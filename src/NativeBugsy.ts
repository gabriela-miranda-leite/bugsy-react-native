import {
  TurboModuleRegistry,
  type TurboModule,
  type CodegenTypes,
} from 'react-native';

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

  show(): void;
  hide(): void;

  // Mirrors com.bugsy.core.model.DeviceInfo (src/types.ts); inlined since codegen can't
  // reference an imported type alias here.
  deviceInfo(): Promise<{
    appVersionName: string;
    appVersionCode: string;
    environment: string;
    buildType: string;
    deviceModel: string;
    osName: string;
    osVersion: string;
    locale: string;
    bugsyVersion: string;
    kotlinVersion: string;
    composeVersion: string;
  }>;

  // Mirrors Bugsy.isVisible (StateFlow<Boolean>); emitted by the native side on every change (DEB-82).
  readonly onIsVisibleChanged: CodegenTypes.EventEmitter<boolean>;

  addSensitiveHeader(name: string): void;
  removeSensitiveHeader(name: string): void;
  addSensitiveBodyField(name: string): void;
  removeSensitiveBodyField(name: string): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Bugsy');
