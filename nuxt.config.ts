// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-01-19',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/tailwindcss'],
  
  // GitHub Pages
  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/vivianquekjiayi/' : '/',
    buildAssetsDir: '_nuxt/', // Important for assets
    cdnURL: 'https://qjy02.github.io/vivianquekjiayi/', // Full CDN URL
  },
  
  // Enable static generation
  ssr: false, // Use false for GitHub Pages (static site)
  
  // Route rules
  routeRules: {
    '/': { prerender: true },
    '/**': { prerender: true }
  }
})