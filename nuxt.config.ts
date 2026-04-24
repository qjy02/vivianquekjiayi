// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-01-19',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/image'
  ],
  
  // GitHub Pages
  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/vivianquekjiayi/' : '/',
    buildAssetsDir: '_nuxt/',
    cdnURL: 'https://qjy02.github.io/vivianquekjiayi/',
  },
  
  // Enable static generation
  ssr: true,
  
  // Route rules
  routeRules: {
    '/': { prerender: true },
    '/**': { prerender: true }
  }
})