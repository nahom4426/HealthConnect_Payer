<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, ref } from "vue";
import Button from "@/components/Button.vue";
import { openModal } from "@customizer/modal-x";
import { authorizationStore } from "../store/authorizationStore";
import {
  changeInsuredStatus,
  getPayerbyPayerUuid,
} from "../api/authorizationApi";
import { useToast } from "@/toast/store/toast";
import icons from "@/utils/icons";
import { watch } from "vue";
import { useSelectedClaimsStore } from "../store/selectedClaimsStore";

const props = defineProps({
  rowData: { type: Object, required: true },
  rowKeys: { type: Array, required: true },
  headKeys: { type: Array, required: true },
  onRowClick: { type: Function, default: () => {} },
  isSelected: { type: Boolean, default: false },
  onSelect: { type: Function, default: () => {} },
});

const { addToast } = useToast();
const authorization = authorizationStore();
const payerNames = ref<Record<string, string>>({});

async function fetchPayerName(payerUuid: string) {
  if (!payerUuid) return "Unknown Payer";
  if (payerNames.value[payerUuid]) return payerNames.value[payerUuid];

  try {
    const response = await getPayerbyPayerUuid(payerUuid);
    if (response?.payerName) {
      payerNames.value[payerUuid] = response.payerName;
      return response.payerName;
    }
    return "Unknown Payer";
  } catch (error) {
    console.error("Error fetching payer name:", error);
    return "Unknown Payer";
  }
}
watch(
  () => props.rowData,
  async (newData) => {
    if (newData && newData.length > 0) {
      const uniquePayerUuids = [
        ...new Set(newData.map((row) => row.payerUuid)),
      ];
      await Promise.all(uniquePayerUuids.map((uuid) => fetchPayerName(uuid)));
    }
  },
  { immediate: true }
);
onMounted(async () => {
  window.addEventListener("click", closeAllDropdowns);
  const uniquePayerUuids = [
    ...new Set(props.rowData.map((row) => row.payerUuid)),
  ];
  await Promise.all(uniquePayerUuids.map((uuid) => fetchPayerName(uuid)));
});

onUnmounted(() => {
  window.removeEventListener("click", closeAllDropdowns);
});

function handleImageError(event) {
  event.target.src = "/assets/placeholder-profile.png";
}

function handleEdit(row) {
  if (row.insuredUuid) {
    openModal("EditInsured", {
      insuredUuid: row.insuredUuid,
      insured: row,
      onUpdated: (updated) =>
        authorization.update(updated.insuredUuid, updated),
    });
  } else if (typeof props.onEdit === "function") {
    props.onEdit(row);
  }
}

function toggleDropdown(event, rowId) {
  event.stopPropagation();
  closeAllDropdowns();
  const dropdown = document.getElementById(`dropdown-${rowId}`);
  if (dropdown) dropdown.classList.toggle("hidden");
}

function closeAllDropdowns() {
  document
    .querySelectorAll(".dropdown-menu")
    .forEach((el) => el.classList.add("hidden"));
}

function handleEditWithClose(row) {
  closeAllDropdowns();
  handleEdit(row);
}

async function handleActivateWithClose(insuredId) {
  closeAllDropdowns();
  try {
    const response = await changeInsuredStatus(insuredId, "ACTIVE");
    if (response.success) {
      addToast({
        type: "success",
        title: "Status Updated",
        message: "Insured member has been activated",
      });
      authorization.update(insuredId, { status: "ACTIVE" });
    } else {
      throw new Error(response.error || "Failed to activate");
    }
  } catch (error) {
    addToast({
      type: "error",
      title: "Activation Failed",
      message: error.message,
    });
  }
}

