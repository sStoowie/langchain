
<script>
  import ImageCarousel from '$lib/components/image-carousel.svelte';
  import LoginForm from '$lib/components/login-form.svelte';
</script>

<!-- Updated layout to use flexbox for two-column design -->
<main class="min-h-screen flex">
  <ImageCarousel />
  <LoginForm />
</main>