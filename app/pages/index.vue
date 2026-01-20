<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useHead } from '#imports'

// --- JS Media Tags Library ---
onMounted(() => {
  // Check if jsmediatags is already loaded
  if (typeof jsmediatags === 'undefined') {
    // Load jsmediatags synchronously
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/jsmediatags@3.9.7/dist/jsmediatags.min.js'
    script.onload = () => {
      console.log('jsmediatags loaded successfully')
      loadAllAlbumArts() // Now load album arts
    }
    script.onerror = () => {
      console.error('Failed to load jsmediatags')
    }
    document.head.appendChild(script)
  } else {
    // Already loaded
    loadAllAlbumArts()
  }
})

// --- State Management ---
const isDownloading = ref(false)
const showScrollTop = ref(false)
const skillsExpanded = ref(false)
const experiencesStates = ref({})
const musicPlayerExpanded = ref(false)
const isToggling = ref(false)

// --- Music State Management ---
const audioRef = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const currentTrackIndex = ref(0)
const albumArts = ref({})
const isLoading = ref(false)

const playlist = [
  {
    title: '小小空间',
    artist: '夕野ことび',
    src: '/music/小小空间.mp3',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    title: '微光角落',
    artist: '夕野ことび',
    src: '/music/微光角落.mp3',
    color: 'from-emerald-500 to-teal-600'
  }
]

const currentTrack = computed(() => playlist[currentTrackIndex.value])

const extractAlbumArt = async (src) => {
  return new Promise(async (resolve) => {
    if (typeof jsmediatags === 'undefined') {
      console.warn('jsmediatags not loaded')
      resolve(null)
      return
    }

    try {
      const response = await fetch(src)
      const blob = await response.blob()
      jsmediatags.read(blob, {
        onSuccess: (tag) => {
          if (tag.tags.picture) {
            const { data, format } = tag.tags.picture
            let base64String = ''
            for (let i = 0; i < data.length; i++) {
              base64String += String.fromCharCode(data[i])
            }
            const imageUrl = `data:${format};base64,${window.btoa(base64String)}`
            albumArts.value[src] = imageUrl
            resolve(imageUrl)
          } else {
            resolve(null)
          }
        },
        onError: (error) => {
          console.error('Error reading audio tags:', error)
          resolve(null)
        }
      })
    } catch (error) {
      console.error('Fetch failed:', error)
      resolve(null)
    }
  })
}

const loadAllAlbumArts = async () => {
  for (const track of playlist) {
    if (!albumArts.value[track.src]) {
      await extractAlbumArt(track.src)
    }
  }
}

const playNewTrack = async () => {
  isLoading.value = true
  isPlaying.value = false
  
  try {
    if (!albumArts.value[currentTrack.value.src]) {
      await extractAlbumArt(currentTrack.value.src)
    }
    
    await nextTick()
    
    currentTime.value = 0
    duration.value = 0 // Add this line to reset duration
    
    audioRef.value.load()
    
    await new Promise((resolve) => {
      const checkReady = () => {
        if (audioRef.value.readyState >= 1) {
          resolve()
        } else {
          setTimeout(checkReady, 100)
        }
      }
      checkReady()
    })
    
    await audioRef.value.play()
    isPlaying.value = true
  } catch (error) {
    console.error('Playback failed:', error)
    isPlaying.value = false
  } finally {
    isLoading.value = false
  }
}

// Load album art on component mount
onMounted(() => {
  // Load album arts for all tracks in background
  loadAllAlbumArts()
})

const onTimeUpdate = () => {
  if (audioRef.value) {
    currentTime.value = audioRef.value.currentTime
    
    if (duration.value === 0 && audioRef.value.duration && 
        !isNaN(audioRef.value.duration) && audioRef.value.duration !== Infinity) {
      duration.value = audioRef.value.duration
    }
  }
}

