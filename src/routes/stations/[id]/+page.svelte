<script lang="ts">
  import { page } from '$app/state';
  import { station } from '../../data.remote';
  import { processStationFreshness } from '#lib/utils/freshness';

  import * as Card from '#lib/components/ui/card';
  import { Badge } from '#lib/components/ui/badge';
  import { Button } from '#lib/components/ui/button';
  import { ArrowLeft, MapPin, Clock, Loader2, Fuel } from 'lucide-svelte';

  let stationId = $derived(page.params.id);
  let stationQuery = $derived(station(stationId));

  function getBadgeVariant(state: string) {
    switch(state) {
      case 'out-of-fuel': return 'destructive';
      case 'recent-consensus': return 'default';
      case 'recent': return 'secondary';
      case 'outdated': return 'outline';
      default: return 'outline';
    }
  }
</script>

<div class="max-w-3xl mx-auto py-8 px-4 sm:px-6">
  <div class="mb-6">
    <Button variant="ghost" size="sm" href="/" class="gap-1 pl-2 text-muted-foreground hover:text-foreground">
      <ArrowLeft class="w-4 h-4" />
      Back to List
    </Button>
  </div>

  {#await stationQuery}
    <div class="flex flex-col items-center justify-center py-20 text-muted-foreground">
      <Loader2 class="w-8 h-8 animate-spin mb-4 text-primary" />
      <p>Loading station details...</p>
    </div>
  {:then record}
    {#if !record}
      <Card.Root class="border-dashed bg-muted/30">
        <Card.Content class="flex flex-col items-center py-12 text-center">
          <Fuel class="w-10 h-10 text-muted-foreground mb-4 opacity-50" />
          <h2 class="text-xl font-semibold">Station not found</h2>
          <p class="text-muted-foreground mt-2">This station may have been removed or does not exist.</p>
        </Card.Content>
      </Card.Root>
    {:else}
      {@const processed = processStationFreshness(record, record.reports || [])}
      
      <Card.Root class="mb-8 border-border/50 shadow-sm overflow-hidden">
        <div class="bg-primary/5 h-2 w-full"></div>
        <Card.Header>
          <Card.Title class="text-3xl font-extrabold tracking-tight">{record.name}</Card.Title>
          <Card.Description class="flex items-center gap-1.5 mt-2 text-base">
            <MapPin class="w-4 h-4 text-muted-foreground" />
            {record.address}
          </Card.Description>
        </Card.Header>
        
        <Card.Content>
          <div class="mt-2 flex flex-wrap gap-8 items-center justify-between border-t border-border pt-6">
            <div>
              <div class="text-sm font-medium text-muted-foreground mb-1.5">Current PMS Price</div>
              {#if processed.displayPrice}
                <div class="text-5xl font-extrabold text-foreground tracking-tighter" class:opacity-60={processed.state === 'outdated'}>
                  ₦{processed.displayPrice}
                </div>
              {:else}
                <div class="text-2xl font-medium text-muted-foreground">Unknown</div>
              {/if}
            </div>
            
            <div class="flex flex-col items-end">
              <div class="text-sm font-medium text-muted-foreground mb-2">Status</div>
              <Badge variant={getBadgeVariant(processed.state)} class="text-sm px-3 py-1">
                {processed.statusText}
              </Badge>
            </div>
          </div>
        </Card.Content>
        <Card.Footer class="bg-muted/30 border-t border-border/50 p-6">
          <Button href={`/report/${record.id}`} size="lg" class="w-full sm:w-auto">
            Submit New Report
          </Button>
        </Card.Footer>
      </Card.Root>

      <div class="mb-8">
        <div class="flex items-center gap-2 mb-4">
          <Clock class="w-5 h-5 text-muted-foreground" />
          <h2 class="text-xl font-bold text-foreground tracking-tight">Price History</h2>
          <span class="text-sm text-muted-foreground ml-auto">Last 10 reports</span>
        </div>
        
        {#if !record.reports || record.reports.length === 0}
          <Card.Root class="bg-muted/30 border-dashed">
            <Card.Content class="p-8 text-center text-muted-foreground">
              No price reports for this station yet.
            </Card.Content>
          </Card.Root>
        {:else}
          <Card.Root class="overflow-hidden">
            <div class="divide-y divide-border">
              {#each [...record.reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10) as report}
                <div class="p-4 sm:p-5 flex justify-between items-center hover:bg-muted/50 transition-colors">
                  <div class="space-y-1.5">
                    <div class="font-medium text-foreground flex items-center gap-2">
                      <Badge variant="outline" class="uppercase text-[10px] font-bold tracking-wider rounded-sm">
                        {report.fuelType}
                      </Badge>
                      {#if !report.hasFuel}
                        <span class="text-destructive font-bold flex items-center gap-1">
                          <Fuel class="w-4 h-4" /> Out of Fuel
                        </span>
                      {:else}
                        <span class="text-lg font-bold">₦{report.pricePerLiter}</span>
                      {/if}
                    </div>
                    <div class="text-sm text-muted-foreground flex items-center gap-1.5">
                      {new Date(report.createdAt).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </Card.Root>
        {/if}
      </div>
    {/if}
  {:catch error}
    <Card.Root class="border-destructive bg-destructive/10">
      <Card.Content class="p-6 text-destructive">
        Error loading station: {error.message}
      </Card.Content>
    </Card.Root>
  {/await}
</div>
