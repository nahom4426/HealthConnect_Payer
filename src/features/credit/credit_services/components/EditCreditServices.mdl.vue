<script setup lang="ts">
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import CreditServicesForm from "../form/editCreditServicesForm.vue";
import { closeModal } from "@customizer/modal-x";
import { toasted } from "@/utils/utils";
import { ref, onMounted, watch } from "vue";
import { updateCreditService, updateCreditDrug, getCreditServiceDetails } from "../api/creditServicesApi";
import { claimServices } from "../store/creditClaimsStore";
import { useAuthStore } from "@/stores/auth";

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

const auth = useAuthStore();
const claimServicesStore = claimServices();
const error = ref('');
const pending = ref(false);
const claimData = ref({});
const dispensingUuid = ref('');
const loading = ref(true);

async function fetchClaimDetails() {
  try {
    loading.value = true;
    if (!dispensingUuid.value) return;
    
    const response = await getCreditServiceDetails(dispensingUuid.value);
    if (response.success) {
      const data = response.data;
      
      // Map the API response to the form structure
      claimData.value = {
        payerUuid: data.payerUuid,
        payerName: data.payerName,
        insuredUuid: data.insuredUuid,
        dependantUuid: data.dependantUuid,
        phone: data.phone,
        patientName: data.patientName,
        employeeId: data.employeeId,
        dispensingDate: data.dispensingDate,
        prescriptionNumber: data.prescriptionNumber,
        pharmacyTransactionId: data.pharmacyTransactionId,
        primaryDiagnosis: data.primaryDiagnosis,
        secondaryDiagnosis: data.secondaryDiagnosis,
        type: data.type,
        // Map items based on type
        medicationItems: data.type === 'service' ? data.items.map(item => ({
          serviceUuid: item.serviceUuid,
          serviceName: item.name,
          serviceCode: item.code,
          paymentAmount: `ETB ${item.price.toFixed(2)}`,
          quantity: item.quantity,
          remark: item.remark,
          primaryDiagnosis: item.primaryDiagnosis,
          secondaryDiagnosis: item.secondaryDiagnosis
        })) : null,
        drugItems: data.type === 'drug' ? data.items.map(item => ({
          drugUuid: item.drugUuid,
          drugName: item.name,
          drugCode: item.code,
          price: item.price,
          quantity: item.quantity,
          route: item.route,
          frequency: item.frequency,
          dose: item.dose,
          duration: item.duration,
          remark: item.remark
        })) : null
      };
    } else {
      throw new Error(response.message || 'Failed to fetch claim details');
    }
  } catch (err) {
    console.error('Error fetching claim details:', err);
    error.value = err.message || 'Failed to load claim details';
    toasted(false, 'Error', error.value);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (props.data) {
    dispensingUuid.value = props.data.dispensingUuid || '';
    if (dispensingUuid.value) {
      fetchClaimDetails();
    }
  }
});

