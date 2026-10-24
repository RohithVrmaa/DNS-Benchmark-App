/*
 * DNS SpeedBench v1.0
 * Portable Windows Standalone DNS Benchmarking & Adapter Optimization Utility
 * Author: Rohith Varma (rohithvrmaa@gmail.com)
 * Version: 1.0.0
 * Architecture: Native Windows Executable (No installation required)
 */

#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <winsock2.h>
#include <ws2tcpip.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#pragma comment(lib, "ws2_32.lib")

typedef struct {
    const char *name;
    const char *provider;
    const char *ip;
    const char *secondary;
    double avg_latency;
    int success;
} DnsResolver;

static DnsResolver g_resolvers[] = {
    {"Cloudflare Primary", "Cloudflare", "1.1.1.1", "1.0.0.1", 0.0, 0},
    {"Cloudflare Secondary", "Cloudflare", "1.0.0.1", "1.1.1.1", 0.0, 0},
    {"Cloudflare Malware", "Cloudflare 1.1.1.2", "1.1.1.2", "1.0.0.2", 0.0, 0},
    {"Cloudflare Family", "Cloudflare 1.1.1.3", "1.1.1.3", "1.0.0.3", 0.0, 0},
    {"Google Primary", "Google Public DNS", "8.8.8.8", "8.8.4.4", 0.0, 0},
    {"Google Secondary", "Google Public DNS", "8.8.4.4", "8.8.8.8", 0.0, 0},
    {"Quad9 Primary", "Quad9 (Malware Block)", "9.9.9.9", "149.112.112.112", 0.0, 0},
    {"Quad9 Secondary", "Quad9", "149.112.112.112", "9.9.9.9", 0.0, 0},
    {"Quad9 Unfiltered", "Quad9", "9.9.9.10", "149.112.112.10", 0.0, 0},
    {"Cisco OpenDNS Home", "Cisco Umbrella", "208.67.222.222", "208.67.220.220", 0.0, 0},
    {"Cisco OpenDNS Family", "Cisco Umbrella", "208.67.222.123", "208.67.220.123", 0.0, 0},
    {"AdGuard Default", "AdGuard AdBlock", "94.140.14.14", "94.140.15.15", 0.0, 0},
    {"AdGuard Family", "AdGuard Safe", "94.140.14.15", "94.140.15.16", 0.0, 0},
    {"AdGuard Non-filtering", "AdGuard", "94.140.14.140", "94.140.14.141", 0.0, 0},
    {"Control D Free", "Control D", "76.76.2.0", "76.76.10.0", 0.0, 0},
    {"Control D Malware", "Control D", "76.76.2.1", "76.76.10.1", 0.0, 0},
    {"Control D Ads & Trackers", "Control D", "76.76.2.2", "76.76.10.2", 0.0, 0},
    {"NextDNS Anycast 1", "NextDNS", "45.90.28.0", "45.90.30.0", 0.0, 0},
    {"NextDNS Anycast 2", "NextDNS", "45.90.30.0", "45.90.28.0", 0.0, 0},
    {"Mullvad DNS", "Mullvad VPN", "194.242.2.2", "194.242.2.3", 0.0, 0},
    {"Mullvad Adblock", "Mullvad VPN", "194.242.2.3", "194.242.2.2", 0.0, 0},
    {"DNS0.eu EU Public", "DNS0.eu", "193.110.81.0", "185.253.5.0", 0.0, 0},
    {"DNS0.eu ZERO (High-Sec)", "DNS0.eu", "193.110.81.9", "185.253.5.9", 0.0, 0},
    {"DNS0.eu Kids", "DNS0.eu", "193.110.81.1", "185.253.5.1", 0.0, 0},
    {"CleanBrowsing Security", "CleanBrowsing", "185.228.168.9", "185.228.169.9", 0.0, 0},
    {"CleanBrowsing Family", "CleanBrowsing", "185.228.168.168", "185.228.169.168", 0.0, 0},
    {"CleanBrowsing Adult", "CleanBrowsing", "185.228.168.10", "185.228.169.11", 0.0, 0},
    {"Comodo Secure DNS", "Comodo", "8.26.56.26", "8.20.247.20", 0.0, 0},
    {"Gcore Anycast 1", "Gcore Public DNS", "95.85.95.85", "2.56.220.2", 0.0, 0},
    {"Gcore Anycast 2", "Gcore Public DNS", "2.56.220.2", "95.85.95.85", 0.0, 0},
    {"Level 3 Primary", "Lumen / CenturyLink", "4.2.2.1", "4.2.2.2", 0.0, 0},
    {"Level 3 Secondary", "Lumen / CenturyLink", "4.2.2.2", "4.2.2.1", 0.0, 0},
    {"Level 3 Alternate 1", "Lumen / CenturyLink", "4.2.2.3", "4.2.2.4", 0.0, 0},
    {"Level 3 Alternate 2", "Lumen / CenturyLink", "4.2.2.4", "4.2.2.3", 0.0, 0},
    {"Verisign Public 1", "Verisign Inc.", "64.6.64.6", "64.6.65.6", 0.0, 0},
    {"Verisign Public 2", "Verisign Inc.", "64.6.65.6", "64.6.64.6", 0.0, 0},
    {"Neustar UltraDNS 1", "Neustar Security", "156.154.70.1", "156.154.71.1", 0.0, 0},
    {"Neustar UltraDNS 2", "Neustar Security", "156.154.71.1", "156.154.70.1", 0.0, 0},
    {"Hurricane Electric", "HE.net Anycast", "74.82.42.42", "74.82.42.42", 0.0, 0},
    {"Freenom World 1", "Freenom Anycast", "80.80.80.80", "80.80.81.81", 0.0, 0},
    {"Freenom World 2", "Freenom Anycast", "80.80.81.81", "80.80.80.80", 0.0, 0},
    {"Yandex Safe DNS", "Yandex Safe", "77.88.8.88", "77.88.8.2", 0.0, 0},
    {"Yandex Family DNS", "Yandex Family", "77.88.8.7", "77.88.8.3", 0.0, 0},
    {"Alternate DNS Primary", "Alternate DNS", "76.76.19.19", "76.223.122.150", 0.0, 0},
    {"SafeDNS Standard", "SafeDNS", "195.46.39.39", "195.46.39.40", 0.0, 0},
    {"DNS.WATCH Primary", "DNS.WATCH Germany", "84.200.69.80", "84.200.70.40", 0.0, 0},
    {"DNS.WATCH Secondary", "DNS.WATCH Germany", "84.200.70.40", "84.200.69.80", 0.0, 0},
    {"OpenNIC Anycast", "OpenNIC Tier-2", "185.121.177.177", "169.254.169.254", 0.0, 0},
    {"Shecan Primary (IR)", "Shecan DNS", "178.22.122.100", "185.51.200.2", 0.0, 0},
    {"Shecan Secondary (IR)", "Shecan DNS", "185.51.200.2", "178.22.122.100", 0.0, 0}
};

