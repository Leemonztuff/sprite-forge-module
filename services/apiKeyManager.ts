// Sistema de gestión avanzada de API keys con rotación automática

export interface ApiKeyInfo {
  id: string;
  name: string;
  key: string;
  quotaUsed: number;
  quotaLimit: number;
  lastUsed: number;
  isActive: boolean;
  priority: number; // 1-10, más alto = más prioritario
}

export interface RotationConfig {
  keys: ApiKeyInfo[];
  strategy: 'round-robin' | 'quota-based' | 'priority';
  autoRotate: boolean;
  quotaThreshold: number; // % antes de rotar (ej: 80)
  retryWithDifferentKey: boolean;
  maxRetriesPerKey: number;
}

export interface QuotaStatus {
  used: number;
  limit: number;
  resetTime: number;
  remaining: number;
  percentageUsed: number;
}

export class ApiKeyManager {
  private static config: RotationConfig;
  private static currentIndex = 0;
  private static failedKeys = new Set<string>();

  static initialize(config: RotationConfig) {
    this.config = config;
    this.loadFromSecureStorage();
    this.startQuotaMonitoring();
  }

  private static async loadFromSecureStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem('encrypted-api-keys');
      if (stored) {
        const decrypted = await this.decrypt(stored);
        this.config.keys = JSON.parse(decrypted);
      }
    } catch (error) {
      console.warn('Failed to load stored keys:', error);
    }
  }

  private static async encrypt(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const key = await this.getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBuffer
    );
    
    return btoa(String.fromCharCode(...iv, ...new Uint8Array(encrypted)));
  }

  private static async decrypt(encryptedData: string): Promise<string> {
    const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = data.slice(0, 12);
    const encrypted = data.slice(12);
    
    const key = await this.getEncryptionKey();
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  }

  private static async getEncryptionKey(): Promise<CryptoKey> {
    const storedKey = localStorage.getItem('encryption-key');
    if (storedKey) {
      const keyData = Uint8Array.from(atob(storedKey), c => c.charCodeAt(0));
      return crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
      );
    }
    
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    
    const exportedKey = await crypto.subtle.exportKey('raw', key);
    localStorage.setItem('encryption-key', btoa(String.fromCharCode(...new Uint8Array(exportedKey))));
    return key;
  }

  static async addKey(keyInfo: Omit<ApiKeyInfo, 'id' | 'quotaUsed' | 'lastUsed'>): Promise<void> {
    const newKey: ApiKeyInfo = {
      ...keyInfo,
      id: crypto.randomUUID(),
      quotaUsed: 0,
      lastUsed: Date.now()
    };
    
    this.config.keys.push(newKey);
    await this.saveToSecureStorage();
  }

  private static async saveToSecureStorage(): Promise<void> {
    try {
      const encrypted = await this.encrypt(JSON.stringify(this.config.keys));
      localStorage.setItem('encrypted-api-keys', encrypted);
    } catch (error) {
      console.error('Failed to save keys:', error);
    }
  }

  static async getNextAvailableKey(): Promise<string | null> {
    const availableKeys = this.config.keys.filter(k => 
      k.isActive && !this.failedKeys.has(k.id)
    );

    if (availableKeys.length === 0) {
      this.failedKeys.clear();
      return null;
    }

    let selectedKey: ApiKeyInfo;

    switch (this.config.strategy) {
      case 'priority':
        selectedKey = availableKeys
          .sort((a, b) => b.priority - a.priority)[0];
        break;
      
      case 'quota-based':
        selectedKey = availableKeys
          .sort((a, b) => {
            const aUsage = (a.quotaUsed / a.quotaLimit) * 100;
            const bUsage = (b.quotaUsed / b.quotaLimit) * 100;
            return aUsage - bUsage;
          })[0];
        break;
      
      case 'round-robin':
      default:
        const idx = this.currentIndex % availableKeys.length;
        selectedKey = availableKeys[idx];
        this.currentIndex++;
        break;
    }

    const quotaPercentage = (selectedKey.quotaUsed / selectedKey.quotaLimit) * 100;
    if (quotaPercentage >= this.config.quotaThreshold) {
      this.failedKeys.add(selectedKey.id);
      return this.getNextAvailableKey();
    }

    return selectedKey.key;
  }

  static async markKeyUsage(apiKey: string, tokensUsed: number = 1): Promise<void> {
    const keyInfo = this.config.keys.find(k => k.key === apiKey);
    if (keyInfo) {
      keyInfo.quotaUsed += tokensUsed;
      keyInfo.lastUsed = Date.now();
      await this.saveToSecureStorage();
    }
  }

  static async markKeyFailed(apiKey: string, error: Error): Promise<void> {
    const keyInfo = this.config.keys.find(k => k.key === apiKey);
    if (keyInfo) {
      this.failedKeys.add(keyInfo.id);
      
      // Si es error de cuota, desactivar temporalmente
      if (error.message.includes('quota') || error.message.includes('429')) {
        keyInfo.isActive = false;
        setTimeout(() => {
          keyInfo.isActive = true;
          this.failedKeys.delete(keyInfo.id);
        }, 60000); // Reactivar después de 1 minuto
      }
      
      await this.saveToSecureStorage();
    }
  }

  static async checkQuotaStatus(apiKey: string): Promise<QuotaStatus> {
    try {
      // Intentar obtener status real de la API
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
        headers: { 'x-goog-api-key': apiKey }
      });
      
      if (response.ok) {
        // Parsear headers de cuota si existen
        const quotaUsed = parseInt(response.headers.get('x-quota-used') || '0');
        const quotaLimit = parseInt(response.headers.get('x-quota-limit') || '15000');
        
        return {
          used: quotaUsed,
          limit: quotaLimit,
          resetTime: Date.now() + (24 * 60 * 60 * 1000),
          remaining: Math.max(0, quotaLimit - quotaUsed),
          percentageUsed: (quotaUsed / quotaLimit) * 100
        };
      }
    } catch (error) {
      console.warn('Failed to fetch real quota:', error);
    }
    
    // Fallback a estimación local
    const keyInfo = this.config.keys.find(k => k.key === apiKey);
    if (keyInfo) {
      return {
        used: keyInfo.quotaUsed,
        limit: keyInfo.quotaLimit,
        resetTime: Date.now() + (24 * 60 * 60 * 1000),
        remaining: Math.max(0, keyInfo.quotaLimit - keyInfo.quotaUsed),
        percentageUsed: (keyInfo.quotaUsed / keyInfo.quotaLimit) * 100
      };
    }
    
    return {
      used: 0,
      limit: 15000,
      resetTime: Date.now() + (24 * 60 * 60 * 1000),
      remaining: 15000,
      percentageUsed: 0
    };
  }

  private static startQuotaMonitoring(): void {
    setInterval(async () => {
      for (const key of this.config.keys) {
        const status = await this.checkQuotaStatus(key.key);
        key.quotaUsed = status.used;
        key.quotaLimit = status.limit;
      }
      await this.saveToSecureStorage();
    }, 60000); // Monitorear cada minuto
  }

  static getAllKeys(): ApiKeyInfo[] {
    return [...this.config.keys];
  }

  static getActiveKeysCount(): number {
    return this.config.keys.filter(k => k.isActive).length;
  }

  static getTotalRemainingQuota(): number {
    return this.config.keys
      .filter(k => k.isActive)
      .reduce((total, k) => total + Math.max(0, k.quotaLimit - k.quotaUsed), 0);
  }
}