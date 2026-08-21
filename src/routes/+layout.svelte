<script lang="ts">
  import './layout.css';
  import favicon from '#lib/assets/favicon.svg';
  import { authClient } from '$auth/client';
  
  let { children } = $props();
  
  const session = authClient.useSession();
  
  async function handleLogout() {
    await authClient.signOut();
    window.location.reload();
  }
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>FuelFind</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 font-sans text-gray-900">
  <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
    <div class="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2">
        <div class="bg-blue-600 text-white p-1.5 rounded-lg">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <span class="text-xl font-bold tracking-tight">FuelFind</span>
      </a>
      
      <nav class="flex items-center gap-4 text-sm font-medium">
        {#if $session.isPending}
          <div class="w-20 h-4 bg-gray-200 animate-pulse rounded"></div>
        {:else if $session.data?.user}
          <span class="text-gray-600 hidden sm:inline">{$session.data.user.email}</span>
          <button onclick={handleLogout} class="text-gray-500 hover:text-gray-900">Log out</button>
        {:else}
          <a href="/login" class="text-gray-600 hover:text-gray-900">Log in</a>
          <a href="/signup" class="bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors">Sign up</a>
        {/if}
      </nav>
    </div>
  </header>
  
  <main>
    {@render children()}
  </main>
</div>
