<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { stations } from './data.remote';
  import { calculateDistance } from '$lib/utils/distance';
  import { processStationFreshness, type ProcessedStation } from '$lib/utils/freshness';

  function fromURL(url: URL) {
    const params = url.searchParams;
    const pageVal = params.get('page');
    const perPageVal = params.get('perPage') || params.get('per_page');
    const searchVal = params.get('search') || params.get('q');
    return {
      page: pageVal ? parseInt(pageVal, 10) : undefined,
      perPage: perPageVal ? parseInt(perPageVal, 10) : undefined,
      search: searchVal || undefined
    };
  }

  // Default test location (Ring Road, Benin City)
  let userLat = $state(6.3330);
  let userLng = $state(5.6250);
  let locationStatus = $state('Using default location (Ring Road, Benin City)');
  
  // Reactively fetch stations based on URL parameters
  let stationsQuery = $derived(stations(fromURL(new URL(page.url.toString()))));

  let sortBy = $state(page.url.searchParams.get('sort') || 'distance');
  let fuelTypeFilter = $state(page.url.searchParams.get('fuelType') || 'pms');
  let only24h = $state(page.url.searchParams.get('only24h') === 'true');

  onMount(() => {
    // Try to get real location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLat = position.coords.latitude;
          userLng = position.coords.longitude;
          locationStatus = 'Using your current location';
        },
        (error) => {
          console.warn('Geolocation error:', error);
          locationStatus = 'Location permission denied, using default';
        }
      );
    }
  });

  function updateFilters(key: string, value: string) {
    const params = new URLSearchParams(page.url.searchParams.toString());
    params.set(key, value);
    if (key === 'fuelType') fuelTypeFilter = value;
    if (key === 'sort') sortBy = value;
    if (key === 'only24h') only24h = value === 'true';
    goto(`?${params.toString()}`);
  }

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
  <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
    <div class="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
        <select 
          value={fuelTypeFilter} 
          onchange={(e) => updateFilters('fuelType', e.currentTarget.value)}
          class="border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="pms">Petrol (PMS)</option>
          <option value="diesel">Diesel (AGO)</option>
          <option value="kerosene">Kerosene (DPK)</option>
        </select>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
        <select 
          value={sortBy} 
          onchange={(e) => updateFilters('sort', e.currentTarget.value)}
          class="border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="distance">Distance</option>
          <option value="price">Lowest Price</option>
        </select>
      </div>

      <div class="flex items-center pt-5 sm:pt-6">
        <label class="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
          <input 
            type="checkbox" 
            checked={only24h}
            onchange={(e) => updateFilters('only24h', e.currentTarget.checked ? 'true' : 'false')}
            class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          Reported in last 24h
        </label>
      </div>
    </div>
    
    <div class="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-1">
      <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
      {locationStatus}
    </div>
  </div>

  {#await stationsQuery}
    <div class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  {:then result}
    {@const processedStations = (() => {
      let filtered = result.data.map((station: any) => {
        const fuelReports = (station.reports || []).filter((r: any) => r.fuelType === fuelTypeFilter);
        const processed = processStationFreshness(station, fuelReports);
        processed.distanceKm = calculateDistance(
          userLat, userLng, 
          parseFloat(station.lat), parseFloat(station.lng)
        );
        return processed;
      });

      if (only24h) {
        filtered = filtered.filter((s: ProcessedStation) => s.state !== 'outdated' && s.state !== 'no-reports');
      }

      if (sortBy === 'price') {
        filtered.sort((a: ProcessedStation, b: ProcessedStation) => {
          if (!a.displayPrice) return 1;
          if (!b.displayPrice) return -1;
          return a.displayPrice - b.displayPrice;
        });
      } else {
        filtered.sort((a: ProcessedStation, b: ProcessedStation) => (a.distanceKm || 0) - (b.distanceKm || 0));
      }
      return filtered;
    })()}

    {#if processedStations.length === 0}
      <div class="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p class="text-gray-500">No stations found.</p>
      </div>
    {:else}
      <div class="space-y-4">
        {#each processedStations as station}
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div class="p-5 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div class="flex-1">
                <a href={`/stations/${station.id}`} class="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                  {station.name}
                </a>
                <p class="text-gray-500 text-sm mt-1">{station.address}</p>
                <div class="mt-2 text-sm font-medium text-gray-500">
                  {station.distanceKm?.toFixed(1)} km away
                </div>
              </div>
              
              <div class="flex flex-col items-start sm:items-end min-w-[120px]">
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
                  <span class="mt-2 text-sm text-gray-400 italic">No Data</span>
                {/if}
              </div>
            </div>
            
            <div class="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
              <a href={`/stations/${station.id}`} class="text-sm font-medium text-gray-600 hover:text-gray-900">
                View History
              </a>
              <a href={`/report/${station.id}`} class="text-sm font-medium text-blue-600 hover:text-blue-800">
                Update Price
              </a>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {:catch error}
    <div class="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
      Error loading stations: {error.message}
    </div>
  {/await}
</div>
