"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * False through the server render and the first client render, true from the
 * commit onward — the React-sanctioned way to gate browser-only output
 * (portals, localStorage-backed counts) without an effect that sets state.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, onClient, onServer);
}
