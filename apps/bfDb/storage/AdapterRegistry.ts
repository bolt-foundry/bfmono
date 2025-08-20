// =================================================
// Storage Adapter Registry — concrete implementation
// =================================================

import { BfError } from "@bfmono/lib/BfError.ts";
import type { DatabaseBackend } from "../backend/DatabaseBackend.ts";
import { registerDefaultAdapter } from "./registerDefaultAdapter.ts";

// Alias: moving forward we’ll refer to all adapters through this name.
export type IBackendAdapter = DatabaseBackend;

/**
 * Holds the singleton BackendAdapter selected for this process.
 * Tests can swap adapters by calling `register()`; production code should
 * register exactly once during startup (e.g. in bfDb.ts).
 */
export class AdapterRegistry {
  private static _active: IBackendAdapter | null = null;

  /**
   * Registers an adapter instance for the current runtime.
   * If an adapter has already been registered and it's different, we throw —
   * preventing accidental double‑registration in production. Tests may reset
   * via `clear()` between suites.
   */
  static register(adapter: IBackendAdapter) {
    if (this._active && this._active !== adapter) {
      throw new BfError("AdapterRegistry: adapter already registered");
    }
    this._active = adapter;
  }

  /**
   * Check if an adapter has been registered without triggering lazy registration
   */
  static hasAdapter(): boolean {
    return this._active !== null;
  }

  /**
   * Returns the active adapter. If none registered, lazily registers the default adapter.
   * This allows apps to use BfDb without explicit registration.
   */
  static async get(): Promise<IBackendAdapter> {
    if (!this._active) {
      // Lazy registration - register default adapter if not already registered
      registerDefaultAdapter();

      // If still no adapter after registration attempt, throw
      if (!this._active) {
        throw new BfError(
          "AdapterRegistry.get(): failed to register default adapter",
        );
      }
    }
    return this._active;
  }

  /**
   * Test helper – resets registry to pristine state.
   */
  static clear() {
    this._active = null;
  }
}
