import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Image, AlertCircle } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [processedImages, setProcessedImages] = useState<string[]>(images);

  // Process images if they're from Google Drive
  useEffect(() => {
    if (isGoogleDrive) {
      const processed = processGoogleDriveUrls(images);
      console.log('Processed image URLs:', processed);
      setProcessedImages(processed);
    } else {
      setProcessedImages(images);
    }
  }, [images, isGoogleDrive]);

  // Handle responsive sizing
  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setContainerWidth(width);
      setContainerHeight(height);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Autoplay functionality
  useEffect(() => {
    if (!autoplay || processedImages.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % processedImages.length);
      setIsLoading(true);
    }, interval);
    
    return () => clearInterval(timer);
  }, [autoplay, interval, processedImages.length]);

  const nextSlide = () => {
    if (processedImages.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % processedImages.length);
    setIsLoading(true);
  };

  const prevSlide = () => {
    if (processedImages.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + processedImages.length) % processedImages.length);
    setIsLoading(true);
  };

  // Calculate height based on container width to maintain aspect ratio
  const carouselHeight = Math.min(500, containerHeight * 0.8);

  // Handle empty state
  if (processedImages.length === 0) {
    return (
      <div 
        className={cn("relative w-full mx-auto bg-muted flex items-center justify-center rounded-lg", className)}
        style={{ height: `${carouselHeight}px`, maxWidth: '100%' }}
      >
        <div className="text-center p-4 space-y-2">
          <Image className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">No images to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full mx-auto", className)} 
         style={{ maxWidth: '100%' }}>
      <div 
        className="relative overflow-hidden rounded-lg bg-muted"
        style={{ height: `${carouselHeight}px` }}
      >
        {/* Image */}
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mb-2" />
            <p className="text-destructive">Failed to load image</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
        ) : (
          <img
            src={processedImages[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            className={cn(
              "absolute w-full h-full object-contain transition-all duration-500",
              isLoading ? "scale-105 blur-sm" : "scale-100 blur-0"
            )}
            onLoad={() => {
              console.log('Image loaded successfully:', processedImages[currentIndex]);
              setIsLoading(false);
              setError(null);
            }}
            onError={(e) => {
              console.error('Error loading image:', processedImages[currentIndex]);
              setError(`Error loading image: ${processedImages[currentIndex]}`);
              setIsLoading(false);
            }}
          />
        )}

        {/* Navigation Buttons and Dots */}
        <div className="absolute inset-0 flex items-center justify-between px-2 sm:px-4">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 opacity-70 hover:opacity-100 transition-opacity"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 opacity-70 hover:opacity-100 transition-opacity"
            onClick={nextSlide}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
          {processedImages.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                currentIndex === index
                  ? "bg-white w-3"
                  : "bg-white/50 hover:bg-white/75"
              )}
              onClick={() => {
                setCurrentIndex(index);
                setIsLoading(true);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotionCarousel;
