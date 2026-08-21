<script lang="ts">
  import '../layout.css';
  import favicon from '#lib/assets/favicon.svg';
  import { authClient } from '$auth/client';
  import { page } from '$app/state';
  import { ModeWatcher } from 'mode-watcher';
  import { Button } from '#lib/components/ui/button';
  import { MapPin, LogIn, LogOut, UserPlus, Home } from '@lucide/svelte';
  
  let { children } = $props();
  const session = authClient.useSession();
  
  async function handleLogout() {
    await authClient.signOut({ fetchOptions: { onSuccess: () => window.location.href = '/' }});
  }

  let isAuthRoute = $derived(page.url.pathname === '/login' || page.url.pathname === '/signup');
</script>

<svelte:head>
  <link rel="icon" type="image/svg+xml" href={favicon} />
</svelte:head>

<ModeWatcher />

<div class="min-h-screen bg-background text-foreground flex flex-col md:flex-row font-sans">
  
  <!-- DESKTOP SIDEBAR -->
  <aside class="hidden md:flex flex-col w-64 border-r border-border bg-card/50 backdrop-blur-sm fixed top-0 bottom-0 left-0">
    <div class="p-6">
      <a href="/" class="flex items-center gap-2 group mb-8">
        <div class="bg-primary text-primary-foreground p-2 rounded-lg group-hover:bg-primary/90 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </div>
        <span class="text-xl font-bold tracking-tight">FuelFind</span>
      </a>

      <nav class="space-y-2">
        <Button 
          variant={page.url.pathname === '/' ? "secondary" : "ghost"} 
          class="w-full justify-start gap-2" 
          href="/"
        >
          <Home class="w-4 h-4" />
          Stations
        </Button>
      </nav>
    </div>

    <div class="mt-auto p-6 border-t border-border">
      {#if $session.isPending}
        <div class="h-10 w-full bg-muted animate-pulse rounded-md"></div>
      {:else if $session.data?.user}
        <div class="mb-3 px-2 text-sm font-medium text-muted-foreground truncate">
          {$session.data.user.name || $session.data.user.email}
        </div>
        <Button variant="outline" class="w-full justify-start gap-2" onclick={handleLogout}>
          <LogOut class="w-4 h-4" />
          Log Out
        </Button>
      {:else}
        <div class="space-y-2">
          <Button variant="outline" class="w-full justify-start gap-2" href="/login">
            <LogIn class="w-4 h-4" />
            Log In
          </Button>
          <Button class="w-full justify-start gap-2" href="/signup">
            <UserPlus class="w-4 h-4" />
            Sign Up
          </Button>
        </div>
      {/if}
    </div>
  </aside>

  <!-- MOBILE HEADER (Top) -->
  <header class="md:hidden sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-sm">
    <div class="px-4 h-14 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2 group">
        <div class="bg-primary text-primary-foreground p-1.5 rounded-md group-hover:bg-primary/90 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
        </div>
        <span class="text-lg font-bold tracking-tight">FuelFind</span>
      </a>
      {#if $session.data?.user}
        <div class="text-xs font-medium text-muted-foreground truncate max-w-[120px]">
          {$session.data.user.name || $session.data.user.email}
        </div>
      {/if}
    </div>
  </header>

  <!-- MAIN CONTENT -->
  <main class="flex-1 w-full md:pl-64 pb-20 md:pb-0">
    <div class="max-w-4xl mx-auto w-full">
      {@render children()}
    </div>
  </main>

  <!-- MOBILE BOTTOM DOCK -->
  <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border z-20 pb-safe">
    <div class="flex items-center justify-around h-16 px-2">
      <Button 
        variant={page.url.pathname === '/' ? "secondary" : "ghost"} 
        size="icon"
        class="w-14 h-14 rounded-full flex flex-col gap-1 items-center justify-center text-xs" 
        href="/"
      >
        <Home class="w-5 h-5" />
      </Button>

      {#if $session.isPending}
        <div class="w-14 h-14 bg-muted animate-pulse rounded-full"></div>
      {:else if $session.data?.user}
        <Button 
          variant="ghost" 
          size="icon"
          class="w-14 h-14 rounded-full flex flex-col gap-1 items-center justify-center text-xs text-muted-foreground hover:text-destructive" 
          onclick={handleLogout}
        >
          <LogOut class="w-5 h-5" />
        </Button>
      {:else}
        <Button 
          variant={page.url.pathname === '/login' ? "secondary" : "ghost"} 
          size="icon"
          class="w-14 h-14 rounded-full flex flex-col gap-1 items-center justify-center text-xs" 
          href="/login"
        >
          <LogIn class="w-5 h-5" />
        </Button>
      {/if}
    </div>
  </nav>

</div>
