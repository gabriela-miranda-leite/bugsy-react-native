#!/usr/bin/env node
/**
 * Downloads Bugsy.xcframework.zip from a `bugsy` repo GitHub Release and unzips it where
 * BugsyReactNative.podspec's `vendored_frameworks` expects it (DEB-85, "Option A": the
 * xcframework ships as a zipped release asset — see docs/ios-xcframework-distribution.md for
 * why, and what moving to "Option B" — a CocoaPods/SPM binary registry — would change).
 *
 * Runs as this package's `postinstall` so a consuming app gets the framework without touching
 * the `bugsy` repo's source. Only does anything on macOS, since that's the only platform where
 * the iOS side of an RN app is ever built.
 */
'use strict';

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Pinned the same way android/build.gradle's `bugsyNativeVersion` is (DEB-80): a hardcoded
// version bumped by hand for now. Unifying both into one source of truth is DEB-94's job.
const BUGSY_NATIVE_VERSION = '0.4.0';

const REPO_ROOT = path.resolve(__dirname, '..');
const FRAMEWORK_NAME = 'Bugsy.xcframework';
const FRAMEWORKS_DIR = path.join(REPO_ROOT, 'ios', 'Frameworks');
const FRAMEWORK_DIR = path.join(FRAMEWORKS_DIR, FRAMEWORK_NAME);
const VERSION_MARKER = path.join(FRAMEWORKS_DIR, '.bugsy-xcframework-version');
const DOWNLOAD_URL =
  `https://github.com/gabriela-miranda-leite/bugsy/releases/download/` +
  `v${BUGSY_NATIVE_VERSION}/${FRAMEWORK_NAME}.zip`;

function alreadyUpToDate() {
  if (!fs.existsSync(FRAMEWORK_DIR)) return false;
  try {
    return (
      fs.readFileSync(VERSION_MARKER, 'utf8').trim() === BUGSY_NATIVE_VERSION
    );
  } catch {
    return false;
  }
}

function main() {
  if (process.platform !== 'darwin') {
    console.log(
      '[bugsy-react-native] Skipping Bugsy.xcframework download (not macOS).'
    );
    return;
  }

  if (alreadyUpToDate()) {
    console.log(
      `[bugsy-react-native] Bugsy.xcframework v${BUGSY_NATIVE_VERSION} already present, skipping download.`
    );
    return;
  }

  fs.mkdirSync(FRAMEWORKS_DIR, { recursive: true });
  fs.rmSync(FRAMEWORK_DIR, { recursive: true, force: true });

  const zipPath = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'bugsy-xcframework-')),
    `${FRAMEWORK_NAME}.zip`
  );

  console.log(`[bugsy-react-native] Downloading ${DOWNLOAD_URL}`);
  execFileSync(
    'curl',
    [
      '--fail',
      '--location',
      '--silent',
      '--show-error',
      '--output',
      zipPath,
      DOWNLOAD_URL,
    ],
    {
      stdio: 'inherit',
    }
  );

  console.log(`[bugsy-react-native] Unzipping into ${FRAMEWORKS_DIR}`);
  execFileSync('unzip', ['-o', '-q', zipPath, '-d', FRAMEWORKS_DIR], {
    stdio: 'inherit',
  });

  fs.rmSync(path.dirname(zipPath), { recursive: true, force: true });
  fs.writeFileSync(VERSION_MARKER, `${BUGSY_NATIVE_VERSION}\n`);

  console.log(
    `[bugsy-react-native] Bugsy.xcframework v${BUGSY_NATIVE_VERSION} ready at ${FRAMEWORK_DIR}`
  );
}

main();
