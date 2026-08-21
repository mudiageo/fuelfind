<script lang="ts">
  import { signIn } from '$auth/client';
  import { goto } from '$app/navigation';
  
  import { Button } from '#lib/components/ui/button';
  import { Input } from '#lib/components/ui/input';
  import { Label } from '#lib/components/ui/label';
  import { Loader2 } from 'lucide-svelte';
  
  let { onSuccess = () => {} } = $props<{ onSuccess?: () => void }>();

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
        onSuccess();
      }
    } catch (err: any) {
      errorMsg = err.message || 'An unexpected error occurred';
    } finally {
      loading = false;
    }
  }
</script>

<div class="space-y-6">
  <div class="text-center">
    <h2 class="text-2xl font-bold">Welcome back</h2>
    <p class="text-sm text-muted-foreground mt-1">Log in to your FuelFind account</p>
  </div>

  {#if errorMsg}
    <div class="bg-destructive/15 text-destructive p-3 rounded-md text-sm border border-destructive/20">{errorMsg}</div>
  {/if}
  
  <form onsubmit={handleLogin} class="space-y-4">
    <div class="space-y-2 text-left">
      <Label for="email">Email</Label>
      <Input type="email" id="email" bind:value={email} required placeholder="you@example.com" />
    </div>
    
    <div class="space-y-2 text-left">
      <Label for="password">Password</Label>
      <Input type="password" id="password" bind:value={password} required />
    </div>
    
    <Button type="submit" class="w-full mt-2" disabled={loading}>
      {#if loading}
        <Loader2 class="w-4 h-4 mr-2 animate-spin" />
        Logging in...
      {:else}
        Log In
      {/if}
    </Button>
  </form>
  
  <div class="text-center text-sm text-muted-foreground mt-4">
    Don't have an account? <a href="/signup" class="text-primary hover:underline font-medium ml-1">Sign up</a>
  </div>
</div>
