import { createClient, SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { GeneratedOutfit, Archetype, LogEntry, AnimationSequence, RiggingData } from '../types';

// Environment configuration
const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Database table names
export const DB_TABLES = {
  OUTFITS: 'generated_outfits',
  ARCHETYPES: 'archetypes',
  LOGS: 'system_logs',
  ANIMATIONS: 'animation_sequences',
  RIGGING: 'rigging_data',
  USER_PREFERENCES: 'user_preferences',
  USAGE_ANALYTICS: 'usage_analytics'
} as const;

export interface DatabaseError extends Error {
  code?: string;
  details?: string;
  hint?: string;
}

/**
 * Supabase client singleton for database operations
 */
class SupabaseManager {
  private static instance: SupabaseClient | null = null;
  private static isInitialized = false;

  /**
   * Initialize the Supabase client
   */
  static initialize(): SupabaseClient {
    if (this.instance && this.isInitialized) {
      return this.instance;
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase configuration. Please check your environment variables.');
    }

    try {
      this.instance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        },
        realtime: {
          params: {
            eventsPerSecond: 2
          }
        }
      });

      this.isInitialized = true;
      console.log('Supabase client initialized successfully');
      return this.instance;

    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      throw new Error(`Supabase initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the Supabase client instance
   */
  static getClient(): SupabaseClient {
    if (!this.instance || !this.isInitialized) {
      return this.initialize();
    }
    return this.instance;
  }

  /**
   * Check if client is initialized
   */
  static isReady(): boolean {
    return this.isInitialized && this.instance !== null;
  }

  /**
   * Handle Supabase errors consistently
   */
  static handleError(error: PostgrestError | any): DatabaseError {
    const dbError: DatabaseError = new Error(
      error?.message || 'Unknown database error occurred'
    );
    
    if ('code' in error) {
      dbError.code = error.code;
      dbError.details = error.details;
      dbError.hint = error.hint;
    }

    console.error('Database error:', dbError);
    return dbError;
  }
}

/**
 * Outfit management operations
 */
export class OutfitService {
  private static client = () => SupabaseManager.getClient();

  /**
   * Save a new generated outfit
   */
  static async saveOutfit(outfit: GeneratedOutfit): Promise<GeneratedOutfit> {
    try {
      const { data, error } = await this.client()
        .from(DB_TABLES.OUTFITS)
        .upsert({
          id: outfit.id,
          url: outfit.url,
          original_url: outfit.originalUrl,
          parent_id: outfit.parentId || null,
          prompt: outfit.prompt,
          timestamp: outfit.timestamp,
          model: outfit.model,
          aspect_ratio: outfit.aspectRatio,
          evolution_step: outfit.evolutionStep,
          mode: outfit.mode,
          mutation_strength: outfit.mutationStrength || null,
          seed: outfit.seed || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw SupabaseManager.handleError(error);

      // Transform database response back to application format
      return {
        id: data.id,
        url: data.url,
        originalUrl: data.original_url,
        parentId: data.parent_id,
        prompt: data.prompt,
        timestamp: data.timestamp,
        model: data.model,
        aspectRatio: data.aspect_ratio,
        evolutionStep: data.evolution_step,
        mode: data.mode,
        mutationStrength: data.mutation_strength,
        seed: data.seed
      };

    } catch (error) {
      throw SupabaseManager.handleError(error as PostgrestError);
    }
  }

  /**
   * Get all outfits for the current user
   */
  static async getAllOutfits(): Promise<GeneratedOutfit[]> {
    try {
      const { data, error } = await this.client()
        .from(DB_TABLES.OUTFITS)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw SupabaseManager.handleError(error);

      return data.map(item => ({
        id: item.id,
        url: item.url,
        originalUrl: item.original_url,
        parentId: item.parent_id,
        prompt: item.prompt,
        timestamp: item.timestamp,
        model: item.model,
        aspectRatio: item.aspect_ratio,
        evolutionStep: item.evolution_step,
        mode: item.mode,
        mutationStrength: item.mutation_strength,
        seed: item.seed
      }));

    } catch (error) {
      throw SupabaseManager.handleError(error as PostgrestError);
    }
  }

  /**
   * Delete an outfit
   */
  static async deleteOutfit(outfitId: string): Promise<void> {
    try {
      const { error } = await this.client()
        .from(DB_TABLES.OUTFITS)
        .delete()
        .eq('id', outfitId);

      if (error) throw SupabaseManager.handleError(error);

    } catch (error) {
      throw SupabaseManager.handleError(error as PostgrestError);
    }
  }

  /**
   * Get outfits by parent ID
   */
  static async getOutfitsByParent(parentId: string): Promise<GeneratedOutfit[]> {
    try {
      const { data, error } = await this.client()
        .from(DB_TABLES.OUTFITS)
        .select('*')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: false });

      if (error) throw SupabaseManager.handleError(error);

      return data.map(item => ({
        id: item.id,
        url: item.url,
        originalUrl: item.original_url,
        parentId: item.parent_id,
        prompt: item.prompt,
        timestamp: item.timestamp,
        model: item.model,
        aspectRatio: item.aspect_ratio,
        evolutionStep: item.evolution_step,
        mode: item.mode,
        mutationStrength: item.mutation_strength,
        seed: item.seed
      }));

    } catch (error) {
      throw SupabaseManager.handleError(error as PostgrestError);
    }
  }
}

/**
 * Archetype management operations
 */
export class ArchetypeService {
  private static client = () => SupabaseManager.getClient();

  /**
   * Save a new archetype
   */
  static async saveArchetype(archetype: Archetype): Promise<Archetype> {
    try {
      const { data, error } = await this.client()
        .from(DB_TABLES.ARCHETYPES)
        .upsert({
          id: archetype.id,
          name: archetype.name,
          content: archetype.content,
          timestamp: archetype.timestamp,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw SupabaseManager.handleError(error);

      return {
        id: data.id,
        name: data.name,
        content: data.content,
        timestamp: data.timestamp
      };

    } catch (error) {
      throw SupabaseManager.handleError(error as PostgrestError);
    }
  }

  /**
   * Get all archetypes
   */
  static async getAllArchetypes(): Promise<Archetype[]> {
    try {
      const { data, error } = await this.client()
        .from(DB_TABLES.ARCHETYPES)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw SupabaseManager.handleError(error);

      return data.map(item => ({
        id: item.id,
        name: item.name,
        content: item.content,
        timestamp: item.timestamp
      }));

    } catch (error) {
      throw SupabaseManager.handleError(error as PostgrestError);
    }
  }

  /**
   * Delete an archetype
   */
  static async deleteArchetype(archetypeId: string): Promise<void> {
    try {
      const { error } = await this.client()
        .from(DB_TABLES.ARCHETYPES)
        .delete()
        .eq('id', archetypeId);

      if (error) throw SupabaseManager.handleError(error);

    } catch (error) {
      throw SupabaseManager.handleError(error as PostgrestError);
    }
  }
}

/**
 * Logging service for system events
 */
export class LoggingService {
  private static client = () => SupabaseManager.getClient();

  /**
   * Log a system event
   */
  static async log(entry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      const { error } = await this.client()
        .from(DB_TABLES.LOGS)
        .insert({
          message: entry.message,
          type: entry.type,
          timestamp: Date.now(),
          created_at: new Date().toISOString()
        });

      if (error) throw SupabaseManager.handleError(error);

    } catch (error) {
      // Don't throw logging errors to prevent app crashes
      console.error('Failed to log entry:', error);
    }
  }

  /**
   * Get recent logs
   */
  static async getRecentLogs(limit: number = 100): Promise<LogEntry[]> {
    try {
      const { data, error } = await this.client()
        .from(DB_TABLES.LOGS)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw SupabaseManager.handleError(error);

      return data.map(item => ({
        id: item.id,
        message: item.message,
        type: item.type,
        timestamp: item.timestamp
      }));

    } catch (error) {
      throw SupabaseManager.handleError(error as PostgrestError);
    }
  }
}

/**
 * Animation sequences management
 */
export class AnimationService {
  private static client = () => SupabaseManager.getClient();

  /**
   * Save animation sequence
   */
  static async saveAnimation(animation: AnimationSequence): Promise<AnimationSequence> {
    try {
      const { data, error } = await this.client()
        .from(DB_TABLES.ANIMATIONS)
        .upsert({
          id: animation.id,
          action: animation.action,
          frames: animation.frames,
          fps: animation.fps,
          spritesheet_url: animation.spritesheetUrl || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw SupabaseManager.handleError(error);

      return {
        id: data.id,
        action: data.action,
        frames: data.frames,
        fps: data.fps,
        spritesheetUrl: data.spritesheet_url
      };

    } catch (error) {
      throw SupabaseManager.handleError(error as PostgrestError);
    }
  }

  /**
   * Get all animations
   */
  static async getAllAnimations(): Promise<AnimationSequence[]> {
    try {
      const { data, error } = await this.client()
        .from(DB_TABLES.ANIMATIONS)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw SupabaseManager.handleError(error);

      return data.map(item => ({
        id: item.id,
        action: item.action,
        frames: item.frames,
        fps: item.fps,
        spritesheetUrl: item.spritesheet_url
      }));

    } catch (error) {
      throw SupabaseManager.handleError(error as PostgrestError);
    }
  }
}

/**
 * Rigging data management
 */
export class RiggingService {
  private static client = () => SupabaseManager.getClient();

  /**
   * Save rigging analysis
   */
  static async saveRigging(rigging: RiggingData): Promise<RiggingData> {
    try {
      const { data, error } = await this.client()
        .from(DB_TABLES.RIGGING)
        .upsert({
          joints: rigging.joints,
          last_analysis_timestamp: rigging.lastAnalysisTimestamp || Date.now(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw SupabaseManager.handleError(error);

      return {
        joints: data.joints,
        lastAnalysisTimestamp: data.last_analysis_timestamp
      };

    } catch (error) {
      throw SupabaseManager.handleError(error as PostgrestError);
    }
  }

  /**
   * Get latest rigging data
   */
  static async getLatestRigging(): Promise<RiggingData | null> {
    try {
      const { data, error } = await this.client()
        .from(DB_TABLES.RIGGING)
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw SupabaseManager.handleError(error);
      }

      return data ? {
        joints: data.joints,
        lastAnalysisTimestamp: data.last_analysis_timestamp
      } : null;

    } catch (error) {
      throw SupabaseManager.handleError(error as PostgrestError);
    }
  }
}

/**
 * User preferences management
 */
export class UserPreferencesService {
  private static client = () => SupabaseManager.getClient();

  /**
   * Save user preferences
   */
  static async savePreferences(preferences: Record<string, any>): Promise<void> {
    try {
      const { error } = await this.client()
        .from(DB_TABLES.USER_PREFERENCES)
        .upsert({
          preferences: preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw SupabaseManager.handleError(error);

    } catch (error) {
      throw SupabaseManager.handleError(error as PostgrestError);
    }
  }

  /**
   * Get user preferences
   */
  static async getPreferences(): Promise<Record<string, any>> {
    try {
      const { data, error } = await this.client()
        .from(DB_TABLES.USER_PREFERENCES)
        .select('preferences')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw SupabaseManager.handleError(error);
      }

      return data?.preferences || {};

    } catch (error) {
      throw SupabaseManager.handleError(error as PostgrestError);
    }
  }
}

/**
 * Usage analytics service
 */
export class AnalyticsService {
  private static client = () => SupabaseManager.getClient();

  /**
   * Track usage event
   */
  static async trackEvent(event: string, data: Record<string, any> = {}): Promise<void> {
    try {
      const { error } = await this.client()
        .from(DB_TABLES.USAGE_ANALYTICS)
        .insert({
          event: event,
          data: data,
          timestamp: Date.now(),
          created_at: new Date().toISOString()
        });

      if (error) throw SupabaseManager.handleError(error);

    } catch (error) {
      // Don't throw analytics errors to prevent app crashes
      console.error('Failed to track analytics event:', error);
    }
  }

  /**
   * Get usage statistics
   */
  static async getStats(days: number = 7): Promise<Record<string, number>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await this.client()
        .from(DB_TABLES.USAGE_ANALYTICS)
        .select('event, created_at')
        .gte('created_at', startDate.toISOString());

      if (error) throw SupabaseManager.handleError(error);

      const stats: Record<string, number> = {};
      data.forEach(item => {
        stats[item.event] = (stats[item.event] || 0) + 1;
      });

      return stats;

    } catch (error) {
      throw SupabaseManager.handleError(error as PostgrestError);
    }
  }
}

/**
 * Initialize Supabase on module load
 */
try {
  SupabaseManager.initialize();
} catch (error) {
  console.warn('Supabase initialization failed on load:', error);
}

export default SupabaseManager;