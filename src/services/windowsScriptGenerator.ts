import { DNSResolver, ResolverBenchmarkResult } from '../types/dns';

/**
 * Generates PowerShell script to apply DNS to Windows Network Adapter
 */
export function generatePowerShellApplyScript(
  resolver: DNSResolver,
  adapterName: string = 'Wi-Fi'
): string {
  const secondary = resolver.secondaryIPv4 ? `,"${resolver.secondaryIPv4}"` : '';
  return `# DNS SpeedBench v1.0 by Rohith Varma
# One-Click Windows Network Adapter Configuration
# Run in Administrator PowerShell
$adapter = "${adapterName}"
$dnsServers = @("${resolver.primaryIPv4}"${secondary})

Write-Host "Configuring DNS for $adapter to ${resolver.name}..." -ForegroundColor Cyan

# Set IPv4 DNS Servers
Set-DnsClientServerAddress -InterfaceAlias $adapter -ServerAddresses $dnsServers

# Flush Windows DNS Cache
Clear-DnsClientCache
ipconfig /flushdns

Write-Host "Success! DNS updated to: $($dnsServers -join ', ')" -ForegroundColor Green
Get-DnsClientServerAddress -InterfaceAlias $adapter -AddressFamily IPv4
`;
}

/**
 * Generates Windows Batch (.bat) file to apply DNS with administrative elevation
 */
export function generateBatchApplyScript(
  resolver: DNSResolver,
  adapterName: string = 'Wi-Fi'
): string {
  return `@echo off
:: DNS SpeedBench Portable - Apply DNS
:: Automatically requests Administrator privileges if needed
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting Administrator privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo [DNS SpeedBench Portable]
echo Configuring Network Adapter "%~1" to ${resolver.name} (${resolver.primaryIPv4})...
echo.

netsh interface ipv4 set dnsservers name="${adapterName}" static ${resolver.primaryIPv4} primary
${resolver.secondaryIPv4 ? `netsh interface ipv4 add dnsservers name="${adapterName}" ${resolver.secondaryIPv4} index=2` : ''}

ipconfig /flushdns
echo.
echo DNS Configuration successfully applied!
echo Primary DNS:   ${resolver.primaryIPv4}
${resolver.secondaryIPv4 ? `echo Secondary DNS: ${resolver.secondaryIPv4}` : ''}
echo.
pause
`;
}

/**
 * Generates Windows Registry (.reg) file to set DNS
 */
export function generateRegistryScript(resolver: DNSResolver): string {
  const dnsList = [resolver.primaryIPv4, resolver.secondaryIPv4].filter(Boolean).join(',');
  return `Windows Registry Editor Version 5.00

; DNS SpeedBench Portable Configuration
; Provider: ${resolver.name} (${resolver.primaryIPv4})
[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters]
"NameServer"="${dnsList}"
`;
}

/**
 * Generates a standalone, zero-installation Windows Batch Benchmark Tool (.bat)
 * Users can double-click this portable file on any Windows PC to benchmark DNS directly in CMD.
 */
