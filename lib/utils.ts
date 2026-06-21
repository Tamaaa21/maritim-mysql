import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isVideoUrl(url: string) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return !!(
    lower.match(/\.(mp4|webm|ogg|mov|mkv|avi|3gp|flv|wmv|m4v)/i) ||
    lower.includes("/video/") ||
    lower.includes("video.") ||
    lower.includes("type=video")
  );
}
