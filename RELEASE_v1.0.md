# DNS SpeedBench v1.0 — Portable Windows GUI Release

**Author & Lead Developer**: Rohith Varma ([rohithvrmaa@gmail.com](mailto:rohithvrmaa@gmail.com))  
**Release Tag**: `v1.0`  
**License**: Apache 2.0  
**Target OS**: Windows 11, Windows 10, Windows 8.1, Windows 7, Windows Server

---

## 🚀 Downloads (Lightweight Portable Windows GUI Executables)

No setup wizard, no installer, no administrative installation required. Just double-click and run from your Downloads folder, Desktop, or USB flash drive. Launches directly into the dedicated, modern desktop graphical user interface with zero console prompt.

| Portable Executable | Architecture | Target Systems | Size | SHA-256 Hash |
| :--- | :--- | :--- | :--- | :--- |
| **[`DNS-SpeedBench-v1.0-win-x64-portable.exe`](https://github.com/RohithVrmaa/DNS-Benchmark-App/releases/download/v1.0/DNS-SpeedBench-v1.0-win-x64-portable.exe)** | **64-bit (x64 GUI)** | Windows 11 & Windows 10 *(Full Desktop GUI)* | **~573 KB** | `a5418a02e5863029eb14b37feeccc5eca1770e9717cd0d92c173bcaf1150bb73` |
| **[`DNS-SpeedBench-v1.0-win-x86-portable.exe`](https://github.com/RohithVrmaa/DNS-Benchmark-App/releases/download/v1.0/DNS-SpeedBench-v1.0-win-x86-portable.exe)** | **32-bit (x86 GUI)** | Legacy 32-bit Windows, Tablets, IoT *(Full Desktop GUI)* | **~578 KB** | `1247bccf908f20cdccf0fcdc103d920368f5696aef100250685f682fce710c5d` |
| **[`SHA256SUMS.txt`](https://github.com/RohithVrmaa/DNS-Benchmark-App/releases/download/v1.0/SHA256SUMS.txt)** | **Checksums** | Cryptographic Verification | < 1 KB | `0dbbee7dc0aa62d3a32131a39bb87601ed5d4e6f06bde64553afd2d91ac14482` |

---

## 🌟 What's New in Version 1.0

- **Ultra-Lightweight Native Binary (< 600 KB)**:
  - Reduced executable footprint from bloated 80+ MB Electron wrappers down to a clean, native Win32 binary of ~570 KB.
  - Zero false positives: completely eliminates heuristic dropper alerts (such as `Doplik!pz`) caused by generic SFX/NSIS self-extractors.
- **Dedicated Desktop GUI Window**:
  - Launches the full interactive DNS Benchmark application in a dedicated, chromeless desktop window (no console/terminal window, no browser tabs, no URL bar).
- **Dual Architecture Support**:
  - **64-bit (x64)** build optimized for modern multi-core AMD/Intel Windows 10/11 environments.
  - **32-bit (x86)** build ensuring full backward compatibility on legacy 32-bit Windows operating systems.
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
