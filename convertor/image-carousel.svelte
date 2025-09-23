<script>
  let currentSlide = $state(0);
  let carouselInterval = $state(null);
  import carouselImage from '$lib/assets/placeholder.svg';
  const slides = [
    {
      image: carouselImage,
      title: "Capturing Moments,",
      subtitle: "Creating Memories"
    },
    {
      image: carouselImage,
      title: "Discover Beauty,",
      subtitle: "Share Your Story"
    },
    {
      image: carouselImage,
      title: "Explore Nature,",
      subtitle: "Find Your Path"
    }
  ];

  function startCarousel() {
    carouselInterval = setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
    }, 5000);
  }

  function stopCarousel() {
    if (carouselInterval) {
      clearInterval(carouselInterval);
      carouselInterval = null;
    }
  }

  function goToSlide(index) {
    currentSlide = index;
    stopCarousel();
    startCarousel();
  }

  // Start carousel when component mounts
  $effect(() => {
    startCarousel();
    return () => stopCarousel();
  });
</script>

<div class="hidden lg:flex lg:w-1/2 relative overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
    {#each slides as slide, index}
      <img 
        src={slide.image || "/placeholder.svg"}
        alt="Slide {index + 1}" 
        class="w-full h-full object-cover opacity-60 absolute inset-0 transition-opacity duration-1000 {currentSlide === index ? 'opacity-60' : 'opacity-0'}"
      />
    {/each}
  </div>
  
  <!-- Logo -->
  <div class="absolute top-8 left-8 z-10">
    <div class="text-white text-2xl font-bold tracking-wider">WEBSITE</div>
  </div>
  
  <!-- Back to website button -->
  <div class="absolute top-8 right-8 z-10">
    <button class="px-4 py-2 text-white border border-white/30 rounded-md hover:bg-white/10 transition-colors flex items-center gap-2">
      Back to website
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
  
  <!-- Content -->
  <div class="absolute bottom-16 left-8 right-8 z-10">
    <h1 class="text-white text-4xl font-bold mb-4 leading-tight transition-all duration-500">
      {slides[currentSlide].title}<br />
      {slides[currentSlide].subtitle}
    </h1>
    
    <!-- Interactive pagination dots -->
    <div class="flex space-x-2 mt-8">
      {#each slides as _, index}
        <button
          onclick={() => goToSlide(index)}
          class="w-8 h-1 rounded transition-all duration-300 {currentSlide === index ? 'bg-white' : 'bg-white/40 hover:bg-white/60'}"
          aria-label={`Go to slide ${index + 1}`}
        ></button>
      {/each}
    </div>
  </div>
</div>