static const int g_resolver_count = sizeof(g_resolvers) / sizeof(g_resolvers[0]);

/* Standard DNS query for "google.com" (IN A) */
static const unsigned char g_dns_query[] = {
    0xAA, 0xBB,             /* Transaction ID */
    0x01, 0x00,             /* Flags: Standard query, Recursion Desired */
    0x00, 0x01,             /* Questions: 1 */
    0x00, 0x00,             /* Answer RRs: 0 */
    0x00, 0x00,             /* Authority RRs: 0 */
    0x00, 0x00,             /* Additional RRs: 0 */
    /* QNAME: 6google3com0 */
    0x06, 'g','o','o','g','l','e',
    0x03, 'c','o','m',
    0x00,
    0x00, 0x01,             /* QTYPE: A (0x0001) */
    0x00, 0x01              /* QCLASS: IN (0x0001) */
};

static void set_color(WORD color) {
    SetConsoleTextAttribute(GetStdHandle(STD_OUTPUT_HANDLE), color);
}

static double benchmark_dns_resolver(const char *ip_str, int samples) {
    SOCKET sock = socket(AF_INET, SOCK_DGRAM, IPPROTO_UDP);
    if (sock == INVALID_SOCKET) {
        return -1.0;
    }

    /* Set socket timeout to 1200ms */
    DWORD timeout = 1200;
    setsockopt(sock, SOL_SOCKET, SO_RCVTIMEO, (const char *)&timeout, sizeof(timeout));
    setsockopt(sock, SOL_SOCKET, SO_SNDTIMEO, (const char *)&timeout, sizeof(timeout));

    struct sockaddr_in dest;
    memset(&dest, 0, sizeof(dest));
    dest.sin_family = AF_INET;
    dest.sin_port = htons(53);
    dest.sin_addr.s_addr = inet_addr(ip_str);

    LARGE_INTEGER freq;
    QueryPerformanceFrequency(&freq);

    double total_ms = 0.0;
    int success_count = 0;
    unsigned char recv_buf[512];

    for (int i = 0; i < samples; i++) {
        LARGE_INTEGER start, end;
        QueryPerformanceCounter(&start);

        int sent = sendto(sock, (const char *)g_dns_query, sizeof(g_dns_query), 0,
                          (struct sockaddr *)&dest, sizeof(dest));
        if (sent <= 0) {
            continue;
        }

        struct sockaddr_in from;
        int from_len = sizeof(from);
        int recvd = recvfrom(sock, (char *)recv_buf, sizeof(recv_buf), 0,
                             (struct sockaddr *)&from, &from_len);

        QueryPerformanceCounter(&end);

        if (recvd > 0) {
            double elapsed_ms = (double)(end.QuadPart - start.QuadPart) * 1000.0 / (double)freq.QuadPart;
            total_ms += elapsed_ms;
            success_count++;
        }
        Sleep(10);
    }

    closesocket(sock);

    if (success_count == 0) {
        return -1.0;
    }
    return total_ms / success_count;
}

