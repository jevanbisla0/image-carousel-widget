import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CarouselDot } from '@/components/ui/carousel-dot';
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
      <div className={cn("relative max-w-[880px] mx-auto", className)}>
        <div className="flex items-center">
          <div className="h-8 w-8 mr-2 flex-shrink-0" />
          <div className={cn("relative w-full flex items-center justify-center force-bg", UI_STYLES.panel)} style={{ height: `${height}px` }}>
            <div className="text-center p-4 space-y-2 rounded-md bg-gray-50 border border-gray-200 shadow-md force-bg">
              <ImageIcon className={cn("mx-auto", UI_STYLES.iconSizeMedium, UI_STYLES.textMuted)} />
              <p className={UI_STYLES.textBody}>No images to display</p>
            </div>
          </div>
          <div className="h-8 w-8 ml-2 flex-shrink-0" />
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("relative max-w-[880px] mx-auto", className)}>
      <div className="flex items-center">
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-8 w-8 flex-shrink-0 mr-2 force-bg",
            UI_STYLES.button.icon
          )}
          onClick={() => {
            goToPrev();
            startAutoplay();
          }}
          aria-label="Previous slide"
        >
          <ChevronLeft className={UI_STYLES.iconSize} />
        </Button>
        
        <div className={cn("relative overflow-hidden rounded-lg w-full force-bg", UI_STYLES.panel)} style={{ height: `${height}px` }}>
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-[-1] force-bg" />
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
                  onError={(e) => {
                    console.error(`Failed to load image: ${src}`);
                    // Set a fallback image
                    e.currentTarget.src = "https://picsum.photos/1000/600?grayscale&blur=2";
                    // Add a visible error indicator
                    e.currentTarget.style.border = "2px solid red";
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-8 w-8 flex-shrink-0 ml-2 force-bg",
            UI_STYLES.button.icon
          )}
          onClick={() => {
            goToNext();
            startAutoplay();
          }}
          aria-label="Next slide"
        >
          <ChevronRight className={UI_STYLES.iconSize} />
        </Button>
      </div>
      
      <div className="mt-4 flex justify-center w-full">
        <div className={cn("flex items-center justify-center gap-2 px-3 py-2 rounded-full force-bg", UI_STYLES.actionBar)}>
          {images.map((_, index) => (
            <CarouselDot
              key={index}
              active={index === activeIndex}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
          
          <div className={cn("ml-2 pl-2 border-l", UI_STYLES.border)}>
            <Button 
              variant="outline"
              onClick={() => window.dispatchEvent(new CustomEvent('toggleCarouselConfig'))}
              className={cn("h-7 px-2 force-bg", UI_STYLES.button.secondary)}
              size="sm"
            >
              <ChevronDown className={cn(UI_STYLES.iconSizeSmall)} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotionCarousel;
