#import <BugsyReactNativeSpec/BugsyReactNativeSpec.h>
#import <React/RCTInvalidating.h>

// Extends NativeBugsySpecBase (not NSObject) to get `emitOnIsVisibleChanged:`, the iOS counterpart
// of Android's generated `NativeBugsySpec.emitOnIsVisibleChanged` (DEB-83).
@interface BugsyReactNative : NativeBugsySpecBase <NativeBugsySpec, RCTInvalidating>

@end
