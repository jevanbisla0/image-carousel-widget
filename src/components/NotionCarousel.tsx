import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { processGoogleDriveUrls } from '@/lib/googleDriveUtils';

interface NotionCarouselProps {
  images: string[];
  className?: string;
  autoplay?: boolean;
  interval?: number;
  isGoogleDrive?: boolean;
}

const NotionCarousel = ({ 
  images, 
  className, 
  autoplay = true, 
  interval = 5000,
  isGoogleDrive = false
}: NotionCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [processedImages, setProcessedImages] = useState<string[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Process images and setup responsive sizing
  useEffect(() => {
    // Process images if they're from Google Drive
    setProcessedImages(isGoogleDrive ? processGoogleDriveUrls(images) : images);
    
    // Handle responsive sizing
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, [images, isGoogleDrive]);

  // Autoplay functionality
  useEffect(() => {
    if (!autoplay || processedImages.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % processedImages.length);
      setIsLoading(true);
    }, interval);
    
    return () => clearInterval(timer);
  }, [autoplay, interval, processedImages.length]);

  const handleSlideChange = (direction: 'next' | 'prev') => {
    if (processedImages.length === 0) return;
    
    setCurrentIndex((prev) => {
      if (direction === 'next') {
        return (prev + 1) % processedImages.length;
      } else {
        return (prev - 1 + processedImages.length) % processedImages.length;
      }
    });
    
    setIsLoading(true);
  };

  // Calculate height based on container width to maintain aspect ratio
  const carouselHeight = Math.min(500, dimensions.height * 0.8);

  // Handle empty state
  if (processedImages.length === 0) {
    return (
      <div 
        className={cn("relative w-full mx-auto bg-muted flex items-center justify-center rounded-lg", className)}
        style={{ height: `${carouselHeight}px`, maxWidth: '100%' }}
      >
        <div className="text-center p-4 space-y-2">
          <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No images to display</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn("relative overflow-hidden rounded-lg w-full mx-auto", className)}
      style={{ height: `${carouselHeight}px`, maxWidth: '100%' }}
    >
      {/* Image slider */}
      <div className="h-full w-full relative">
        <img
          src={processedImages[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          className={cn(
            "h-full w-full object-contain transition-opacity duration-500",
            isLoading ? "opacity-0" : "opacity-100"
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      </div>
      
      {/* Navigation arrows */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background/90"
        onClick={() => handleSlideChange('prev')}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background/90"
        onClick={() => handleSlideChange('next')}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      {/* Pagination dots */}
      <div className="absolute bottom-2 left-0 right-0">
        <div className="flex items-center justify-center gap-1.5">
          {processedImages.map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === currentIndex ? "w-4 bg-primary" : "w-1.5 bg-primary/50"
              )}
              onClick={() => {
                setCurrentIndex(index);
                setIsLoading(true);
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotionCarousel;