const onLoadedMetadata = () => {
  if (audioRef.value) {
    // Add a small delay to ensure audio duration is available
    setTimeout(() => {
      if (audioRef.value && !isNaN(audioRef.value.duration) && 
          audioRef.value.duration !== Infinity && audioRef.value.duration > 0) {
        duration.value = audioRef.value.duration
      } else {
        // Fallback: set duration to 0 to avoid NaN display
        duration.value = 0
      }
    }, 100)
  }
}

const seek = (e) => {
  if (!audioRef.value || duration.value === 0) return
  
  const rect = e.currentTarget.getBoundingClientRect()
  const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  audioRef.value.currentTime = percent * duration.value
}

// Helper: Format Time (00:00)
const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds) || seconds === Infinity || seconds === 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

// --- Music Actions ---
const toggleMusicPlayer = () => {
  isToggling.value = true
  setTimeout(() => {
    musicPlayerExpanded.value = !musicPlayerExpanded.value
    isToggling.value = false
  }, 300)
}

const toggleMusic = () => {
  if (!audioRef.value) return
  
  if (isPlaying.value) {
    audioRef.value.pause()
    isPlaying.value = false
  } else {
    audioRef.value.play().then(() => {
      isPlaying.value = true
    }).catch(error => {
      console.error('Play failed:', error)
      isPlaying.value = false
    })
  }
}

const nextTrack = () => {
  currentTrackIndex.value = (currentTrackIndex.value + 1) % playlist.length
  playNewTrack()
}

const prevTrack = () => {
  currentTrackIndex.value = (currentTrackIndex.value - 1 + playlist.length) % playlist.length
  playNewTrack()
}

// --- Data: Social Links ---
const socialLinks = [
  {
    name: 'GitHub',
    url: 'https://github.com/qjy02',
    icon: `
      <svg class="w-5 h-5 fill-current group-hover:text-black transition-colors" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
      </svg>
    `
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/vivian-quek-jia-yi-5645b0185/',
    icon: `
      <svg class="w-5 h-5 fill-current group-hover:text-[#0077b5] transition-colors" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    `
  },
  {
    name: 'Email',
    url: 'mailto:jyquek32@gmail.com',
    icon: `
      <svg class="w-5 h-5 stroke-current group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
      </svg>
    `
  }
]


// --- Data: Skills ---
const skills = [
  {
    category: 'Frontend',
    items: [
      'HTML', 'CSS', 'Tailwind CSS', 'JavaScript (ES6+)',
      'TypeScript', 'React',
      'Angular', 'Quasar', 'Vite', 'Vue.js', 'Nuxt.js', 'Next.js'
    ]
  },
  {
    category: 'Backend',
    items: [
      'Python', 'Django REST', 'FastAPI', 'Node.js', 'PHP', 'Java', 'C', 'C++'
    ]
  },
  {
    category: 'Databases & APIs',
    items: [
      'MySQL', 'MSSQL (Microsoft SQL Server)', 'PostgreSQL', 'REST APIs', 'Postman', 'SQLYog'
    ]
  },
  {
    category: 'UI/UX & Design Tools',
    items: [
      'Figma', 'Storybook', 'Canva', 'Mockflow', 'Draw.io', 'Visual Studio Code', 'IntelliJ IDEA', 'Oracle', 'CodeBlocks'
    ]
  },
  {
    category: 'Development & DevOps Tools',
    items: [
      'Git', 'GitHub', 'Jira', 'Linux (Ubuntu)', 'WinSCP', 'PuTTY', 'ngrok'
    ]
  },
  {
    category: 'Languages',
    items: [
      'English', 'Bahasa Melayu', 'Chinese', 'Hokkien'
    ]
  }
]

// Define how many skills to show initially
const initialVisibleSkills = 6

// --- Computed Properties ---
const visibleSkills = computed(() => {
  if (skillsExpanded.value) {
    // Return all skills in a flat array when expanded
    return skills.flatMap(category => category.items)
  } else {
    // Return only limited skills when collapsed
    const allSkills = skills.flatMap(category => category.items)
    return allSkills.slice(0, initialVisibleSkills)
  }
})

