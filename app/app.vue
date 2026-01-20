<script setup>
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
      href: '/images/Vispiv.png'
    }
  ]
})
</script>

<template>
  <div class="relative min-h-screen">
    <!-- Background Image -->
    <div 
      class="fixed inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
      :style="{ backgroundImage: 'url(/images/nature.jpg)' }"
    ></div>
    
    <!-- High opacity overlay (95% white) Background -->
    <div class="fixed inset-0 bg-gradient-to-b from-white/90 via-white/87 to-white/85"></div>
    
    <!-- Content -->
    <div class="relative z-10">
      <NuxtPage />
    </div>
  </div>
</template>