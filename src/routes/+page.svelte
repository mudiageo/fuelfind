<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { fromURL } from 'omni-svelte/remote';
  import { stations } from './data.remote';
  import { calculateDistance } from '#lib/utils/distance';
  import { processStationFreshness, type ProcessedStation } from '#lib/utils/freshness';

  import * as Card from '#lib/components/ui/card';
  import { Badge } from '#lib/components/ui/badge';
  import * as Select from '#lib/components/ui/select';
  import { Checkbox } from '#lib/components/ui/checkbox';
  import { Label } from '#lib/components/ui/label';
  import { MapPin, ArrowRight, Loader2, Info } from '@lucide/svelte';

  // Default test location (Ring Road, Benin City)
  let userLat = $state(6.3330);
  let userLng = $state(5.6250);
  let locationStatus = $state('Using default location (Benin City)');
  
  // Reactively fetch stations based on URL parameters
  let stationsQuery = $derived(stations(fromURL(new URL(page.url.toString()))));

  let sortBy = $state(page.url.searchParams.get('sort') || 'distance');
  let fuelTypeFilter = $state(page.url.searchParams.get('fuelType') || 'pms');
  let only24h = $state(page.url.searchParams.get('only24h') === 'true');

  onMount(() => {
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

  // Since shadcn-svelte v4 Select uses bind:value and triggers reactively, we can use an effect
  // to sync state back to URL when it changes
  $effect(() => {
    const params = new URLSearchParams(page.url.searchParams.toString());
    let changed = false;
    
    if (params.get('fuelType') !== fuelTypeFilter) {
      params.set('fuelType', fuelTypeFilter);
      changed = true;
    }
    if (params.get('sort') !== sortBy) {
      params.set('sort', sortBy);
      changed = true;
    }
    if ((params.get('only24h') === 'true') !== only24h) {
      params.set('only24h', only24h ? 'true' : 'false');
      changed = true;
    }
    
    if (changed) {
      goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
    }
  });

  function getBadgeVariant(state: string) {
    switch(state) {
      case 'out-of-fuel': return 'destructive';
      case 'recent-consensus': return 'default';
      case 'recent': return 'secondary';
      case 'outdated': return 'outline';
      default: return 'outline';
    }
  }

  function getFuelLabel(val: string) {
    if (val === 'pms') return 'Petrol (PMS)';
    if (val === 'diesel') return 'Diesel (AGO)';
    return 'Kerosene (DPK)';
  }

  function getSortLabel(val: string) {
    if (val === 'price') return 'Lowest Price';
    return 'Distance';
  }
</script>

<div class="max-w-4xl mx-auto py-8 px-4 sm:px-6">
  <div class="flex flex-col gap-6 mb-8">
    <div>
      <h1 class="text-3xl font-extrabold tracking-tight">Stations Nearby</h1>
      <p class="text-muted-foreground flex items-center gap-1.5 mt-1 text-sm">
        <MapPin class="w-4 h-4" />
        {locationStatus}
      </p>
    </div>

    <Card.Root class="bg-card">
      <Card.Content class="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-end justify-between">
        <div class="flex flex-col sm:flex-row gap-4 flex-1">
          <div class="space-y-1.5 flex-1 max-w-[200px]">
            <Label>Fuel Type</Label>
            <Select.Root type="single" bind:value={fuelTypeFilter}>
              <Select.Trigger>
                {getFuelLabel(fuelTypeFilter)}
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="pms">Petrol (PMS)</Select.Item>
                <Select.Item value="diesel">Diesel (AGO)</Select.Item>
                <Select.Item value="kerosene">Kerosene (DPK)</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
          
          <div class="space-y-1.5 flex-1 max-w-[200px]">
            <Label>Sort By</Label>
            <Select.Root type="single" bind:value={sortBy}>
              <Select.Trigger>
                {getSortLabel(sortBy)}
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="distance">Distance</Select.Item>
                <Select.Item value="price">Lowest Price</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
        </div>

        <div class="flex items-center space-x-2 pt-2 sm:pt-0 pb-1">
          <Checkbox id="only24h" bind:checked={only24h} />
          <Label for="only24h" class="cursor-pointer font-normal text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Reported in last 24h
          </Label>
        </div>
      </Card.Content>
    </Card.Root>
  </div>

  {#await stationsQuery}
    <div class="flex flex-col items-center justify-center py-20 text-muted-foreground">
      <Loader2 class="w-8 h-8 animate-spin mb-4 text-primary" />
      <p>Finding stations near you...</p>
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
      <div class="text-center py-20 border border-dashed rounded-xl bg-muted/30">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
          <Info class="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 class="text-lg font-medium text-foreground">No stations found</h3>
        <p class="text-muted-foreground mt-1 max-w-sm mx-auto">
          Try adjusting your filters or expanding your search to find stations nearby.
        </p>
      </div>
    {:else}
      <div class="grid gap-4">
        {#each processedStations as station}
          <a href={`/stations/${station.id}`} class="block group">
            <Card.Root class="transition-all hover:shadow-md hover:border-primary/50 relative overflow-hidden">
              <Card.Content class="p-5 sm:p-6">
                <div class="flex flex-col sm:flex-row justify-between gap-4">
                  <div class="flex-1 pr-8">
                    <h3 class="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {station.name}
                    </h3>
                    <p class="text-muted-foreground text-sm mt-1">{station.address}</p>
                    <div class="mt-3 flex items-center gap-3 text-sm font-medium text-muted-foreground">
                      <span class="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md">
                        <MapPin class="w-3.5 h-3.5" />
                        {station.distanceKm?.toFixed(1)} km
                      </span>
                    </div>
                  </div>
                  
                  <div class="flex flex-col items-start sm:items-end justify-start sm:min-w-[140px]">
                    {#if station.displayPrice}
                      <div class="text-3xl font-extrabold tracking-tight text-foreground" class:opacity-60={station.state === 'outdated'}>
                        ₦{station.displayPrice}
                      </div>
                    {/if}
                    
                    {#if station.state !== 'no-reports'}
                      <div class="mt-2">
                        <Badge variant={getBadgeVariant(station.state)}>
                          {station.statusText}
                        </Badge>
                      </div>
                    {:else}
                      <span class="mt-2 text-sm text-muted-foreground italic">No data</span>
                    {/if}
                  </div>
                </div>
                
                <div class="absolute right-5 top-1/2 -translate-y-1/2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all hidden sm:block text-muted-foreground">
                  <ArrowRight class="w-5 h-5" />
                </div>
              </Card.Content>
            </Card.Root>
          </a>
        {/each}
      </div>
    {/if}
  {:catch error}
    <Card.Root class="border-destructive bg-destructive/10">
      <Card.Content class="p-6 text-destructive">
        Error loading stations: {error.message}
      </Card.Content>
    </Card.Root>
  {/await}
</div>
