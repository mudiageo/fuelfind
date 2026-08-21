<script lang="ts">
  import { goto } from '$app/navigation';
  import SignupForm from '#lib/components/SignupForm.svelte';
  import * as Card from '#lib/components/ui/card';
</script>

<div class="max-w-md mx-auto mt-10 p-4 sm:p-0">
  <Card.Root>
    <Card.Content class="pt-6">
      <SignupForm onSuccess={() => goto('/')} />
    </Card.Content>
  </Card.Root>
</div>
