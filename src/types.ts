// Mirrors the public types in com.bugsy.core (bugsy repo) so the typed JS API (DEB-79) and the
// TurboModule spec (DEB-77) speak the same language as the Kotlin side. Keep names and fields in
// sync with the Kotlin sources; any unavoidable difference is documented inline below.

/** Mirrors `com.bugsy.core.Trigger`. */
export type Trigger = 'Shake' | 'FloatingButton' | 'Notification';

/**
 * Mirrors `com.bugsy.core.model.DebugFlag`.
 *
 * `value`/`defaultValue` are `Any` in Kotlin (a `Boolean`, `String` or number set by the host
 * app's `flagsProvider`); JS has no equivalent of `Any`, so they're typed as the union of the
 * concrete types Kotlin's `FlagValueSerializer` supports.
 */
export interface DebugFlag {
  key: string;
  label: string;
  value: boolean | string | number;
  isOverridden: boolean;
  defaultValue: boolean | string | number;
}

/** Mirrors `com.bugsy.core.model.DeviceInfo`. */
export interface DeviceInfo {
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
}

/** Mirrors `com.bugsy.core.BugsyConfig`. */
export interface BugsyConfig {
  trigger?: Trigger;
  shakeThresholdG?: number;
  flagsProvider?: () => DebugFlag[];
  /**
   * Lets the UI toggle between masked data and the real values (tokens, passwords) and copy
   * them. The values only live in memory, never on disk. With `false`, everything exists masked
   * only.
   */
  allowRevealingSecrets?: boolean;
  /**
   * Data the consuming app wants shown on the Device tab (e.g. `['user_id', 'u_42']`,
   * `['email', 'dev@app.com']`), displayed in an "Account" section alongside the device/runtime
   * ones. Read again every time the tab is opened — never cached or persisted between sessions.
   */
  customInfoProvider?: () => Array<[string, string]>;
  /**
   * Name of the environment the app runs against (e.g. `"staging"`), shown on the Device tab.
   * Bugsy can't discover it, so it stays "—" unless the app provides it.
   */
  environment?: string;
  /** Requests at or above this duration are highlighted as slow in the UI. `0` turns the highlight off. */
  slowRequestThresholdMs?: number;
}
