import type { Config } from "tailwindcss";

export default {
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: '#e5e7eb',
				input: '#e5e7eb',
				background: '#ffffff',
				foreground: '#111827',
				
				primary: {
					DEFAULT: '#1f2937',
					foreground: '#f9fafb',
				},
				
				secondary: {
					DEFAULT: '#f3f4f6', 
					foreground: '#1f2937',
				},

				destructive: {
					DEFAULT: '#ef4444',
					foreground: '#f9fafb',
				},

				surface: {
					DEFAULT: 'rgba(255, 255, 255, 0.4)',
					primary: '#1f2937'
				}
			},
			borderRadius: {
				lg: '8px',
				md: '6px',
				sm: '4px'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
