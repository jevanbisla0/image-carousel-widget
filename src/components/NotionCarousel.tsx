
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [loadAttempts, setLoadAttempts] = useState(0);

  // Setup images and responsive sizing
  useEffect(() => {
    if (!images || images.length === 0) {
      console.log('No images provided to carousel');
      setProcessedImages([]);
      return;
    }

    // Simply use the provided images - processing is done before passing to component
    console.log('Setting up carousel images:', images);
    setProcessedImages(images);
    setIsLoading(true);
    setImageError(false);
    setLoadAttempts(0);
    
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
  }, [images]);

  // Reset current index when images change
  useEffect(() => {
    setCurrentIndex(0);
  }, [processedImages]);

  // Autoplay functionality
  useEffect(() => {
    if (!autoplay || processedImages.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % processedImages.length);
      setIsLoading(true);
      setImageError(false);
      setLoadAttempts(0);
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
    setLoadAttempts(0);
  };

  // Calculate height based on container width to maintain aspect ratio
  const carouselHeight = Math.min(500, dimensions.height * 0.8);

  const handleImageLoad = useCallback(() => {
    console.log('Image loaded successfully:', processedImages[currentIndex]);
    setIsLoading(false);
    setImageError(false);
  }, [processedImages, currentIndex]);

  const handleImageError = useCallback(() => {
    const currentAttempts = loadAttempts + 1;
    console.error(`Failed to load image (attempt ${currentAttempts}):`, processedImages[currentIndex]);
    
    if (currentAttempts < 3) {
      // Try with a different cache-busting parameter
      setLoadAttempts(currentAttempts);
      // Force a reload by updating the state
      setIsLoading(true);
    } else {
      setIsLoading(false);
      setImageError(true);
    }
  }, [processedImages, currentIndex, loadAttempts]);

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
                <Alert variant="destructive" className="mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load image. Make sure Google Drive sharing is set to "Anyone with the link can view".
                  </AlertDescription>
                </Alert>
                <div className="text-xs text-muted-foreground mt-2">
                  Current URL: <span className="font-mono break-all">{processedImages[currentIndex]}</span>
                </div>
              </div>
            ) : (
              <img
                key={`${processedImages[currentIndex]}?attempt=${loadAttempts}`}
                src={`${processedImages[currentIndex]}${loadAttempts > 0 ? `&cb=${Date.now()}` : ''}`}
                alt={`Slide ${currentIndex + 1}`}
                className={cn(
                  "h-full w-full object-contain transition-opacity duration-500",
                  isLoading ? "opacity-0" : "opacity-100"
                )}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            )}
            
            {isLoading && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Loading image...</span>
                </div>
              </div>
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
                setLoadAttempts(0);
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
