<script setup lang="ts">
import { ref, watch } from 'vue';
import Button from '@/components/Button.vue';
import { useApiRequest } from '@/composables/useApiRequest';
import { getProviders } from '@/features/providers/api/providerApi';

const props = defineProps({
  initialValues: {
    type: Object,
    default: () => ({})
  },
  submitButtonText: {
    type: String,
    default: 'Submit'
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit']);

// Form values
const providerUuid = ref(props.initialValues?.providerUuid || '');
const providerName = ref(props.initialValues?.providerName || '');
const startDate = ref(props.initialValues?.startDate || '');
const endDate = ref(props.initialValues?.endDate || '');
const contractType = ref(props.initialValues?.contractType || '');
const description = ref(props.initialValues?.description || '');
const status = ref(props.initialValues?.status || 'ACTIVE');

// Providers list for dropdown
const providers = ref([]);
const providersReq = useApiRequest();

// Fetch providers for dropdown
function fetchProviders() {
  providersReq.send(
    () => getProviders({ status: 'ACTIVE' }),
    (res) => {
      if (res