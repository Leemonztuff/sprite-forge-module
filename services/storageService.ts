
import { GeneratedOutfit, Archetype } from "../types";
import { supabase, isSupabaseConfigured } from "./supabaseClient";

/**
 * SCHEMA SQL PARA SUPABASE
 * 
 * create table outfits (
 *   id uuid primary key default gen_random_uuid(),
 *   url text not null,
 *   original_url text,
 *   parent_id uuid references outfits(id),
 *   prompt text,
 *   timestamp bigint default (extract(epoch from now()) * 1000),
 *   model text,
 *   aspect_ratio text,
 *   evolution_step integer,
 *   mode text,
 *   mutation_strength integer,
 *   seed integer,
 *   identity text, -- Hash de identidad del Core
 *   drift float    -- Score de fidelidad del Core
 * );
 * 
 * create table archetypes (
 *   id uuid primary key default gen_random_uuid(),
 *   name text not null,
 *   content text not null,
 *   timestamp bigint
 * );
 */

const BUCKET_NAME = 'sprites';

export class StorageService {
  
  private static base64ToBlob(base64: string): Blob {
    const byteString = atob(base64.split(',')[1]);
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  private static async uploadImage(id: string, base64: string): Promise<string> {
    if (!supabase || !isSupabaseConfigured) return base64;

    try {
      const blob = this.base64ToBlob(base64);
      const filePath = `evolution/${id}.png`;
      
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, blob, { contentType: 'image/png', upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
      return data.publicUrl;
    } catch (e) {
      console.warn("Storage upload failed, using base64 fallback", e);
      return base64;
    }
  }

  static async saveOutfit(outfit: GeneratedOutfit): Promise<void> {
    if (!supabase || !isSupabaseConfigured) return;

    try {
      let finalUrl = outfit.url;
      if (outfit.url.startsWith('data:image')) {
        finalUrl = await this.uploadImage(outfit.id, outfit.url);
      }

      const { error } = await supabase
        .from('outfits')
        .upsert({
          id: outfit.id,
          url: finalUrl,
          original_url: outfit.originalUrl,
          parent_id: outfit.parentId,
          prompt: outfit.prompt,
          timestamp: outfit.timestamp,
          model: outfit.model,
          aspect_ratio: outfit.aspectRatio,
          evolution_step: outfit.evolutionStep,
          mode: outfit.mode,
          mutation_strength: outfit.mutationStrength,
          seed: outfit.seed
        });

      if (error) throw error;
    } catch (e: any) {
      console.error("Critical Save Error:", e.message);
      throw new Error(`Sync Error: ${e.message}`);
    }
  }

  static async getAllOutfits(): Promise<GeneratedOutfit[]> {
    if (!supabase || !isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('outfits')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        url: row.url,
        originalUrl: row.original_url,
        parentId: row.parent_id,
        prompt: row.prompt,
        timestamp: row.timestamp,
        model: row.model,
        aspectRatio: row.aspect_ratio,
        evolutionStep: row.evolution_step,
        mode: row.mode,
        mutationStrength: row.mutation_strength,
        seed: row.seed
      }));
    } catch (e) {
      return [];
    }
  }

  static async deleteOutfit(id: string): Promise<void> {
    if (supabase && isSupabaseConfigured) {
      await supabase.storage.from(BUCKET_NAME).remove([`evolution/${id}.png`]);
      await supabase.from('outfits').delete().eq('id', id);
    }
  }

  static async saveArchetype(archetype: Archetype): Promise<void> {
    if (supabase && isSupabaseConfigured) {
      await supabase.from('archetypes').upsert(archetype);
    }
  }

  static async getAllArchetypes(): Promise<Archetype[]> {
    if (!supabase || !isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('archetypes').select('*');
    if (error) return [];
    return data || [];
  }

  static async deleteArchetype(id: string): Promise<void> {
    if (supabase && isSupabaseConfigured) {
      await supabase.from('archetypes').delete().eq('id', id);
    }
  }
}