// --- Data: Projects ---
const projects = [
  {
    title: 'Personal Portfolio Website',
    desc: 'A corner to share a little about myselfS',
    tags: ['Vue', 'Vite', 'HTML', 'Tailwind CSS', 'Nuxt.js', 'JavaScript'],
    link: 'https://qjy02.github.io/vivianquekjiayi/'
  },
  {
    title: 'Vipo Playground',
    desc: 'An interactive web playground featuring fun games with Vipo, a virtual mascot companion',
    tags: ['React', 'Vite', 'HTML', 'Tailwind CSS', 'JavaScript'],
    link: 'https://qjy02.github.io/react/'
  },
  {
    title: 'Vispiv Collectives',
    desc: 'A collection of mini web applications or tools',
    tags: ['Vanilla HTML', 'Tailwind CSS', 'JavaScript'],
    link: 'https://qjy02.github.io/vispiv/'
  },
  {
    title: 'Predicting churn with filter-based techniques and deep learning',
    desc: 'A customer churn prediction model integrating attribute selection analysis with deep learning to improve prediction performance while reducing feature dimensions in the telecommunications industry',
    tags: ['Tensorflow', 'Keras', 'Python', 'Pandas', 'Scikit-learn', 'Deep Learning'],
    link: 'https://ijece.iaescore.com/index.php/IJECE/article/view/33625'
  },
  {
    title: 'Customer Churn Prediction through Attribute Selection Analysis and Support Vector Machine',
    desc: 'A churn prediction model using attribute selection analysis and Support Vector Machine that achieves better performance with reduced feature dimensions compared to full feature set utilization',
    tags: ['Tensorflow', 'Keras', 'Python', 'Pandas', 'Scikit-learn', 'Machine Learning'],
    link: 'https://jtde.telsoc.org/index.php/jtde/article/view/777'
  },
  {
    title: 'Java Tutorial',
    desc: 'A collection of Java tutorials and examples for beginners to learn Java programming',
    tags: ['Java'],
    link: 'https://github.com/qjy02/java_tutorial/'
  }
]

// --- Data: Work Experience ---
const workExperiences = [
  {
    year: 'Mar 2024 - Dec 2025',
    role: 'Software Engineer (Backend)',
    company: 'Panda Software House Sdn. Bhd. (Melaka, Malaysia)',
    points: [
      'Developed RESTful APIs using Python Django Rest Framework for the Sublet Rental Management System to manage tenant agreements, billing, and financial records',
      'Handle E-Invoicing Portal System to support tax entity management, retailer onboarding, and B2B transactions',
      'Designed and implemented APIs for the Rebate Income Management System (RIMS) to handle trading agreements, claims, rebates, and financial summaries',
      'Worked closely with multiple departments to handle client support tickets and system change requests',
      'Managed data synchronization across multiple systems (backend portals, invoicing, and accounting platforms)'
    ],
    desc: 'Developed and maintained RESTful APIs for multiple management systems',
    showMore: false
  },
  {
    year: 'May 2022 - Aug 2022',
    role: 'Frontend Web Developer Intern',
    company: 'Moabi PLT (Melaka, Malaysia)',
    points: [
      'Developed responsive and user-friendly UI components for the MakanHere POS food ordering app using the Angular framework',
      'Conducted research and implementation of Storybook (Angular Framework) for isolated UI component development, testing, and documentation',
      'Collaborated with UI/UX team on small projects to ensure consistent UI/UX across the application',
      'Supported front-end development tasks focused on simple, usable and responsive designs'
    ],
    desc: 'Built responsive UI components for the MakanHere POS app with Angular and Storybook, collaborating with the UI/UX team on clean, usable designs',
    showMore: false
  },
  {
    year: 'Mar 2020 - Jun 2020',
    role: 'Game Development Research Intern',
    company: 'CUCC FIST MMU (Melaka, Malaysia)',
    points: [
      'Developed a Voice Recognition Maze Game for Telekom Malaysia\'s 2020 Game Campaign using HTML, CSS, and JavaScript',
      'Implemented voice-controlled gameplay, interactive storylines with multiple endings, and chatbot integration',
      'Designed and integrated virtual characters (TM-Kun & Unifi-Chan) for user engagement',
      'Collaborated remotely in a 2-person development team during the COVID-19 period',
      'Created UI/UX banners and interactive prototypes using Figma and Mockflow'
    ],
    desc: 'Developed a voice-controlled maze game with interactive storylines and virtual characters for Telekom Malaysia, collaborating remotely and designing UI/UX prototypes using Figma and Mockflow',
    showMore: false
  }
]

