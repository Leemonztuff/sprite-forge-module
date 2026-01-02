/**
 * Security Enhancements for Sprite Forge
 * Input validation and sanitization utilities
 */

/**
 * Comprehensive input validator and sanitizer
 */
export class InputValidator {
  // Allowed characters for prompts
  private static readonly PROMPT_PATTERN = /^[a-zA-Z0-9\s\-_,.!?'"()[\]{}:;@#$%&*+=\\|<>\/~`]+$/;
  
  // Dangerous patterns to block
  private static readonly DANGEROUS_PATTERNS = [
    /javascript:/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /<script[^>]*>.*?<\/script>/gis,
    /<iframe[^>]*>.*?<\/iframe>/gis,
    /<object[^>]*>.*?<\/object>/gis,
    /<embed[^>]*>.*?<\/embed>/gis,
    /<link[^>]*>/gis,
    /<meta[^>]*>/gis,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
    /@import/gi,
    /union\s+select/gi,
    /drop\s+table/gi,
    /insert\s+into/gi,
    /delete\s+from/gi,
    /update\s+.*set/gi
  ];

  /**
   * Validate and sanitize user prompt
   */
  static validatePrompt(prompt: string): { isValid: boolean; sanitized: string; error?: string } {
    if (!prompt || typeof prompt !== 'string') {
      return { isValid: false, sanitized: '', error: 'Prompt is required' };
    }

    // Length validation
    if (prompt.length > 1000) {
      return { isValid: false, sanitized: '', error: 'Prompt too long (max 1000 characters)' };
    }

    // Remove dangerous patterns
    let sanitized = prompt;
    for (const pattern of this.DANGEROUS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }

    // Remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    // Validate allowed characters
    if (!this.PROMPT_PATTERN.test(sanitized)) {
      return { isValid: false, sanitized: '', error: 'Prompt contains invalid characters' };
    }

    if (sanitized.length === 0) {
      return { isValid: false, sanitized: '', error: 'Prompt contains only invalid content' };
    }

    return { isValid: true, sanitized };
  }

  /**
   * Validate file upload
   */
  static validateFileUpload(file: File): { isValid: boolean; error?: string } {
    if (!file || !(file instanceof File)) {
      return { isValid: false, error: 'Invalid file object' };
    }

    // File type validation
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Invalid file type. Only PNG, JPEG, WebP, and GIF allowed' };
    }

    // File size validation (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { isValid: false, error: 'File too large (max 5MB)' };
    }

    // Minimum file size (100 bytes)
    if (file.size < 100) {
      return { isValid: false, error: 'File too small (min 100 bytes)' };
    }

