<script lang="ts">
  import './layout.css';
  import favicon from '#lib/assets/favicon.svg';
  import { authClient } from '$auth/client';
  import { page } from '$app/state';
  import { preloadData, goto } from '$app/navigation';
  import { ModeWatcher } from 'mode-watcher';
  import { Button } from '#lib/components/ui/button';
  import { MapPin, LogIn, LogOut, UserPlus, Home } from '@lucide/svelte';

  import * as Dialog from '#lib/components/ui/dialog';
  import LoginForm from '#lib/components/LoginForm.svelte';
  import SignupForm from '#lib/components/SignupForm.svelte';
  
  let { children } = $props();
  const session = authClient.useSession();
  
  async function handleLogout() {
    await authClient.signOut({ fetchOptions: { onSuccess: () => window.location.href = '/' }});
  }

  async function openModal(e: MouseEvent, stateKey: string) {
    if (e.metaKey || e.ctrlKey) return;
    const href = e.currentTarget.href;
    if (!href) return;
    e.preventDefault();
    const result = await preloadData(href);
    if (result.type === 'loaded' && result.status === 200) {
      goto(href, { shallow: true, state: { [stateKey]: true } });
    } else {
      window.location.href = href;
    }
  }

  let isAuthRoute = $derived(page.url.pathname === '/login' || page.url.pathname === '/signup');
</script>

<svelte:head>
  <link rel="icon" type="image/svg+xml" href={favicon} />
</svelte:head>

<ModeWatcher />

{#if page.state.showLogin}
  <Dialog.Root open={true} onOpenChange={(open) => { if (!open) history.back(); }}>
    <Dialog.Content class="sm:max-w-[425px]">
      <LoginForm onSuccess={() => history.back()} />
    </Dialog.Content>
  </Dialog.Root>
{/if}

{#if page.state.showSignup}
  <Dialog.Root open={true} onOpenChange={(open) => { if (!open) history.back(); }}>
    <Dialog.Content class="sm:max-w-[425px]">
      <SignupForm onSuccess={() => history.back()} />
    </Dialog.Content>
  </Dialog.Root>
{/if}

<div class="min-h-screen bg-background text-foreground flex font-sans overflow-hidden">
  
  <!-- DESKTOP SIDEBAR -->
  <aside class="hidden md:flex flex-col w-64 border-r border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-screen sticky top-0 z-20">
    <div class="p-6 flex items-center gap-3 border-b border-border/50">
      <div class="bg-primary text-primary-foreground p-2 rounded-lg shadow-sm">
        <MapPin class="w-5 h-5" />
      </div>
      <span class="text-xl font-bold tracking-tight">FuelFind</span>
    </div>
    
    <nav class="flex-1 p-4 space-y-1.5 overflow-y-auto">
      <Button variant={page.url.pathname === '/' ? "secondary" : "ghost"} class="w-full justify-start gap-3" href="/">
        <Home class="w-5 h-5" />
        <span class="font-medium">Home</span>
      </Button>
    </nav>

    <div class="p-4 border-t border-border/50 bg-muted/20">
      {#if $session.isPending}
        <div class="h-10 w-full bg-muted animate-pulse rounded-md"></div>
      {:else if $session.data?.user}
        <div class="mb-4 px-2">
          <p class="text-sm font-semibold truncate">{$session.data.user.name || 'User'}</p>
          <p class="text-xs text-muted-foreground truncate">{$session.data.user.email}</p>
        </div>
        <Button variant="outline" class="w-full justify-start gap-3 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors" onclick={handleLogout}>
          <LogOut class="w-4 h-4" />
          <span class="font-medium">Log Out</span>
        </Button>
      {:else}
        <div class="space-y-2">
          <Button variant="default" class="w-full justify-start gap-3 shadow-sm" href="/login" onclick={(e) => openModal(e, 'showLogin')}>
            <LogIn class="w-4 h-4" />
            <span class="font-medium">Log In</span>
          </Button>
          <Button variant="outline" class="w-full justify-start gap-3" href="/signup" onclick={(e) => openModal(e, 'showSignup')}>
            <UserPlus class="w-4 h-4" />
            <span class="font-medium">Sign Up</span>
          </Button>
        </div>
      {/if}
    </div>
  </aside>

  <!-- MOBILE HEADER (Top) -->
  <header class="md:hidden fixed top-0 left-0 right-0 z-30 bg-background/90 backdrop-blur border-b border-border">
    <div class="px-4 h-14 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2 group">
        <div class="bg-primary text-primary-foreground p-1.5 rounded-md shadow-sm">
          <MapPin class="w-4 h-4" />
        </div>
        <span class="text-lg font-bold tracking-tight">FuelFind</span>
      </a>
      {#if $session.data?.user}
        <div class="text-xs font-medium text-muted-foreground truncate bg-muted/50 px-2 py-1 rounded-full">
          {$session.data.user.name || 'User'}
        </div>
      {/if}
    </div>
  </header>

  <!-- MAIN CONTENT -->
  <main class="flex-1 w-full h-screen overflow-y-auto pt-14 md:pt-0 pb-20 md:pb-0 relative scroll-smooth">
    <div class="max-w-4xl mx-auto w-full p-4 md:p-6 lg:p-8 animate-in fade-in duration-500">
      {@render children()}
    </div>
  </main>

  <!-- MOBILE BOTTOM DOCK -->
  <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border z-40 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
    <div class="flex items-center justify-around h-16 px-2">
      <a href="/" class="flex flex-col items-center justify-center w-16 h-full gap-1 {page.url.pathname === '/' ? 'text-primary' : 'text-muted-foreground hover:text-foreground transition-colors'}">
        <Home class="w-5 h-5" />
        <span class="text-[10px] font-medium">Home</span>
      </a>

      {#if $session.isPending}
        <div class="w-16 h-full flex flex-col items-center justify-center gap-1 opacity-50">
          <div class="w-5 h-5 bg-muted animate-pulse rounded-full"></div>
          <div class="w-8 h-2 bg-muted animate-pulse rounded"></div>
        </div>
      {:else if $session.data?.user}
        <button onclick={handleLogout} class="flex flex-col items-center justify-center w-16 h-full gap-1 text-muted-foreground hover:text-destructive transition-colors">
          <LogOut class="w-5 h-5" />
          <span class="text-[10px] font-medium">Log Out</span>
        </button>
      {:else}
        <a href="/login" onclick={(e) => openModal(e, 'showLogin')} class="flex flex-col items-center justify-center w-16 h-full gap-1 {page.url.pathname === '/login' ? 'text-primary' : 'text-muted-foreground hover:text-foreground transition-colors'}">
          <LogIn class="w-5 h-5" />
          <span class="text-[10px] font-medium">Log In</span>
        </a>
      {/if}
    </div>
  </nav>
</div>
