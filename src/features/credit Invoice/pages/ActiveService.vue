<script setup>
import DefaultPage from "@/components/DefaultPage.vue";
import Table from "@/components/Table.vue";
import ActiveServiceProvider from "../components/ActiveServiceProvider.vue";
import Button from "@/components/Button.vue";
</script>
<template>
  <DefaultPage v-model="search">
    <ActiveServiceProvider v-slot="{ ActiveService, pending }" :search="search">
      <Table
        :showPagination="true"
        :pending="pending"
        :headers="{
          head: [
            'Full Name',
            'Relationship',
            'Institution',
            'Service Date',
            'Claim Amount',
            'Actions',
          ],
          row: [
            'name',
            'Relationship',
            'institutionName',
            'serviceDate',
            'amount',
          ],
        }"
        :rows="
          ActiveService.map((el) => {
            return {
              name: el.dependantUuid
                ? `${el.dependantFatherName} ${el.dependantGrandFatherName}`
                : `${el.firstName} ${el.fatherName}`,
              amount: `${el.totalAmount} Birr`,
              Relationship: el.dependantUuid ? `Child` : `Main`,
              ...el,
            };
          })
        "
      >
        <template #actions="{ row }">
          <Button
            @click="$router.push(`claim/${row?.claimUuid}`)"
            class="bg-secondary text-white"
            >Details</Button
          >
        </template>
      </Table>
    </ActiveServiceProvider>
  </DefaultPage>
</template>