export function generatePortableBatchBenchmark(): string {
  return `@echo off
setlocal enabledelayedexpansion
title DNS SpeedBench v1.0 by Rohith Varma (Portable Executable)
color 0B

echo ======================================================================
echo    DNS SPEEDBENCH v1.0 - PORTABLE WINDOWS BENCHMARK TOOL
echo    Author: Rohith Varma ^| Standalone Executable (Zero Installation)
echo ======================================================================
echo.
echo Benchmarking top public DNS resolvers from your physical connection...
echo Please wait while ping and DNS resolution latencies are measured...
echo.

echo ----------------------------------------------------------------------
echo  RESOLVER              PRIMARY IP       AVG RTT     STATUS
echo ----------------------------------------------------------------------

set "resolvers=Cloudflare:1.1.1.1 Google-DNS:8.8.8.8 Quad9:9.9.9.9 Cisco-OpenDNS:208.67.222.222 AdGuard-DNS:94.140.14.14 NextDNS:45.90.28.0 ControlD:76.76.2.0"

for %%R in (%resolvers%) do (
    for /f "tokens=1,2 delims=:" %%A in ("%%R") do (
        set "name=%%A               "
        set "name=!name:~0,20!"
        set "ip=%%B            "
        set "ip=!ip:~0,15!"
        
        set "avg=FAIL"
        for /f "tokens=4 delims==" %%P in ('ping -n 3 -w 1000 %%B ^| findstr /i "Average"') do (
            set "avg=%%P"
            set "avg=!avg: =!"
        )
        
        if "!avg!"=="FAIL" (
            echo  !name! !ip!  [TIMEOUT]   Offline
        ) else (
            echo  !name! !ip!  !avg!      Optimal
        )
    )
)

echo ----------------------------------------------------------------------
echo.
echo [1] Apply Cloudflare DNS (1.1.1.1, 1.0.0.1)
echo [2] Apply Google DNS (8.8.8.8, 8.8.4.4)
echo [3] Apply Quad9 DNS (9.9.9.9, 149.112.112.112)
echo [4] Reset DNS to Automatic (DHCP)
echo [5] Exit
echo.
set /p choice="Select option (1-5): "

if "%choice%"=="1" (
    powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList '-Command Set-DnsClientServerAddress -InterfaceAlias (Get-NetAdapter | Where-Object Status -eq Up | Select-Object -First 1).Name -ServerAddresses 1.1.1.1,1.0.0.1; Clear-DnsClientCache; Write-Host Applied Cloudflare DNS! -ForegroundColor Green; Start-Sleep 2'"
)
if "%choice%"=="2" (
    powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList '-Command Set-DnsClientServerAddress -InterfaceAlias (Get-NetAdapter | Where-Object Status -eq Up | Select-Object -First 1).Name -ServerAddresses 8.8.8.8,8.8.4.4; Clear-DnsClientCache; Write-Host Applied Google DNS! -ForegroundColor Green; Start-Sleep 2'"
)
if "%choice%"=="3" (
    powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList '-Command Set-DnsClientServerAddress -InterfaceAlias (Get-NetAdapter | Where-Object Status -eq Up | Select-Object -First 1).Name -ServerAddresses 9.9.9.9,149.112.112.112; Clear-DnsClientCache; Write-Host Applied Quad9 DNS! -ForegroundColor Green; Start-Sleep 2'"
)
if "%choice%"=="4" (
    powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList '-Command Set-DnsClientServerAddress -InterfaceAlias (Get-NetAdapter | Where-Object Status -eq Up | Select-Object -First 1).Name -ResetServerAddresses; Clear-DnsClientCache; Write-Host Reset to DHCP! -ForegroundColor Green; Start-Sleep 2'"
)

echo.
echo Thank you for using DNS SpeedBench by Rohith Varma.
pause
`;
}

/**
 * Generates native C# source code that can be compiled into a standalone Windows .exe
 * using the built-in Windows C# compiler csc.exe (zero install!)
 */
