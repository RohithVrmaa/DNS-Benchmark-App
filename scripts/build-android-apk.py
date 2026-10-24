#!/usr/bin/env python3
import os
import sys
import shutil
import hashlib
import subprocess
from PIL import Image, ImageDraw

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BUILD_DIR = os.path.join(ROOT_DIR, "build-android")
OUT_DIR = os.path.join(ROOT_DIR, "release-bin")
ANDROID_JAR = "/usr/lib/android-sdk/platforms/android-23/android.jar"
DX_BIN = "/usr/bin/dalvik-exchange"
AAPT_BIN = "/usr/bin/aapt"
ZIPALIGN_BIN = "/usr/bin/zipalign"
APKSIGNER_BIN = "/usr/bin/apksigner"

def run_cmd(cmd, cwd=None):
    print(f"==> Running: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    res = subprocess.run(cmd, cwd=cwd, shell=isinstance(cmd, str), capture_output=True, text=True)
    if res.returncode != 0:
        print(f"ERROR stdout:\n{res.stdout}")
        print(f"ERROR stderr:\n{res.stderr}")
        raise RuntimeError(f"Command failed with exit code {res.returncode}")
    return res.stdout

def create_icon(out_path, size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    pad = int(size * 0.05)
    r = int(size * 0.22)
    draw.rounded_rectangle([pad, pad, size - pad, size - pad], radius=r, fill=(13, 19, 34, 255), outline=(6, 182, 212, 255), width=max(2, int(size * 0.03)))

    cx, cy = size // 2, size // 2
    cr = int(size * 0.32)
    draw.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], outline=(14, 165, 233, 200), width=max(2, int(size * 0.025)))

    p1 = (int(cx * 1.05), int(cy * 0.55))
    p2 = (int(cx * 0.72), int(cy * 1.05))
    p3 = (int(cx * 0.98), int(cy * 1.05))
    p4 = (int(cx * 0.95), int(cy * 1.45))
    p5 = (int(cx * 1.28), int(cy * 0.95))
    p6 = (int(cx * 1.02), int(cy * 0.95))
    draw.polygon([p1, p2, p3, p4, p5, p6], fill=(52, 211, 153, 255))

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    img.save(out_path, "PNG")

