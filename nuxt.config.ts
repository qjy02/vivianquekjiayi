// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-01-19',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/tailwindcss'],
  
  // Github Pages
  app: {
    baseURL: '/vivianquekjiayi/', // Repository name
    buildAssetsDir: 'assets',
  },
  
  // Generate static site
  ssr: true,
  
  // Routes
  nitro: {
    prerender: {
      routes: ['/']
    }
  }
})