// --- Data: Education ---
const education = [
  {
    year: 'Aug 2021 - Oct 2023',
    role: 'Bachelor of Computer Science (Hons.) in Artificial Intelligence',
    company: 'Multimedia University (Melaka, Malaysia)',
    desc: 'CGPA: 3.90'
  },
  {
    year: 'Apr 2019 - Jul 2021',
    role: 'Diploma in Information Technology',
    company: 'Multimedia University (Melaka, Malaysia)',
    desc: 'CGPA: 3.98'
  },
  {
    year: 'May 2015 - Dec 2018',
    role: 'IGCSE (O Level)',
    company: 'Oakrich International School (Melaka, Malaysia)',
    desc: ''
  },
  {
    year: 'Jan 2009 - Dec 2014',
    role: 'UPSR',
    company: 'SJK (C) WEN HUA (Melaka, Malaysia)',
    desc: ''
  }
]

// --- Data: Partners (Logos) ---
const partners = [
  {
    name: 'Giant Malaysia',
    logo: 'https://i0.wp.com/www.giant.com.my/wp-content/uploads/2021/03/Giant_Malaysia.png?fit=380%2C240&ssl=1'
  },
  {
    name: 'TF Value Mart',
    logo: 'https://www.tfvaluemart.com.my/wp-content/uploads/2020/11/logo.svg'
  },
  {
    name: 'Sri Ternak Group',
    logo: 'https://www.sriternak.com/wp-content/uploads/2023/07/logo-sri-ternak-03.svg'
  },
  {
    name: 'Everrise',
    logo: 'https://everriseshop.panda-eco.com/everrise/branch_image/logo.png'
  },
  {
    name: 'Curtin University',
    logo: 'https://curtin.edu.my/wp-content/themes/mimas/dist/images/cm-logo.png'
  }
]

// --- Actions ---

// 1. Expand/Collapse Experience Points
const toggleExperiencePoints = (expIndex) => {
  experiencesStates.value[expIndex] = !experiencesStates.value[expIndex]
}

// 2. Handle Resume Download
const handleDownload = () => {
  isDownloading.value = true
  
  setTimeout(() => {
    isDownloading.value = false
    
    try {
      const link = document.createElement('a')
      link.href = '/files/VivianQuekJiaYi_Resume.pdf' // Default file path and name
      link.download = 'VivianQuekJiaYi_Resume.pdf' // Filename can be changed
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log('Resume downloaded successfully!')
    } catch (error) {
      console.error('Download failed:', error)
      alert('Sorry, the download failed. Please try again.')
    }
  }, 1000)
}

