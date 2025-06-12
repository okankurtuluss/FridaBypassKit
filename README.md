# FridaBypassKit
Android Universal Anti-Bypass Framework - Root, SSL Pinning, Emulator &amp; Debug Detection Bypass


## Frida Android Bypass
A powerful Frida script that bypasses common Android security detections and restrictions.

# Features
Root Detection Bypass - Hides root/su binaries, Magisk, and root management apps
SSL Pinning Bypass - Intercepts and bypasses SSL certificate pinning
Emulator Detection Bypass - Spoofs device properties to appear as real device
Debug Detection Bypass - Prevents apps from detecting debugging tools

# Requirements
Rooted Android device or emulator
Frida installed on your computer
Frida-server running on the Android device
Python 3.x (for Frida installation)

# 1. Install Frida on your computer:
pip install frida-tools

# 2. Download and install frida-server on Android:
bash# Check your device architecture
adb shell getprop ro.product.cpu.abi

# Download the correct frida-server from:
#https://github.com/frida/frida/releases

# Push frida-server to device
adb push frida-server /data/local/tmp/
adb shell chmod 755 /data/local/tmp/frida-server

# Run frida-server as root
adb shell su -c /data/local/tmp/frida-server &

## Usage
# Basic usage:
Spawn and hook application
frida -U -f com.example.app -l bypass.js --no-pause

# Attach to running application
frida -U com.example.app -l fridabypasskit.js

# Tested Applications
This script has been tested and works with many applications that implement:

- Root detection (RootBeer, SafetyNet, custom implementations)
- SSL pinning (OkHttp, custom TrustManagers)
- Emulator detection
- Anti-debugging techniques

# Root Detection Bypass
- Hooks File.exists() to hide su binaries
- Intercepts Runtime.exec() calls for root checks
- Hides root-related packages from PackageManager
- Modifies system properties to appear unrooted

# SSL Pinning Bypass
- Hooks TrustManagerImpl.verifyChain() method
- Hooks TrustManagerImpl.checkTrustedRecursive() method
- Bypasses certificate chain verification
- Returns empty certificate chains to avoid validation
- Works with most Android SSL implementations including OkHttp, Retrofit, and custom implementations

# Emulator Detection Bypass
- Spoofs telephony manager values
- Returns fake phone numbers and operator names
- Modifies build properties

# Debug Detection Bypass
- Hooks Debug.isDebuggerConnected()
- Prevents debugger detection
- Bypasses anti-debugging checks

# Disclaimer
This tool is for educational and research purposes only. Users are responsible for complying with applicable laws and regulations. The authors are not responsible for any misuse or damage caused by this tool.
