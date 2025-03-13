/**
 * Shared UI styling constants for consistent design across components
 */

export const UI_STYLES = {
  // Border styles
  border: "border-gray-200/50",
  borderHeavy: "border-gray-300/50",
  borderLight: "border-gray-100/50",
  
  // Icon sizes
  iconSize: "h-4 w-4",
  iconSizeSmall: "h-3 w-3",
  iconSizeMedium: "h-5 w-5",
  iconSizeLarge: "h-6 w-6",
  
  // Text styles
  textMuted: "text-gray-500",
  textSubtle: "text-gray-600",
  textHeading: "text-gray-800",
  
  // Background styles
  bgTransparent: "bg-transparent",
  bgPanel: "bg-white/80 backdrop-blur-sm",
  bgCard: "bg-white",
  bgMuted: "bg-gray-50",
  
  // Containers
  panel: "bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/50",
  card: "bg-white rounded-md border border-gray-200/50",
  actionBar: "bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-300/50",
  
  // Button styles
  button: {
    primary: "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: "bg-gray-500 hover:bg-gray-600 text-white",
    danger: "bg-red-500 hover:bg-red-600 text-white border-none",
    add: "bg-purple-500 hover:bg-purple-600 text-white",
    subtle: "bg-white/10 hover:bg-white/20 text-white border-transparent",
  },
  
  // Spacing
  space: {
    xs: "space-y-1",
    sm: "space-y-2",
    md: "space-y-4",
    lg: "space-y-8",
  },
  
  // Transitions
  transition: {
    fast: "transition-all duration-150 ease-in-out",
    default: "transition-all duration-300 ease-in-out",
    slow: "transition-all duration-500 ease-in-out",
  },
  
  // Animation
  animation: {
    pulse: "animate-pulse",
    spin: "animate-spin",
  },
  
  // Status indicators
  indicator: {
    active: "bg-green-500",
    inactive: "bg-gray-300",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  },
}; 