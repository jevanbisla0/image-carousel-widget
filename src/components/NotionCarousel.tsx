
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
  const [imageError, setImageError] = useState(false);

  // Process images and setup responsive sizing
  useEffect(() => {
    // Process images if they're from Google Drive
    const newProcessedImages = isGoogleDrive ? processGoogleDriveUrls(images) : images;
    console.log('Processed images:', newProcessedImages);
    setProcessedImages(newProcessedImages);
    setIsLoading(true);
    setImageError(false);
    
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
      setImageError(false);
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
    setImageError(false);
  };

  // Calculate height based on container width to maintain aspect ratio
  const carouselHeight = Math.min(500, dimensions.height * 0.8);

  const handleImageError = () => {
    console.error(`Failed to load image: ${processedImages[currentIndex]}`);
    setIsLoading(false);
    setImageError(true);
  };

  // Handle empty state
  if (processedImages.length === 0) {
    return (
      <div className={cn("relative w-full mx-auto bg-transparent", className)}>
        <div className="flex items-center bg-transparent">
          <div className="h-8 w-8 mr-2 flex-shrink-0" /> {/* Spacer for alignment */}
          
          <div 
            className="relative w-full bg-transparent flex items-center justify-center rounded-lg"
            style={{ height: `${carouselHeight}px` }}
          >
            <div className="text-center p-4 space-y-2 bg-muted/20 rounded-md">
              <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">No images to display</p>
            </div>
          </div>
          
          <div className="h-8 w-8 ml-2 flex-shrink-0" /> {/* Spacer for alignment */}
        </div>
        <div className="mt-2 h-1.5"></div> {/* Empty space for pagination dots alignment */}
      </div>
    );
  }

  return (
    <div className={cn("relative w-full mx-auto bg-transparent", className)}>
      {/* Navigation arrows - positioned outside */}
      <div className="flex items-center bg-transparent">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full bg-transparent hover:bg-background/10 mr-2 flex-shrink-0"
          onClick={() => handleSlideChange('prev')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {/* Image slider container */}
        <div 
          className="relative overflow-hidden rounded-lg w-full bg-transparent"
          style={{ height: `${carouselHeight}px` }}
        >
          <div className="h-full w-full relative bg-transparent flex items-center justify-center">
            {imageError ? (
              <div className="text-center p-4 space-y-2">
                <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">Failed to load image</p>
                <p className="text-muted-foreground text-xs">
                  Make sure the Google Drive file is shared with "Anyone with the link can view"
                </p>
              </div>
            ) : (
              <img
                src={processedImages[currentIndex]}
                alt={`Slide ${currentIndex + 1}`}
                className={cn(
                  "h-full w-full object-contain transition-opacity duration-500",
                  isLoading ? "opacity-0" : "opacity-100"
                )}
                onLoad={() => setIsLoading(false)}
                onError={handleImageError}
                crossOrigin="anonymous"
              />
            )}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full bg-transparent hover:bg-background/10 ml-2 flex-shrink-0"
          onClick={() => handleSlideChange('next')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Pagination dots - moved outside */}
      <div className="mt-2 flex justify-center bg-transparent">
        <div className="flex items-center justify-center gap-1.5 bg-transparent">
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
                setImageError(false);
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
