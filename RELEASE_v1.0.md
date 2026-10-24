# DNS SpeedBench v1.0 — Portable Windows Release

**Author & Lead Developer**: Rohith Varma ([rohithvrmaa@gmail.com](mailto:rohithvrmaa@gmail.com))  
**Release Tag**: `v1.0`  
**License**: Apache 2.0  
**Target OS**: Windows 11, Windows 10, Windows 8.1, Windows 7, Windows Server (2016+)

---

## 🚀 Downloads (Portable Zero-Install Executables)

No setup wizard, no installer, no administrative installation required. Just double-click and run from your Downloads folder, Desktop, or USB flash drive.

| Portable Executable | Architecture | Target Systems | Size | SHA-256 Hash |
| :--- | :--- | :--- | :--- | :--- |
| **[`DNS-SpeedBench-v1.0-win-x64-portable.exe`](https://github.com/RohithVrmaa/DNS-Benchmark-App/releases/download/v1.0/DNS-SpeedBench-v1.0-win-x64-portable.exe)** | **64-bit (x64)** | Modern Windows 11 & Windows 10 *(Recommended)* | 82 KB | `b52013c4279aeed6f82be3cca21e6c691dce454b9cb8860f0133f1fb02029ce1` |
| **[`DNS-SpeedBench-v1.0-win-x86-portable.exe`](https://github.com/RohithVrmaa/DNS-Benchmark-App/releases/download/v1.0/DNS-SpeedBench-v1.0-win-x86-portable.exe)** | **32-bit (x86)** | Legacy 32-bit Windows, Tablets, IoT, Embedded | 84 KB | `11c24d0b4864d8397482d2921f3e6d00977858c7b7280ad6d7e040f5527f743d` |
| **[`SHA256SUMS.txt`](https://github.com/RohithVrmaa/DNS-Benchmark-App/releases/download/v1.0/SHA256SUMS.txt)** | **Checksums** | All Architectures Verification | < 1 KB | Cryptographic Verification |

---

## 🌟 What's New in Version 1.0

- **Dual Architecture Support**:
  - **64-bit (x64)** build optimized for modern multi-core AMD/Intel Windows 10/11 environments.
  - **32-bit (x86)** build ensuring full backward compatibility on legacy 32-bit Windows operating systems.
- **50+ Pre-Configured Resolvers**:
  - Cloudflare, Google Public DNS, Quad9, Cisco OpenDNS, AdGuard, NextDNS, Control D, Mullvad, DNS0.eu, Gcore, Level 3, Verisign, and regional/privacy endpoints.
- **Domain Latency Heatmap**:
  - Cross-domain response matrix across 10 top destination domains (`google.com`, `cloudflare.com`, `microsoft.com`, etc.).
  - Automated throttling and peering congestion detection with real-time spike indicators (`🔥`).
- **Head-to-Head Comparison Mode**:
  - Side-by-side performance diffing between any two chosen DNS servers with jitter and reliability metrics.
- **DNS Server Management**:
  - Add, test, edit, and save custom local router gateway IPs (`192.168.1.1`) or private DNS servers with local storage persistence.
- **Benchmark History**:
  - Automatic session logging to track network routing improvements over time.
- **Zero-Pollution Portable Architecture**:
  - Does not touch the Windows Registry.
  - Leaves zero residual files in `AppData`.
  - Microsecond precision socket ping and resolution.

---

## 🛠️ How to Compile Manually on Windows (Zero Tools Required)

Both 32-bit and 64-bit binaries can be compiled directly on any Windows PC using Microsoft's native `.NET Framework` compiler:

### 64-bit (x64):
```cmd
C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe /platform:x64 /optimize+ /out:DNS-SpeedBench-v1.0-win-x64-portable.exe DNSBenchmark.cs
```

### 32-bit (x86):
```cmd
C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe /platform:x86 /optimize+ /out:DNS-SpeedBench-v1.0-win-x86-portable.exe DNSBenchmark.cs
```

---

## 👤 Author

**Rohith Varma**  
Email: [rohithvrmaa@gmail.com](mailto:rohithvrmaa@gmail.com)  
GitHub: [rohithvrmaa](https://github.com/rohithvrmaa)
