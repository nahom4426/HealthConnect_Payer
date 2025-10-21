<script setup>
import { ref, watch } from 'vue';
import { toasted } from '@/utils/utils';

const props = defineProps({
  previews: { type: Array, default: () => [] }
});
const emit = defineEmits(['update:previews']);

const isDragOver = ref(false);

function updatePreviews(newVal) {
  emit('update:previews', newVal);
}

function handleFileDragOver(event) {
  event.preventDefault();
  isDragOver.value = true;
}
function handleFileDragLeave(event) {
  event.preventDefault();
  const rect = event.currentTarget.getBoundingClientRect();
  if (
    event.clientX <= rect.left ||
    event.clientX >= rect.right ||
    event.clientY <= rect.top ||
    event.clientY >= rect.bottom
  ) {
    isDragOver.value = false;
  }
}
function handleFileDrop(event) {
  event.preventDefault();
  isDragOver.value = false;
  const files = Array.from(event.dataTransfer?.files || []);
  if (files.length > 0) processFiles(files);
}
function handleInputChange(event) {
  const files = Array.from(event.target.files || []);
  if (files.length > 0) processFiles(files);
  event.target.value = '';
}
function triggerBrowse() {
  const input = document.getElementById('medical-service-file-upload');
  if (input) input.click();
}
function removeFile(index) {
  const next = [...props.previews];
  next.splice(index, 1);
  updatePreviews(next);
}
function getFileTypeIcon(fileType) {
  if (fileType.startsWith('image/')) return '🖼️ Image';
  if (fileType === 'application/pdf') return '📄 PDF';
  if (fileType.includes('word')) return '📝 Document';
  if (fileType.includes('excel') || fileType.includes('sheet')) return '📊 Spreadsheet';
  return '📁 File';
}
function processFiles(files) {
  const validTypes = [
    'image/jpeg','image/png','image/gif','image/webp',
    'application/pdf',
    'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  const validFiles = files.filter(file => {
    if (file.size > 5 * 1024 * 1024) {
      toasted(false, 'File Too Large', `${file.name} exceeds 5MB limit`);
      return false;
    }
    if (!validTypes.includes(file.type)) {
      toasted(false, 'Invalid File Type', `${file.name} is not a supported format`);
      return false;
    }
    return true;
  });
  if (!validFiles.length) return;

  const next = [...props.previews];
  validFiles.forEach(file => {
    const preview = { name: file.name, type: file.type, file, preview: '' };
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => {
        preview.preview = e.target?.result || '';
        updatePreviews([...next, preview]);
      };
      reader.onerror = () => updatePreviews([...next, preview]);
      reader.readAsDataURL(file);
    } else {
      next.push(preview);
      updatePreviews(next);
    }
  });
}
</script>

<template>
  <div class="space-y-2 mt-4 h-full">
    <label class="block text-sm font-medium text-gray-700">Medical Service Files</label>

    <div
      @dragover.prevent="handleFileDragOver"
      @dragleave.prevent="handleFileDragLeave"
      @drop.prevent="handleFileDrop"
      class="border border-gray-200 bg-white border-dashed rounded-md items-center justify-center p-4 md:p-5 flex flex-col cursor-pointer hover:border-primary transition-colors duration-200 min-h-[8.5rem] md:min-h-[9.5rem]"
      :class="{ 'border-primary': isDragOver }"
    >
      <div v-if="previews.length" class="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
        <div v-for="(file, index) in previews" :key="index" class="relative border rounded-md p-2 bg-white">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium truncate max-w-[120px]">{{ file.name }}</span>
            <button type="button" @click.stop="removeFile(index)" class="text-red-500 hover:text-red-700 text-sm font-bold">×</button>
          </div>
          <img v-if="file.type.startsWith('image/') && file.preview" :src="file.preview" alt="Preview" class="h-20 w-full object-contain mx-auto" />
          <div v-else class="flex items-center justify-center h-16 md:h-20 bg-gray-100 rounded">
            <span class="text-xs text-gray-500">{{ getFileTypeIcon(file.type) }}</span>
          </div>
        </div>
      </div>

      <div class="text-center">
        <template v-if="!previews.length">
          <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <p class="text-xs md:text-sm text-[#75778B] mt-2">Drag your files here to upload</p>
          <p class="text-xs md:text-sm text-[#75778B] mt-1">or</p>
        </template>
        <button type="button" @click="triggerBrowse" class="mt-2 px-4 py-2 text-sm font-medium text-[#75778B] border border-[#75778B] rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          {{ previews.length ? 'Add More Files' : 'Browse Files' }}
        </button>
        <p v-if="previews.length" class="text-xs text-gray-500 mt-2">{{ previews.length }} file(s) selected</p>
      </div>

      <input id="medical-service-file-upload" type="file" accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx" multiple class="hidden" @change="handleInputChange" />
    </div>

    <p class="text-xs text-gray-500">Supported formats: images, PDF, Word, Excel. Max file size: 5MB each.</p>
  </div>
</template>
