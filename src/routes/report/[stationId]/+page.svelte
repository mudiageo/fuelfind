<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { createPriceReport, station } from '../../data.remote';
  import { authClient } from '$auth/client';
  import { queueReport } from '$lib/db/offline';
  import { onMount } from 'svelte';

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
</script>

<div class="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border border-gray-100">
  <div class="mb-6">
    <a href={`/stations/${stationId}`} class="text-blue-600 hover:underline flex items-center gap-1 text-sm">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      Back to Station
    </a>
  </div>

  <h1 class="text-2xl font-bold mb-2 text-gray-900">Report Price</h1>
  
  {#await stationQuery then record}
    {#if record}
      <p class="text-gray-500 mb-6">{record.name}</p>
    {/if}
  {/await}

  {#if $session.isPending}
    <div class="text-center py-4">Loading session...</div>
  {:else if !$session.data?.user}
    <div class="bg-yellow-50 text-yellow-800 p-4 rounded-md text-sm border border-yellow-200 mb-4">
      You must be logged in to submit a report. 
      <div class="mt-2">
        <a href="/login" class="font-bold underline">Log In</a> or <a href="/signup" class="font-bold underline">Sign Up</a>
      </div>
    </div>
  {:else}
    <form onsubmit={handleSubmit} class="space-y-5">
      <div>
        <label class="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
          <input 
            type="checkbox" 
            bind:checked={hasFuel}
            class="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span class="font-medium text-gray-900">Station has fuel</span>
        </label>
      </div>

      {#if hasFuel}
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Fuel Type</label>
          <select 
            bind:value={fuelType}
            class="w-full border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="pms">Petrol (PMS)</option>
            <option value="diesel">Diesel (AGO)</option>
            <option value="kerosene">Kerosene (DPK)</option>
          </select>
        </div>
        
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700">Price per Liter (₦)</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-500 sm:text-sm">₦</span>
            </div>
            <input 
              type="number"
              bind:value={pricePerLiter}
              required
              min="1"
              placeholder="e.g. 650"
              class="w-full pl-8 border border-gray-300 p-2.5 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
        </div>
      {/if}
      
      <button 
        type="submit" 
        disabled={submitting}
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium p-3 rounded-md transition-colors disabled:opacity-70"
      >
        {submitting ? 'Submitting...' : 'Submit Report'}
      </button>
    </form>
  {/if}
</div>
