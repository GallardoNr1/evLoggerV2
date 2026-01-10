import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, copyFileSync } from "node:fs";
import { join } from "node:path";

function run(cmd) {
    execSync(cmd, { stdio: "inherit", shell: true });
}

function appendIfMissing(filePath, content) {
    const current = existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
    if (!current.includes(content.trim())) {
        writeFileSync(filePath, current + "\n\n" + content.trim() + "\n", "utf8");
    }
}

function injectSigningIntoAppBuildGradle(appGradlePath) {
    let s = readFileSync(appGradlePath, "utf8");

    // If already injected, do nothing
    if (s.includes("signingConfigs") && s.includes("EVLOGGER_KEY_ALIAS")) return;

    const marker = "compileSdk = rootProject.ext.compileSdkVersion";
    if (!s.includes(marker)) {
        throw new Error(`No encuentro marker '${marker}' en ${appGradlePath}`);
    }

    const signingBlock = `
    signingConfigs {
        release {
            storeFile file(EVLOGGER_STORE_FILE)
            storePassword EVLOGGER_STORE_PASSWORD
            keyAlias EVLOGGER_KEY_ALIAS
            keyPassword EVLOGGER_KEY_PASSWORD
        }
    }
`;

    s = s.replace(marker, `${marker}\n${signingBlock}`);

    // Ensure buildTypes.release uses signingConfig (solo si no está ya)
    if (!s.includes("signingConfig signingConfigs.release")) {
        s = s.replace(
            /buildTypes\s*\{\s*release\s*\{/m,
            "buildTypes {\n        release {\n            signingConfig signingConfigs.release"
        );
    }

    writeFileSync(appGradlePath, s, "utf8");
}

/**
 * Crea android/local.properties con sdk.dir automáticamente
 * - Usa ANDROID_SDK_ROOT/ANDROID_HOME si existen
 * - Si no, usa LOCALAPPDATA\Android\Sdk (típico en Windows)
 */
function ensureAndroidSdkLocalProperties(androidDir) {
    const localPropsPath = join(androidDir, "local.properties");
    if (existsSync(localPropsPath)) return;

    const envSdk =
        process.env.ANDROID_SDK_ROOT ||
        process.env.ANDROID_HOME ||
        (process.env.LOCALAPPDATA ? join(process.env.LOCALAPPDATA, "Android", "Sdk") : null);

    if (!envSdk || !existsSync(envSdk)) {
        console.warn(
            "⚠️ No he podido detectar el Android SDK automáticamente.\n" +
            "   Instálalo con Android Studio y/o define ANDROID_SDK_ROOT.\n" +
            "   Luego crea android/local.properties con:\n" +
            "   sdk.dir=C:\\\\Users\\\\<TU_USUARIO>\\\\AppData\\\\Local\\\\Android\\\\Sdk\n"
        );
        return;
    }

    // En local.properties hay que escapar las barras: \ -> \\
    const escaped = envSdk.replace(/\\/g, "\\\\");
    writeFileSync(localPropsPath, `sdk.dir=${escaped}\n`, "utf8");
    console.log(`✓ Creado local.properties apuntando al SDK: ${envSdk}`);
}

/**
 * (Opcional) Copia un keystore si existe en una ruta fija fuera del repo.
 * Ajusta KEYSTORE_SOURCE si quieres.
 */
function ensureKeystore(root, androidDir) {
    const keystoreTarget = join(androidDir, "evlogger-release.keystore");
    if (existsSync(keystoreTarget)) return;

    // ✅ Cambia esta ruta si quieres guardar el keystore fuera del repo
    const KEYSTORE_SOURCE = join(root, "evlogger-release.keystore"); // por defecto: en la raíz del repo

    if (existsSync(KEYSTORE_SOURCE)) {
        copyFileSync(KEYSTORE_SOURCE, keystoreTarget);
        console.log("✓ Copiado evlogger.keystore a android/");
    } else {
        console.warn(
            "⚠️ No encuentro el keystore para copiarlo automáticamente.\n" +
            `   Esperaba: ${KEYSTORE_SOURCE}\n` +
            "   Colócalo manualmente en android/evlogger.keystore o ajusta KEYSTORE_SOURCE en el script."
        );
    }
}

/**
 * (Opcional) Verifica que no queda en android/
 */
function failIfLovable(androidDir) {
    const needle = /lovable/i;
    // checks rápidos en ficheros clave
    const filesToCheck = [
        join(androidDir, "app", "build.gradle"),
        join(androidDir, "app", "src", "main", "AndroidManifest.xml"),
    ].filter(existsSync);

    for (const f of filesToCheck) {
        const txt = readFileSync(f, "utf8");
        if (needle.test(txt)) {
            throw new Error(`❌ He encontrado 'lovable' en ${f}. Revisa appId/namespace o tu template.`);
        }
    }
}

function generateCapacitorAssetsIfPresent(root) {
    const icon = join(root, "assets", "icon.png");
    const splash = join(root, "assets", "splash.png");

    if (existsSync(icon) || existsSync(splash)) {
        console.log("✓ Generando icon/splash con @capacitor/assets...");
        run("npx @capacitor/assets generate --android");
    } else {
        console.log("ℹ️ No hay assets/icon.png ni assets/splash.png; salto generación de assets.");
    }
}

const root = process.cwd();
const androidDir = join(root, "android");

if (existsSync(androidDir)) {
    console.log("android/ ya existe. Si quieres regenerarlo, bórralo primero.");
    process.exit(0);
}

function injectApkRename(appGradlePath) {
    let s = readFileSync(appGradlePath, "utf8");

    // Si ya está el bloque (o uno parecido), no tocar
    if (s.includes("EvLogger-release.apk") || s.includes('outputFileName = "${appName}-release.apk"')) return;

    const marker = /buildTypes\s*\{[\s\S]*?\}/m;
    if (!marker.test(s)) {
        throw new Error("No encuentro buildTypes para inyectar rename APK");
    }

    const renameBlock = `
    // Renombrar SOLO el APK release (debug debe quedarse como app-debug.apk para cap run)
    applicationVariants.all { variant ->
        if (variant.buildType.name == "release") {
            variant.outputs.all { output ->
                def appName = "EvLogger"
                outputFileName = "\${appName}-release.apk"
            }
        }
    }
`;

    s = s.replace(marker, (m) => `${m}\n\n${renameBlock}`);
    writeFileSync(appGradlePath, s, "utf8");
}

// 1) Crear Android
run("npx cap add android");

// 2) Crear local.properties con el SDK (para que gradlew funcione sin Android Studio)
ensureAndroidSdkLocalProperties(androidDir);

// 3) Aplicar gradle.properties.append
const gradlePropsAppend = readFileSync(
    join(root, "tools/android-template/gradle.properties.append"),
    "utf8"
);
appendIfMissing(join(androidDir, "gradle.properties"), gradlePropsAppend);

// 4) Inyectar signing config en app/build.gradle
injectSigningIntoAppBuildGradle(join(androidDir, "app", "build.gradle"));
injectApkRename(join(androidDir, "app", "build.gradle"));

// 5) (Opcional) Copiar el keystore automáticamente
ensureKeystore(root, androidDir);

// 6) Generar icon/splash si hay assets/
generateCapacitorAssetsIfPresent(root);

// 7) Sync final (deja Android y plugins coherentes)
run("npx cap sync android");

// 8) (Opcional) comprobar que no hay 'lovable'
failIfLovable(androidDir);

console.log("\n✅ Android creado y configurado (SDK + Java 21 + signing + props + assets + sync).");
console.log("Siguiente: npm run android:apk");
