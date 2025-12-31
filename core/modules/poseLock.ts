
import { Skeleton } from '../types';

/**
 * Valida si la postura del nuevo sprite se mantiene dentro de los límites de tolerancia del original.
 */
export function lockPose(baseSkeleton: Skeleton, newSkeleton: Skeleton, tolerance: number = 3): boolean {
  const keys: (keyof Skeleton)[] = ['head', 'shoulders', 'hips', 'knees', 'feet'];
  for (const k of keys) {
    const [bx, by] = baseSkeleton[k];
    const [nx, ny] = newSkeleton[k];
    if (Math.abs(bx - nx) > tolerance || Math.abs(by - ny) > tolerance) {
      return false;
    }
  }
  return true;
}
