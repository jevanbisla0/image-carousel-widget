/**
 * Shared type definitions
 */

// Carousel properties
export interface CarouselProps {
  images: string[];
  className?: string;
  autoplay?: boolean;
  interval?: number;
  height?: number;
  onConfigureClick?: () => void;
}

// Google Drive related types
export interface GoogleDriveImage {
  id: string;
  url: string;
}

// Storage options
export interface StorageOptions {
  folderId: string;
  storageKey?: string;
} 