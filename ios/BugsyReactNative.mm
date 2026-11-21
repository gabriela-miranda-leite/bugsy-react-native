#import "BugsyReactNative.h"

// Placeholder implementation of the generated spec (DEB-77) so the example app keeps building.
// The real translation to `Bugsy` (bugsy-core, Swift/ObjC++ side) lands in DEB-87.
@implementation BugsyReactNative

- (void)initialize:(JS::NativeBugsy::SpecInitializeConfig &)config {
}

- (void)destroy {
}

- (void)addSensitiveHeader:(NSString *)name {
}

- (void)removeSensitiveHeader:(NSString *)name {
}

- (void)addSensitiveBodyField:(NSString *)name {
}

- (void)removeSensitiveBodyField:(NSString *)name {
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeBugsySpecJSI>(params);
}

+ (NSString *)moduleName
{
  return @"Bugsy";
}

@end
