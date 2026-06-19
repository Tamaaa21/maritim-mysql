import { MapPin, Anchor, Waves, TrendingUp, Sun } from "lucide-react";

const CATEGORY_ICONS: Record<string, any> = {
  MapPin, Anchor, Waves, TrendingUp, Sun,
};

export function getIcon(name?: string) {
  return CATEGORY_ICONS[name || "Sun"] || Sun;
}
