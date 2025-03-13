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
  actionBar: "bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200/30",
  
  // Button styles for transparent backgrounds
  button: {
    // Primary button with higher opacity background and border
    primary: "bg-blue-500/85 hover:bg-blue-600/90 text-white border border-blue-400/50 shadow-sm",
    
    // Secondary option that's visible on transparent
    secondary: "bg-gray-500/75 hover:bg-gray-600/80 text-white border border-gray-400/50 shadow-sm",
    
    // Danger button with visible border
    danger: "bg-red-500/85 hover:bg-red-600/90 text-white border border-red-400/50 shadow-sm",
    
    // Add button with visible border
    add: "bg-purple-500/85 hover:bg-purple-600/90 text-white border border-purple-400/50 shadow-sm",
    
    // Subtle button with visible border and backdrop blur
    subtle: "bg-white/25 hover:bg-white/35 text-gray-800 border border-gray-300/50 backdrop-blur-sm shadow-sm",
    
    // Transparent button with visible border
    transparent: "bg-transparent hover:bg-black/10 border border-gray-300/50 text-gray-800 shadow-sm",
    
    // Icon button that's visible on any background
    icon: "bg-white/30 hover:bg-white/40 border border-gray-300/50 backdrop-blur-sm shadow-sm",
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