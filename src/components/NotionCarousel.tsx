
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, AlertCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NotionCarouselProps {
  images: string[];
  className?: string;
  autoplay?: boolean;
  interval?: number;
  isGoogleDrive?: boolean;
  renderControls?: boolean;
  onIndexChange?: (index: number) => void;
  controlledIndex?: number;
}

export const CarouselDots = ({ 
  images, 
  currentIndex, 
  onDotClick,
  className 
}: { 
  images: string[], 
  currentIndex: number, 
  onDotClick: (index: number) => void,
  className?: string
}) => {
  if (!images || images.length <= 1) return null;
  
  return (
    <div className={cn("flex items-center justify-center gap-3 bg-black/70 backdrop-blur-sm rounded-full px-5 py-2.5", className)}>
      {images.map((_, index) => (
        <button
          key={index}
          className={cn(
            "flex items-center justify-center transition-all notion-transparent",
            index === currentIndex 
              ? "opacity-100 scale-110" 
              : "opacity-70 hover:opacity-90"
          )}
          onClick={() => onDotClick(index)}
          aria-label={`Go to slide ${index + 1}`}
        >
          <div 
            className={cn(
              "rounded-full transition-all",
              index === currentIndex
                ? "bg-white shadow-glow w-2.5 h-2.5" 
                : "bg-white/80 w-2 h-2 hover:bg-white"
            )}
          />
        </button>
      ))}
    </div>
  );
};

const NotionCarousel = ({ 
  images, 
  className, 
  autoplay = true, 
  interval = 5000,
  isGoogleDrive = false,
  renderControls = true,
  onIndexChange,
  controlledIndex
}: NotionCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [processedImages, setProcessedImages] = useState<string[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [imageError, setImageError] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [imagesInitialized, setImagesInitialized] = useState(false);

  // Use controlled index if provided
  const activeIndex = controlledIndex !== undefined ? controlledIndex : currentIndex;

  // Update the parent component when index changes internally
  useEffect(() => {
    if (onIndexChange && controlledIndex === undefined) {
      onIndexChange(currentIndex);
    }
  }, [currentIndex, onIndexChange, controlledIndex]);

  useEffect(() => {
    if (!images || images.length === 0) {
      console.log('No images provided to carousel');
      setProcessedImages([]);
      setImagesInitialized(false);
      return;
    }

    console.log('Setting up carousel images:', images);
    setProcessedImages(images);
    setIsLoading(true);
    setImageError(false);
    setLoadAttempts(0);
    setImagesInitialized(true);
    
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

  useEffect(() => {
    if (processedImages.length > 0) {
      setCurrentIndex(0);
    }
  }, [processedImages]);

  useEffect(() => {
    if (!autoplay || processedImages.length <= 1) return;
    
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

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setIsLoading(true);
    setImageError(false);
    setLoadAttempts(0);
  };

  const carouselHeight = Math.min(500, dimensions.height * 0.8);

  const handleImageLoad = useCallback(() => {
    console.log('Image loaded successfully:', processedImages[activeIndex]);
    setIsLoading(false);
    setImageError(false);
  }, [processedImages, activeIndex]);

  const handleImageError = useCallback(() => {
    const currentAttempts = loadAttempts + 1;
    console.error(`Failed to load image (attempt ${currentAttempts}):`, processedImages[activeIndex]);
    
    if (currentAttempts < 3) {
      setLoadAttempts(currentAttempts);
      setIsLoading(true);
    } else {
      setIsLoading(false);
      setImageError(true);
    }
  }, [processedImages, activeIndex, loadAttempts]);

  if (processedImages.length === 0) {
    return (
      <div className={cn("relative w-full mx-auto notion-transparent", className)}>
        <div className="flex items-center notion-transparent">
          <div className="h-8 w-8 mr-2 flex-shrink-0 notion-transparent" />
          
          <div 
            className="relative w-full notion-transparent flex items-center justify-center rounded-lg border border-gray-300/30"
            style={{ height: `${carouselHeight}px` }}
          >
            <div className="text-center p-4 space-y-2 notion-transparent rounded-md">
              <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <p className="text-muted-foreground/50">No images to display</p>
            </div>
          </div>
          
          <div className="h-8 w-8 ml-2 flex-shrink-0 notion-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full mx-auto notion-transparent", className)}>
      <div className="flex items-center notion-transparent">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full notion-transparent hover:bg-white/10 mr-2 flex-shrink-0"
          onClick={() => handleSlideChange('prev')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div 
          className="relative overflow-hidden rounded-lg w-full notion-transparent border border-gray-300/50"
          style={{ height: `${carouselHeight}px` }}
        >
          <div className="h-full w-full relative notion-transparent flex items-center justify-center">
            {imageError ? (
              <div className="text-center p-4 space-y-2 notion-transparent">
                <Alert variant="destructive" className="mb-2 bg-transparent border-destructive/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load image. Make sure Google Drive sharing is set to "Anyone with the link can view".
                  </AlertDescription>
                </Alert>
                <div className="text-xs text-muted-foreground/70 mt-2">
                  Current URL: <span className="font-mono break-all">{processedImages[activeIndex]}</span>
                </div>
              </div>
            ) : (
              <img
                key={`${processedImages[activeIndex]}?attempt=${loadAttempts}`}
                src={`${processedImages[activeIndex]}${loadAttempts > 0 ? `&cb=${Date.now()}` : ''}`}
                alt={`Slide ${activeIndex + 1}`}
                className={cn(
                  "h-full w-full object-contain transition-opacity duration-500",
                  isLoading ? "opacity-0" : "opacity-100"
                )}
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{ background: 'none' }}
              />
            )}
            
            {isLoading && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center notion-transparent">
                <div className="animate-pulse flex flex-col items-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <span className="text-sm text-muted-foreground/50">Loading image...</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full notion-transparent hover:bg-white/10 ml-2 flex-shrink-0"
          onClick={() => handleSlideChange('next')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {renderControls && processedImages.length > 1 && imagesInitialized && (
        <div className="mt-4 flex justify-center notion-transparent">
          <CarouselDots 
            images={processedImages} 
            currentIndex={activeIndex} 
            onDotClick={handleDotClick} 
          />
        </div>
      )}
    </div>
  );
};

export default NotionCarousel;
