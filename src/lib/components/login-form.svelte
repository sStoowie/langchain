<script>
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';

  import {
    IconEye,
    IconEyeOff,
    IconBrandGoogleFilled,
    IconBrandLinkedinFilled,
    IconBrandGithub
  } from '@tabler/icons-svelte';
  
  let email = $state('');
  let password = $state('');
  let showPassword = $state(false);

  function handleSubmit(event) {
    event.preventDefault();
    console.log('Login attempt:', { email, password });
  }

  function handleSocialLogin(provider) {
    console.log(`${provider} login clicked`);
  }

  function handleForgotPassword() {
    console.log('Forgot password clicked');
  }
</script>

<div class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-900">
  <div class="w-full max-w-md space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-3xl font-bold text-white mb-2">Welcome back</h2>
      <p class="text-gray-400">Sign in to your account</p>
    </div>

    <!-- Login form -->
    <form onsubmit={handleSubmit} class="space-y-4">
      <div class="space-y-2">
        <Label for="email" class="text-gray-300">Email</Label>
        <Input
          id="email"
          type="email"
          bind:value={email}
          placeholder="Enter your email"
          class="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500"
          required
        />
      </div>

      <div class="space-y-2">
        <Label for="password" class="text-gray-300">Password</Label>
        <div class="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            bind:value={password}
            placeholder="Enter your password"
            class="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500 pr-10"
            required
          />
          <button
            type="button"
            onclick={() => showPassword = !showPassword}
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {#if showPassword}
              <IconEye/>
            {:else}
              <IconEyeOff/>
            {/if}
          </button>
        </div>
      </div>

      <div class="text-right">
        <button 
          type="button"
          onclick={handleForgotPassword}
          class="text-sm text-purple-400 hover:text-purple-300 underline"
        >
          Forgot password?
        </button>
      </div>

      <Button 
        type="submit" 
        class="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
      >
        Sign in
      </Button>
    </form>

    <!-- Divider -->
    <div class="relative">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-700"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="px-2 bg-gray-900 text-gray-400">Or sign in with</span>
      </div>
    </div>

    <!-- Social Login Buttons -->
    <div class="grid grid-cols-3 gap-3">
      <Button
        variant="outline"
        onclick={() => handleSocialLogin('Google')}
        class="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
      >
        <IconBrandGoogleFilled/>
      </Button>
      
      <Button
        variant="outline"
        onclick={() => handleSocialLogin('GitHub')}
        class="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
      >
        <IconBrandGithub/>
      </Button>
      
      <Button
        variant="outline"
        onclick={() => handleSocialLogin('LinkedIn')}
        class="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
      >
        <IconBrandLinkedinFilled/>
      </Button>
    </div>
  </div>
</div>