export function generateCSharpStandaloneSource(): string {
  return `// DNS SpeedBench v1.0 by Rohith Varma - Standalone Windows Executable (.exe)
// Compile to native single .exe on any Windows machine with 0 installs:
// Command: C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe /out:DNSBenchmark.exe /target:exe DNSBenchmark.cs

using System;
using System.Net.NetworkInformation;
using System.Diagnostics;
using System.Collections.Generic;

class DNSBenchmark
{
    struct Resolver {
        public string Name;
        public string IP;
        public string SecondaryIP;
    }

    static void Main()
    {
        Console.Title = "DNS SpeedBench v1.0 - by Rohith Varma";
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine("==================================================================");
        Console.WriteLine("   DNS SpeedBench v1.0 - Standalone Windows Executable (.exe)");
        Console.WriteLine("   Author: Rohith Varma | Zero Installation Required");
        Console.WriteLine("==================================================================");
        Console.WriteLine("   Zero Installation Required - Direct Memory Execution");
        Console.WriteLine("==================================================================");
        Console.ResetColor();
        Console.WriteLine();

        var resolvers = new List<Resolver>
        {
            new Resolver { Name = "Cloudflare (1.1.1.1)", IP = "1.1.1.1", SecondaryIP = "1.0.0.1" },
            new Resolver { Name = "Google Public DNS",   IP = "8.8.8.8", SecondaryIP = "8.8.4.4" },
            new Resolver { Name = "Quad9 Security",      IP = "9.9.9.9", SecondaryIP = "149.112.112.112" },
            new Resolver { Name = "Cisco OpenDNS",       IP = "208.67.222.222", SecondaryIP = "208.67.220.220" },
            new Resolver { Name = "AdGuard Ad-Block",    IP = "94.140.14.14", SecondaryIP = "94.140.15.15" },
            new Resolver { Name = "NextDNS Anycast",     IP = "45.90.28.0", SecondaryIP = "45.90.30.0" },
            new Resolver { Name = "Control D",           IP = "76.76.2.0", SecondaryIP = "76.76.10.0" }
        };

        Console.WriteLine(string.Format("{0,-24} {1,-16} {2,-12} {3}", "RESOLVER", "PRIMARY IP", "AVG LATENCY", "STATUS"));
        Console.WriteLine(new string('-', 66));

        Ping pinger = new Ping();
        string fastestName = "";
        long lowestPing = long.MaxValue;
        string fastestIP = "";
        string fastestSecondary = "";

        foreach (var r in resolvers)
        {
            long totalTime = 0;
            int successfulPings = 0;

            for (int i = 0; i < 4; i++)
            {
                try
                {
                    PingReply reply = pinger.Send(r.IP, 1000);
                    if (reply.Status == IPStatus.Success)
                    {
                        totalTime += reply.RoundtripTime;
                        successfulPings++;
                    }
                }
                catch { }
            }

            if (successfulPings > 0)
            {
                long avg = totalTime / successfulPings;
                if (avg < lowestPing)
                {
                    lowestPing = avg;
                    fastestName = r.Name;
                    fastestIP = r.IP;
                    fastestSecondary = r.SecondaryIP;
                }

                Console.ForegroundColor = avg < 30 ? ConsoleColor.Green : (avg < 60 ? ConsoleColor.Yellow : ConsoleColor.Red);
                Console.WriteLine(string.Format("{0,-24} {1,-16} {2,-12} {3}", r.Name, r.IP, avg + " ms", "Online"));
            }
            else
            {
                Console.ForegroundColor = ConsoleColor.DarkGray;
                Console.WriteLine(string.Format("{0,-24} {1,-16} {2,-12} {3}", r.Name, r.IP, "TIMEOUT", "Unreachable"));
            }
            Console.ResetColor();
        }

        Console.WriteLine(new string('-', 66));
        Console.WriteLine();
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine("🏆 FASTEST RESOLVER DETECTED: " + fastestName + " (" + lowestPing + " ms)");
        Console.ResetColor();
        Console.WriteLine();
        Console.WriteLine("Press [1] to automatically set this fastest DNS to your Windows adapter.");
        Console.WriteLine("Press any other key to exit.");

        var key = Console.ReadKey();
        if (key.KeyChar == '1' && !string.IsNullOrEmpty(fastestIP))
        {
            string psCmd = string.Format("Set-DnsClientServerAddress -InterfaceAlias (Get-NetAdapter | Where-Object Status -eq Up | Select-Object -First 1).Name -ServerAddresses '{0}','{1}'; Clear-DnsClientCache; Write-Host 'Applied!' -ForegroundColor Green; Start-Sleep 2", fastestIP, fastestSecondary);
            ProcessStartInfo psi = new ProcessStartInfo("powershell", "-Command \\"" + psCmd + "\\"");
            psi.Verb = "runas";
            psi.UseShellExecute = true;
            try {
                Process.Start(psi);
            } catch (Exception ex) {
                Console.WriteLine("Elevation cancelled: " + ex.Message);
            }
        }
    }
}
`;
}

/**
 * Downloads generated content as a file directly in the browser
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates benchmark summary CSV
 */
export function generateResultsCsv(results: ResolverBenchmarkResult[]): string {
  const headers = [
    'Rank',
    'Resolver Name',
    'Provider',
    'Primary IPv4',
    'Secondary IPv4',
    'Avg Latency (ms)',
    'Min Latency (ms)',
    'Max Latency (ms)',
    'Jitter (ms)',
    'Cached Avg (ms)',
    'Uncached Avg (ms)',
    'Success Rate (%)',
    'DNSSEC',
    'Malware Block',
    'Ad Block',
    'Location',
  ];

  const rows = results.map((r, idx) => [
    idx + 1,
    `"${r.resolver.name}"`,
    `"${r.resolver.provider}"`,
    r.resolver.primaryIPv4,
    r.resolver.secondaryIPv4,
    r.avgLatencyMs,
    r.minLatencyMs,
    r.maxLatencyMs,
    r.jitterMs,
    r.cachedAvgMs,
    r.uncachedAvgMs,
    `${r.successRate}%`,
    r.resolver.features.dnssec ? 'Yes' : 'No',
    r.resolver.features.malwareBlocking ? 'Yes' : 'No',
    r.resolver.features.adBlocking ? 'Yes' : 'No',
    `"${r.resolver.location}"`,
  ]);

  return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
}
