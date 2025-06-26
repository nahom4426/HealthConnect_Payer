<script setup>
import { ref, watch } from "vue";
import Modal from "@/components/Modal.vue";
import Button from "@/components/Button.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { updateProviderContract } from "../api/providerContractApi";
import { addToast } from "@/toast";

const props = defineProps({
  contractUuid: {
    type: String,
    required: true,
  },
  contract: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close", "updated"]);

const formData = ref({
  providerName: props.contract?.providerName || "",
  startDate: props.contract?.startDate || "",
  endDate: props.contract?.endDate || "",
  contractType: props.contract?.contractType || "",
  description: props.contract?.description || "",
  status: props.contract?.status || "ACTIVE",
});

const error = ref("");
const updatePending = ref(false);
const updateReq = useApiRequest();

// Watch for changes in the contract prop
watch(
  () => props.contract,
  (newContract) => {
    if (newContract) {
      formData.value = {
        providerName: newContract.providerName || "",
        startDate: newContract.startDate || "",
        endDate: newContract.endDate || "",
        contractType: newContract.contractType || "",
        description: newContract.description || "",
        status: newContract.status || "ACTIVE",
      };
    }
  },
  { deep: true }
);

// Handle form submission
async function handleSubmit() {
  try {
    updatePending.value = true;
    console.log("Submitting updated contract data:", formData.value);

    const response = await updateProviderContract(
      props.contractUuid,
      formData.value
    );
    console.log("Update response:", response);

    if (response.success) {
      addToast({
        type: "success",
        title: "Success",
        message: "Contract updated successfully",
      });
      emit("updated", { ...props.contract, ...formData.value });
      emit("close");
    } else {
      error.value = response.error || "Failed to update contract";
      addToast({
        type: "error",
        title: "Error",
        message: error.value,
      });
    }
  } catch (err) {
    error.value = err.message || "An error occurred while updating contract";

    addToast({
      type: "error",
      title: "Error",
      message: error.value,
    });
    console.error("Error updating contract:", err);
  } finally {
    updatePending.value = false;
  }
}
</script>

<template>
  <Modal title="Edit Provider Contract" @close="emit('close')">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div
        v-if="error"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
      >
        {{ error }}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="form-group">
          <label
            for="providerName"
            class="block text-sm font-medium text-gray-700"
            >Provider Name</label
          >
          <input
            id="providerName"
            v-model="formData.providerName"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div class="form-group">
          <label
            for="contractType"
            class="block text-sm font-medium text-gray-700"
            >Contract Type</label
          >
          <input
            id="contractType"
            v-model="formData.contractType"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div class="form-group">
          <label for="startDate" class="block text-sm font-medium text-gray-700"
            >Start Date</label
          >
          <input
            id="startDate"
            v-model="formData.startDate"
            type="date"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div class="form-group">
          <label for="endDate" class="block text-sm font-medium text-gray-700"
            >End Date</label
          >
          <input
            id="endDate"
            v-model="formData.endDate"
            type="date"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div class="form-group col-span-2">
          <label
            for="description"
            class="block text-sm font-medium text-gray-700"
            >Description</label
          >
          <textarea
            id="description"
            v-model="formData.description"
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="status" class="block text-sm font-medium text-gray-700"
            >Status</label
          >
          <select
            id="status"
            v-model="formData.status"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <Button type="button" variant="secondary" @click="emit('close')"
          >Cancel</Button
        >
        <Button type="submit" :loading="updatePending">Update Contract</Button>
      </div>
    </form>
  </Modal>
</template>
