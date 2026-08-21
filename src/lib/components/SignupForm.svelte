<script lang="ts">
  import { signUp } from '$auth/client';
  
  import { Button } from '#lib/components/ui/button';
  import { Input } from '#lib/components/ui/input';
  import { Label } from '#lib/components/ui/label';
  import { Loader2 } from 'lucide-svelte';
  
  let { onSuccess = () => {} } = $props<{ onSuccess?: () => void }>();

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
    <h2 class="text-2xl font-bold">Create an account</h2>
    <p class="text-sm text-muted-foreground mt-1">Join FuelFind to report and view fuel prices</p>
  </div>

  {#if errorMsg}
    <div class="bg-destructive/15 text-destructive p-3 rounded-md text-sm border border-destructive/20">{errorMsg}</div>
  {/if}
  
  <form onsubmit={handleSignup} class="space-y-4">
    <div class="space-y-2 text-left">
      <Label for="name">Name</Label>
      <Input type="text" id="name" bind:value={name} required placeholder="John Doe" />
    </div>
    
    <div class="space-y-2 text-left">
      <Label for="email">Email</Label>
      <Input type="email" id="email" bind:value={email} required placeholder="you@example.com" />
    </div>
    
    <div class="space-y-2 text-left">
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
  
  <div class="text-center text-sm text-muted-foreground mt-4">
    Already have an account? <a href="/login" class="text-primary hover:underline font-medium ml-1">Log in</a>
  </div>
</div>
