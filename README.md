# DNS SpeedBench v1.0

> **Standalone Windows DNS Benchmark & Optimization Utility**  
> Developed and authored by **Rohith Varma**

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Platform](https://img.shields.io/badge/Platform-Windows%2010%20%2F%2011%20(Portable)-0078D6.svg?logo=windows)](https://microsoft.com)
[![Version](https://img.shields.io/badge/Version-v1.0-emerald.svg)](https://github.com)

DNS SpeedBench is a modern, standalone Windows desktop application designed to benchmark public DNS resolvers with precision timing, jitter calculations, DNSSEC validation, and domain-level throttling diagnostics.

---

## 🚀 Downloads (Portable Zero-Install Windows Executables)

No setup wizard, no installer, no administrative installation required. Simply download and double-click to run on any Windows system:

| Release Binary | Architecture | Target Platform | Description |
| :--- | :--- | :--- | :--- |
| **`DNS-SpeedBench-v1.0-win-x64-portable.exe`** | **64-bit (x64)** | Windows 11 & Windows 10 (64-bit) | High-performance 64-bit native portable executable *(Recommended)* |
| **`DNS-SpeedBench-v1.0-win-x86-portable.exe`** | **32-bit (x86)** | Windows 7 / 8 / 10 (32-bit) & Legacy | Legacy 32-bit compatible portable executable |
| **`DNS-SpeedBench-v1.0-x64-Launcher.bat`** | **64-bit Script** | Windows Command Prompt | Double-click batch runner for 64-bit systems |
| **`DNS-SpeedBench-v1.0-x86-Launcher.bat`** | **32-bit Script** | Windows Command Prompt | Double-click batch runner for 32-bit systems |

---

## Key Features

- **Dual Architecture (32-bit & 64-bit)**: Dedicated portable builds for modern 64-bit (x64) and legacy 32-bit (x86) Windows systems.
- **Portable Zero-Install Architecture**: Runs directly as a portable utility without requiring administrative installation or background telemetry services.
- **50+ Pre-Configured Resolvers**: Benchmarks major global anycast networks (Cloudflare, Google, Quad9, OpenDNS), security & malware blocking resolvers, ad-blocking providers (AdGuard, NextDNS, Control D), regional sovereign resolvers (DNS0.eu, Shecan), and enterprise backbones (Level 3, Verisign, Gcore).
- **Domain Performance Heatmap**: Real-time cross-matrix visualization analyzing query response times across individual top domains (`google.com`, `cloudflare.com`, `microsoft.com`, `apple.com`, `amazon.com`, `wikipedia.org`, `github.com`, `netflix.com`, `reddit.com`, `youtube.com`) with automated detection of peering congestion and intermittent throttling.
- **Head-to-Head Comparison Mode**: Inspect two DNS resolvers side-by-side with delta metrics, jitter variance, DNSSEC enforcement, and feature comparisons.
- **Windows Adapter Configuration**: One-click generation of native PowerShell scripts, batch scripts (`.bat`), and `netsh` commands to immediately apply optimal DNS resolvers to active network adapters (Wi-Fi / Ethernet).
- **DNS Server Management**: Add, customize, test, and persist custom local gateway or private upstream DNS server IPs in local storage.
- **Benchmark History**: Records and compares historical benchmark runs over time to track ISP routing changes.
- **Live Interactive DNS Probe**: Perform instantaneous DNS queries across any record type (`A`, `AAAA`, `CNAME`, `MX`, `TXT`, `NS`, `PTR`) against any selected resolver.
- **Zero AI References / Standalone Clean Code**: Pristine architecture with no AI branding, telemetry, or dependencies.

---

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS with Windows 11 Fluent / Mica aesthetic
- **Icons**: Lucide Icons
- **Motion**: Motion (Framer Motion)
- **Engine**: Browser-compatible DNS-over-HTTPS (DoH) engine with fallback high-precision timing calibration

---

## Getting Started

### Prerequisites

- Node.js 18+ / 20+
- npm or bun

### Installation & Local Run

```bash
# Clone the repository
git clone https://github.com/rohithvrmaa/dns-speedbench.git
cd dns-speedbench

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Production Build

```bash
npm run build
```

---

## Windows Portable Setup

1. Run the application or build the static artifacts.
2. Click **Run Benchmark** to identify the lowest-latency DNS resolver for your physical location and network.
3. Click **Configure Adapter** on your top-performing resolver.
4. Download or copy the generated Windows PowerShell script to automatically update your adapter's IPv4/IPv6 DNS settings.

---

## Author & Developer

**Rohith Varma**  
Email: [rohithvrmaa@gmail.com](mailto:rohithvrmaa@gmail.com)

---

## License

This project is licensed under the Apache 2.0 License.
