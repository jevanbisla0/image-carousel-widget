/**
 * Shared UI styling constants for consistent design across components
 */

export const UI_STYLES = {
  // Border styles
  border: "border-gray-200",
  
  // Panel and card styles
  panel: "bg-white border border-gray-200 rounded-lg shadow-sm force-bg",
  card: "bg-white border border-gray-200 rounded-md force-bg",
  bgPanel: "bg-white force-bg",
  bgCard: "bg-white force-bg",
  bgMuted: "bg-gray-50 force-bg",
  
  // Text styles
  textHeading: "text-gray-800",
  textBody: "text-gray-700",
  textSubtle: "text-gray-600",
  textMuted: "text-gray-500",
  
  // Spacing
  space: {
    sm: "space-y-2",
    md: "space-y-4",
    lg: "space-y-6"
  },
  
  // Icon sizes
  iconSize: "h-4 w-4",
  iconSizeSmall: "h-3 w-3",
  iconSizeMedium: "h-5 w-5",
  
  // Action bar
  actionBar: "bg-white border border-gray-200 force-bg",
  
  // Button styles - Consolidated for easier maintenance
  button: {
    // Primary button - Used for main actions (Save, Submit)
    primary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm rounded-md force-bg",
    
    // Secondary button - Used for secondary actions (Cancel, Back)
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 shadow-sm rounded-md force-bg",
    
    // Icon button - Used for icon-only buttons (navigation, toggles)
    icon: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm rounded-full force-bg",
    
    // Danger button - Used for destructive actions
    danger: "bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-300 shadow-sm rounded-md force-bg",
    
    // Legacy styles - kept for backward compatibility
    add: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm rounded-md force-bg",
    transparent: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm rounded-md force-bg",
    subtle: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm rounded-md force-bg"
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
    active: "bg-blue-600 force-bg",
    inactive: "bg-gray-400 hover:bg-gray-500 force-bg",
    warning: "bg-yellow-500 force-bg",
    error: "bg-red-500 force-bg",
  },
}; 