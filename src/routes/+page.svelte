<script lang="ts">
  import { onMount } from 'svelte';
  import { getStations } from './data.remote';
  import { calculateDistance } from '$lib/utils/distance';
  import { processStationFreshness, type ProcessedStation } from '$lib/utils/freshness';

  // Hardcoded test location (Ring Road, Benin City) for MVP
  const testLat = 6.3330;
  const testLng = 5.6250;

  let rawStations: any[] = $state([]);
  let processedStations: ProcessedStation[] = $state([]);
  let loading = $state(true);

  onMount(async () => {
    try {
      const data = await getStations();
      rawStations = data;
      
      processedStations = rawStations.map(station => {
        const processed = processStationFreshness(station, station.reports || []);
        // Calculate distance
        processed.distanceKm = calculateDistance(
          testLat, testLng, 
          parseFloat(station.lat), parseFloat(station.lng)
        );
        return processed;
      }).sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    } catch (e) {
      console.error("Error fetching stations:", e);
    } finally {
      loading = false;
    }
  });

  function getBadgeClasses(state: string) {
    switch(state) {
      case 'out-of-fuel': return 'bg-red-100 text-red-800 border-red-200';
      case 'recent-consensus': return 'bg-green-100 text-green-800 border-green-200';
      case 'recent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'outdated': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
</script>

<div class="max-w-3xl mx-auto py-6 px-4">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-bold text-gray-900">FuelFind Benin</h1>
    <a href="/login" class="text-blue-600 hover:underline">Login / Report</a>
  </div>

  <div class="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6">
    <p class="text-sm text-blue-800">
      📍 Showing stations sorted by distance from <strong>King Square (Ring Road)</strong>.
    </p>
  </div>

  {#if loading}
    <div class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  {:else if processedStations.length === 0}
    <div class="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
      <p class="text-gray-500">No stations found. Run the seed script!</p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each processedStations as station}
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div class="p-5">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-xl font-semibold text-gray-900">{station.name}</h3>
                <p class="text-gray-500 text-sm mt-1">{station.address}</p>
                <div class="mt-2 text-sm text-gray-600">
                  <span class="inline-flex items-center">
                    <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    {station.distanceKm?.toFixed(1)} km away
                  </span>
                </div>
              </div>
              
              <div class="text-right flex flex-col items-end">
                {#if station.displayPrice}
                  <div class="text-2xl font-bold text-gray-900" class:text-gray-400={station.state === 'outdated'}>
                    ₦{station.displayPrice}
                  </div>
                {/if}
                
                {#if station.state !== 'no-reports'}
                  <span class={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeClasses(station.state)}`}>
                    {station.statusText}
                  </span>
                {:else}
                  <a href={`/report/${station.id}`} class="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    Be the first to report
                  </a>
                {/if}
              </div>
            </div>
            
            {#if station.state !== 'no-reports'}
              <div class="mt-4 pt-4 border-t border-gray-100">
                <a href={`/report/${station.id}`} class="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Update price report
                </a>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
