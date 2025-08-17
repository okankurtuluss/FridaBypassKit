/*
 * Updated Frida Script - 2025
 * Combines root hiding, emulator spoofing, and SSL pinning bypass
 * Compatible with latest Frida versions (16+)
 */

function bypassRootAndEmulator() {
    Java.perform(function () {
        console.log("[+] Starting anti-detection bypass...");

        // ====== 1. LIST OF ROOT / DETECTION INDICATORS ======
        const ROOT_PACKAGES = [
            "com.noshufou.android.su", "com.noshufou.android.su.elite",
            "eu.chainfire.supersu", "com.koushikdutta.superuser",
            "com.thirdparty.superuser", "com.yellowes.su",
            "com.koushikdutta.rommanager", "com.koushikdutta.rommanager.license",
            "com.dimonvideo.luckypatcher", "com.chelpus.lackypatch",
            "com.ramdroid.appquarantine", "com.ramdroid.appquarantinepro",
            "com.devadvance.rootcloak", "com.devadvance.rootcloakplus",
            "de.robv.android.xposed.installer", "com.saurik.substrate",
            "com.zachspong.temprootremovejb", "me.phh.superuser",
            "com.amphoras.hidemyroot", "com.amphoras.hidemyrootadfree",
            "com.formyhm.hideroot", "com.formyhm.hiderootpremium",
            "eu.chainfire.supersu.pro", "com.kingouser.com",
            "com.topjohnwu.magisk", "me.weishu.kernelsu", // KernelSU
            "com.topjohnwu.magisk.canary"
        ];

        const ROOT_BINARIES = [
            "su", "busybox", "supersu", "Superuser.apk",
            "KingoUser.apk", "SuperSu.apk", "magisk",
            "frida-server", "frida-agent", "gum-js-android-x86.so"
        ];

        const EMULATOR_FILES = [
            "/dev/qemu_pipe",
            "/dev/socket/qemud",
            "/system/lib/libc_malloc_debug_qemu.so",
            "/sys/qemu_trace",
            "/system/bin/qemu-props"
        ];

        // ====== 2. CUSTOM DEVICE PROPERTIES (Spoof Samsung Galaxy S9) ======
        const FAKE_PROPS = {
            "ro.build.selinux": "1",
            "ro.debuggable": "0",
            "service.adb.root": "0",
            "ro.secure": "1",
            "ro.kernel.qemu": "0",
            "ro.boot.qemu": "0",
            "ro.product.device": "starlte",
            "ro.product.model": "SM-G960F",
            "ro.product.manufacturer": "samsung",
            "ro.product.brand": "samsung",
            "ro.product.name": "starltexx",
            "ro.build.fingerprint": "samsung/starltexx/starlte:10/QP1A.190711.020/G960FXXSDFUG5:user/release-keys",
            "ro.build.tags": "release-keys",
            "ro.build.type": "user",
            "ro.hardware": "samsungexynos9810",
            "ro.serialno": "R28M30XXXX"
        };

        const FAKE_PROP_KEYS = Object.keys(FAKE_PROPS);

        // ====== 3. JAVA CLASSES ======
        const Build = Java.use('android.os.Build');
        const SystemProperties = Java.use('android.os.SystemProperties');
        const PackageManager = Java.use('android.app.ApplicationPackageManager');
        const Runtime = Java.use('java.lang.Runtime');
        const File = Java.use('java.io.File');
        const String = Java.use('java.lang.String');
        const TelephonyManager = Java.use('android.telephony.TelephonyManager');
        const Secure = Java.use('android.provider.Settings$Secure');
        const ProcessBuilder = Java.use('java.lang.ProcessBuilder');
        const BufferedReader = Java.use('java.io.BufferedReader');

        // ====== 4. SPOOF DEVICE HARDWARE PROPERTIES ======
        Build.DEVICE.value = "starlte";
        Build.MANUFACTURER.value = "samsung";
        Build.BRAND.value = "samsung";
        Build.MODEL.value = "SM-G960F";
        Build.HARDWARE.value = "samsungexynos9810";
        Build.PRODUCT.value = "starltexx";
        Build.FINGERPRINT.value = "samsung/starltexx/starlte:10/QP1A.190711.020/G960FXXSDFUG5:user/release-keys";
        Build.TAGS.value = "release-keys";
        Build.SERIAL.value = "R28M30XXXX";
        Build.SUPPORTED_ABIS.value = ["armeabi-v7a", "armeabi"];
        Build.CPU_ABI.value = "armeabi-v7a";
        Build.CPU_ABI2.value = "armeabi";

        // ====== 5. TELEPHONY SPOOFING (IMEI, IMSI, etc.) ======
        TelephonyManager.getDeviceId.overloads.forEach(function (overload) {
            overload.implementation = function () {
                console.log("[+] Bypassing getDeviceId()");
                return "359872070XXXXXX";
            };
        });

        if (TelephonyManager.getImei) {
            TelephonyManager.getImei.overloads.forEach(function (overload) {
                overload.implementation = function () {
                    console.log("[+] Bypassing getImei()");
                    return "359872070XXXXXX";
                };
            });
        }

        TelephonyManager.getSubscriberId.overloads.forEach(function (overload) {
            overload.implementation = function () {
                console.log("[+] Bypassing getSubscriberId()");
                return "310260000000000";
            };
        });

        TelephonyManager.getNetworkOperatorName.overloads.forEach(function (overload) {
            overload.implementation = function () {
                console.log("[+] Bypassing getNetworkOperatorName()");
                return "T-Mobile";
            };
        });

        TelephonyManager.getSimOperatorName.overloads.forEach(function (overload) {
            overload.implementation = function () {
                console.log("[+] Bypassing getSimOperatorName()");
                return "T-Mobile";
            };
        });

        TelephonyManager.getPhoneType.overloads.forEach(function (overload) {
            overload.implementation = function () {
                console.log("[+] Bypassing getPhoneType()");
                return 1; // PHONE_TYPE_GSM
            };
        });

        TelephonyManager.getNetworkCountryIso.overloads.forEach(function (overload) {
            overload.implementation = function () {
                console.log("[+] Bypassing getNetworkCountryIso()");
                return "us";
            };
        });

        TelephonyManager.getSimCountryIso.overloads.forEach(function (overload) {
            overload.implementation = function () {
                console.log("[+] Bypassing getSimCountryIso()");
                return "us";
            };
        });

        // ====== 6. ANDROID ID SPOOFING ======
        Secure.getString.overloads.forEach(function (overload) {
            overload.implementation = function (contentResolver, name) {
                if (name === Secure.ANDROID_ID.value) {
                    console.log("[+] Bypassing ANDROID_ID");
                    return "9774d56d682e549c";
                }
                return this.getString(contentResolver, name);
            };
        });

        // ====== 7. HIDE ROOT APPS FROM PACKAGE MANAGER ======
        PackageManager.getPackageInfo.overloads.forEach(function (overload) {
            overload.implementation = function (packageName, flags) {
                if (ROOT_PACKAGES.includes(packageName)) {
                    console.log(`[+] Hiding root package: ${packageName}`);
                    packageName = "com.unknown.fake.app"; // Invalid package
                }
                return this.getPackageInfo(packageName, flags);
            };
        });

        // ====== 8. HIDE ROOT / EMULATOR FILES ======
        File.exists.implementation = function () {
            const path = this.getAbsolutePath();
            const name = this.getName();

            if (ROOT_BINARIES.includes(name) || EMULATOR_FILES.includes(path)) {
                console.log(`[+] Blocking file access: ${path || name}`);
                return false;
            }
            return this.exists.call(this);
        };

        // ====== 9. BLOCK SUSPICIOUS COMMANDS (su, getprop, etc.) ======
        const SUSPICIOUS_CMDS = [
            "getprop", "mount", "build.prop", "id", "sh",
            "cat /proc/cpuinfo", "ifconfig", "ip addr", "ps", "netstat"
        ];

        function isSuspicious(cmd) {
            return SUSPICIOUS_CMDS.some(k => cmd.includes(k));
        }

        // Hook Runtime.exec variants
        const execMethods = [
            Runtime.exec.overload('java.lang.String'),
            Runtime.exec.overload('[Ljava.lang.String;'),
            Runtime.exec.overload('java.lang.String', '[Ljava.lang.String;'),
            Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;'),
            Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;', 'java.io.File')
        ];

        execMethods.forEach(method => {
            method.implementation = function () {
                const args = Array.from(arguments);
                let cmd = args[0];

                if (typeof cmd === 'string' && (isSuspicious(cmd) || cmd === "su")) {
                    console.log(`[+] Blocking command: ${cmd}`);
                    cmd = "grep"; // harmless command
                } else if (Array.isArray(cmd) && (isSuspicious(cmd.join(" ")) || cmd[0] === "su")) {
                    console.log(`[+] Blocking command array: ${cmd.join(" ")}`);
                    cmd = ["grep"];
                }

                return method.apply(this, [cmd, ...args.slice(1)]);
            };
        });

        // ====== 10. HIDE "test-keys" IN STRING CHECKS ======
        String.contains.implementation = function (name) {
            if (name === "test-keys") {
                console.log("[+] Hiding test-keys");
                return false;
            }
            return this.contains.call(this, name);
        };

        // ====== 11. SPOOF SYSTEM PROPERTIES ======
        SystemProperties.get.overloads.forEach(function (overload) {
            overload.implementation = function (name) {
                if (FAKE_PROP_KEYS.includes(name)) {
                    console.log(`[+] Spoofing property: ${name}`);
                    return FAKE_PROPS[name];
                }
                return this.get(name);
            };
        });

        // ====== 12. NATIVE LEVEL: fopen() & system() HOOKS ======
        if (Module.findExportByName("libc.so", "fopen")) {
            Interceptor.attach(Module.findExportByName("libc.so", "fopen"), {
                onEnter: function (args) {
                    const path = Memory.readCString(args[0]);
                    if (ROOT_BINARIES.some(b => path.includes(b)) || EMULATOR_FILES.includes(path)) {
                        Memory.writeUtf8String(args[0], "/no/way");
                        console.log(`[+] Blocked fopen for: ${path}`);
                    }
                }
            });
        }

        if (Module.findExportByName("libc.so", "system")) {
            Interceptor.attach(Module.findExportByName("libc.so", "system"), {
                onEnter: function (args) {
                    const cmd = Memory.readCString(args[0]);
                    if (isSuspicious(cmd) || cmd === "su") {
                        console.log(`[+] Blocked native system(): ${cmd}`);
                        Memory.writeUtf8String(args[0], "grep");
                    }
                }
            });
        }

        // ====== 13. BUFFERED READER: HIDE EMULATOR STRINGS ======
        BufferedReader.readLine.overloads.forEach(function (overload) {
            overload.implementation = function () {
                let line = this.readLine.call(this);
                if (line !== null) {
                    const badWords = ["goldfish", "ranchu", "generic", "intel", "qemu", "sdk"];
                    if (badWords.some(word => line.includes(word))) {
                        console.log(`[+] Removing suspicious line: ${line}`);
                        line = ""; // empty it
                    }
                    if (line.includes("ro.build.tags=test-keys")) {
                        line = line.replace("test-keys", "release-keys");
                        console.log("[+] Fixed build.tags in file read");
                    }
                }
                return line;
            };
        });

        // ====== 14. PROCESS BUILDER SPOOFING ======
        ProcessBuilder.start.implementation = function () {
            const cmdList = this.command();
            const cmdStr = cmdList.toString();
            if (isSuspicious(cmdStr) || cmdList.get(0) === "su") {
                console.log(`[+] Blocking ProcessBuilder: ${cmdStr}`);
                this.command(["grep"]);
            }
            return this.start.call(this);
        };

        console.log("[+] Anti-detection hooks installed!");
    });
}

