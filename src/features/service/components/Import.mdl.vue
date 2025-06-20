<script setup>
import { ref, watch } from "vue";
import Button from "@/components/Button.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { useAuthStore } from "@/stores/auth";
import { toasted } from "@/utils/utils";
import { closeModal } from "@customizer/modal-x";
import { importServices } from "../api/serviceApi";
import { importDrug } from "../api/drugApi";
const props = defineProps({
  data: String,
});
const req = useApiRequest();
const auth = useAuthStore().auth?.user?.providerUuid;
const progress = ref(0);
const importing = ref(false);
const fileInput = ref();
const message = ref({ type: null, text: null });

const reset = () => {
  progress.value = 0;
  importing.value = false;
  message.value = { type: null, text: null };
  fileInput.value.value = "";
};

const importFile = (file) => {
  if (!file)
    return (message.value = { type: "error", text: "Please select a file" });

  reset();
  importing.value = true;
  if (props.data == "drug") {
    req.send(
      () =>
        importDrug({ providerUuid: auth }, file, {
          onUploadProgress: (e) =>
            (progress.value = e.total
              ? Math.round((e.loaded * 100) / e.total)
              : 0),
        }),
      (res) => {
        if (req?.success) {
          message.value = { type: "success", text: "Import completed!" };
          toasted.success("Drug imported");
          setTimeout(closeModal, 2000);
        } else {
          message.value = {
            type: "error",
            text: req.response.value?.message || "Import failed",
          };
        }
      }
    );
  } else {
    req.send(
      () =>
        importServices({ providerUuid: auth }, file, {
          onUploadProgress: (e) =>
            (progress.value = e.total
              ? Math.round((e.loaded * 100) / e.total)
              : 0),
        }),
      (res) => {
        if (req?.success) {
          message.value = { type: "success", text: "Import completed!" };
          toasted.success("Services imported");
          setTimeout(closeModal, 2000);
        } else {
          message.value = {
            type: "error",
            text: req.response.value?.message || "Import failed",
          };
        }
      }
    );
  }
};

const handleFile = (e) => {
  const file = e.target.files[0];
  const fd = new FormData();
  fd.append("file", file);
  if (!file) return;

  const validTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];
  if (!validTypes.includes(file.type)) {
    message.value = { type: "error", text: "Please upload Excel/CSV file" };
    return (e.target.value = "");
  }

  importFile(fd);
};
const triggerFileInput = () => {
  fileInput.value?.click();
};
const title = props.data === "drug" ? "Import Drug" : "Import Service";
</script>

<template>
  <div class="bg-black/50 min-h-full p-6 grid place-items-center">
    <NewFormParent
      size="xs"
      class="flex justify-center bg-white"
      :title="title"
    >
      <div class="p-4 w-full max-w-md">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Select File (Excel/CSV)</label
          >
          <input
            ref="fileInput"
            type="file"
            accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            :disabled="importing"
            @change="handleFile"
          />
        </div>

        <div
          v-if="message.text"
          :class="`mb-4 p-3 rounded-md ${
            message.type === 'error'
              ? 'bg-red-50 text-red-700'
              : 'bg-green-50 text-green-700'
          }`"
        >
          {{ message.text }}
        </div>

        <div v-if="importing" class="mb-4">
          <div class="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uploading...</span>
            <span>{{ progress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div
              class="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              :style="`width: ${progress}%`"
            ></div>
          </div>
        </div>

        <div class="text-xs text-gray-500 mt-2">
          Ensure your file follows the required format.
        </div>
      </div>

      <template #bottom>
        <div class="flex gap-3 justify-end items-center w-full p-4 border-t">
          <Button
            @click.prevent="closeModal"
            class="flex items-center border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
            size="md"
            :disabled="importing"
          >
            Cancel
          </Button>
          <Button
            v-if="!importing && message.type !== 'success'"
            @click.prevent="triggerFileInput"
            class="flex items-center bg-primary text-white font-medium hover:bg-primary/80"
            size="md"
          >
            Select File
          </Button>
        </div>
      </template>
    </NewFormParent>
  </div>
</template>