def main():
    print("--- Building DNS SpeedBench Android APK ---")

    if os.path.exists(BUILD_DIR):
        shutil.rmtree(BUILD_DIR)
    os.makedirs(BUILD_DIR, exist_ok=True)
    os.makedirs(OUT_DIR, exist_ok=True)

    # 1. Generate Icons
    icon_densities = {
        "drawable-mdpi": 48,
        "drawable-hdpi": 72,
        "drawable-xhdpi": 96,
        "drawable-xxhdpi": 144,
        "drawable-xxxhdpi": 192,
    }
    for folder, sz in icon_densities.items():
        icon_path = os.path.join(BUILD_DIR, "res", folder, "ic_launcher.png")
        create_icon(icon_path, sz)

    # 2. Values / Strings
    values_dir = os.path.join(BUILD_DIR, "res", "values")
    os.makedirs(values_dir, exist_ok=True)
    with open(os.path.join(values_dir, "strings.xml"), "w") as f:
        f.write('''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">DNS SpeedBench</string>
</resources>
''')

    # 3. AndroidManifest.xml
    manifest_path = os.path.join(BUILD_DIR, "AndroidManifest.xml")
    with open(manifest_path, "w") as f:
        f.write('''<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.rohithvarma.dnsspeedbench"
    android:versionCode="1"
    android:versionName="1.0">

    <uses-sdk android:minSdkVersion="21" android:targetSdkVersion="28" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />

    <application
        android:label="@string/app_name"
        android:icon="@drawable/ic_launcher"
        android:hardwareAccelerated="true"
        android:theme="@android:style/Theme.NoTitleBar">
        <activity
            android:name=".MainActivity"
            android:label="@string/app_name"
            android:configChanges="orientation|keyboardHidden|screenSize"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
''')

    # 4. Copy Web Assets
    dist_dir = os.path.join(ROOT_DIR, "dist")
    if not os.path.exists(dist_dir) or not os.path.exists(os.path.join(dist_dir, "index.html")):
        print("Building dist assets...")
        run_cmd("npm run build", cwd=ROOT_DIR)

    assets_target = os.path.join(BUILD_DIR, "assets")
    shutil.copytree(dist_dir, assets_target)

    # Sanitize index.html in assets: strip crossorigin attribute so file:// loads without CORS issues
    asset_index = os.path.join(assets_target, "index.html")
    with open(asset_index, "r") as f:
        html = f.read()
    html = html.replace(' crossorigin=""', '').replace(' crossorigin', '')
    with open(asset_index, "w") as f:
        f.write(html)

    # 5. Java Sources
    java_src_dir = os.path.join(BUILD_DIR, "src", "com", "rohithvarma", "dnsspeedbench")
    os.makedirs(java_src_dir, exist_ok=True)
    java_file = os.path.join(java_src_dir, "MainActivity.java")
    with open(java_file, "w") as f:
        f.write('''package com.rohithvarma.dnsspeedbench;

import android.app.Activity;
import android.os.Bundle;
import android.os.Build;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.graphics.Color;

public class MainActivity extends Activity {
    private WebView mWebView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED
        );
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getWindow().setStatusBarColor(Color.parseColor("#090d16"));
            getWindow().setNavigationBarColor(Color.parseColor("#090d16"));
        }

        mWebView = new WebView(this);
        mWebView.setBackgroundColor(Color.parseColor("#090d16"));
        setContentView(mWebView);

        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        mWebView.setWebViewClient(new WebViewClient());
        mWebView.setWebChromeClient(new WebChromeClient());

        mWebView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onBackPressed() {
        if (mWebView != null && mWebView.canGoBack()) {
            mWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
''')

    # 6. Generate R.java with AAPT
    gen_dir = os.path.join(BUILD_DIR, "gen")
    os.makedirs(gen_dir, exist_ok=True)
    run_cmd([
        AAPT_BIN, "package", "-f", "-m",
        "-J", gen_dir,
        "-M", manifest_path,
        "-S", os.path.join(BUILD_DIR, "res"),
        "-I", ANDROID_JAR
    ])

    # 7. Compile Java classes with javac
    bin_classes = os.path.join(BUILD_DIR, "classes")
    os.makedirs(bin_classes, exist_ok=True)
    r_java = os.path.join(gen_dir, "com", "rohithvarma", "dnsspeedbench", "R.java")
    run_cmd([
        "javac", "-source", "1.8", "-target", "1.8",
        "-cp", ANDROID_JAR,
        "-d", bin_classes,
        r_java, java_file
    ])

    # 8. Convert bytecode to Dalvik DEX
    dex_output = os.path.join(BUILD_DIR, "classes.dex")
    run_cmd([
        DX_BIN, "--dex",
        f"--output={dex_output}",
        bin_classes
    ])

    # 9. Package APK with AAPT
    raw_apk = os.path.join(BUILD_DIR, "app-unaligned.apk")
    run_cmd([
        AAPT_BIN, "package", "-f",
        "-M", manifest_path,
        "-S", os.path.join(BUILD_DIR, "res"),
        "-A", assets_target,
        "-I", ANDROID_JAR,
        "-F", raw_apk
    ])

    # 10. Add classes.dex to APK
    run_cmd([
        AAPT_BIN, "add", "-k", raw_apk, "classes.dex"
    ], cwd=BUILD_DIR)

    # 11. Zipalign APK (4-byte alignment)
    aligned_apk = os.path.join(BUILD_DIR, "app-aligned.apk")
    run_cmd([
        ZIPALIGN_BIN, "-f", "-p", "4",
        raw_apk, aligned_apk
    ])

    # 12. Create Keystore
    keystore_path = os.path.join(BUILD_DIR, "release.keystore")
    if not os.path.exists(keystore_path):
        run_cmd([
            "keytool", "-genkeypair", "-v",
            "-keystore", keystore_path,
            "-storepass", "speedbench123",
            "-keypass", "speedbench123",
            "-alias", "speedbench",
            "-keyalg", "RSA",
            "-keysize", "2048",
            "-validity", "10000",
            "-dname", "CN=Rohith Varma, OU=DNS SpeedBench, O=OpenSource, L=Hyderabad, ST=Telangana, C=IN"
        ])

    # 13. Sign APK with apksigner (v1 + v2 + v3 schemes)
    final_apk = os.path.join(OUT_DIR, "DNS-SpeedBench-v1.0-android.apk")
    run_cmd([
        APKSIGNER_BIN, "sign",
        "--ks", keystore_path,
        "--ks-pass", "pass:speedbench123",
        "--key-pass", "pass:speedbench123",
        "--ks-key-alias", "speedbench",
        "--out", final_apk,
        aligned_apk
    ])

    # 14. Verify APK signature
    verify_out = run_cmd([APKSIGNER_BIN, "verify", "--verbose", final_apk])
    print(f"Signature Verification:\n{verify_out}")

    # Compute SHA-256
    sha256 = hashlib.sha256()
    with open(final_apk, "rb") as f:
        while chunk := f.read(65536):
            sha256.update(chunk)
    digest = sha256.hexdigest()

    size_mb = os.path.getsize(final_apk) / (1024 * 1024)
    print(f"SUCCESS: Built signed APK: {final_apk}")
    print(f"Size: {size_mb:.2f} MB | SHA-256: {digest}")

    # Update SHA256SUMS.txt
    sums_file = os.path.join(OUT_DIR, "SHA256SUMS.txt")
    with open(sums_file, "a") as f:
        f.write(f"{digest}  DNS-SpeedBench-v1.0-android.apk\n")

if __name__ == "__main__":
    main()
