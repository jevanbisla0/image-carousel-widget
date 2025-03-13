import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, AlertCircle, ChevronDown } from 'lucide-react';
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
          {imageError ? (
            <div className="text-center p-4 space-y-2 notion-transparent">
              <Alert variant="destructive" className="mb-2 bg-transparent border-destructive/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load image. Make sure Google Drive sharing is set to "Anyone with the link can view".
                </AlertDescription>
              </Alert>
              <div className="text-xs text-muted-foreground/70 mt-2">
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
              <div className="animate-pulse flex flex-col items-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <span className="text-sm text-muted-foreground/50">Loading image...</span>
              </div>
            </div>
          )}
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
      
      <div className="mt-4 flex justify-center notion-transparent">
        <div className="flex items-center justify-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg notion-transparent border border-gray-300/50">
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
          
          <div className="ml-2 pl-2 border-l border-gray-400/30">
            <Button 
              variant="outline"
              onClick={() => window.dispatchEvent(new CustomEvent('toggleCarouselConfig'))}
              className="bg-white/10 hover:bg-white/20 text-white border-gray-400/30 h-7 px-2"
              size="sm"
            >
              <ChevronDown className="h-3 w-3 mr-1" />
              Configure
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotionCarousel;
