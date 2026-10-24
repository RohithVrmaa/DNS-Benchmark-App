#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <winsock2.h>
#include <ws2tcpip.h>
#include <shlobj.h>
#include <shlwapi.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <process.h>
#include <iostream>

#include "embedded_assets.h"
#include "webview/include/webview/webview.h"

static volatile int g_serverRunning = 1;
static SOCKET g_serverSock = INVALID_SOCKET;
static unsigned short g_serverPort = 0;

/* Client request handler thread */
static unsigned __stdcall HandleClient(void* pArg) {
    SOCKET client = (SOCKET)(uintptr_t)pArg;
    char buffer[4096];
    int bytesRead = recv(client, buffer, sizeof(buffer) - 1, 0);
    
    if (bytesRead > 0) {
        buffer[bytesRead] = '\0';
        
        char method[16] = {0};
        char path[1024] = {0};
        sscanf(buffer, "%15s %1023s", method, path);

        const unsigned char* content = ASSET_INDEX_HTML;
        size_t contentLength = ASSET_INDEX_HTML_len;
        const char* contentType = "text/html; charset=utf-8";

        if (strstr(path, ".js") != NULL) {
            content = ASSET_INDEX_JS;
            contentLength = ASSET_INDEX_JS_len;
            contentType = "application/javascript; charset=utf-8";
        } else if (strstr(path, ".css") != NULL) {
            content = ASSET_INDEX_CSS;
            contentLength = ASSET_INDEX_CSS_len;
            contentType = "text/css; charset=utf-8";
        } else if (strstr(path, "favicon.ico") != NULL) {
            const char* notFound = "HTTP/1.1 204 No Content\r\nConnection: close\r\n\r\n";
            send(client, notFound, (int)strlen(notFound), 0);
            shutdown(client, SD_SEND);
            closesocket(client);
            return 0;
        }

        char header[512];
        int headerLen = sprintf(header,
            "HTTP/1.1 200 OK\r\n"
            "Content-Type: %s\r\n"
            "Content-Length: %lu\r\n"
            "Access-Control-Allow-Origin: *\r\n"
            "Cache-Control: no-cache, no-store, must-revalidate\r\n"
            "Connection: close\r\n\r\n",
            contentType, (unsigned long)contentLength);

        send(client, header, headerLen, 0);

        // Send content in 16KB chunks
        size_t totalSent = 0;
        while (totalSent < contentLength) {
            size_t toSend = contentLength - totalSent;
            if (toSend > 16384) toSend = 16384;
            int sent = send(client, (const char*)(content + totalSent), (int)toSend, 0);
            if (sent <= 0) break;
            totalSent += (size_t)sent;
        }
    }

    shutdown(client, SD_SEND);
    closesocket(client);
    return 0;
}

/* HTTP server listener thread */
static unsigned __stdcall ServerThread(void* pArg) {
    (void)pArg;
    while (g_serverRunning) {
        struct sockaddr_in clientAddr;
        int clientLen = sizeof(clientAddr);
        SOCKET client = accept(g_serverSock, (struct sockaddr*)&clientAddr, &clientLen);
        if (client == INVALID_SOCKET) {
            if (!g_serverRunning) break;
            Sleep(10);
            continue;
        }

        HANDLE hClient = (HANDLE)_beginthreadex(NULL, 0, HandleClient, (void*)(uintptr_t)client, 0, NULL);
        if (hClient) {
            CloseHandle(hClient);
        } else {
            closesocket(client);
        }
    }
    return 0;
}

