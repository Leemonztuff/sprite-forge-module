
export interface PixelData {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export interface Skeleton {
  head: [number, number];
  shoulders: [number, number];
  hips: [number, number];
  knees: [number, number];
  feet: [number, number];
}

export interface UserSession {
  user: {
    id: string;
    credits: number;
    role: string;
  } | null;
}

export interface SpriteMetadata {
  prompt: string;
  seed: number;
  engine: string;
  timestamp: number;
  integrityScore: number;
}

export type CoreModule = (img: PixelData, ...args: any[]) => PixelData | Uint8Array | number[][] | Skeleton | string | number | boolean;