// 3. Handle Scroll to Top
const checkScroll = () => {
  showScrollTop.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 4. Lifecycle Hooks for Scroll Listener
onMounted(() => {
  window.addEventListener('scroll', checkScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})
</script>

<template>
  <div class="relative min-h-screen text-neutral-800 selection:bg-neutral-200"> 
    <transition name="fade">
      <div v-if="isDownloading" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
        <div class="w-16 h-16 border-4 border-neutral-200 border-t-neutral-800 rounded-full animate-spin"></div>
        <p class="mt-4 text-neutral-600 tracking-widest text-sm uppercase">Preparing Resume...</p>
      </div>
    </transition>

    <!-- Music Player Button -->
    <div class="absolute top-0 right-0">
      <transition name="fade">
        <button
          v-if="!musicPlayerExpanded"
          @click="toggleMusicPlayer"
          :class="{'sink-down': isToggling}"
          class="flex items-center justify-center
                px-5 py-1 rounded-full
                bg-transparent text-black
                transition-all duration-150"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
          </svg>
        </button>
      </transition>
    </div>

    <!-- Main Section-->
    <main class="max-w-2xl mx-auto px-6 py-16 relative">
      <!-- Header Section-->
      <header class="flex flex-col items-center text-center">
        
        <div class="relative group">
          <div class="absolute -inset-1 bg-gradient-to-r from-neutral-200 to-neutral-300 rounded-full opacity-50 blur group-hover:opacity-75 transition duration-500"></div>
          <img
            src="/images/kotobi.png"
            alt="Vivian Quek"
            class="relative w-32 h-32 rounded-full object-cover shadow-sm ring-4 ring-white"
          />
        </div>

        <h1 class="mt-6 text-3xl font-semibold tracking-wide text-neutral-900">
          Vivian Quek Jia Yi
        </h1>
        <p class="mt-2 text-neutral-500 font-medium">
          Software Engineer
        </p>

        <div class="mt-8 max-w-lg space-y-4 text-neutral-600 leading-relaxed text-center">
          <p>
            Hi! I am a full-stack web developer with a little over a year of experience, from building simple websites to complete retail systems. I enjoy learning new things and exploring how technology can make life more enjoyable.
          </p>
        </div>

        <!-- Resume Button Section -->
        <button 
          @click="handleDownload"
          class="mt-8 px-8 py-3 bg-neutral-900 text-white text-sm rounded-full shadow-lg hover:bg-neutral-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
        >
          <span>Download Resume</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>

        <!-- Link Section -->
        <div class="mt-10 flex justify-center gap-8 text-sm font-medium text-neutral-500">
          <a 
            v-for="link in socialLinks" 
            :key="link.name"
            :href="link.url" 
            target="_blank"
            class="group flex items-center gap-2 hover:text-neutral-900 transition-colors"
          >
            <span v-html="link.icon" class="icon-container"></span>
            <span class="underline-offset-4 group-hover:underline">{{ link.name }}</span>
          </a>
        </div>
      </header>

      <hr class="my-8 border-neutral-300" />

      <!-- Skills Section -->
      <section>
        <h2 class="text-lg font-semibold text-neutral-800 mb-6 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" 
              class="w-4 h-4 text-neutral-400 mt-0.5" 
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Skills
        </h2>
              
        <!-- Skills by Category (Expanded View) -->
        <div v-if="skillsExpanded" class="space-y-6">
          <div v-for="category in skills" :key="category.category" class="space-y-3">
            <h3 class="text-sm font-medium text-neutral-500">{{ category.category }}</h3>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="skill in category.items" 
                :key="skill"
                class="px-4 py-2 cursor-pointer bg-white border border-neutral-100 rounded-xl text-sm text-neutral-600 shadow-sm hover:border-neutral-300 transition-colors"
              >
                {{ skill }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Skills (Collapsed View) -->
        <div v-else class="flex flex-wrap gap-3 justify-center">
          <span 
            v-for="skill in visibleSkills" 
            :key="skill"
            class="px-4 py-2 cursor-pointer bg-white border border-neutral-100 rounded-xl text-sm text-neutral-600 shadow-sm hover:border-neutral-300 transition-colors"
          >
            {{ skill }}
          </span>
          <span v-if="!skillsExpanded" class="text-sm text-neutral-400 px-4 py-2">
            +{{ skills.flatMap(c => c.items).length - initialVisibleSkills }} more
          </span>
        </div>
        
        <!-- Expand/Collapse Button -->
        <button 
          @click="skillsExpanded = !skillsExpanded"
          class="mt-6 flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors group"
        >
          <span>{{ skillsExpanded ? 'Show less' : 'Show all skills' }}</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4 transition-transform duration-300 group-hover:scale-110" 
            :class="{ 'rotate-180': skillsExpanded }"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </section>

      <!-- Projects Section -->
      <section class="mt-16">
        <h2 class="text-lg font-semibold text-neutral-800 mb-6 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" 
              class="w-4 h-4 text-neutral-400 mt-0.5" 
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          Projects
        </h2>

        <div class="grid gap-6 sm:gap-8">
          <div 
            v-for="project in projects" 
            :key="project.title" 
            class="group relative p-6 sm:p-8 overflow-hidden">

            <!-- Border and shadow effect -->
            <div class="absolute inset-0 border-2 border-neutral-200/80 rounded-2xl 
                        group-hover:border-neutral-300 transition-all duration-500
                        before:absolute before:inset-0 before:border before:border-neutral-300/30 
                        before:rounded-2xl before:pointer-events-none before:-m-1"></div>
            
            <!-- Decorative corner accents -->
            <div class="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-rose-400/60 
                        rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div class="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-indigo-400/60 
                        rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <!-- Content container -->
            <div class="relative z-10">
              <!-- Title and description -->
              <div class="flex justify-between items-start gap-4 mb-4">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <!-- Decorative circle -->
                    <div class="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-rose-400 to-indigo-400 
                                group-hover:from-rose-500 group-hover:to-indigo-500
                                transition-colors duration-300 flex-shrink-0"></div>
                    <h3 class="font-medium text-neutral-900 group-hover:text-neutral-800 
                              transition-colors duration-300 truncate text-base tracking-tight">
                      {{ project.title }}
                    </h3>
                  </div>
                  
                  <!-- Description with visible text -->
                  <p class="text-sm text-neutral-700 leading-relaxed mt-3 pl-5 
                          border-l border-neutral-300/50 group-hover:border-neutral-400/60 
                          transition-colors duration-300">
                    {{ project.desc }}
                  </p>
                </div>
                
                <!-- Link -->
                <a :href="project.link" target="_blank" rel="noopener noreferrer" 
                  class="text-neutral-500 hover:text-rose-600 transition-all duration-300 
                          flex-shrink-0 mt-1 p-2 hover:bg-rose-50/50 rounded-lg group/link">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" 
                      viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" 
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
              
              <!-- Tags -->
              <div class="mt-6 pt-5 border-t border-neutral-300/40 group-hover:border-neutral-400/50 transition-colors duration-300 pl-5">
                <div class="flex flex-wrap gap-2">
                  <span v-for="tag in project.tags" :key="tag" 
                        class="text-xs font-medium text-sky-700/80 
                              bg-sky-50/60 px-3 py-1.5 rounded-full cursor-pointer
                              border border-sky-200/50
                              group-hover:border-sky-300/70
                              transition-all duration-300
                              hover:bg-sky-100/80 hover:text-sky-800
                              hover:scale-105 hover:shadow-sm hover:shadow-sky-200/30">
                    #{{ tag }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Subtle background effect on hover -->
            <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/0 via-rose-50/0 to-indigo-50/0 
                        group-hover:via-rose-50/30 group-hover:to-indigo-50/20 
                        transition-all duration-700 pointer-events-none"></div>
          </div>
        </div>
      </section>

      <!-- Work Experience Section -->
      <section class="mt-16">
        <h2 class="text-lg font-semibold text-neutral-800 mb-6 flex items-center gap-2">
          <span class="text-neutral-400 flex items-center justify-center h-5 w-5 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </span>
          Work Experience
        </h2>

        <div class="relative border-l border-neutral-200 ml-3 space-y-10">
          <div v-for="(exp, index) in workExperiences" :key="index" class="ml-8 relative">
            <span class="absolute -left-[39px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-400 ring-4 ring-neutral-50"></span>            
            <span class="text-xs font-semibold tracking-wide text-neutral-400 uppercase">{{ exp.year }}</span>
            <h3 class="mt-1 text-base font-medium text-neutral-800">{{ exp.role }}</h3>
            <span class="text-sm text-neutral-500">{{ exp.company }}</span>
            
            <div class="mt-2">
              <div class="text-sm text-neutral-600">
                <p v-if="!experiencesStates[index]" class="leading-relaxed mb-2">
                  {{ exp.desc }}
                </p>
                
                <ul v-if="experiencesStates[index]" class="space-y-1.5 list-disc pl-4">
                  <li v-for="(point, pointIndex) in exp.points" :key="pointIndex" class="leading-relaxed">
                    {{ point }}
                  </li>
                </ul>
                
                <button 
                  @click="toggleExperiencePoints(index)"
                  class="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                >
                  <span>{{ experiencesStates[index] ? 'Show Less' : 'Show More' }}</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    class="h-3 w-3 transition-transform duration-300" 
                    :class="{ 'rotate-180': experiencesStates[index] }"
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Education Section -->
      <section class="mt-16">
        <h2 class="text-lg font-semibold text-neutral-800 mb-6 flex items-center gap-2">
          <span class="text-neutral-400 flex items-center justify-center mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </span>
          Education
        </h2>
        
        <div class="relative border-l border-neutral-200 ml-3 space-y-10">
          <div v-for="(edu, index) in education" :key="index" class="ml-8 relative">
            <span class="absolute -left-[39px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-400 ring-4 ring-neutral-50"></span>
            
            <span class="text-xs font-semibold tracking-wide text-neutral-400 uppercase">{{ edu.year }}</span>
            <h3 class="mt-1 text-base font-medium text-neutral-800">{{ edu.role }}</h3>
            <span class="text-sm text-neutral-500">{{ edu.company }}</span>
            
            <p v-if="edu.desc" class="mt-2 text-sm text-neutral-600 leading-relaxed max-w-md">
              {{ edu.desc }}
            </p>
          </div>
        </div>
      </section>

      <!-- Contribution Partner Section -->
      <section class="mt-16 overflow-hidden">
        <h2 class="text-center text-base font-semibold tracking-wide text-black-800 mb-6">
          Companies & Brands I've Worked With
        </h2>
        
        <div class="slider relative w-full overflow-hidden">
          <div class="slide-track flex gap-12">
            <div v-for="(partner, i) in partners" :key="`a-${i}`" class="cursor-pointer flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity flex items-center">
              <img :src="partner.logo" class="h-12 w-32 object-contain hover:scale-105 transition-all duration-300" :alt="partner.name" />
            </div>
            <div v-for="(partner, i) in partners" :key="`b-${i}`" class="cursor-pointer flex-shrink-0 opacity-80 hover:opacity-100 transition-opacity flex items-center">
              <img :src="partner.logo" class="h-12 w-32 object-contain hover:scale-105 transition-all duration-300" :alt="partner.name" />
            </div>
          </div>
          <div class="absolute top-0 left-0 w-12 h-full bg-gradient-to-r from-black-50 to-transparent"></div>
          <div class="absolute top-0 right-0 w-12 h-full bg-gradient-to-l from-black-50 to-transparent"></div>
        </div>
        
        <!-- Confidentiality Note -->
        <p class="mt-4 text-center text-xs text-black-400 italic max-w-md mx-auto">
          * Please note that due to confidentiality agreements, specific implementation details cannot be disclosed.
        </p>
      </section>

      <!-- Footer Section -->
      <footer class="mt-8 text-center border-t border-neutral-300 pt-6">
        <p class="text-xs text-black-300">
          © Vispiv Collectives / Kotobi Corner 2026
        </p>
        <p class="text-xs text-black-300 mt-1">
          Crafted with Vue & Nuxt JS <span class="text-red-300">♥</span>
        </p>
      </footer>

      <!-- Scroll to Top -->
      <transition name="fade">
        <button
          v-if="showScrollTop"
          @click="scrollToTop"
          aria-label="Scroll to top"
          class="fixed bottom-8 right-8 z-40
                w-10 h-10
                bg-neutral-900 text-neutral-50
                border-2 border-neutral-700
                shadow-[3px_3px_0_0_rgba(0,0,0,0.6)]
                hover:translate-x-0.5 hover:translate-y-0.5
                hover:shadow-[1.5px_1.5px_0_0_rgba(0,0,0,0.6)]
                active:translate-x-1 active:translate-y-1
                active:shadow-none
                transition-all duration-150"
        >
          <!-- Pixel Arrow Up -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="mx-auto w-4 h-4"
            shape-rendering="crispEdges"
            fill="currentColor"
          >
            <path d="
              M11 4h2v2h2v2h2v2h-4v6h-2v-6H7V8h2V6h2V4z
            " />
          </svg>
        </button>
      </transition>

      <!-- Music Player Section -->
      <transition name="music-player">
        <div 
          v-if="musicPlayerExpanded"
          class="fixed bottom-0 left-0 z-50 w-full bg-neutral-900 border-t border-neutral-800 shadow-[0_-2px_10px_rgba(0,0,0,0.3)] text-white px-3 py-2"
        >
          <audio ref="audioRef" :src="currentTrack.src" preload="metadata" @timeupdate="onTimeUpdate" @loadedmetadata="onLoadedMetadata" @ended="nextTrack"></audio>

          <!-- Single Row Layout -->
          <div class="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <!-- Track Info -->
            <div class="flex items-center gap-2 min-w-0 flex-1 md:flex-none">
              <div class="relative w-10 h-10 bg-neutral-800 rounded-md overflow-hidden flex-shrink-0">
                <div v-if="albumArts[currentTrack.src]" 
                    class="absolute inset-0">
                  <img :src="albumArts[currentTrack.src]" 
                      alt="Album Art"
                      class="w-full h-full object-cover">
                </div>
                <div v-else 
                    :class="[currentTrack.color]" 
                    class="absolute inset-0 opacity-80 bg-gradient-to-br">
                </div>
                
                <div v-if="!albumArts[currentTrack.src]" class="absolute inset-0 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                  </svg>
                </div>
              </div>
              
              <div class="flex flex-col overflow-hidden min-w-0">
                <span class="text-xs font-semibold truncate">{{ currentTrack.title }}</span>
                <span class="text-[10px] text-neutral-400 truncate">{{ currentTrack.artist }}</span>
              </div>
            </div>

            <!-- Controls -->
            <div class="flex flex-col items-center mx-1 sm:mx-2 md:flex-1 md:max-w-md">
              <div class="flex items-center gap-3 mb-0.5">
                <button @click="prevTrack" class="text-neutral-400 hover:text-white transition-colors flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                  </svg>
                </button>

                <button @click="toggleMusic" class="text-white hover:text-neutral-300 transition-colors flex-shrink-0">
                  <svg v-if="isPlaying" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                  </svg>
                </button>
                
                <button @click="nextTrack" class="text-neutral-400 hover:text-white transition-colors flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                  </svg>
                </button>
              </div>

              <!-- Progress Bar -->
              <div class="w-full flex items-center gap-2 text-[10px] font-mono text-neutral-400 hidden xs:flex">
                <span class="flex-shrink-0">{{ formatTime(currentTime) }}</span>
                <div @click="seek" class="relative flex-1 h-0.5 bg-neutral-600 rounded-full cursor-pointer group min-w-[50px]">
                  <div :style="{ width: (currentTime / duration * 100) + '%' }" class="absolute left-0 top-0 h-full bg-white rounded-full group-hover:bg-green-500"></div>
                </div>
                <span class="flex-shrink-0">{{ formatTime(duration) }}</span>
              </div>
            </div>

            <!-- Hide Button -->
            <button 
              @click="toggleMusicPlayer"
              :class="{'sink-down': isToggling}"
              class="text-neutral-400 hover:text-white transition-colors flex-shrink-0 ml-1"
              aria-label="Hide player"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 13l5 5 5-5M7 6l5 5 5-5" />
              </svg>
            </button>
          </div>

          <!-- Fallback Progress Bar -->
          <div class="mt-1 xs:hidden">
            <div @click="seek" class="relative w-full h-0.5 bg-neutral-600 rounded-full cursor-pointer group">
              <div :style="{ width: (currentTime / duration * 100) + '%' }" class="absolute left-0 top-0 h-full bg-white rounded-full group-hover:bg-green-500"></div>
            </div>
            <div class="flex justify-between text-[8px] text-neutral-400 mt-0.5">
              <span>{{ formatTime(currentTime) }}</span>
              <span>{{ formatTime(duration) }}</span>
            </div>
          </div>
        </div>
      </transition>
    </main>
  </div>
</template>