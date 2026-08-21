<script lang="ts">
  import { signUp } from 'omni-svelte/auth/client';
  import { goto } from '$app/navigation';
  
  import * as Card from '#lib/components/ui/card';
  import { Button } from '#lib/components/ui/button';
  import { Input } from '#lib/components/ui/input';
  import { Label } from '#lib/components/ui/label';
  import { Loader2 } from 'lucide-svelte';
  
  let name = $state('');
  let email = $state('');
  let password = $state('');
  let errorMsg = $state('');
  let loading = $state(false);

  async function handleSignup(e: Event) {
    e.preventDefault();
    loading = true;
    errorMsg = '';
    
    try {
      const { error } = await signUp.email({ email, password, name });
      if (error) {
        errorMsg = error.message || 'Signup failed';
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
      <Card.Title class="text-2xl">Create an account</Card.Title>
      <Card.Description>Join FuelFind to report and view fuel prices</Card.Description>
    </Card.Header>
    <Card.Content>
      {#if errorMsg}
        <div class="bg-destructive/15 text-destructive p-3 rounded-md mb-6 text-sm border border-destructive/20">{errorMsg}</div>
      {/if}
      
      <form onsubmit={handleSignup} class="space-y-4">
        <div class="space-y-2">
          <Label for="name">Name</Label>
          <Input type="text" id="name" bind:value={name} required placeholder="John Doe" />
        </div>
        
        <div class="space-y-2">
          <Label for="email">Email</Label>
          <Input type="email" id="email" bind:value={email} required placeholder="you@example.com" />
        </div>
        
        <div class="space-y-2">
          <Label for="password">Password</Label>
          <Input type="password" id="password" bind:value={password} required minlength="8" />
          <p class="text-xs text-muted-foreground mt-1">Must be at least 8 characters</p>
        </div>
        
        <Button type="submit" class="w-full mt-2" disabled={loading}>
          {#if loading}
            <Loader2 class="w-4 h-4 mr-2 animate-spin" />
            Creating account...
          {:else}
            Sign Up
          {/if}
        </Button>
      </form>
    </Card.Content>
    <Card.Footer class="flex justify-center text-sm text-muted-foreground border-t p-6">
      Already have an account? <a href="/login" class="text-primary hover:underline font-medium ml-1">Log in</a>
    </Card.Footer>
  </Card.Root>
</div>
