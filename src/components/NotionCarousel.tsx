import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UI_STYLES } from '@/lib/styles';

interface NotionCarouselProps {
  images: string[];
  className?: string;
  autoplay?: boolean;
  interval?: number;
  isGoogleDrive?: boolean;
  height?: number; // Optional height in pixels
}

const NotionCarousel = ({ 
  images, 
  className, 
  autoplay = true, 
  interval = 5000,
  isGoogleDrive = false,
  height = 480, // Increased to 480px
}: NotionCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [processedImages, setProcessedImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [direction, setDirection] = useState<'next' | 'prev' | null>(null);

  useEffect(() => {
    if (!images || images.length === 0) {
      setProcessedImages([]);
      return;
    }

    setProcessedImages(images);
    setIsLoading(true);
    setImageError(false);
    setLoadAttempts(0);
  }, [images]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [processedImages]);

  useEffect(() => {
    if (!autoplay || processedImages.length === 0) return;
    
    const timer = setInterval(() => {
      handleSlideChange('next');
    }, interval);
    
    return () => clearInterval(timer);
  }, [autoplay, interval, processedImages.length]);

  const handleSlideChange = (moveDirection: 'next' | 'prev') => {
    if (processedImages.length === 0) return;
    
    setDirection(moveDirection);
    setTransitionEnabled(true);
    
    setCurrentIndex((prev) => {
      if (moveDirection === 'next') {
        return (prev + 1) % processedImages.length;
      } else {
        return (prev - 1 + processedImages.length) % processedImages.length;
      }
    });
    
    setIsLoading(true);
    setImageError(false);
    setLoadAttempts(0);
  };

  const getSlideTransform = (index: number) => {
    // Regular case - use the index difference
    const indexDiff = index - currentIndex;
    
    // Handle wrapping cases
    if (processedImages.length <= 1) return 0;
    
    if (direction === 'next' && indexDiff === -(processedImages.length - 1)) {
      // Going from last to first with next button
      return 100; // Position to the right
    }
    
    if (direction === 'prev' && indexDiff === processedImages.length - 1) {
      // Going from first to last with prev button
      return -100; // Position to the left
    }
    
    // Normal case
    return indexDiff * 100;
  };

  const carouselHeight = height;

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    const currentAttempts = loadAttempts + 1;
    
    if (currentAttempts < 3) {
      setLoadAttempts(currentAttempts);
    } else {
      setIsLoading(false);
      setImageError(true);
    }
  }, [loadAttempts]);

  const NavButton = ({ direction }: { direction: 'next' | 'prev' }) => (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "h-8 w-8 rounded-full notion-transparent flex-shrink-0 bg-white/20",
        UI_STYLES.button.icon,
        direction === 'prev' ? "mr-2" : "ml-2"
      )}
      onClick={() => handleSlideChange(direction)}
    >
      {direction === 'prev' ? (
        <ChevronLeft className={UI_STYLES.iconSize} />
      ) : (
        <ChevronRight className={UI_STYLES.iconSize} />
      )}
    </Button>
  );

  if (processedImages.length === 0) {
    return (
      <div className={cn("relative max-w-[880px] mx-auto notion-transparent", className)}>
        <div className="flex items-center notion-transparent">
          <div className="h-8 w-8 mr-2 flex-shrink-0 notion-transparent" />
          
          <div 
            className={cn(`relative w-full notion-transparent flex items-center justify-center rounded-lg border backdrop-blur-sm bg-white/20 ${UI_STYLES.border}`)}
            style={{ height: `${carouselHeight}px` }}
          >
            <div className="text-center p-4 space-y-2 notion-transparent rounded-md bg-black/20 backdrop-blur-sm border border-white/10 shadow-lg">
              <ImageIcon className={cn(`mx-auto h-10 w-10 text-white/70`)} />
              <p className="text-white/80 font-medium">No images to display</p>
            </div>
          </div>
          
          <div className="h-8 w-8 ml-2 flex-shrink-0 notion-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative max-w-[880px] mx-auto notion-transparent", className)}>
      <div className="flex items-center notion-transparent">
        <NavButton direction="prev" />
        
        <div 
          className={cn(`relative overflow-hidden rounded-lg w-full notion-transparent border ${UI_STYLES.border}`)}
          style={{ height: `${carouselHeight}px` }}
        >
          {imageError ? (
            <div className="text-center p-6 space-y-3 notion-transparent">
              <Alert variant="destructive" className="mb-2 bg-black/30 backdrop-blur-sm border-red-400/50 shadow-lg">
                <AlertCircle className={UI_STYLES.iconSize} />
                <AlertDescription className="text-white/90">
                  Failed to load image. Make sure Google Drive sharing is set to "Anyone with the link can view".
                </AlertDescription>
              </Alert>
              <div className="text-xs text-white/80 p-2 bg-black/20 backdrop-blur-sm rounded border border-white/10 shadow-sm">
                Current URL: <span className="font-mono break-all">{processedImages[currentIndex]}</span>
              </div>
            </div>
          ) : (
            <div className="h-full w-full relative">
              {processedImages.map((image, index) => (
                <div 
                  key={`slide-${index}`}
                  className={`absolute inset-0 w-full h-full ${
                    transitionEnabled ? 'transition-all duration-500 ease-in-out' : ''
                  }`}
                  style={{ 
                    transform: `translateX(${getSlideTransform(index)}%)`,
                    opacity: index === currentIndex ? 1 : Math.abs(getSlideTransform(index)) <= 100 ? 0.5 : 0,
                    zIndex: index === currentIndex ? 10 : 5,
                    visibility: Math.abs(index - currentIndex) > 1 && 
                              !(
                                (direction === 'next' && index === 0 && currentIndex === processedImages.length - 1) || 
                                (direction === 'prev' && index === processedImages.length - 1 && currentIndex === 0)
                              ) 
                              ? "hidden" : "visible"
                  }}
                >
                  {index === currentIndex && (
                    <img
                      key={`${image}?attempt=${loadAttempts}`}
                      src={`${image}${loadAttempts > 0 ? `&cb=${Date.now()}` : ''}`}
                      alt={`Slide ${index + 1}`}
                      className="h-full w-full object-cover"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      style={{ background: 'none' }}
                    />
                  )}
                  
                  {index !== currentIndex && (
                    <img
                      src={image}
                      alt={`Slide ${index + 1}`}
                      className="h-full w-full object-cover"
                      style={{ background: 'none' }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          
          {isLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center notion-transparent z-20">
              <div className={cn("flex flex-col items-center p-4 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10 shadow-lg", UI_STYLES.animation.pulse)}>
                <ImageIcon className={cn(`h-8 w-8 mb-2 text-white/80`)} />
                <span className={cn(`text-sm text-white/80 font-medium`)}>Loading image...</span>
              </div>
            </div>
          )}
        </div>
        
        <NavButton direction="next" />
      </div>
      
      <div className="mt-4 flex justify-center w-full notion-transparent">
        <div className={cn("flex items-center justify-center gap-2 notion-transparent bg-white/10 px-3 py-2 rounded-full", UI_STYLES.actionBar)}>
          {processedImages.map((_, index) => (
            <button
              key={index}
              className={cn(
                "rounded-full transition-all shadow-md notion-transparent",
                index === currentIndex 
                  ? "w-5 h-5 bg-white" 
                  : "w-3 h-3 bg-white/60 hover:bg-white/80"
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
          
          <div className={cn(`ml-2 pl-2 border-l ${UI_STYLES.border}`)}>
            <Button 
              variant="outline"
              onClick={() => window.dispatchEvent(new CustomEvent('toggleCarouselConfig'))}
              className={cn("h-7 px-2 bg-white/20", UI_STYLES.button.subtle)}
              size="sm"
            >
              <ChevronDown className={UI_STYLES.iconSizeSmall + " mr-1"} />
              Configure
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotionCarousel;
