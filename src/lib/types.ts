/**
 * Shared type definitions
 */

// Carousel properties
export interface CarouselProps {
  /** Array of image URLs to display */
  images?: string[];
  /** Optional CSS class name */
  className?: string;
  /** Whether to auto-play the carousel (default: true) */
  autoplay?: boolean;
  /** Auto-play interval in milliseconds (default: 5000) */
  interval?: number;
  /** Height of the carousel in pixels (default: 480) */
  height?: number;
  /** Callback when configure button is clicked */
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

// Storage configuration
export interface StorageConfig {
  /** Key for storing the folder ID in localStorage */
  folderKey: string;
  /** Default folder name if none is specified */
  defaultFolder: string;
} 