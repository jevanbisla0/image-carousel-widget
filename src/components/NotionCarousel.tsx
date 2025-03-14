import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UI_STYLES } from '@/lib/styles';

interface NotionCarouselProps {
  images: string[];
  className?: string;
  autoplay?: boolean;
  interval?: number;
  isGoogleDrive?: boolean;
  height?: number;
}

const NotionCarousel = ({ 
  images, 
  className, 
  autoplay = true, 
  interval = 5000,
  isGoogleDrive = false,
  height = 480,
}: NotionCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Handle autoplay
  useEffect(() => {
    if (!autoplay || images.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, interval);
    
    return () => clearInterval(timer);
  }, [autoplay, interval, images.length]);
  
  // Simple navigation functions
  const next = () => setCurrentIndex((currentIndex + 1) % images.length);
  const prev = () => setCurrentIndex((currentIndex - 1 + images.length) % images.length);
  
  if (images.length === 0) {
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
        {/* Previous button */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-full notion-transparent flex-shrink-0 bg-white/20",
            UI_STYLES.button.icon,
            "mr-2"
          )}
          onClick={prev}
        >
          <ChevronLeft className={UI_STYLES.iconSize} />
        </Button>
        
        {/* Carousel container */}
        <div 
          className={cn(`relative overflow-hidden rounded-lg w-full notion-transparent border ${UI_STYLES.border}`)}
          style={{ height: `${height}px` }}
        >
          {/* Sliding track */}
          <div 
            className="w-full h-full flex transition-transform duration-500 ease-in-out"
            style={{ 
              width: `${images.length * 100}%`,
              transform: `translateX(-${currentIndex * (100 / images.length)}%)`
            }}
          >
            {/* Individual slides */}
            {images.map((src, index) => (
              <div 
                key={index} 
                className="h-full flex-shrink-0"
                style={{ width: `${100 / images.length}%` }}
              >
                <img 
                  src={src} 
                  alt={`Slide ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Next button */}
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-full notion-transparent flex-shrink-0 bg-white/20",
            UI_STYLES.button.icon,
            "ml-2"
          )}
          onClick={next}
        >
          <ChevronRight className={UI_STYLES.iconSize} />
        </Button>
      </div>
      
      {/* Dots navigation */}
      <div className="mt-4 flex justify-center w-full notion-transparent">
        <div className={cn("flex items-center justify-center gap-2 notion-transparent bg-white/10 px-3 py-2 rounded-full", UI_STYLES.actionBar)}>
          {images.map((_, index) => (
            <button
              key={index}
              className={cn(
                "rounded-full transition-all shadow-md notion-transparent",
                index === currentIndex 
                  ? "w-5 h-5 bg-white" 
                  : "w-3 h-3 bg-white/60 hover:bg-white/80"
              )}
              onClick={() => setCurrentIndex(index)}
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
