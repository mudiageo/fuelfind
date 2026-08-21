<script lang="ts">
  import { goto } from '$app/navigation';
  import LoginForm from '#lib/components/LoginForm.svelte';
  import * as Card from '#lib/components/ui/card';
</script>

<div class="max-w-md mx-auto mt-10 p-4 sm:p-0">
  <Card.Root>
    <Card.Content class="pt-6">
      <LoginForm onSuccess={() => goto('/')} />
    </Card.Content>
  </Card.Root>
</div>
