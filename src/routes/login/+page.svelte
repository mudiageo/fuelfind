<script lang="ts">
  import { signIn } from '$auth/client';
  import { goto } from '$app/navigation';
  
  let email = $state('');
  let password = $state('');
  let errorMsg = $state('');
  let loading = $state(false);

  async function handleLogin(e: Event) {
    e.preventDefault();
    loading = true;
    errorMsg = '';
    
    try {
      const { error } = await signIn.email({ email, password });
      if (error) {
        errorMsg = error.message || 'Login failed';
      } else {
        goto('/');
      }
    } catch (err: any) {
      errorMsg = err.message || 'An unexpected error occurred';
    } finally {
      loading = false;
    }
  }
</script>

<div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border border-gray-100">
  <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">Log In to FuelFind</h1>
  
  {#if errorMsg}
    <div class="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-100">{errorMsg}</div>
  {/if}
  
  <form onsubmit={handleLogin} class="space-y-4">
    <div>
      <label class="block mb-1 text-sm font-medium text-gray-700" for="email">Email</label>
      <input type="email" id="email" bind:value={email} class="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" required />
    </div>
    
    <div>
      <label class="block mb-1 text-sm font-medium text-gray-700" for="password">Password</label>
      <input type="password" id="password" bind:value={password} class="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" required />
    </div>
    
    <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium p-2.5 rounded-md transition-colors mt-2" disabled={loading}>
      {loading ? 'Logging in...' : 'Log In'}
    </button>
  </form>
  
  <p class="mt-6 text-sm text-center text-gray-600">
    Don't have an account? <a href="/signup" class="text-blue-600 hover:underline font-medium">Sign up</a>
  </p>
</div>