/* Entry point for pure Windows GUI application (no console) */
int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    (void)hInstance;
    (void)hPrevInstance;
    (void)lpCmdLine;
    (void)nCmdShow;

    // Initialize Winsock
    WSADATA wsa;
    if (WSAStartup(MAKEWORD(2, 2), &wsa) != 0) {
        MessageBoxW(NULL, L"Failed to initialize network subsystem.", L"DNS SpeedBench Error", MB_OK | MB_ICONERROR);
        return 1;
    }

    // Create server socket binding to localhost on random free port
    g_serverSock = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (g_serverSock == INVALID_SOCKET) {
        WSACleanup();
        MessageBoxW(NULL, L"Failed to create local communication socket.", L"DNS SpeedBench Error", MB_OK | MB_ICONERROR);
        return 1;
    }

    struct sockaddr_in srvAddr;
    ZeroMemory(&srvAddr, sizeof(srvAddr));
    srvAddr.sin_family = AF_INET;
    srvAddr.sin_addr.s_addr = inet_addr("127.0.0.1");
    srvAddr.sin_port = htons(0); // 0 = OS selects free ephemeral port

    if (bind(g_serverSock, (struct sockaddr*)&srvAddr, sizeof(srvAddr)) == SOCKET_ERROR) {
        closesocket(g_serverSock);
        WSACleanup();
        MessageBoxW(NULL, L"Failed to bind local loopback port.", L"DNS SpeedBench Error", MB_OK | MB_ICONERROR);
        return 1;
    }

    struct sockaddr_in boundAddr;
    int addrLen = sizeof(boundAddr);
    if (getsockname(g_serverSock, (struct sockaddr*)&boundAddr, &addrLen) == 0) {
        g_serverPort = ntohs(boundAddr.sin_port);
    } else {
        g_serverPort = 48291;
    }

    if (listen(g_serverSock, SOMAXCONN) == SOCKET_ERROR) {
        closesocket(g_serverSock);
        WSACleanup();
        MessageBoxW(NULL, L"Failed to listen on local loopback.", L"DNS SpeedBench Error", MB_OK | MB_ICONERROR);
        return 1;
    }

    // Start background HTTP server
    HANDLE hServer = (HANDLE)_beginthreadex(NULL, 0, ServerThread, NULL, 0, NULL);
    Sleep(50);

    try {
        // Create native Windows application window (real HWND, own class, own taskbar icon)
        webview::webview w(false, nullptr);
        w.set_title("DNS SpeedBench v1.0");
        w.set_size(1280, 840, WEBVIEW_HINT_NONE);

        // Native app polish: set desktop flag, disable context menu, hotkeys, zoom, and drag/drop
        w.init(
            "window.__IS_NATIVE_DESKTOP__ = true;\n"
            "window.addEventListener('contextmenu', function(e) { e.preventDefault(); });\n"
            "window.addEventListener('keydown', function(e) {\n"
            "  if (e.key === 'F5' || (e.ctrlKey && ['r','R','p','P','u','U','s','S','f','F','+','-','=','0'].indexOf(e.key) !== -1)) {\n"
            "    e.preventDefault();\n"
            "  }\n"
            "});\n"
            "window.addEventListener('wheel', function(e) { if (e.ctrlKey) e.preventDefault(); }, { passive: false });\n"
            "window.addEventListener('dragover', function(e) { e.preventDefault(); });\n"
            "window.addEventListener('drop', function(e) { e.preventDefault(); });\n"
        );

        // Set native window icon from embedded resource 101
        auto winRes = w.window();
        if (winRes.has_value()) {
            HWND hwnd = (HWND)winRes.value();
            HICON hIcon = LoadIcon(hInstance, MAKEINTRESOURCE(101));
            if (hIcon) {
                SendMessage(hwnd, WM_SETICON, ICON_BIG, (LPARAM)hIcon);
                SendMessage(hwnd, WM_SETICON, ICON_SMALL, (LPARAM)hIcon);
            }
        }

        // Navigate to local embedded web application in native desktop mode
        char url[128];
        snprintf(url, sizeof(url), "http://127.0.0.1:%u/?native=1", g_serverPort);
        w.navigate(url);

        // Run native Windows message loop
        w.run();
    } catch (const webview::exception &e) {
        // Fallback message if WebView2 runtime is missing
        MessageBoxW(NULL,
            L"DNS SpeedBench encountered an issue initializing the native desktop view.\n\n"
            L"Please ensure Microsoft Edge or the Evergreen WebView2 Runtime is present on your system.",
            L"DNS SpeedBench", MB_OK | MB_ICONEXCLAMATION);
    } catch (...) {
        MessageBoxW(NULL, L"Unexpected application error.", L"DNS SpeedBench", MB_OK | MB_ICONERROR);
    }

    // Clean shutdown
    g_serverRunning = 0;
    if (g_serverSock != INVALID_SOCKET) {
        closesocket(g_serverSock);
    }
    if (hServer) {
        WaitForSingleObject(hServer, 1000);
        CloseHandle(hServer);
    }
    WSACleanup();

    return 0;
}
