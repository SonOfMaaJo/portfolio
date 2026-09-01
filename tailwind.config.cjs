/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter Variable', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
			},
			maxWidth: {
				prose: '68ch',
			},
		},
	},
	plugins: [require("@tailwindcss/typography"), require("daisyui")],
	daisyui: {
		themes: [
			{
				viery: {
					"color-scheme": "light",
					"primary": "#334155",
					"primary-content": "#ffffff",
					"secondary": "#475569",
					"secondary-content": "#ffffff",
					"accent": "#334155",
					"accent-content": "#ffffff",
					"neutral": "#1f2530",
					"neutral-content": "#f1f2f4",
					"base-100": "#fbfbf9",
					"base-200": "#f2f2ee",
					"base-300": "#e3e3dd",
					"base-content": "#1c2024",
					"info": "#3b6ea5",
					"success": "#3f8f5b",
					"warning": "#b7791f",
					"error": "#b4443c",
					"--rounded-box": "0.5rem",
					"--rounded-btn": "0.375rem",
					"--rounded-badge": "0.25rem",
					"--border-btn": "1px",
					"--tab-radius": "0.375rem",
					"--animation-btn": "0.2s",
					"--animation-input": "0.2s",
				},
			},
		],
		darkTheme: "viery",
		logs: false,
	}
}
