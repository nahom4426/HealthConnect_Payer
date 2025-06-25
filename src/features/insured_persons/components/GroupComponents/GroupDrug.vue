<script setup>
import Table from "@/components/Table.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { openModal } from "@customizer/modal-x";
import { useAuthStore } from "@/stores/auth";
import { toasted } from "@/utils/utils";
import { useDrugStore } from "@/features/service/store/drugStore";
import DrugDataprovider from "@/features/service/components/DrugDataprovider.vue";
import { useSelectedDrugStore } from "../../store/selectedDrugStore";
import { computed, ref } from "vue";
const api = useApiRequest();
const authStore = useAuthStore();
const drugStore = useDrugStore();
const props = defineProps({
  id: String,
});

const useSelectedDrug = useSelectedDrugStore();

const isSelected = computed(() => {
  return useSelectedDrug.isAllSelected;
});

function handleSelectAll(checked, data) {
  useSelectedDrug.SelectAll(checked, data);
}
function selectService(id, data = []) {
  const idx = useSelectedDrug.selectedValues.findIndex((el) => el == id);
  if (idx > -1) {
    useSelectedDrug.removeValue(id);
    useSelectedDrug.setAllSelected(false);
  } else {
    useSelectedDrug.addValue(id);
    if (useSelectedDrug.selectedValues.length === data.length) {
      useSelectedDrug.setAllSelected(true);
    }
  }
}
const search = ref("");
</script>
<template>
  <div>
    <DrugDataprovider
      :id="props.id"
      :search="search"
      :auto="false"
      v-slot="{ pending, drugs }"
    >
      <div class="flex flex-col gap-4 bg-white p-3">
        <div class="flex w-full justify-between items-center">
          <h1 class="text-base-clr">Allowed Drugs</h1>
          <input
            v-model="search"
            placeholder="Search and Select Drugs"
            class="p-4 w-[36rem] bg-base-clr3 rounded-md"
            type="text"
          />
        </div>
        <div class="h-60 overflow-auto scrollbar-hide">
          <Table
            :first-col="true"
            :show-pagination="false"
            :pending="pending"
            :rows="drugs"
            :headers="{
              head: ['Code', 'Drug Name', 'Price (ETB)', 'Status', 'actions'],
              row: ['drugCode', 'drugName', 'price', 'status'],
            }"
          >
            <template #headerFirst="{ row }">
              <Button>
                <input
                  :checked="isSelected"
                  @change="handleSelectAll($event.target.checked, drugs)"
                  class="size-4"
                  type="checkbox"
                />
              </Button>
            </template>
            <template #select="{ row }">
              <Button>
                <input
                  type="checkbox"
                  :checked="
                    useSelectedDrug.selectedValues.includes(row?.drugUuid)
                  "
                  @change="selectService(row?.drugUuid, drugs)"
                  class="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </Button>
            </template>
          </Table>
        </div>
      </div>
    </DrugDataprovider>
  </div>
</template>
