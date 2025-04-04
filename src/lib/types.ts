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