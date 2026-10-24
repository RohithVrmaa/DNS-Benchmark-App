#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <winsock2.h>
#include <ws2tcpip.h>
#include <shlobj.h>
#include <shlwapi.h>
#include <shellapi.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <process.h>
#include "embedded_assets.h"

static volatile int g_serverRunning = 1;
static SOCKET g_serverSock = INVALID_SOCKET;
static unsigned short g_serverPort = 0;

/* Helper to check if file exists */
static BOOL FileExistsW(const wchar_t* path) {
    DWORD dwAttrib = GetFileAttributesW(path);
    return (dwAttrib != INVALID_FILE_ATTRIBUTES && !(dwAttrib & FILE_ATTRIBUTE_DIRECTORY));
}

/* Helper to check registry for App Path */
static BOOL GetAppPathFromRegistry(const wchar_t* appName, wchar_t* outPath, DWORD maxLen) {
    wchar_t subKey[512];
    wnsprintfW(subKey, 512, L"SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\%s", appName);
    
    HKEY hKey;
    if (RegOpenKeyExW(HKEY_LOCAL_MACHINE, subKey, 0, KEY_READ, &hKey) == ERROR_SUCCESS) {
        DWORD size = maxLen * sizeof(wchar_t);
        DWORD type = 0;
        if (RegQueryValueExW(hKey, NULL, NULL, &type, (LPBYTE)outPath, &size) == ERROR_SUCCESS) {
            RegCloseKey(hKey);
            // Remove enclosing quotes if any
            if (outPath[0] == L'"') {
                size_t len = wcslen(outPath);
                if (len > 1 && outPath[len - 1] == L'"') {
                    outPath[len - 1] = L'\0';
                    memmove(outPath, outPath + 1, (len - 1) * sizeof(wchar_t));
                }
            }
            if (FileExistsW(outPath)) {
                return TRUE;
            }
        }
        RegCloseKey(hKey);
    }
    return FALSE;
}

/* Locate Microsoft Edge, Chrome, or other Chromium browser */
static BOOL FindChromiumBrowser(wchar_t* outPath, size_t maxLen) {
    wchar_t buf[MAX_PATH];

    // 1. Check registry for msedge.exe
    if (GetAppPathFromRegistry(L"msedge.exe", outPath, (DWORD)maxLen)) {
        return TRUE;
    }

    // 2. Standard Program Files (x86) / Program Files for Edge
    wchar_t progFiles[MAX_PATH];
    if (GetEnvironmentVariableW(L"ProgramFiles(x86)", progFiles, MAX_PATH)) {
        wnsprintfW(buf, MAX_PATH, L"%s\\Microsoft\\Edge\\Application\\msedge.exe", progFiles);
        if (FileExistsW(buf)) {
            wcsncpy(outPath, buf, maxLen);
            return TRUE;
        }
    }
    if (GetEnvironmentVariableW(L"ProgramFiles", progFiles, MAX_PATH)) {
        wnsprintfW(buf, MAX_PATH, L"%s\\Microsoft\\Edge\\Application\\msedge.exe", progFiles);
        if (FileExistsW(buf)) {
            wcsncpy(outPath, buf, maxLen);
            return TRUE;
        }
    }

    // 3. User LocalAppData for Edge
    if (GetEnvironmentVariableW(L"LOCALAPPDATA", progFiles, MAX_PATH)) {
        wnsprintfW(buf, MAX_PATH, L"%s\\Microsoft\\Edge\\Application\\msedge.exe", progFiles);
        if (FileExistsW(buf)) {
            wcsncpy(outPath, buf, maxLen);
            return TRUE;
        }
    }

    // 4. Check registry for chrome.exe
    if (GetAppPathFromRegistry(L"chrome.exe", outPath, (DWORD)maxLen)) {
        return TRUE;
    }

    // 5. Standard Program Files for Chrome
    if (GetEnvironmentVariableW(L"ProgramFiles", progFiles, MAX_PATH)) {
        wnsprintfW(buf, MAX_PATH, L"%s\\Google\\Chrome\\Application\\chrome.exe", progFiles);
        if (FileExistsW(buf)) {
            wcsncpy(outPath, buf, maxLen);
            return TRUE;
        }
    }
    if (GetEnvironmentVariableW(L"ProgramFiles(x86)", progFiles, MAX_PATH)) {
        wnsprintfW(buf, MAX_PATH, L"%s\\Google\\Chrome\\Application\\chrome.exe", progFiles);
        if (FileExistsW(buf)) {
            wcsncpy(outPath, buf, maxLen);
            return TRUE;
        }
    }

    // 6. User LocalAppData for Chrome
    if (GetEnvironmentVariableW(L"LOCALAPPDATA", progFiles, MAX_PATH)) {
        wnsprintfW(buf, MAX_PATH, L"%s\\Google\\Chrome\\Application\\chrome.exe", progFiles);
        if (FileExistsW(buf)) {
            wcsncpy(outPath, buf, maxLen);
            return TRUE;
        }
    }

    // 7. Check Brave
    if (GetEnvironmentVariableW(L"ProgramFiles", progFiles, MAX_PATH)) {
        wnsprintfW(buf, MAX_PATH, L"%s\\BraveSoftware\\Brave-Browser\\Application\\brave.exe", progFiles);
        if (FileExistsW(buf)) {
            wcsncpy(outPath, buf, maxLen);
            return TRUE;
        }
    }

    return FALSE;
}

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

/* Windows GUI entry point */
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

    // Give server thread a few milliseconds to spin up
    Sleep(50);

    // Prepare temp profile directory for standalone app session
    wchar_t tempPath[MAX_PATH];
    GetTempPathW(MAX_PATH, tempPath);
    wchar_t profileDir[MAX_PATH];
    wnsprintfW(profileDir, MAX_PATH, L"%sDNS-SpeedBench-Profile", tempPath);
    CreateDirectoryW(profileDir, NULL);

    // Locate Edge or Chrome
    wchar_t browserPath[MAX_PATH];
    BOOL hasBrowser = FindChromiumBrowser(browserPath, MAX_PATH);

    if (hasBrowser) {
        wchar_t cmdLine[2048];
        wnsprintfW(cmdLine, 2048,
            L"\"%s\" --app=\"http://127.0.0.1:%u/\" --window-size=1260,840 --user-data-dir=\"%s\" --no-first-run --no-default-browser-check",
            browserPath, g_serverPort, profileDir);

        STARTUPINFOW si;
        PROCESS_INFORMATION pi;
        ZeroMemory(&si, sizeof(si));
        si.cb = sizeof(si);
        ZeroMemory(&pi, sizeof(pi));

        if (CreateProcessW(NULL, cmdLine, NULL, NULL, FALSE, 0, NULL, NULL, &si, &pi)) {
            // Wait for user to close the dedicated app window
            WaitForSingleObject(pi.hProcess, INFINITE);
            CloseHandle(pi.hProcess);
            CloseHandle(pi.hThread);
        } else {
            // Fallback to default browser
            wchar_t url[256];
            wnsprintfW(url, 256, L"http://127.0.0.1:%u/", g_serverPort);
            ShellExecuteW(NULL, L"open", url, NULL, NULL, SW_SHOWNORMAL);
            // Wait while server runs
            Sleep(600000);
        }
    } else {
        // Fallback to system default browser
        wchar_t url[256];
        wnsprintfW(url, 256, L"http://127.0.0.1:%u/", g_serverPort);
        ShellExecuteW(NULL, L"open", url, NULL, NULL, SW_SHOWNORMAL);
        Sleep(600000);
    }

    // Shutdown server
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
