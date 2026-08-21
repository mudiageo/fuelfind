<script lang="ts">
  import { signIn } from 'omni-svelte/auth/client';
  import { goto } from '$app/navigation';
  
  import * as Card from '#lib/components/ui/card';
  import { Button } from '#lib/components/ui/button';
  import { Input } from '#lib/components/ui/input';
  import { Label } from '#lib/components/ui/label';
  import { Loader2 } from 'lucide-svelte';
  
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

<div class="max-w-md mx-auto mt-10 p-4 sm:p-0">
  <Card.Root>
    <Card.Header class="text-center">
      <Card.Title class="text-2xl">Welcome back</Card.Title>
      <Card.Description>Log in to your FuelFind account</Card.Description>
    </Card.Header>
    <Card.Content>
      {#if errorMsg}
        <div class="bg-destructive/15 text-destructive p-3 rounded-md mb-6 text-sm border border-destructive/20">{errorMsg}</div>
      {/if}
      
      <form onsubmit={handleLogin} class="space-y-4">
        <div class="space-y-2">
          <Label for="email">Email</Label>
          <Input type="email" id="email" bind:value={email} required placeholder="you@example.com" />
        </div>
        
        <div class="space-y-2">
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
    </Card.Content>
    <Card.Footer class="flex justify-center text-sm text-muted-foreground border-t p-6">
      Don't have an account? <a href="/signup" class="text-primary hover:underline font-medium ml-1">Sign up</a>
    </Card.Footer>
  </Card.Root>
</div>
