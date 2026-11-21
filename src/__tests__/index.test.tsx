import { afterEach, describe, expect, it, jest } from '@jest/globals';
import type { DeviceInfo } from '../types';

jest.mock('../NativeBugsy', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn(),
    destroy: jest.fn(),
    show: jest.fn(),
    hide: jest.fn(),
    deviceInfo: jest.fn(),
    onIsVisibleChanged: jest.fn(),
    addSensitiveHeader: jest.fn(),
    removeSensitiveHeader: jest.fn(),
    addSensitiveBodyField: jest.fn(),
    removeSensitiveBodyField: jest.fn(),
  },
}));

import { Bugsy } from '../index';
import NativeBugsy from '../NativeBugsy';

const mockNativeBugsy = jest.mocked(NativeBugsy);

describe('Bugsy', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initialize() forwards the serializable config fields to the native module', () => {
    Bugsy.initialize({
      trigger: 'FloatingButton',
      shakeThresholdG: 3,
      allowRevealingSecrets: false,
      environment: 'staging',
      slowRequestThresholdMs: 1000,
    });

    expect(mockNativeBugsy.initialize).toHaveBeenCalledWith({
      trigger: 'FloatingButton',
      shakeThresholdG: 3,
      allowRevealingSecrets: false,
      environment: 'staging',
      slowRequestThresholdMs: 1000,
    });
  });

  it('initialize() defaults to an empty config', () => {
    Bugsy.initialize();

    expect(mockNativeBugsy.initialize).toHaveBeenCalledWith({
      trigger: undefined,
      shakeThresholdG: undefined,
      allowRevealingSecrets: undefined,
      environment: undefined,
      slowRequestThresholdMs: undefined,
    });
  });

  it('destroy() delegates to the native module', () => {
    Bugsy.destroy();

    expect(mockNativeBugsy.destroy).toHaveBeenCalledTimes(1);
  });

  it('show() delegates to the native module', () => {
    Bugsy.show();

    expect(mockNativeBugsy.show).toHaveBeenCalledTimes(1);
  });

  it('hide() delegates to the native module', () => {
    Bugsy.hide();

    expect(mockNativeBugsy.hide).toHaveBeenCalledTimes(1);
  });

  it('deviceInfo() resolves with what the native module returns', async () => {
    const deviceInfo: DeviceInfo = {
      appVersionName: '1.0.0',
      appVersionCode: '1',
      environment: 'staging',
      buildType: 'debug',
      deviceModel: 'Pixel 9',
      osName: 'Android',
      osVersion: '15',
      locale: 'pt-BR',
      bugsyVersion: '0.1.0',
      kotlinVersion: '2.0.0',
      composeVersion: '1.7.0',
    };
    mockNativeBugsy.deviceInfo.mockResolvedValue(deviceInfo);

    await expect(Bugsy.deviceInfo()).resolves.toEqual(deviceInfo);
  });

  it('onIsVisibleChanged() delegates to the native module and returns its subscription', () => {
    const subscription = { remove: jest.fn() };
    mockNativeBugsy.onIsVisibleChanged.mockReturnValue(subscription);
    const listener = jest.fn();

    const result = Bugsy.onIsVisibleChanged(listener);

    expect(mockNativeBugsy.onIsVisibleChanged).toHaveBeenCalledWith(listener);
    expect(result).toBe(subscription);
  });

  it('addSensitiveHeader()/removeSensitiveHeader() delegate to the native module', () => {
    Bugsy.addSensitiveHeader('X-Api-Key');
    Bugsy.removeSensitiveHeader('X-Api-Key');

    expect(mockNativeBugsy.addSensitiveHeader).toHaveBeenCalledWith(
      'X-Api-Key'
    );
    expect(mockNativeBugsy.removeSensitiveHeader).toHaveBeenCalledWith(
      'X-Api-Key'
    );
  });

  it('addSensitiveBodyField()/removeSensitiveBodyField() delegate to the native module', () => {
    Bugsy.addSensitiveBodyField('token');
    Bugsy.removeSensitiveBodyField('token');

    expect(mockNativeBugsy.addSensitiveBodyField).toHaveBeenCalledWith('token');
    expect(mockNativeBugsy.removeSensitiveBodyField).toHaveBeenCalledWith(
      'token'
    );
  });
});
