import { AES, enc } from 'crypto-js';

const STORAGE_KEY = 'nexasec_'; 
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY || 'default-dev-key';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export const secureStorage = {
  set<T extends JsonValue>(key: string, data: T): void {
    if (typeof window === 'undefined') return;
    try {
      const encrypted = AES.encrypt(
        JSON.stringify(data),
        ENCRYPTION_KEY
      ).toString();
      localStorage.setItem(STORAGE_KEY + key, encrypted);
    } catch (error) {
      console.error('Error storing encrypted data:', error);
    }
  },

  get<T extends JsonValue>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const encrypted = localStorage.getItem(STORAGE_KEY + key);
      if (!encrypted) return null;
      const decrypted = AES.decrypt(encrypted, ENCRYPTION_KEY).toString(enc.Utf8);
      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('Error retrieving encrypted data:', error);
      return null;
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY + key);
  }
};