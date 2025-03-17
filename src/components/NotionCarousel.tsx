import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UI_STYLES } from '@/lib/styles';

interface NotionCarouselProps {
  images: string[];
  className?: string;
  autoplay?: boolean;
  interval?: number;
  height?: number;
}

const NotionCarousel = ({ 
  images, 
  className, 
  autoplay = true, 
  interval = 5000,
  height = 480,
}: NotionCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoplayRef = useRef<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const skipTransitionRef = useRef(false);
  
  const totalSlides = images.length + 2;
  const slideWidth = 100 / totalSlides;
  
  const allSlides = [
    images[images.length - 1],
    ...images,
    images[0]
  ];
  
  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setActiveIndex(prev => 
      prev === images.length - 1 ? images.length : prev + 1
    );
  }, [images.length, isTransitioning]);
  
  const goToPrev = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setActiveIndex(prev => 
      prev === 0 ? -1 : prev - 1
    );
  }, [isTransitioning]);
  
  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
    
    if (autoplay && images.length > 1) {
      autoplayRef.current = window.setInterval(goToNext, interval);
    }
  }, [autoplay, goToNext, images.length, interval]);
  
  useEffect(() => {
    startAutoplay();
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [startAutoplay]);
  
  const handleTransitionEnd = useCallback(() => {
    setIsTransitioning(false);
    
    if (activeIndex === images.length) {
      skipTransitionRef.current = true;
      setActiveIndex(0);
      startAutoplay();
    } 
    else if (activeIndex === -1) {
      skipTransitionRef.current = true;
      setActiveIndex(images.length - 1);
      startAutoplay();
    }
  }, [activeIndex, images.length, startAutoplay]);
  
  useEffect(() => {
    if (skipTransitionRef.current) {
      requestAnimationFrame(() => {
        skipTransitionRef.current = false;
      });
    }
  }, [activeIndex]);
  
  useEffect(() => {
    const element = carouselRef.current;
    if (!element) return;
    
    element.addEventListener('transitionend', handleTransitionEnd);
    return () => element.removeEventListener('transitionend', handleTransitionEnd);
  }, [handleTransitionEnd]);
  
  useEffect(() => {
    if (!isTransitioning) startAutoplay();
  }, [activeIndex, isTransitioning, startAutoplay]);
  
  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setActiveIndex(index);
    startAutoplay();
  }, [isTransitioning, startAutoplay]);
  
  if (!images.length) {
    return (
      <div className={cn("relative max-w-[880px] mx-auto notion-transparent", className)}>
        <div className="flex items-center notion-transparent">
          <div className="h-8 w-8 mr-2 flex-shrink-0 notion-transparent" />
          <div 
            className={cn(`relative w-full notion-transparent flex items-center justify-center rounded-lg border backdrop-blur-sm bg-white/20 ${UI_STYLES.border}`)}
            style={{ height: `${height}px` }}
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
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-full notion-transparent flex-shrink-0",
            "bg-white/40 backdrop-blur-sm border-white/30 shadow-sm",
            "hover:bg-white/60 hover:border-white/50",
            "mr-2"
          )}
          onClick={() => {
            goToPrev();
            startAutoplay();
          }}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4 text-gray-800" />
        </Button>
        
        <div 
          className={cn(`relative overflow-hidden rounded-lg w-full notion-transparent border ${UI_STYLES.border}`)}
          style={{ height: `${height}px` }}
        >
          <div 
            ref={carouselRef}
            className="w-full h-full flex"
            style={{ 
              width: `${totalSlides * 100}%`,
              transform: `translateX(-${(activeIndex + 1) * slideWidth}%)`,
              transition: skipTransitionRef.current ? 'none' : 'transform 500ms ease-in-out'
            }}
          >
            {allSlides.map((src, index) => (
              <div 
                key={`slide-${index}`} 
                className="h-full flex-shrink-0"
                style={{ width: `${slideWidth}%` }}
              >
                <img 
                  src={src} 
                  alt={`Slide ${index === 0 || index === allSlides.length - 1 ? 'clone' : index}`}
                  className="w-full h-full object-cover"
                  loading={index === activeIndex + 1 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-full notion-transparent flex-shrink-0",
            "bg-white/40 backdrop-blur-sm border-white/30 shadow-sm",
            "hover:bg-white/60 hover:border-white/50",
            "ml-2"
          )}
          onClick={() => {
            goToNext();
            startAutoplay();
          }}
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4 text-gray-800" />
        </Button>
      </div>
      
      <div className="mt-4 flex justify-center w-full notion-transparent">
        <div className={cn(
          "flex items-center justify-center gap-2 notion-transparent",
          "bg-white/30 backdrop-blur-sm px-3 py-2 rounded-full shadow-sm",
          "border border-white/30"
        )}>
          {images.map((_, index) => (
            <button
              key={index}
              className={cn(
                "rounded-full transition-all shadow-md notion-transparent",
                index === activeIndex 
                  ? "w-5 h-5 bg-gray-800" 
                  : "w-3 h-3 bg-gray-600/60 hover:bg-gray-700"
              )}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
          
          <div className={cn(`ml-2 pl-2 border-l border-white/40`)}>
            <Button 
              variant="outline"
              onClick={() => window.dispatchEvent(new CustomEvent('toggleCarouselConfig'))}
              className={cn(
                "h-7 px-2 bg-white/40 backdrop-blur-sm shadow-sm",
                "border-white/30 hover:bg-white/60 hover:border-white/50",
                "text-gray-800"
              )}
              size="sm"
            >
              <ChevronDown className="h-3 w-3 mr-1 text-gray-800" />
              Configure
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotionCarousel;