    return { isValid: true };
  }

  /**
   * Validate image dimensions
   */
  static validateImageDimensions(width: number, height: number): { isValid: boolean; error?: string } {
    if (!width || !height || typeof width !== 'number' || typeof height !== 'number') {
      return { isValid: false, error: 'Invalid dimensions' };
    }

    if (width <= 0 || height <= 0) {
      return { isValid: false, error: 'Dimensions must be positive' };
    }

    if (width > 2048 || height > 2048) {
      return { isValid: false, error: 'Dimensions too large (max 2048x2048)' };
    }

    if (width < 32 || height < 32) {
      return { isValid: false, error: 'Dimensions too small (min 32x32)' };
    }

    return { isValid: true };
  }

  /**
   * Validate API key format
   */
  static validateApiKey(apiKey: string): { isValid: boolean; error?: string } {
    if (!apiKey || typeof apiKey !== 'string') {
      return { isValid: false, error: 'API key is required' };
    }

    // Gemini API keys start with 'AIza' and are about 39 characters
    if (!apiKey.startsWith('AIza')) {
      return { isValid: false, error: 'Invalid API key format' };
    }

    if (apiKey.length < 30 || apiKey.length > 50) {
      return { isValid: false, error: 'Invalid API key length' };
    }

    if (!/^[A-Za-z0-9_-]+$/.test(apiKey)) {
      return { isValid: false, error: 'API key contains invalid characters' };
    }

    return { isValid: true };
  }

  /**
   * Validate email address
   */
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    if (email.length > 254) {
      return { isValid: false, error: 'Email too long' };
    }

    return { isValid: true };
  }

  /**
   * Validate numeric input
   */
  static validateNumber(value: any, min: number = 0, max: number = 100): { isValid: boolean; sanitized?: number; error?: string } {
    const num = Number(value);
    
    if (isNaN(num)) {
      return { isValid: false, error: 'Value must be a number' };
    }

    if (num < min || num > max) {
      return { isValid: false, error: `Value must be between ${min} and ${max}` };
    }

    return { isValid: true, sanitized: num };
  }

  /**
   * Validate configuration object
   */
  static validateConfig(config: any): { isValid: boolean; sanitized?: any; errors: string[] } {
    const errors: string[] = [];
    const sanitized: any = {};

    if (!config || typeof config !== 'object') {
      errors.push('Configuration is required');
      return { isValid: false, errors };
    }

    // Validate model
    if (config.model) {
      const validModels = ['gemini-2.5-flash-image', 'gemini-3-flash-preview'];
      if (!validModels.includes(config.model)) {
        errors.push('Invalid model specified');
      } else {
        sanitized.model = config.model;
      }
    }

    // Validate mutation strength
    if (config.mutationStrength !== undefined) {
      const strengthResult = this.validateNumber(config.mutationStrength, 0, 100);
      if (!strengthResult.isValid) {
        errors.push(`Invalid mutation strength: ${strengthResult.error}`);
      } else {
        sanitized.mutationStrength = strengthResult.sanitized;
      }
    }

    // Validate aspect ratio
    if (config.aspectRatio) {
      const validRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
      if (!validRatios.includes(config.aspectRatio)) {
        errors.push('Invalid aspect ratio');
      } else {
        sanitized.aspectRatio = config.aspectRatio;
      }
    }

    // Validate mode
    if (config.mode) {
      const validModes = ['Draft', 'Master', 'Spritesheet', 'Orthographic', 'Animation'];
      if (!validModes.includes(config.mode)) {
        errors.push('Invalid mode specified');
      } else {
        sanitized.mode = config.mode;
      }
    }

    return {
      isValid: errors.length === 0,
      sanitized: errors.length === 0 ? sanitized : undefined,
      errors
    };
  }

  /**
   * Rate limiting helper
   */
  static checkRateLimit(identifier: string, limit: number, windowMs: number): { allowed: boolean; retryAfter?: number } {
    const key = `rate_limit_${identifier}`;
    const now = Date.now();
    
    const existing = localStorage.getItem(key);
    if (!existing) {
      // First request in window
      localStorage.setItem(key, JSON.stringify({
        count: 1,
        resetTime: now + windowMs
      }));
      return { allowed: true };
    }

    const data = JSON.parse(existing);
    
    if (now > data.resetTime) {
      // Window expired, reset
      localStorage.setItem(key, JSON.stringify({
        count: 1,
        resetTime: now + windowMs
      }));
      return { allowed: true };
    }

    if (data.count >= limit) {
      const retryAfter = Math.ceil((data.resetTime - now) / 1000);
      return { allowed: false, retryAfter };
    }

    // Increment count
    localStorage.setItem(key, JSON.stringify({
      count: data.count + 1,
      resetTime: data.resetTime
    }));

    return { allowed: true };
  }

  /**
   * Clean up expired rate limit entries
   */
  static cleanupExpiredRateLimits(): void {
    const now = Date.now();
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('rate_limit_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (now > data.resetTime) {
            keysToRemove.push(key);
          }
        } catch {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

/**
 * Content Security Policy (CSP) headers generator
 */
export function generateCSPHeaders(): Record<string, string> {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval'", // Required for Vite dev
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://generativelanguage.googleapis.com https://api.supabase.io",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
}

/**
 * Security middleware for API requests
 */
export function securityHeaders(req: Request, res: Response): void {
  const headers = generateCSPHeaders();
  Object.entries(headers).forEach(([key, value]) => {
    res.headers.set(key, value);
  });
}

// Export validation functions for easy access
export const {
  validatePrompt,
  validateFileUpload,
  validateImageDimensions,
  validateApiKey,
  validateEmail,
  validateNumber,
  validateConfig,
  checkRateLimit,
  cleanupExpiredRateLimits
} = InputValidator;