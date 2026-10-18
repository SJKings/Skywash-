import { Armchair, Cog, Sparkles, SprayCan, type LucideIcon } from 'lucide-react-native';
import type { WashType } from '@/lib/api';

export const PACKAGE_ICONS: Record<WashType, LucideIcon> = {
  EXTERIOR: SprayCan,
  INTERIOR: Armchair,
  FULL_DETAIL: Sparkles,
  ENGINE_BAY: Cog,
};

/** URL segment for a package: FULL_DETAIL → "full-detail". */
export function packageSlug(id: WashType) {
  return id.toLowerCase().replace('_', '-');
}

export function packageFromSlug(slug: string): WashType | null {
  const id = slug.toUpperCase().replace('-', '_');
  return id in PACKAGE_ICONS ? (id as WashType) : null;
}
