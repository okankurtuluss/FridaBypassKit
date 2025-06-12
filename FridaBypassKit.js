Java.perform(function() {
    console.log("[AUABF] Script starting...");
    
    var File = Java.use("java.io.File");
    File.exists.implementation = function() {
        var path = this.getAbsolutePath();
        var dangerous_paths = [
            "/su", "/system/bin/su", "/system/xbin/su", "/sbin/su",
            "/data/local/xbin/su", "/data/local/bin/su", "/system/sd/xbin/su",
            "/system/bin/failsafe/su", "/data/local/su", "/su/bin/su",
            "/system/app/Superuser.apk", "/system/etc/init.d/99SuperSUDaemon",
            "/dev/com.koushikdutta.superuser.daemon/", "/system/xbin/daemonsu",
            "com.koushikdutta.superuser", "com.thirdparty.superuser",
            "eu.chainfire.supersu", "com.noshufou.android.su"
        ];
        
        for (var i = 0; i < dangerous_paths.length; i++) {
            if (path.indexOf(dangerous_paths[i]) != -1) {
                console.log("[BYPASS-ROOT] File.exists(): " + path + " -> false");
                return false;
            }
        }
        return this.exists();
    };
    
    var Runtime = Java.use("java.lang.Runtime");
    var ProcessBuilder = Java.use("java.lang.ProcessBuilder");
    var Process = Java.use("java.lang.Process");
    
    function createFakeProcess() {
        var ByteArrayInputStream = Java.use("java.io.ByteArrayInputStream");
        var ByteArrayOutputStream = Java.use("java.io.ByteArrayOutputStream");
        
        var fakeProcess = Process.$new();
        
        fakeProcess.getInputStream.implementation = function() {
            return ByteArrayInputStream.$new([]);
        };
        
        fakeProcess.getOutputStream.implementation = function() {
            return ByteArrayOutputStream.$new();
        };
        
        fakeProcess.getErrorStream.implementation = function() {
            return ByteArrayInputStream.$new([]);
        };
        
        fakeProcess.waitFor.implementation = function() {
            return 0;
        };
        
        fakeProcess.exitValue.implementation = function() {
            return 0;
        };
        
        fakeProcess.destroy.implementation = function() {
        };
        
        return fakeProcess;
    }
    
    Runtime.exec.overload('java.lang.String').implementation = function(cmd) {
        console.log("[BYPASS-ROOT] Runtime.exec: " + cmd);
        if (cmd.indexOf("su") != -1 || cmd.indexOf("which") != -1) {
            console.log("[BYPASS-ROOT] Command blocked! Returning fake process.");
            return createFakeProcess();
        }
        return this.exec(cmd);
    };
    
    Runtime.exec.overload('[Ljava.lang.String;').implementation = function(cmds) {
        var cmd = cmds.join(" ");
        console.log("[BYPASS-ROOT] Runtime.exec[]: " + cmd);
        if (cmd.indexOf("su") != -1 || cmd.indexOf("which") != -1) {
            console.log("[BYPASS-ROOT] Command blocked! Returning fake process.");
            return createFakeProcess();
        }
        return this.exec(cmds);
    };
    
    Runtime.exec.overload('java.lang.String', '[Ljava.lang.String;').implementation = function(cmd, env) {
        console.log("[BYPASS-ROOT] Runtime.exec with env: " + cmd);
        if (cmd.indexOf("su") != -1 || cmd.indexOf("which") != -1) {
            console.log("[BYPASS-ROOT] Command blocked! Returning fake process.");
            return createFakeProcess();
        }
        return this.exec(cmd, env);
    };
    
    Runtime.exec.overload('[Ljava.lang.String;', '[Ljava.lang.String;').implementation = function(cmds, env) {
        var cmd = cmds.join(" ");
        console.log("[BYPASS-ROOT] Runtime.exec[] with env: " + cmd);
        if (cmd.indexOf("su") != -1 || cmd.indexOf("which") != -1) {
            console.log("[BYPASS-ROOT] Command blocked! Returning fake process.");
            return createFakeProcess();
        }
        return this.exec(cmds, env);
    };
    
    ProcessBuilder.start.implementation = function() {
        var cmd = this.command();
        console.log("[BYPASS-ROOT] ProcessBuilder.start: " + cmd);
        if (cmd.toString().indexOf("su") != -1) {
            console.log("[BYPASS-ROOT] Process blocked! Returning fake process.");
            return createFakeProcess();
        }
        return this.start();
    };
    
    var Build = Java.use("android.os.Build");
    Build.TAGS.value = "release-keys";
    
    try {
        var SystemProperties = Java.use("android.os.SystemProperties");
        SystemProperties.get.overload('java.lang.String').implementation = function(key) {
            console.log("[BYPASS-ROOT] SystemProperties.get: " + key);
            if (key == "ro.debuggable" || key == "ro.secure") {
                return "0";
            }
            if (key == "ro.build.tags") {
                return "release-keys";
            }
            return this.get(key);
        };
    } catch(e) {
        console.log("[ERROR] SystemProperties hook failed: " + e);
    }
    
    try {
        var PackageManager = Java.use("android.app.ApplicationPackageManager");
        PackageManager.getPackageInfo.overload('java.lang.String', 'int').implementation = function(pkg, flags) {
            var dangerous_packages = [
                "com.koushikdutta.superuser", "com.thirdparty.superuser",
                "eu.chainfire.supersu", "com.noshufou.android.su",
                "com.zachspong.temprootremovejb", "com.ramdroid.appquarantine",
                "com.koushikdutta.rommanager", "com.koushikdutta.rommanager.license",
                "com.dimonvideo.luckypatcher", "com.chelpus.lackypatch",
                "com.ramdroid.appquarantine", "com.ramdroid.appquarantinepro"
            ];
            
            if (dangerous_packages.indexOf(pkg) != -1) {
                console.log("[BYPASS-ROOT] Package hidden: " + pkg);
                var NameNotFoundException = Java.use("android.content.pm.PackageManager$NameNotFoundException");
                throw NameNotFoundException.$new(pkg);
            }
            return this.getPackageInfo(pkg, flags);
        };
    } catch (e) {
        console.log("[ERROR] PackageManager hook failed: " + e);
    }
    
    try {
        var UnixFileSystem = Java.use("java.io.UnixFileSystem");
        UnixFileSystem.checkAccess.implementation = function(file, access) {
            var path = file.toString();
            console.log("[BYPASS-ROOT] UnixFileSystem.checkAccess " + path);
            
            var dangerous_paths = [
                "/su", "/system/bin/su", "/system/xbin/su", "/sbin/su",
                "/data/local/xbin/su", "/data/local/bin/su", "/system/sd/xbin/su",
                "/system/bin/failsafe/su", "/data/local/su", "/su/bin/su",
                "/system/app/Superuser.apk", "/vendor/bin/su", "/cache/su", "/data/su"
            ];
            
            for (var i = 0; i < dangerous_paths.length; i++) {
                if (path.indexOf(dangerous_paths[i]) != -1) {
                    console.log("[BYPASS-ROOT] Access denied: " + path);
                    return false;
                }
            }
            
            return this.checkAccess(file, access);
        };
    } catch(e) {
        console.log("[ERROR] UnixFileSystem hook failed: " + e);
    }
    
    try {
        var TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
        TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain, host, clientAuth, ocspData, tlsSctData) {
            console.log('[BYPASS-SSL] TrustManagerImpl.verifyChain bypassed');
            return untrustedChain;
        };
    } catch(e) {
        console.log('[ERROR] TrustManagerImpl hook failed: ' + e);
    }
    
    try {
        var TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
        TrustManagerImpl.checkTrustedRecursive.implementation = function(certs, host, clientAuth, untrustedChain, trustAnchorChain, used) {
            console.log('[BYPASS-SSL] TrustManagerImpl.checkTrustedRecursive bypassed');
            return Java.use('java.util.ArrayList').$new();
        };
    } catch(e) {
        console.log('[ERROR] checkTrustedRecursive hook failed: ' + e);
    }
    
    try {
        var TelephonyManager = Java.use('android.telephony.TelephonyManager');
        
        TelephonyManager.getNetworkOperatorName.implementation = function() {
            console.log('[BYPASS-EMU] TelephonyManager.getNetworkOperatorName -> T-Mobile');
            return "T-Mobile";
        };
        
        TelephonyManager.getSimOperatorName.implementation = function() {
            console.log('[BYPASS-EMU] TelephonyManager.getSimOperatorName -> T-Mobile');
            return "T-Mobile";
        };
        
        TelephonyManager.getLine1Number.implementation = function() {
            console.log('[BYPASS-EMU] TelephonyManager.getLine1Number -> +1234567890');
            return "+1234567890";
        };
    } catch(e) {
        console.log('[ERROR] TelephonyManager hook failed: ' + e);
    }
    
    try {
        var Debug = Java.use('android.os.Debug');
        Debug.isDebuggerConnected.implementation = function() {
            console.log('[BYPASS-DEBUG] Debug.isDebuggerConnected -> false');
            return false;
        };
        
        Debug.waitingForDebugger.implementation = function() {
            console.log('[BYPASS-DEBUG] Debug.waitingForDebugger -> false');
            return false;
        };
    } catch(e) {
        console.log('[ERROR] Debug hook failed: ' + e);
    }
    
    console.log("[AUABF] ✓ All bypasses loaded successfully!");
});