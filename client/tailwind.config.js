export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // brand-700 (#1F4E79) is the anchor used across the app, so the ramp is
        // built around it and left byte-identical. Previously the scale skipped
        // 200/300/400/800 entirely, so every use of those classes silently
        // produced no CSS at all.
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1F4E79',
          800: '#1A3D5F',
          900: '#16304D',
        },
      },
    },
  },
  plugins: [],
}
