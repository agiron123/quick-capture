const {
  AndroidConfig,
  createRunOncePlugin,
  withAndroidManifest,
  withAppBuildGradle,
  withDangerousMod,
  withMainApplication,
} = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const PACKAGE_NAME = 'com.quickcapture.wearbridge';
const PLUGIN_NAME = 'with-wear-capture-bridge';

function addWearBridgeService(androidManifest) {
  const application = AndroidConfig.Manifest.getMainApplicationOrThrow(androidManifest);
  application.service = application.service ?? [];

  const alreadyAdded = application.service.some(
    (service) => service.$?.['android:name'] === `${PACKAGE_NAME}.WearCaptureListenerService`,
  );
  if (alreadyAdded) return androidManifest;

  application.service.push({
    $: {
      'android:name': `${PACKAGE_NAME}.WearCaptureListenerService`,
      'android:exported': 'true',
    },
    'intent-filter': [
      {
        action: [{ $: { 'android:name': 'com.google.android.gms.wearable.MESSAGE_RECEIVED' } }],
        data: [{ $: { 'android:scheme': 'wear', 'android:host': '*', 'android:pathPrefix': '/capture' } }],
      },
    ],
  });

  return androidManifest;
}

function addWearDependency(buildGradle) {
  if (buildGradle.includes('play-services-wearable')) {
    return buildGradle;
  }

  return buildGradle.replace(
    /dependencies\s*\{/,
    `dependencies {
    implementation("com.google.android.gms:play-services-wearable:18.2.0")`,
  );
}

function addPackageImport(mainApplication) {
  const importLine = `import ${PACKAGE_NAME}.WearCaptureBridgePackage`;
  if (mainApplication.includes(importLine)) return mainApplication;

  return mainApplication.replace(
    /(package .+\n)/,
    `$1\n${importLine}\n`,
  );
}

function addPackageRegistration(mainApplication) {
  if (mainApplication.includes('WearCaptureBridgePackage()')) {
    return mainApplication;
  }

  if (mainApplication.includes('PackageList(this).packages.apply')) {
    return mainApplication.replace(
      /PackageList\(this\)\.packages\.apply\s*\{/,
      `PackageList(this).packages.apply {
              add(WearCaptureBridgePackage())`,
    );
  }

  return mainApplication.replace(
    /(override fun getPackages\(\): List<ReactPackage> \{[^]*?return packages)/,
    `$1.apply { add(WearCaptureBridgePackage()) }`,
  );
}

function copyWearBridgeSources(projectRoot, packagePath) {
  const sourceDir = path.join(projectRoot, 'plugins', 'wear-bridge');
  const targetDir = path.join(packagePath, 'wearbridge');

  fs.mkdirSync(targetDir, { recursive: true });

  for (const fileName of ['WearCaptureBridge.kt', 'WearCaptureBridgePackage.kt']) {
    fs.copyFileSync(path.join(sourceDir, fileName), path.join(targetDir, fileName));
  }
}

const withWearCaptureBridge = (config) => {
  config = withAndroidManifest(config, (config) => {
    config.modResults.manifest = addWearBridgeService(config.modResults.manifest);
    return config;
  });

  config = withAppBuildGradle(config, (config) => {
    config.modResults.contents = addWearDependency(config.modResults.contents);
    return config;
  });

  config = withMainApplication(config, (config) => {
    let contents = config.modResults.contents;
    contents = addPackageImport(contents);
    contents = addPackageRegistration(contents);
    config.modResults.contents = contents;
    return config;
  });

  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const packageName = config.android?.package ?? 'com.quickcapture.app';
      const packagePath = AndroidConfig.getPackagePath(config.modRequest.platformProjectRoot, packageName);
      copyWearBridgeSources(config.modRequest.projectRoot, packagePath);
      return config;
    },
  ]);

  return config;
};

module.exports = createRunOncePlugin(withWearCaptureBridge, PLUGIN_NAME);
