import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// UI styling constants
export const UI_STYLES = {
  // Common styles
  panel: "bg-white/40 border border-gray-200 rounded-lg shadow-sm",
  actionBar: "bg-white border border-gray-200",
  
  // Text styles
  textBody: "text-gray-700",
  textMuted: "text-gray-500",
  
  // Icon sizes
  iconSize: "h-4 w-4",
  iconSizeSmall: "h-3 w-3",
  iconSizeMedium: "h-5 w-5",
  
  // Button styles
  button: {
    primary: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm rounded-md",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 shadow-sm rounded-md",
    danger: "bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-300 shadow-sm rounded-md",
  }
};
