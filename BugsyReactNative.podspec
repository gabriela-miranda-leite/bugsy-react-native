require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "BugsyReactNative"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/gabriela-miranda-leite/bugsy-react-native.git", :tag => "v#{s.version}" }
  s.swift_version = "5.0"
  # Required for a pod mixing Swift and Obj-C (BugsyModule.swift, DEB-87) to generate its
  # `-Swift.h` interop header correctly when the app isn't using `use_frameworks!`.
  s.static_framework = true

  s.source_files = "ios/**/*.{h,m,mm,swift,cpp}"
  s.private_header_files = "ios/**/*.h"
  # Bugsy.xcframework lands here via `scripts/download-xcframework.js` (DEB-85, this package's
  # `postinstall`), so its own headers must stay out of source_files/private_header_files above.
  # Scoped to just the headers (DEB-87 fix): `exclude_files` is matched against every glob
  # attribute, including `vendored_frameworks` below — excluding the whole directory silently
  # dropped the xcframework from the Pods project instead of just its headers.
  s.exclude_files = "ios/Frameworks/**/*.h"
  s.vendored_frameworks = "ios/Frameworks/Bugsy.xcframework"

  install_modules_dependencies(s)
end