async function handleDeactivateWithClose(insuredId) {
  closeAllDropdowns();
  try {
    const response = await changeInsuredStatus(insuredId, "INACTIVE");
    if (response.success) {
      addToast({
        type: "success",
        title: "Status Updated",
        message: "Insured member has been deactivated",
      });
      authorization.update(insuredId, { status: "INACTIVE" });
    } else {
      throw new Error(response.error || "Failed to deactivate");
    }
  } catch (error) {
    addToast({
      type: "error",
      title: "Deactivation Failed",
      message: error.message,
    });
  }
}
const useSelectedClaims = useSelectedClaimsStore();
function selectedClaims(id: any) {
  const idx = useSelectedClaims.selectedValues.findIndex((el) => el == id);
  if (idx > -1) {
    useSelectedClaims.removeValue(id);
    useSelectedClaims.setAllSelected(false);
  } else {
    useSelectedClaims.addValue(id);
    if (useSelectedClaims.selectedValues.length === props.rowData.length) {
      useSelectedClaims.setAllSelected(true);
    }
  }
}
</script>
<template>
  <tr
    v-for="(row, idx) in rowData"
    :key="idx"
    @click.self="props.onRowClick(row)"
    class="bg-white border-b hover:bg-gray-50 transition-colors duration-150 ease-in-out"
  >
    <td class="px-4" @click.stop>
      <Button>
        <input
          type="checkbox"
          :checked="
            useSelectedClaims.selectedValues.includes(row?.dispensingUuid)
          "
          @change="selectedClaims(row?.dispensingUuid)"
          class="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </Button>
    </td>

    <td class="p-4 font-medium text-gray-500">{{ idx + 1 }}</td>

    <td class="p-3 py-4" v-for="key in rowKeys" :key="key">
      <div v-if="key === 'totalAmount'" class="truncate">
        <span
          class="px-2.5 py-1 rounded-full text-xs font-medium bg-[#DFF1F1] text-[#02676B]"
        >
          ETB {{ row.totalAmount.toFixed(2) }}
        </span>
      </div>

      <div v-else-if="key === 'payerUuid'" class="text-gray-700">
        {{ payerNames[row[key]] || row[key] || "Loading..." }}
      </div>

      <span v-else class="text-gray-700">
        {{ row[key] }}
      </span>
    </td>

    <td class="p-3">
      <div class="dropdown-container relative">
        <button
          @click.stop="toggleDropdown($event, row.insuredUuid || row.id)"
          class="inline-flex items-center p-2 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 focus:outline-none"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
            />
          </svg>
        </button>

        <div
          :id="`dropdown-${row.insuredUuid || row.id}`"
          class="dropdown-menu hidden absolute right-0 z-10 w-44 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <div class="py-1">
            <button
              @click.stop="handleEditWithClose(row)"
              class="block w-full text-start py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <div class="flex items-start justify-start pl-4 gap-4">
                <i v-html="icons.edits" />
                Edit
              </div>
            </button>
            <button
              @click.prevent="
                $router.push(`/insured_list/detail/${row.insuredUuid}`)
              "
              class="block w-full text-center py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <div class="flex items-center justify-start pl-4 gap-4">
                <i v-html="icons.details" />
                Details
              </div>
            </button>

            <template v-if="row.status">
              <button
                v-if="row.status === 'INACTIVE' || row.status === 'Inactive'"
                @click.stop="handleActivateWithClose(row.insuredUuid || row.id)"
                class="block w-full text-center py-2 text-sm text-[#28A745] hover:bg-gray-100"
              >
                <div class="flex items-center justify-start pl-4 gap-4">
                  <i v-html="icons.activate" />
                  Activate
                </div>
              </button>

              <button
                v-if="row.status === 'ACTIVE' || row.status === 'Active'"
                @click.stop="
                  handleDeactivateWithClose(row.insuredUuid || row.id)
                "
                class="block w-full text-center py-2 text-sm text-[#DB2E48] hover:bg-gray-100"
              >
                <div class="flex items-center justify-start pl-4 gap-4">
                  <i v-html="icons.deactivate" />
                  Deactivate
                </div>
              </button>
            </template>
          </div>
        </div>
      </div>
    </td>
  </tr>
</template>

<style scoped>
.dropdown-container {
  position: relative;
}

.dropdown-menu {
  transition: all 0.2s ease-out;
  transform-origin: top right;
}

.dropdown-menu.hidden {
  opacity: 0;
  transform: scale(0.95);
  pointer-events: none;
}

.dropdown-menu:not(.hidden) {
  opacity: 1;
  transform: scale(1);
}

tr:hover {
  background-color: #f9fafb;
}
</style>
