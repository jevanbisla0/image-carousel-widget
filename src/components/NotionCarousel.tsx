
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, AlertCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';

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
    <div className={cn("flex items-center justify-center gap-3 bg-black/70 backdrop-blur-sm rounded-full px-5 py-3", className)}>
      {images.map((_, index) => (
        <button
          key={`dot-${index}`}
          className={cn(
            "flex items-center justify-center transition-all notion-transparent",
            index === currentIndex 
              ? "opacity-100 scale-110" 
              : "opacity-80 hover:opacity-100"
          )}
          onClick={() => onDotClick(index)}
          aria-label={`Go to slide ${index + 1}`}
        >
          <div 
            className={cn(
              "rounded-full transition-all shadow-[0_0_4px_rgba(0,0,0,0.5)]",
              index === currentIndex
                ? "bg-purple-500 w-3.5 h-3.5 shadow-glow border border-purple-400" 
                : "bg-purple-400 w-3 h-3 hover:bg-purple-500 border border-purple-300"
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
  const [isLoading, setIsLoading] = useState<boolean[]>([]);
  const [processedImages, setProcessedImages] = useState<string[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [imageErrors, setImageErrors] = useState<boolean[]>([]);
  const [loadAttempts, setLoadAttempts] = useState<number[]>([]);
  const imageCacheRef = useRef<Map<string, boolean>>(new Map());
  const [initialLoad, setInitialLoad] = useState(true);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeIndex = controlledIndex !== undefined ? controlledIndex : currentIndex;

  // Effect for handling controlled index changes
  useEffect(() => {
    if (controlledIndex !== undefined && processedImages.length > 0) {
      // Reset loading state only for the current image if not already loading
      setIsLoading(prev => {
        const newLoadingState = [...prev];
        if (controlledIndex < newLoadingState.length && !imageCacheRef.current.get(processedImages[controlledIndex])) {
          newLoadingState[controlledIndex] = true;
        }
        return newLoadingState;
      });
    }
  }, [controlledIndex, processedImages]);

  // Notify parent of index change when current index changes internally
  useEffect(() => {
    if (onIndexChange && controlledIndex === undefined) {
      onIndexChange(currentIndex);
    }
  }, [currentIndex, onIndexChange, controlledIndex]);

  // Set up images and initialize state arrays
  useEffect(() => {
    if (!images || images.length === 0) {
      console.log('No images provided to carousel');
      setProcessedImages([]);
      return;
    }

    const filteredImages = images.filter(img => img && img.trim() !== '');
    console.log('Setting up carousel images:', filteredImages);
    
    if (filteredImages.length === 0) {
      console.log('All images were filtered out as invalid');
      return;
    }
    
    setProcessedImages(filteredImages);
    
    // Initialize state arrays for all images
    setIsLoading(new Array(filteredImages.length).fill(true));
    setImageErrors(new Array(filteredImages.length).fill(false));
    setLoadAttempts(new Array(filteredImages.length).fill(0));
    setInitialLoad(true);
    
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

  // Reset current index if the number of images changes
  useEffect(() => {
    if (processedImages.length > 0 && currentIndex >= processedImages.length) {
      setCurrentIndex(0);
      if (onIndexChange && controlledIndex === undefined) {
        onIndexChange(0);
      }
    }
  }, [processedImages, currentIndex, onIndexChange, controlledIndex]);

  // Clear existing timer when component unmounts or dependencies change
  useEffect(() => {
    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
    };
  }, []);

  // Handle autoplay
  useEffect(() => {
    if (!autoplay || processedImages.length <= 1) return;
    
    // Clear any existing timer
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
    
    // Set up new timer
    autoplayTimerRef.current = setInterval(() => {
      if (processedImages.length === 0) return;
      
      const nextIndex = (activeIndex + 1) % processedImages.length;
      
      if (controlledIndex === undefined) {
        setCurrentIndex(nextIndex);
        
        if (onIndexChange) {
          onIndexChange(nextIndex);
        }
      }
      
      // Don't reset loading state if the image is already cached
      if (!imageCacheRef.current.get(processedImages[nextIndex])) {
        setIsLoading(prev => {
          const newState = [...prev];
          newState[nextIndex] = true;
          return newState;
        });
        
        setLoadAttempts(prev => {
          const newState = [...prev];
          newState[nextIndex] = 0;
          return newState;
        });
        
        setImageErrors(prev => {
          const newState = [...prev];
          newState[nextIndex] = false;
          return newState;
        });
      }
    }, interval);
    
    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
    };
  }, [autoplay, interval, processedImages.length, activeIndex, onIndexChange, controlledIndex]);

  const handleSlideChange = (direction: 'next' | 'prev') => {
    if (processedImages.length === 0) return;
    
    const newIndex = direction === 'next' 
      ? (activeIndex + 1) % processedImages.length
      : (activeIndex - 1 + processedImages.length) % processedImages.length;
      
    if (controlledIndex === undefined) {
      setCurrentIndex(newIndex);
      
      if (onIndexChange) {
        onIndexChange(newIndex);
      }
    }
    
    // Only set loading if the image isn't cached
    if (!imageCacheRef.current.get(processedImages[newIndex])) {
      setIsLoading(prev => {
        const newState = [...prev];
        newState[newIndex] = true;
        return newState;
      });
      
      setLoadAttempts(prev => {
        const newState = [...prev];
        newState[newIndex] = 0;
        return newState;
      });
      
      setImageErrors(prev => {
        const newState = [...prev];
        newState[newIndex] = false;
        return newState;
      });
    }
  };

  const handleDotClick = (index: number) => {
    if (index === activeIndex) return;
    
    if (controlledIndex === undefined) {
      setCurrentIndex(index);
      
      if (onIndexChange) {
        onIndexChange(index);
      }
    }
    
    // Only set loading if the image isn't cached
    if (!imageCacheRef.current.get(processedImages[index])) {
      setIsLoading(prev => {
        const newState = [...prev];
        newState[index] = true;
        return newState;
      });
      
      setLoadAttempts(prev => {
        const newState = [...prev];
        newState[index] = 0;
        return newState;
      });
      
      setImageErrors(prev => {
        const newState = [...prev];
        newState[index] = false;
        return newState;
      });
    }
  };

  const carouselHeight = Math.min(500, dimensions.height * 0.8);

  const handleImageLoad = useCallback((index: number) => {
    if (index === activeIndex) {
      console.log('Image loaded successfully:', processedImages[activeIndex]);
      
      // Update loading state for the current image
      setIsLoading(prev => {
        const newState = [...prev];
        newState[activeIndex] = false;
        return newState;
      });
      
      // Update error state
      setImageErrors(prev => {
        const newState = [...prev];
        newState[activeIndex] = false;
        return newState;
      });
      
      // Add to cache
      if (processedImages[activeIndex]) {
        imageCacheRef.current.set(processedImages[activeIndex], true);
      }
      
      // No longer initial load
      setInitialLoad(false);
    }
  }, [processedImages, activeIndex]);

  const handleImageError = useCallback((index: number) => {
    if (index === activeIndex) {
      // Update load attempts for the current image
      setLoadAttempts(prev => {
        const newState = [...prev];
        newState[activeIndex] = (newState[activeIndex] || 0) + 1;
        return newState;
      });
      
      const currentAttempts = loadAttempts[activeIndex] ? loadAttempts[activeIndex] + 1 : 1;
      console.error(`Failed to load image (attempt ${currentAttempts}):`, processedImages[activeIndex]);
      
      if (currentAttempts >= 3) {
        // Update loading state after max attempts
        setIsLoading(prev => {
          const newState = [...prev];
          newState[activeIndex] = false;
          return newState;
        });
        
        // Update error state
        setImageErrors(prev => {
          const newState = [...prev];
          newState[activeIndex] = true;
          return newState;
        });
        
        toast({
          title: "Image failed to load",
          description: "Make sure Google Drive sharing is set to 'Anyone with the link can view'",
          variant: "destructive"
        });
      } else {
        // Try again with a new timestamp
        const imgElement = document.getElementById(`carousel-img-${activeIndex}`) as HTMLImageElement;
        if (imgElement) {
          const newSrc = `${processedImages[activeIndex]}&cb=${Date.now()}`;
          imgElement.src = newSrc;
        }
      }
    }
  }, [processedImages, activeIndex, loadAttempts, toast]);

  const getImageSource = (url: string, attempts: number) => {
    if (!url) return '';
    return `${url}${attempts > 0 ? `&cb=${Date.now()}` : ''}`;
  };

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

  // Determine if the current image is loading
  const isCurrentImageLoading = isLoading[activeIndex];
  const hasCurrentImageError = imageErrors[activeIndex];

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
            {hasCurrentImageError ? (
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
              <>
                {processedImages.map((img, idx) => (
                  <img
                    key={`carousel-img-${idx}`}
                    id={`carousel-img-${idx}`}
                    src={getImageSource(img, loadAttempts[idx] || 0)}
                    alt={`Slide ${idx + 1}`}
                    className={cn(
                      "h-full w-full object-contain transition-opacity duration-500 absolute inset-0",
                      idx === activeIndex ? "z-10" : "z-0",
                      idx === activeIndex && isCurrentImageLoading ? "opacity-0" : "opacity-100",
                      idx !== activeIndex ? "hidden" : "block"
                    )}
                    onLoad={() => handleImageLoad(idx)}
                    onError={() => handleImageError(idx)}
                    style={{ background: 'none' }}
                    loading={idx === activeIndex ? "eager" : "lazy"}
                  />
                ))}
              </>
            )}
            
            {isCurrentImageLoading && !hasCurrentImageError && (
              <div className="absolute inset-0 flex items-center justify-center notion-transparent z-20">
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
      
      {renderControls && processedImages.length > 1 && (
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
