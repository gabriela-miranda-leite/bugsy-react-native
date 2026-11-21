import type { EventSubscription } from 'react-native';
import NativeBugsy from './NativeBugsy';
import type { BugsyConfig, DeviceInfo } from './types';

export type { BugsyConfig, DebugFlag, DeviceInfo, Trigger } from './types';

/** Mirrors `object Bugsy` (com.bugsy.core), delegating to the native module (DEB-77/DEB-78). */
export const Bugsy = {
  initialize(config: BugsyConfig = {}): void {
    NativeBugsy.initialize({
      trigger: config.trigger,
      shakeThresholdG: config.shakeThresholdG,
      allowRevealingSecrets: config.allowRevealingSecrets,
      environment: config.environment,
      slowRequestThresholdMs: config.slowRequestThresholdMs,
    });
  },

  destroy(): void {
    NativeBugsy.destroy();
  },

  show(): void {
    NativeBugsy.show();
  },

  hide(): void {
    NativeBugsy.hide();
  },

  deviceInfo(): Promise<DeviceInfo> {
    return NativeBugsy.deviceInfo();
  },

  /** Fires whenever `Bugsy.isVisible` changes on the native side (DEB-82). */
  onIsVisibleChanged(
    listener: (isVisible: boolean) => void
  ): EventSubscription {
    return NativeBugsy.onIsVisibleChanged(listener);
  },

  addSensitiveHeader(name: string): void {
    NativeBugsy.addSensitiveHeader(name);
  },

  removeSensitiveHeader(name: string): void {
    NativeBugsy.removeSensitiveHeader(name);
  },

  addSensitiveBodyField(name: string): void {
    NativeBugsy.addSensitiveBodyField(name);
  },

  removeSensitiveBodyField(name: string): void {
    NativeBugsy.removeSensitiveBodyField(name);
  },
};
