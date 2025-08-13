import * as React from "react";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

function isBrowser() {
  return typeof window !== "undefined";
}

const { useState } = React;

type SetValue<T> = React.Dispatch<React.SetStateAction<T>>;

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, SetValue<T>] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (isBrowser()) { // disable on server side
        // Get from local storage by key
        const item = globalThis.localStorage.getItem(key);
        // Parse stored json or if none return initialValue
        return item ? JSON.parse(item) : initialValue;
      } else {
        return initialValue;
      }
    } catch (error) {
      // If error also return initialValue
      logger.info(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue: SetValue<T> = (value: React.SetStateAction<T>) => {
    try {
      if (isBrowser()) { // disable on server side
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function
          ? value(storedValue)
          : value;
        // Save state
        setStoredValue(valueToStore);
        // Save to local storage
        globalThis.localStorage.setItem(key, JSON.stringify(valueToStore));
      } else {
        setStoredValue(value);
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      logger.info(error);
    }
  };

  return [storedValue, setValue];
}
