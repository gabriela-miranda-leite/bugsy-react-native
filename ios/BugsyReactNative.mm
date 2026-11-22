#import "BugsyReactNative.h"

// Hand-written interface for `BugsyModule.swift` (DEB-87), instead of `#import
// "BugsyReactNative-Swift.h"`: in this CocoaPods target (Obj-C++ + Swift mixed, no
// `use_frameworks!`), Xcode's build graph doesn't reliably order this file's compile after the
// Swift module's header-generation step, so the generated header is sometimes still empty when
// this file compiles. A plain `@interface` with matching selectors avoids that dependency — the
// Obj-C runtime resolves `BugsyModule` by its `@objc(BugsyModule)` name at link/load time, not by
// header identity.
NS_ASSUME_NONNULL_BEGIN
@interface BugsyModule : NSObject
@property(nonatomic, copy, nullable) void (^onIsVisibleChanged)(BOOL isVisible);
- (void)initializeWithTrigger:(NSString *_Nullable)trigger
               shakeThresholdG:(NSNumber *_Nullable)shakeThresholdG
        allowRevealingSecrets:(NSNumber *_Nullable)allowRevealingSecrets
                   environment:(NSString *_Nullable)environment
        slowRequestThresholdMs:(NSNumber *_Nullable)slowRequestThresholdMs;
- (void)destroy;
- (void)show;
- (void)hide;
- (NSDictionary<NSString *, NSString *> *)deviceInfo;
- (void)addSensitiveHeader:(NSString *)name;
- (void)removeSensitiveHeader:(NSString *)name;
- (void)addSensitiveBodyField:(NSString *)name;
- (void)removeSensitiveBodyField:(NSString *)name;
- (void)invalidate;
@end
NS_ASSUME_NONNULL_END

// Thin Obj-C++ shim satisfying the generated `NativeBugsySpec` protocol (its C++ types, like
// `JS::NativeBugsy::SpecInitializeConfig&`, aren't visible from Swift). All the real logic lives
// in `BugsyModule.swift` (DEB-87), which mirrors `BugsyReactNativeModule.kt` (DEB-81/82/83).
@implementation BugsyReactNative {
  BugsyModule *_module;
}

RCT_EXPORT_MODULE(Bugsy)

- (instancetype)init
{
  if (self = [super init]) {
    _module = [BugsyModule new];
    __weak __typeof(self) weakSelf = self;
    _module.onIsVisibleChanged = ^(BOOL isVisible) {
      [weakSelf emitOnIsVisibleChanged:isVisible];
    };
  }
  return self;
}

- (void)invalidate
{
  [_module invalidate];
}

- (void)initialize:(JS::NativeBugsy::SpecInitializeConfig &)config
{
  NSNumber *shakeThresholdG = config.shakeThresholdG().has_value()
      ? @(config.shakeThresholdG().value())
      : nil;
  NSNumber *allowRevealingSecrets = config.allowRevealingSecrets().has_value()
      ? @(config.allowRevealingSecrets().value())
      : nil;
  NSNumber *slowRequestThresholdMs = config.slowRequestThresholdMs().has_value()
      ? @(config.slowRequestThresholdMs().value())
      : nil;

  [_module initializeWithTrigger:config.trigger()
                  shakeThresholdG:shakeThresholdG
            allowRevealingSecrets:allowRevealingSecrets
                       environment:config.environment()
            slowRequestThresholdMs:slowRequestThresholdMs];
}

- (void)destroy
{
  [_module destroy];
}

- (void)show
{
  [_module show];
}

- (void)hide
{
  [_module hide];
}

- (void)deviceInfo:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject
{
  resolve([_module deviceInfo]);
}

- (void)addSensitiveHeader:(NSString *)name
{
  [_module addSensitiveHeader:name];
}

- (void)removeSensitiveHeader:(NSString *)name
{
  [_module removeSensitiveHeader:name];
}

- (void)addSensitiveBodyField:(NSString *)name
{
  [_module addSensitiveBodyField:name];
}

- (void)removeSensitiveBodyField:(NSString *)name
{
  [_module removeSensitiveBodyField:name];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeBugsySpecJSI>(params);
}

@end
