<script setup>
import ClaimServiceDataProvider from "./ClaimServiceDataProvider.vue";
import ServiceConfirmationPdf from "./ServiceConfirmation.Pdf.vue";
</script>
<template>
  <ClaimServiceDataProvider
    v-slot="{ claims, claimServices, pending }"
    :claimUuid="$route.params.Uuid"
  >
    <ServiceConfirmationPdf
      :claim="claims"
      :services="claimServices"
      v-if="!pending"
    />
    <div v-else>Loading</div>
  </ClaimServiceDataProvider>
</template>
