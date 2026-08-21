<script lang="ts">
  import '../layout.css';
  import favicon from '#lib/assets/favicon.svg';
  import { authClient } from 'omni-svelte/auth/client';
  import { page } from '$app/state';
  import { ModeWatcher } from 'mode-watcher';
  import { Button } from '#lib/components/ui/button';
  
  let { children } = $props();
  const session = authClient.useSession();
  
  async function handleLogout() {
    await authClient.signOut({ fetchOptions: { onSuccess: () => window.location.href = '/' }});
  }
</script>

<svelte:head>
  <link rel="icon" type="image/svg+xml" href={favicon} />
</svelte:head>

<ModeWatcher />

<div class="min-h-screen bg-background text-foreground flex flex-col font-sans">
  <header class="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm">
    <div class="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2 group">
        <div class="bg-primary text-primary-foreground p-2 rounded-lg group-hover:bg-primary/90 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </div>
        <span class="text-xl font-bold tracking-tight">FuelFind</span>
      </a>
      
      <nav class="flex items-center gap-3">
        {#if $session.isPending}
          <div class="h-9 w-20 bg-muted animate-pulse rounded-md"></div>
        {:else if $session.data?.user}
          <div class="hidden sm:block text-sm text-muted-foreground mr-2">
            {$session.data.user.name || $session.data.user.email}
          </div>
          <Button variant="outline" size="sm" onclick={handleLogout}>Log Out</Button>
        {:else}
          {#if page.url.pathname !== '/login'}
            <Button variant="ghost" size="sm" href="/login">Log In</Button>
          {/if}
          {#if page.url.pathname !== '/signup'}
            <Button size="sm" href="/signup">Sign Up</Button>
          {/if}
        {/if}
      </nav>
    </div>
  </header>

  <main class="flex-1 w-full">
    {@render children()}
  </main>
</div>
