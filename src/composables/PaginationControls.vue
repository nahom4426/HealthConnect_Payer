<template>
  <div class="pagination-wrapper">
    <div class="pagination-controls">
      <!-- Previous Button -->
      <button
        class="pagination-button"
        :disabled="currentPage === 1 || pending"
        @click="previous"
      >
        &laquo;
      </button>

      <!-- Page Numbers -->
      <template v-if="totalPages <= 7">
        <button
          v-for="page in totalPages"
          :key="page"
          class="pagination-button"
          :class="{ active: page === currentPage }"
          :disabled="pending"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>
      </template>

      <template v-else>
        <!-- Always show first page -->
        <button
          class="pagination-button"
          :class="{ active: 1 === currentPage }"
          :disabled="pending"
          @click="goToPage(1)"
        >
          1
        </button>

        <!-- Dynamic middle pages -->
        <template v-if="currentPage < 4">
          <button
            v-for="page in range(2, 5)"
            :key="page"
            class="pagination-button"
            :class="{ active: page === currentPage }"
            :disabled="pending"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <span class="ellipsis">...</span>
        </template>

        <template v-else-if="currentPage > totalPages - 3">
          <span class="ellipsis">...</span>
          <button
            v-for="page in range(totalPages - 4, totalPages - 1)"
            :key="page"
            class="pagination-button"
            :class="{ active: page === currentPage }"
            :disabled="pending"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </template>

        <template v-else>
          <span class="ellipsis">...</span>
          <button
            v-for="page in [currentPage - 1, currentPage, currentPage + 1]"
            :key="page"
            class="pagination-button"
            :class="{ active: page === currentPage }"
            :disabled="pending"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <span class="ellipsis">...</span>
        </template>

        <!-- Always show last page -->
        <button
          class="pagination-button"
          :class="{ active: totalPages === currentPage }"
          :disabled="pending"
          @click="goToPage(totalPages)"
        >
          {{ totalPages }}
        </button>
      </template>

      <!-- Next Button -->
      <button
        class="pagination-button"
        :disabled="currentPage === totalPages || pending"
        @click="next"
      >
        &raquo;
      </button>
    </div>

    <div class="pagination-info">
      Page {{ currentPage }} of {{ totalPages }} ({{ totalItems }} items)
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  },
  pending: {
    type: Boolean,
    default: false
  },
  next: {
    type: Function,
    required: true
  },
  previous: {
    type: Function,
    required: true
  },
  goToPage: {
    type: Function,
    required: true
  }
});

// Helper function to generate number ranges
const range = (start: number, end: number) => {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};
</script>

<style scoped>
.pagination-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1.5rem;
  gap: 0.5rem;
}

.pagination-controls {
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
  padding: 0.5rem;
  max-width: 100%;
}

.pagination-button {
  min-width: 2.5rem;
  height: 2.5rem;
  padding: 0 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: white;
  color: #4a5568;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-button:hover:not(:disabled) {
  background-color: #f7fafc;
  border-color: #cbd5e0;
}

.pagination-button.active {
  background-color: #4299e1;
  color: white;
  border-color: #4299e1;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ellipsis {
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  color: #718096;
}

.pagination-info {
  color: #718096;
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .pagination-button {
    min-width: 2.25rem;
    height: 2.25rem;
    font-size: 0.875rem;
  }
}
</style>