static int compare_resolvers(const void *a, const void *b) {
    const DnsResolver *ra = (const DnsResolver *)a;
    const DnsResolver *rb = (const DnsResolver *)b;
    if (ra->success != rb->success) {
        return rb->success - ra->success;
    }
    if (ra->avg_latency < rb->avg_latency) return -1;
    if (ra->avg_latency > rb->avg_latency) return 1;
    return 0;
}

int main(int argc, char **argv) {
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
        fprintf(stderr, "Failed to initialize Winsock.\n");
        return 1;
    }

    system("cls");
    set_color(FOREGROUND_GREEN | FOREGROUND_BLUE | FOREGROUND_INTENSITY);
    printf("========================================================================\n");
#if defined(_WIN64)
    printf("   DNS SPEEDBENCH v1.0 [64-bit x64 Portable]\n");
#else
    printf("   DNS SPEEDBENCH v1.0 [32-bit x86 Portable]\n");
#endif
    printf("   Developed & Authored by Rohith Varma (rohithvrmaa@gmail.com)\n");
    printf("   Standalone Executable - Zero Installation Required\n");
    printf("========================================================================\n\n");
    set_color(FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_BLUE);

    printf("Starting live benchmark across %d global and public DNS resolvers...\n", g_resolver_count);
    printf("Evaluating latency, UDP round-trip reliability, and responsiveness.\n\n");

    set_color(FOREGROUND_INTENSITY | FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_BLUE);
    printf("%-4s %-26s %-16s %-12s %s\n", "No.", "Resolver Name", "IP Address", "Avg Latency", "Status");
    printf("------------------------------------------------------------------------\n");
    set_color(FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_BLUE);

    for (int i = 0; i < g_resolver_count; i++) {
        double lat = benchmark_dns_resolver(g_resolvers[i].ip, 2);
        if (lat >= 0.0) {
            g_resolvers[i].avg_latency = lat;
            g_resolvers[i].success = 1;
            
            if (lat < 25.0) {
                set_color(FOREGROUND_GREEN | FOREGROUND_INTENSITY);
            } else if (lat < 60.0) {
                set_color(FOREGROUND_GREEN | FOREGROUND_RED | FOREGROUND_INTENSITY);
            } else {
                set_color(FOREGROUND_RED | FOREGROUND_INTENSITY);
            }
            printf("%-4d %-26s %-16s %8.2f ms    Online\n", i + 1, g_resolvers[i].name, g_resolvers[i].ip, lat);
        } else {
            g_resolvers[i].avg_latency = 9999.0;
            g_resolvers[i].success = 0;
            set_color(FOREGROUND_INTENSITY);
            printf("%-4d %-26s %-16s %11s    Timeout\n", i + 1, g_resolvers[i].name, g_resolvers[i].ip, "TIMEOUT");
        }
        set_color(FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_BLUE);
    }

    qsort(g_resolvers, g_resolver_count, sizeof(DnsResolver), compare_resolvers);

    printf("\n------------------------------------------------------------------------\n");
    set_color(FOREGROUND_GREEN | FOREGROUND_INTENSITY);
    printf("TOP 3 FASTEST DNS RESOLVERS DETECTED:\n");
    printf("------------------------------------------------------------------------\n");
    for (int i = 0; i < 3 && i < g_resolver_count; i++) {
        if (g_resolvers[i].success) {
            printf("  #%d: %s (%s) - %.2f ms\n", i + 1, g_resolvers[i].name, g_resolvers[i].ip, g_resolvers[i].avg_latency);
        }
    }
    set_color(FOREGROUND_RED | FOREGROUND_GREEN | FOREGROUND_BLUE);

    printf("\nFastest DNS recommended: %s (%s)\n", g_resolvers[0].name, g_resolvers[0].ip);
    printf("\nActions:\n");
    printf("  [1] Automatically apply fastest DNS to primary Windows network adapter\n");
    printf("  [2] Re-run benchmark\n");
    printf("  [3] Exit\n\n");
    printf("Enter choice (1-3): ");

    int choice = 0;
    if (scanf("%d", &choice) == 1) {
        if (choice == 1 && g_resolvers[0].success) {
            char cmd[512];
            snprintf(cmd, sizeof(cmd),
                     "powershell -Command \"Start-Process powershell -Verb RunAs -ArgumentList '-Command \"Set-DnsClientServerAddress -InterfaceAlias (Get-NetAdapter | Where-Object Status -eq Up | Select-Object -First 1).Name -ServerAddresses \\'%s\\',\\'%s\\'; Clear-DnsClientCache; ipconfig /flushdns; Write-Host \\'Fastest DNS applied successfully!\\' -ForegroundColor Green; Start-Sleep 3\"'\"",
                     g_resolvers[0].ip, g_resolvers[0].secondary);
            system(cmd);
        } else if (choice == 2) {
            WSACleanup();
            return main(argc, argv);
        }
    }

    WSACleanup();
    return 0;
}
