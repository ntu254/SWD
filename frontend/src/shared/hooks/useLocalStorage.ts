// Custom hooks
import { useCallback, useState } from "react";

export const useLocalStorage = (key: string, initialValue: unknown) => {
  const [storedValue, setStoredValue] = useState<unknown>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: unknown) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.log(error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
};