// ========= SSL PINNING BYPASS =========
function bypassSSLPinning() {
    setTimeout(function () {
        Java.perform(function () {
            console.log("[+] Starting SSL Pinning Bypass...");

            try {
                const CertificateFactory = Java.use("java.security.cert.CertificateFactory");
                const FileInputStream = Java.use("java.io.FileInputStream");
                const BufferedInputStream = Java.use("java.io.BufferedInputStream");
                const X509Certificate = Java.use("java.security.cert.X509Certificate");
                const KeyStore = Java.use("java.security.KeyStore");
                const TrustManagerFactory = Java.use("javax.net.ssl.TrustManagerFactory");
                const SSLContext = Java.use("javax.net.ssl.SSLContext");

                // Load your Burp/Charles certificate
                const certPath = "/data/local/tmp/cert-der.crt"; // Change if needed
                const cf = CertificateFactory.getInstance("X.509");

                let fileInputStream;
                try {
                    fileInputStream = FileInputStream.$new(certPath);
                } catch (e) {
                    console.log(`[-] Certificate not found: ${certPath}`);
                    console.log("[*] Use: adb push your-cert.crt /data/local/tmp/cert-der.crt");
                    return;
                }

                const bufferedInputStream = BufferedInputStream.$new(fileInputStream);
                const ca = cf.generateCertificate(bufferedInputStream);
                bufferedInputStream.close();
                fileInputStream.close();

                const cert = Java.cast(ca, X509Certificate);
                console.log(`[+] Loaded CA: ${cert.getSubjectDN().getName()}`);

                // Create custom KeyStore
                const keyStore = KeyStore.getInstance(KeyStore.getDefaultType());
                keyStore.load(null);
                keyStore.setCertificateEntry("frida-ca", ca);

                // Initialize custom TrustManager
                const tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
                tmf.init(keyStore);

                // Hook SSLContext.init to replace TrustManager
                SSLContext.init.overloads.forEach(function (overload) {
                    overload.implementation = function (keyManager, trustManager, secureRandom) {
                        console.log("[*] SSLContext.init() hooked!");
                        overload.call(this, keyManager, tmf.getTrustManagers(), secureRandom);
                    };
                });

                console.log("[+] SSL Pinning Bypass Applied!");
            } catch (err) {
                console.log("[-] SSL Bypass failed:", err);
            }
        });
    }, 1000); // Small delay to ensure app is ready
}

// ========= RUN BOTH MODULES =========
if (Java.available) {
    bypassRootAndEmulator();
    bypassSSLPinning();
} else {
    console.log("[-] Java environment not available.");
}
