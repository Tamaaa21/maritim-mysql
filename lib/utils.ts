import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isVideoUrl(url: string) {
  return !!(url && (url.match(/\.(mp4|webm|ogg|mov|mkv|avi|3gp|flv|wmv)/i) || url.includes("video")));
}
