<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { createPriceReport, station } from '../../data.remote';
  import { authClient } from '$auth/client';
  import { queueReport } from '#lib/db/offline';
  import { onMount } from 'svelte';

  import * as Card from '#lib/components/ui/card';
  import { Button } from '#lib/components/ui/button';
  import { Input } from '#lib/components/ui/input';
  import { Label } from '#lib/components/ui/label';
  import { Checkbox } from '#lib/components/ui/checkbox';
  import * as Select from '#lib/components/ui/select';
  import { ArrowLeft, Loader2, AlertTriangle } from '@lucide/svelte';

  let stationId = $derived(page.params.stationId);
  let stationQuery = $derived(station(stationId));
  
  const session = authClient.useSession();
  
  let fuelType = $state('pms');
  let pricePerLiter = $state('');
  let hasFuel = $state(true);
  let isOffline = $state(false);
  let submitting = $state(false);

  onMount(() => {
    isOffline = !navigator.onLine;
    const updateStatus = () => isOffline = !navigator.onLine;
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!$session.data?.user || submitting) return;
    
    submitting = true;
    
    const payload = {
      stationId: Number(stationId),
      userId: $session.data.user.id,
      fuelType,
      pricePerLiter: hasFuel ? Number(pricePerLiter) : 0,
      hasFuel
    };

    if (isOffline) {
      await queueReport(payload);
      alert('You are offline. Your report has been queued and will sync when reconnected.');
      goto(`/stations/${stationId}`);
    } else {
      try {
        await createPriceReport(payload);
        goto(`/stations/${stationId}`);
      } catch (err: any) {
        alert(err.message || 'An error occurred while submitting the report.');
      }
    }
    submitting = false;
  }

  function getFuelLabel(val: string) {
    if (val === 'pms') return 'Petrol (PMS)';
    if (val === 'diesel') return 'Diesel (AGO)';
    return 'Kerosene (DPK)';
  }
</script>

<div class="max-w-md mx-auto mt-10 p-4 sm:p-0">
  <div class="mb-6">
    <Button variant="ghost" size="sm" href={`/stations/${stationId}`} class="gap-1 pl-2 text-muted-foreground hover:text-foreground">
      <ArrowLeft class="w-4 h-4" />
      Back to Station
    </Button>
  </div>

  <Card.Root>
    <Card.Header>
      <Card.Title class="text-2xl">Report Price</Card.Title>
      {#await stationQuery then record}
        {#if record}
          <Card.Description>{record.name}</Card.Description>
        {/if}
      {/await}
    </Card.Header>
    <Card.Content>
      {#if $session.isPending}
        <div class="flex justify-center py-8">
          <Loader2 class="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      {:else if !$session.data?.user}
        <div class="bg-amber-500/10 text-amber-600 dark:text-amber-400 p-4 rounded-lg flex gap-3 border border-amber-500/20">
          <AlertTriangle class="w-5 h-5 shrink-0 mt-0.5" />
          <div class="text-sm">
            <p class="font-medium mb-2">Authentication Required</p>
            <p class="mb-3 opacity-90">You must be logged in to submit a price report.</p>
            <div class="flex gap-3">
              <Button href="/login" variant="outline" size="sm" class="bg-background/50">Log In</Button>
              <Button href="/signup" size="sm">Sign Up</Button>
            </div>
          </div>
        </div>
      {:else}
        <form onsubmit={handleSubmit} class="space-y-6">
          <div class="flex items-center space-x-3 bg-muted/30 p-4 rounded-lg border border-border">
            <Checkbox id="hasFuel" bind:checked={hasFuel} />
            <Label for="hasFuel" class="font-medium cursor-pointer flex-1">Station currently has fuel</Label>
          </div>

          {#if hasFuel}
            <div class="space-y-3">
              <Label>Fuel Type</Label>
              <Select.Root type="single" bind:value={fuelType}>
                <Select.Trigger class="w-full">
                  {getFuelLabel(fuelType)}
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="pms">Petrol (PMS)</Select.Item>
                  <Select.Item value="diesel">Diesel (AGO)</Select.Item>
                  <Select.Item value="kerosene">Kerosene (DPK)</Select.Item>
                </Select.Content>
              </Select.Root>
            </div>
            
            <div class="space-y-3">
              <Label for="price">Price per Liter (₦)</Label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span class="text-muted-foreground sm:text-sm font-medium">₦</span>
                </div>
                <Input 
                  id="price"
                  type="number"
                  bind:value={pricePerLiter}
                  required
                  min="1"
                  placeholder="e.g. 650"
                  class="pl-8"
                />
              </div>
            </div>
          {/if}
          
          <Button 
            type="submit" 
            disabled={submitting}
            class="w-full"
            size="lg"
          >
            {#if submitting}
              <Loader2 class="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            {:else}
              Submit Report
            {/if}
          </Button>
        </form>
      {/if}
    </Card.Content>
  </Card.Root>
</div>
