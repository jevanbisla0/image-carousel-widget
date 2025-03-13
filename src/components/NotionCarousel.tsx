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
}

const NotionCarousel = ({ 
  images, 
  className, 
  autoplay = true, 
  interval = 5000,
  isGoogleDrive = false,
}: NotionCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [processedImages, setProcessedImages] = useState<string[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [imageError, setImageError] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);

  useEffect(() => {
    if (!images || images.length === 0) {
      setProcessedImages([]);
      return;
    }

    setProcessedImages(images);
    setIsLoading(true);
    setImageError(false);
    setLoadAttempts(0);
    
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
    setCurrentIndex(0);
  }, [processedImages]);

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

  const carouselHeight = Math.min(500, dimensions.height * 0.8);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    const currentAttempts = loadAttempts + 1;
    
    if (currentAttempts < 3) {
      setLoadAttempts(currentAttempts);
      setIsLoading(true);
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
        "h-8 w-8 rounded-full notion-transparent flex-shrink-0",
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
      <div className={cn("relative w-full mx-auto notion-transparent", className)}>
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
    <div className={cn("relative w-full mx-auto notion-transparent", className)}>
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
              style={{ background: 'none' }}
            />
          )}
          
          {isLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center notion-transparent">
              <div className={cn("flex flex-col items-center p-4 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10 shadow-lg", UI_STYLES.animation.pulse)}>
                <ImageIcon className={cn(`h-8 w-8 mb-2 text-white/80`)} />
                <span className={cn(`text-sm text-white/80 font-medium`)}>Loading image...</span>
              </div>
            </div>
          )}
        </div>
        
        <NavButton direction="next" />
      </div>
      
      <div className="mt-4 flex justify-center notion-transparent">
        <div className={cn("flex items-center justify-center gap-2 notion-transparent", UI_STYLES.actionBar)}>
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
              className={cn("h-7 px-2", UI_STYLES.button.subtle)}
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
