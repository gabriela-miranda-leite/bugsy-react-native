import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  // Mirrors com.bugsy.core.Bugsy on the native side; see BugsyConfig there for field docs.
  // trigger/shakeThresholdG default on the native side when omitted here.
  initialize(config: {
    trigger?: string;
    shakeThresholdG?: number;
    allowRevealingSecrets?: boolean;
    environment?: string;
    slowRequestThresholdMs?: number;
  }): void;
  destroy(): void;

  addSensitiveHeader(name: string): void;
  removeSensitiveHeader(name: string): void;
  addSensitiveBodyField(name: string): void;
  removeSensitiveBodyField(name: string): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Bugsy');