watch(() => props.data, (newData) => {
  if (newData) {
    dispensingUuid.value = newData.dispensingUuid || '';
    if (dispensingUuid.value) {
      fetchClaimDetails();
    }
  }
}, { deep: true });

  async function handleSubmit(formValues: any) {
 if (formValues && formValues.isTrusted) {
    console.error('Received raw event instead of form values!');
    return;
  }

  try {
    pending.value = true;
    error.value = '';

    // Debug: Verify what we're receiving
    console.log('Received form values:', formValues);

    if (!dispensingUuid.value) {
      throw new Error('Claim UUID is missing');
    }

    // Check if formValues is actually the form data
    if (!formValues || typeof formValues !== 'object' || Array.isArray(formValues)) {
      throw new Error('Invalid form data received');
    }

    // More robust validation
    const requiredFields = {
      payerUuid: 'Payer',
      dispensingDate: 'Dispensing Date',
      phone: 'Phone Number', 
      patientName: 'Patient Name',
      employeeId: 'Employee ID'
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([field]) => {
        const value = formValues[field];
        return value === undefined || value === null || value === '';
      })
      .map(([_, name]) => name);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Check we have either medicationItems or drugItems with at least one item
    const hasMedicationItems = formValues.medicationItems?.length > 0;
    const hasDrugItems = formValues.drugItems?.length > 0;
    
    if (!hasMedicationItems && !hasDrugItems) {
      throw new Error('Please add at least one service or drug item');
    }
    
    const isDependantClaim = !!formValues.dependantUuid;
    const commonPayload = {
      providerUuid: auth.auth?.user?.providerUuid || "",
      payerUuid: formValues.payerUuid,
      payerName: formValues.payerName,
      insuredUuid: isDependantClaim ? null : formValues.insuredUuid,
      dependantUuid: isDependantClaim ? formValues.dependantUuid : null,
      phone: formValues.phone,
      patientName: formValues.patientName,
      employeeId: formValues.employeeId,
      dispensingDate: formValues.dispensingDate,
      prescriptionNumber: formValues.prescriptionNumber || '',
      pharmacyTransactionId: formValues.pharmacyTransactionId || '',
      primaryDiagnosis: formValues.primaryDiagnosis || '',
      secondaryDiagnosis: formValues.secondaryDiagnosis || '',
      isDependant: isDependantClaim
    };

    let result;
    let updatedData;

    try {
      if (formValues.medicationItems) {
        // Handle service update
        const servicePayload = {
          ...commonPayload,
          medicationItems: formValues.medicationItems.map((item: any) => ({
            serviceUuid: item.serviceUuid,
            remark: item.remark || '',
            quantity: Number(item.quantity) || 1,
            paymentAmount: typeof item.paymentAmount === 'string' 
              ? parseFloat(item.paymentAmount.replace('ETB ', '')) || 0
              : Number(item.paymentAmount) || 0,
            primaryDiagnosis: formValues.primaryDiagnosis || '',
            secondaryDiagnosis: formValues.secondaryDiagnosis || ''
          }))
        };
        result = await updateCreditService(dispensingUuid.value, servicePayload);
      } else if (formValues.drugItems) {
        // Handle drug update
        const drugPayload = {
          ...commonPayload,
          drugItems: formValues.drugItems.map((item: any) => ({
            drugUuid: item.drugUuid,
            quantity: Number(item.quantity) || 1,
            totalPrice: (item.price || 0) * (Number(item.quantity) || 1),
            route: item.route || 'oral',
            frequency: item.frequency || 'daily',
            dose: item.dose || '1',
            duration: item.duration || '7 days',
            remark: item.remark || ''
          }))
        };
        result = await updateCreditDrug(dispensingUuid.value, drugPayload);
      } else {
        throw new Error('No items added - must have either services or drugs');
      }

      // Check if result exists and has success property
      if (!result) {
        throw new Error('No response received from server');
      }

      if (result.success) {
        // Prepare updated data
        updatedData = {
          ...commonPayload,
          invoiceNumber: result.data?.invoiceNumber || claimData.value.invoiceNumber,
          dispensingUuid: dispensingUuid.value,
          totalAmount: formValues.medicationItems 
            ? formValues.medicationItems.reduce((sum: number, item: any) => {
                const paymentAmount = typeof item.paymentAmount === 'string' 
                  ? parseFloat(item.paymentAmount.replace('ETB ', '')) || 0
                  : Number(item.paymentAmount) || 0;
                return sum + (paymentAmount * (Number(item.quantity) || 1));
              }, 0)
            : formValues.drugItems.reduce((sum: number, item: any) => 
                sum + ((item.price || 0) * (Number(item.quantity) || 1)), 0),
          items: formValues.medicationItems 
            ? formValues.medicationItems.map((item: any) => ({
                ...item,
                type: 'service',
                name: item.serviceName,
                code: item.serviceCode,
                price: typeof item.paymentAmount === 'string' 
                  ? parseFloat(item.paymentAmount.replace('ETB ', '')) || 0
                  : Number(item.paymentAmount) || 0,
                remark: item.remark || ''
              }))
            : formValues.drugItems.map((item: any) => ({
                ...item,
                type: 'drug',
                name: item.drugName,
                code: item.drugCode,
                price: item.price || 0
              }))
        };

        // Update store with new data
        claimServicesStore.update(dispensingUuid.value, updatedData);

        toasted(true, 'Success', 'Claim updated successfully');
        
        if (props.data.onUpdated && typeof props.data.onUpdated === 'function') {
          props.data.onUpdated(updatedData);
        }

        // Only close modal on success
        closeModal();
      } else {
        throw new Error(result.message || result.data?.message || 'Update failed without error message');
      }
    } catch (apiError: any) {
      if (apiError.response?.status === 401) {
        // Special handling for 401 - show toast but keep modal open
        toasted(false, 'Error', 'Full authentication is required to access this resource');
        return; // Exit early to prevent modal from closing
      }
      throw apiError; // Re-throw other errors
    }
  } catch (error: any) {
    console.error('Update error:', error);
    const errorMessage = error.response?.data?.message || 
                       error.message || 
                       'Failed to update claim';
    error.value = errorMessage;
    toasted(false, 'Error', errorMessage);
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <ModalParent>
    <NewFormParent 
      class="" 
      size="xl" 
      :title="`Edit Credit ${claimData.type === 'service' ? 'Service' : 'Drug'}`" 
      :subtitle="`Update the credit ${claimData.type === 'service' ? 'service' : 'drug'} information below.`"
    >
      <div class="bg-white rounded-lg">
        <div v-if="error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {{ error }}
        </div>
        
        <div v-if="loading" class="p-4 mb-4 text-sm text-blue-700 bg-blue-100 rounded-lg flex items-center gap-2">
         <Spinner class="h-5 w-5 text-blue-500 animate-spin" />
          Loading claim details...
        </div>
        
       <!-- In your template where you call handleSubmit -->
            <CreditServicesForm
              v-else-if="!loading && Object.keys(claimData).length > 0"
              :initial-data="claimData"
              :is-edit="true"
              :pending="pending"
              :dispensing-uuid="dispensingUuid"
              @submit="handleSubmit" 
              @cancel="closeModal"     
            />
      </div>
    </NewFormParent>
  </ModalParent>
</template>

<style scoped>
/* Additional styling if needed */
</style>