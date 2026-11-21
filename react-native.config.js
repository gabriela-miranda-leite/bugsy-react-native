/**
 * Autolinking config for bugsy-react-native.
 *
 * Works for both architectures: the Android package / iOS podspec are
 * discovered by the React Native CLI (Old Arch), and the codegen spec in
 * package.json ("codegenConfig") wires up the TurboModule for New Arch.
 *
 * @type {import('@react-native-community/cli-types').UserDependencyConfig}
 */
module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: './android',
        packageImportPath: 'import com.bugsyreactnative.BugsyPackage;',
        packageInstance: 'new BugsyPackage()',
      },
      ios: {
        podspecPath: './BugsyReactNative.podspec',
      },
    },
  },
};
