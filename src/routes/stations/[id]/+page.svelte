<script lang="ts">
  import { page } from '$app/state';
  import { station } from '../../data.remote';
  import { processStationFreshness } from '$lib/utils/freshness';

  let stationId = $derived(page.params.id);
  let stationQuery = $derived(station(stationId));
</script>

<div class="max-w-3xl mx-auto py-6 px-4">
  <div class="mb-6">
    <a href="/" class="text-blue-600 hover:underline flex items-center gap-1">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      Back to List
    </a>
  </div>

  {#await stationQuery}
    <div class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  {:then record}
    {#if !record}
      <div class="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p class="text-gray-500">Station not found.</p>
      </div>
    {:else}
      {@const processed = processStationFreshness(record, record.reports || [])}
      
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div class="p-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{record.name}</h1>
          <p class="text-gray-500">{record.address}</p>
          
          <div class="mt-6 flex flex-wrap gap-4 items-center justify-between border-t border-gray-100 pt-6">
            <div>
              <div class="text-sm font-medium text-gray-500 mb-1">Current PMS Price</div>
              {#if processed.displayPrice}
                <div class="text-4xl font-bold text-gray-900" class:text-gray-400={processed.state === 'outdated'}>
                  ₦{processed.displayPrice}
                </div>
              {:else}
                <div class="text-xl font-medium text-gray-500">Unknown</div>
              {/if}
            </div>
            
            <div class="text-right">
              <div class="text-sm font-medium text-gray-500 mb-2">Status</div>
              <span class={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border bg-gray-100 text-gray-800 border-gray-200`}>
                {processed.statusText}
              </span>
            </div>
          </div>
          
          <div class="mt-8">
            <a href={`/report/${record.id}`} class="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
              Submit New Report
            </a>
          </div>
        </div>
      </div>

      <div class="mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">Price History (Last 10)</h2>
        
        {#if !record.reports || record.reports.length === 0}
          <div class="bg-gray-50 rounded-lg p-6 text-center text-gray-500 border border-gray-200">
            No price reports for this station yet.
          </div>
        {:else}
          <div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <ul class="divide-y divide-gray-200">
              {#each [...record.reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10) as report}
                <li class="p-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <div class="font-medium text-gray-900 flex items-center gap-2">
                      <span class="uppercase text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{report.fuelType}</span>
                      {#if !report.hasFuel}
                        <span class="text-red-600 font-bold">Out of Fuel</span>
                      {:else}
                        ₦{report.pricePerLiter}
                      {/if}
                    </div>
                    <div class="text-sm text-gray-500 mt-1">
                      {new Date(report.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <!-- We don't have user names linked in MVP easily, so just showing time -->
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    {/if}
  {:catch error}
    <div class="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
      Error loading station: {error.message}
    </div>
  {/await}
</div>
