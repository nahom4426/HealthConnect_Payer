<!-- AddCreditServices.vue (page component) -->
<script setup>
import CreditServicesForm from "../form/creditServicesForm.vue";
import { useApiRequest } from "@/composables/useApiRequest";
import { claimServices } from "../store/creditClaimsStore";
import { toasted } from "@/utils/utils";
import { createCreditService } from "../api/creditServicesApi";
import { useRouter } from "vue-router";
import Button from "@/components/Button.vue";
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import creditServicesFormDataProvider from "../form/creditServicesFormDataProvider.vue";

const req = useApiRequest();
const claimServicesStore = claimServices();
const router = useRouter();
const auth = useAuthStore();
const formDataProvider = ref();
const formRef = ref();

async function handleSubmit(values) {
  try {
    console.log('Form values received:', values);
    
    // Validate required fields
    if (!values.dispensingDate || 
        (!values.insuredUuid && !values.dependantUuid)) {
      throw new Error('Please fill all required fields');
    }

    if (!values.medicationItems || values.medicationItems.length === 0) {
      throw new Error('Please add at least one medication item');
    }

    // Build the payload according to the API specification
    const payload = {
      contractHeaderUuid: values.contractHeaderUuid,
      insuredUuid: values.insuredUuid,
      dependantUuid: values.dependantUuid || null,
      primaryDiagnosis: values.primaryDiagnosis || '',
      secondaryDiagnosis: values.secondaryDiagnosis || '',
      isInsurance: values.isInsurance || false,
      packageUuid: values.isInsurance ? values.packageUuid : null,
      dispensingDate: values.dispensingDate,
      medicationItems: values.medicationItems.map(item => {
        console.log('Processing medication item:', item);
        
        // For insurance claims, use serviceId from packageEligibleServices
        // For non-insurance claims, use contractDetailUuid from contract services
        const medicationItem = {
          itemType: item.itemType || 'SERVICE',
          remark: item.remark || '',
          price: item.price || 
                (item.itemType === 'SERVICE' 
                  ? (typeof item.paymentAmount === 'string' 
                      ? parseFloat(item.paymentAmount.replace('ETB ', '')) || 0
                      : Number(item.paymentAmount) || 0)
                  : item.price || 0),
          quantity: Number(item.quantity) || 1
        };

        // Add the correct identifier based on insurance type
        if (values.isInsurance) {
          // For insurance claims, use serviceId from packageEligibleServices
          medicationItem.serviceId = item.serviceId || item.eligibleServiceUuid;
          medicationItem.contractDetailUuid = item.contractDetailUuid || item.eligibleServiceUuid;
        } else {
          // For non-insurance claims, use contractDetailUuid from contract services
          medicationItem.contractDetailUuid = item.contractDetailUuid;
        }

        // Add drug-specific fields if it's a drug
        if (item.itemType === 'DRUG') {
          medicationItem.route = item.route || 'oral';
          medicationItem.frequency = item.frequency || 'daily';
          medicationItem.dose = item.dose || '1';
          medicationItem.duration = item.duration || '7 days';
        }

        return medicationItem;
      })
    };

    console.log('Final payload:', payload);

    const result = await createCreditService(payload);

    if (result.success) {
      const storeData = {
        ...payload,
        invoiceNumber: result.data?.invoiceNumber || `TEMP-${Date.now()}`,
        dispensingUuid: result.data?.dispensingUuid || `TEMP-${Date.now()}`,
        totalAmount: payload.medicationItems.reduce((sum, item) => 
          sum + ((item.price || 0) * (Number(item.quantity) || 1)), 0),
        patientResponsibility: 0,
        insuranceCoverage: 0,
        branchName: null,
        createdAt: new Date().toISOString(),
        items: payload.medicationItems.map(item => ({
          ...item,
          name: item.itemType === 'SERVICE' ? item.serviceName : item.drugName,
          code: item.itemType === 'SERVICE' ? item.serviceCode : item.drugCode,
        }))
      };

      claimServicesStore.add(storeData);
      toasted(true, 'Success', result.data?.message || 'Credit claim added successfully');
      router.push('/credit_services');
    } else {
      throw new Error(result.data?.message || 'Submission failed');
    }
  } catch (error) {
    console.error('Submission error:', error);
    const errorMessage = error.response?.data?.message || 
                       error.message || 
                       'Failed to process credit request';
    toasted(false, 'Error', errorMessage);
  }
}

function submitForm() {
  if (formRef.value) {
    formRef.value.submit();
  }
}
</script>

<template>
  <div class="bg-white p-4 rounded-xl space-y-6 box-border">
    <!-- <h1 class="border-b font-semibold p-4">Eligibility Check</h1> -->
    
    <div class="bg-white rounded-lg">
      <creditServicesFormDataProvider ref="formDataProvider">
        <template #default="{ pending: dataProviderPending }">
          <CreditServicesForm
            ref="formRef"
            :pending="req.pending.value || dataProviderPending"
            @submit="handleSubmit"
          />
        </template>
      </creditServicesFormDataProvider>
    </div>

    <div class="mt-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-md">
      <p class="text-sm text-blue-700">
        <strong>Note:</strong> Please ensure all required fields are filled and medication items are added before submission.
      </p>
    </div>

    <!-- <Button
      size="md"
      class="flex justify-center w-full items-center mt-3 gap-3 box-border text-white bg-primary"
      :pending="req.pending.value"
      @click="submitForm"
    >
      Submit Credit Claim
    </Button> -->
  </div>
</template>
