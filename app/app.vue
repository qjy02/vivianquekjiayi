<script setup>
const isProd = typeof window !== 'undefined' && window.location.hostname === 'qjy02.github.io'
const baseURL = isProd ? '/vivianquekjiayi/' : '/'

useHead({
  title: 'Vivian Quek Jia Yi',
  meta: [
    {
      name: 'description',
      content: 'My personal website'
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1.0'
    }
  ],
  link: [
    {
      rel: 'icon',
      type: 'image/png',
      href: `${baseURL}images/Logo/Vispiv.png`
    }
  ]
})

const bgImageUrl = `${baseURL}images/Background/nature.jpg`
</script>

<template>
  <div class="relative min-h-screen">
    <!-- Background Image -->
    <div 
      class="fixed inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
      :style="{ backgroundImage: `url(${bgImageUrl})` }"
    ></div>
    
    <!-- High opacity overlay (95% white) Background -->
    <div class="fixed inset-0 bg-gradient-to-b from-white/90 via-white/87 to-white/85"></div>
    
    <!-- Content -->
    <div class="relative z-10">
      <NuxtPage />
    </div>
  </div>
</template>