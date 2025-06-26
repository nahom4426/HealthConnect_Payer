<script setup>
import { ref, watch } from "vue";
import Button from "@/components/Button.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import ModalParent from "@/components/ModalParent.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { useAuthStore } from "@/stores/auth";
import { toasted } from "@/utils/utils";
import { closeModal } from "@customizer/modal-x";
import { importInsuredPersons } from "../api/insuredPersonsApi";

const props = defineProps({
  data: String,
});

const req = useApiRequest();
const auth = useAuthStore().auth?.user?.payerUuid;
const progress = ref(0);
const importing = ref(false);
const fileInput = ref();
const message = ref({ type: null, text: null });
const selectedFile = ref(null);
const fileName = ref("");

const reset = () => {
  progress.value = 0;
  importing.value = false;
  message.value = { type: null, text: null };
  selectedFile.value = null;
  fileName.value = "";
};

const importFile = () => {
  if (!selectedFile.value) {
    message.value = { type: "error", text: "Please select a file" };
    return;
  }

  importing.value = true;

  const fd = new FormData();
  fd.append("file", selectedFile.value);

  const successMessage = props.data === "drug" ? "Drug imported" : "Services imported";

  req.send(
    () =>
      importInsuredPersons({ payerUuid: auth }, fd, {
        onUploadProgress: (e) =>
          (progress.value = e.total
            ? Math.round((e.loaded * 100) / e.total)
            : 0),
      }),
    () => {
      if (req?.success) {
        message.value = { type: "success", text: "Import completed!" };
        toasted.success(successMessage);

        setTimeout(() => {
          closeModal(); // ✅ closes the modal
          reset();      // ✅ resets the state
        }, 1500); // 1.5s delay for smooth user experience
      } else {
        message.value = {
          type: "error",
          text: req.response.value?.message || "Import failed",
        };
        importing.value = false;
      }
    }
  );
};

const handleFile = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const validTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];
  
  if (!validTypes.includes(file.type)) {
    message.value = { type: "error", text: "Please upload Excel/CSV file" };
    return;
  }

  selectedFile.value = file;
  fileName.value = file.name;
  message.value = { type: null, text: null };
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const removeFile = () => {
  reset();
  fileInput.value.value = "";
};

const title = props.data === "dependant" ? "Import dependant Data" : "Import Employee Data";
</script>

<template>
  <div class="bg-black/50 min-h-full p-6 grid place-items-center">
    <ModalParent>
    <NewFormParent
      size="mdd"
      class="flex justify-center bg-white rounded-lg shadow-xl"
      :title="title"
    >
      <div class="p-6 w-full  justify-center  items-center">
        <div class="mb-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <h2 class="mt-2 text-lg font-semibold text-gray-800">{{ title }}</h2>
          <p class="mt-1 text-sm text-gray-500">Upload your Excel or CSV file</p>
        </div>

        <div class="mb-4">]
          <div 
            @click="triggerFileInput"
            class="w-full border-2 max-w-md mx-20 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors duration-200"
            :class="{'border-blue-400': selectedFile}"
          >
            <template v-if="!selectedFile">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p class="mt-2 text-sm text-gray-600">Click to select file</p>
              <p class="text-xs text-gray-500 mt-1">Excel or CSV files only</p>
            </template>
            <template v-else>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="mt-2 text-sm font-medium text-gray-700 truncate">{{ fileName }}</p>
              <button 
                @click.stop="removeFile"
                class="mt-2 text-xs text-red-500 hover:text-red-700"
              >
                Remove file
              </button>
            </template>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            class="hidden"
            @change="handleFile"
          />
        </div>

        <div
          v-if="message.text"
          class="mb-4 p-3 rounded-md text-sm"
          :class="{
            'bg-red-50 text-red-700': message.type === 'error',
            'bg-green-50 text-green-700': message.type === 'success',
            'bg-blue-50 text-blue-700': !message.type
          }"
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

        <div class="text-xs text-gray-500 mt-4 text-center">
          <p>Ensure your file follows the required format.</p>
          <p class="mt-1">Max file size: 5MB</p>
        </div>
      </div>

      <template #bottom>
        <div class="flex gap-3 justify-between items-center w-full p-4 border-t">
          <Button
            @click.prevent="closeModal"
            class="flex items-center border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
            size="md"
           
          >
            Cancel
          </Button>
          <div class="flex gap-3">
            <Button
              v-if="selectedFile && !importing && message.type !== 'success'"
              @click.prevent="removeFile"
              class="flex items-center border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              size="md"
            >
              Change File
            </Button>
            <Button
              v-if="selectedFile && !importing && message.type !== 'success'"
              @click.prevent="importFile"
              class="flex items-center bg-blue-600 text-white font-medium hover:bg-blue-700"
              size="md"
            >
              Import Now
            </Button>
          </div>
        </div>
      </template>
    </NewFormParent>
    </ModalParent>
  </div>
</template>