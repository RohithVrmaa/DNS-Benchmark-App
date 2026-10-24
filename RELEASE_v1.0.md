# DNS SpeedBench v1.0 — Native Windows Desktop App (Portable)

**Author & Lead Developer**: Rohith Varma ([rohithvrmaa@gmail.com](mailto:rohithvrmaa@gmail.com))  
**Release Tag**: `v1.0`  
**License**: Apache 2.0  
**Target OS**: Windows 11, Windows 10, Windows 8.1, Windows 7, Windows Server

---

## 🚀 Downloads (Native Standalone Desktop Executables)

A true native Windows desktop application window (`HWND`) with its own application icon, native taskbar entry, and zero browser chrome. No setup wizard, no installer, no administrative installation required. Just double-click and run from your Downloads folder, Desktop, or USB flash drive.

| Portable Executable | Architecture | Target Systems | Size | SHA-256 Hash |
| :--- | :--- | :--- | :--- | :--- |
| **[`DNS-SpeedBench-v1.0-win-x64-portable.exe`](https://github.com/RohithVrmaa/DNS-Benchmark-App/releases/download/v1.0/DNS-SpeedBench-v1.0-win-x64-portable.exe)** | **64-bit (x64)** | Windows 11 & Windows 10 *(Native Desktop App)* | **~1.5 MB** | `92e74c6048a997d45f4b7fab675432c0e814788d87ebd1ec90310b60ae9eac38` |
| **[`DNS-SpeedBench-v1.0-win-x86-portable.exe`](https://github.com/RohithVrmaa/DNS-Benchmark-App/releases/download/v1.0/DNS-SpeedBench-v1.0-win-x86-portable.exe)** | **32-bit (x86)** | Legacy 32-bit Windows, Tablets, IoT *(Native Desktop App)* | **~1.7 MB** | `99337c6d751f77cff012c4d772276dab674f73c06e57ccc720f3453e8ef82841` |
| **[`SHA256SUMS.txt`](https://github.com/RohithVrmaa/DNS-Benchmark-App/releases/download/v1.0/SHA256SUMS.txt)** | **Checksums** | Cryptographic Verification | < 1 KB | *(Included in download)* |

---

## 🌟 What's New in Version 1.0

- **True Native Windows Application (Proper Desktop App)**:
  - Creates a dedicated native Win32 window (`HWND`) with its own custom window procedure and class.
  - Native Windows taskbar icon and window chrome — no browser address bar, no tabs, no Edge profile banners, no browser search boxes, and no default browser context menus.
- **100% Standalone Static Runtime (Zero Missing DLL Errors)**:
  - Statically links C/C++ runtimes (`-static -static-libgcc -static-libstdc++`) so the application requires zero external DLLs (no `libstdc++-6.dll` or `libgcc_s_seh-1.dll` errors).
  - Out-of-the-box operation on any clean Windows machine without needing Visual C++ redistributables or MinGW environments.
- **Ultra-Lightweight Native Binary (~1.5 MB)**:
  - Native C++ desktop binary embedding all application assets directly into the PE image (replaces heavy 80+ MB runtimes).
  - Zero antivirus false positives: no NSIS SFX dropper heuristics (such as `Doplik!pz`).
- **Dual Architecture Support**:
  - **64-bit (x64)** build optimized for modern multi-core AMD/Intel Windows 10/11 environments.
  - **32-bit (x86)** build ensuring backward compatibility on 32-bit Windows operating systems.
- **50+ Pre-Configured Anycast Resolvers**:
  - Cloudflare (1.1.1.1, Security, Family), Google Public DNS (8.8.8.8), Quad9 (9.9.9.9), Cisco OpenDNS, AdGuard, NextDNS, Control D, Mullvad, DNS0.eu, Gcore, Level 3, Verisign, and regional/privacy endpoints.
- **Domain Latency Heatmap**:
  - Cross-domain response matrix across top destination domains (`google.com`, `cloudflare.com`, `microsoft.com`, `wikipedia.org`, etc.).
  - Automated throttling and peering congestion detection with real-time spike indicators (`🔥`).
- **Interactive Visualizations & Comparisons**:
  - Real-time comparison bar charts, jitter matrices, and longitudinal performance history tracking.
- **DNS Server Management**:
  - Add, test, edit, and save custom router gateway IPs (`192.168.1.1`) or private DNS servers.
- **One-Click Configuration Exporter**:
  - Export network benchmarks to CSV, JSON, and generate elevated PowerShell/CMD batch scripts for instant 1-click DNS configuration.

---

## 👤 Author

**Rohith Varma**  
Email: [rohithvrmaa@gmail.com](mailto:rohithvrmaa@gmail.com)  
GitHub: [rohithvrmaa](https://github.com/rohithvrmaa)
