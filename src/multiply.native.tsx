import BugsyReactNative from './NativeBugsyReactNative';

export function multiply(a: number, b: number): number {
  return BugsyReactNative.multiply(a, b);
}
