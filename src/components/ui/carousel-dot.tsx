import * as React from "react"
import { cn } from "@/lib/utils"
import { UI_STYLES } from "@/lib/styles"

interface CarouselDotProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

const CarouselDot = React.forwardRef<HTMLButtonElement, CarouselDotProps>(
  ({ active = false, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "rounded-full transition-all",
          active 
            ? "w-5 h-5 border-2 border-white shadow-md bg-blue-600" 
            : "w-3 h-3 border border-white/50 hover:border-white hover:scale-110 bg-blue-400 hover:bg-blue-500",
          className
        )}
        {...props}
      />
    )
  }
)

CarouselDot.displayName = "CarouselDot"

export { CarouselDot } 