<script lang="ts">
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

  // state
  let email: string = '';
  let password: string = '';
  let showPassword: boolean = false;
  let emailError: string = '';
  let passwordError: string = '';

  // regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // validate helpers
  function validateEmail(value: string): string {
    return emailRegex.test(value) ? '' : 'กรุณากรอกอีเมลให้ถูกต้อง';
  }

  function validatePassword(value: string): string {
    return passwordRegex.test(value)
      ? ''
      : 'รหัสผ่านต้อง ≥ 8 ตัว มีตัวพิมพ์เล็ก/ใหญ่ ตัวเลข และอักขระพิเศษ';
  }

  function handleSubmit(event: Event) {
    event.preventDefault();
    emailError = validateEmail(email);
    passwordError = validatePassword(password);

    if (!emailError && !passwordError) {
      console.log('Login attempt:', { email, password });
    }
  }

  function handleSocialLogin(provider: string) {
    console.log(`${provider} login clicked`);
  }

  $: isFormValid = email && password && !emailError && !passwordError;
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
      <!-- Email -->
      <div class="space-y-2">
        <Label for="email" class="text-gray-300">Email</Label>
        <Input
          id="email"
          type="email"
          bind:value={email}
          placeholder="Enter your email"
          class="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500"
          required
          onblur={() => (emailError = validateEmail(email))}
        />
        {#if emailError}
          <p class="text-red-400 text-sm" role="alert">{emailError}</p>
        {/if}
      </div>

      <!-- Password -->
      <div class="space-y-2">
        <Label for="password" class="text-gray-300">Password</Label>
        <div class="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            bind:value={password}
            placeholder="Enter your password"
            class="bg-gray-800 border-gray-700 text-white placeholder-gray-500 pr-10"
            required
            onblur={() => (passwordError = validatePassword(password))}
          />
          <button
            type="button"
            onclick={() => (showPassword = !showPassword)}
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {#if showPassword}
              <IconEye />
            {:else}
              <IconEyeOff />
            {/if}
          </button>
        </div>
        {#if passwordError}
          <p class="text-red-400 text-sm" role="alert">{passwordError}</p>
        {/if}
      </div>

      <!-- Forgot password -->
      <div class="text-right">
        <button
          type="button"
          class="text-sm text-purple-400 hover:text-purple-300 underline"
        >
          Forgot password?
        </button>
      </div>

      <!-- Submit -->
      <Button
        type="submit"
        class="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
        disabled={!isFormValid}
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
        aria-label="Sign in with Google"
      >
        <IconBrandGoogleFilled />
      </Button>
      
      <Button
        variant="outline"
        onclick={() => handleSocialLogin('GitHub')}
        class="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
        aria-label="Sign in with GitHub"
      >
        <IconBrandGithub />
      </Button>
      
      <Button
        variant="outline"
        onclick={() => handleSocialLogin('LinkedIn')}
        class="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
        aria-label="Sign in with LinkedIn"
      >
        <IconBrandLinkedinFilled />
      </Button>
    </div>
  </div>
</div>
