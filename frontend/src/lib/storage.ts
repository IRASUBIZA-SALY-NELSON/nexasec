import { AES, enc } from 'crypto-js';

const STORAGE_KEY = 'nexasec_'; 
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_STORAGE_KEY || 'default-dev-key';

export const secureStorage = {
  set: (key: string, data: any) => {
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

  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    
    try {
      const encrypted = localStorage.getItem(STORAGE_KEY + key);
      if (!encrypted) return null;
      
      const decrypted = AES.decrypt(encrypted, ENCRYPTION_KEY).toString(enc.Utf8);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Error retrieving encrypted data:', error);
      return null;
    }
  },

  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY + key);
  }
}; 