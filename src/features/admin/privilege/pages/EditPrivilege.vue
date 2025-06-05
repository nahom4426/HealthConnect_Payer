<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useApiRequest } from '@/composables/useApiRequest';
import { getPrivilegeById, updatePrivilege } from '../Api/PrivilegeApi';
import NewFormParent from '../../role/components/NewFormParent.vue';
import PrivilegeForm from '../form/PrivilegeForm.vue';
import { usePrivilege } from '../store/privilegeStore';
import { ref, watch } from 'vue';
import { toasted } from '@/utils/utils.js';
import Button from '@/components/Button.vue';
import { useForm } from '@/components/new_form_builder/useForm';

const router = useRouter();
const { submit } = useForm('privilegeForm');
const privilegeStore = usePrivilege();
const route = useRoute();
const privilegeUuid = route.params.privilegeUuid;
const req = useApiRequest();
const updateReq = useApiRequest();

// Create form data object to track changes
const formData = ref({
    privilegeName: '',
    privilegeDescription: '',
    privilegeCategory: ''
});

const privilege = ref(
    privilegeStore.privilege.find((el) => el.privilegeUuid == privilegeUuid) || {}
);

// Load privilege data if not found in store
if (!Object.keys(privilege.value).length) {
    req.send(
        () => getPrivilegeById(privilegeUuid),
        (res) => {
            if (res.success) {
                privilege.value = res.data;
                // Initialize formData with current privilege values
                formData.value = {
                    privilegeName: res.data.privilegeName || '',
                    privilegeDescription: res.data.privilegeDescription || '',
                    privilegeCategory: res.data.privilegeCategory || ''
                };
                console.log('Privilege data loaded from API:', formData.value);
            }
        }
    );
} else {
    // Initialize formData with current privilege values
    formData.value = {
        privilegeName: privilege.value.privilegeName || '',
        privilegeDescription: privilege.value.privilegeDescription || '',
        privilegeCategory: privilege.value.privilegeCategory || ''
    };
    console.log('Privilege data loaded from store:', formData.value);
}

// Validate form data
function validateFormData(data) {
    const errors = [];
    
    // Check privilegeName (3-50 characters)
    if (!data.privilegeName) {
        errors.push('Privilege Name is required');
    } else if (data.privilegeName.length < 3 || data.privilegeName.length > 50) {
        errors.push('Privilege Name must be between 3 and 50 characters');
    }
    
    // Check privilegeDescription (3-255 characters)
    if (!data.privilegeDescription) {
        errors.push('Privilege Description is required');
    } else if (data.privilegeDescription.length < 3) {
        errors.push('Privilege Description must be at least 3 characters');
    }
    
    // Check privilegeCategory (3-50 characters)
    if (!data.privilegeCategory) {
        errors.push('Privilege Category is required');
    } else if (data.privilegeCategory.length < 3 || data.privilegeCategory.length > 50) {
        errors.push('Privilege Category must be between 3 and 50 characters');
    }
    
    return errors;
}

// Handle form input changes
function updateFormData(field, value) {
    formData.value[field] = value;
    console.log(`Updated ${field} to:`, value);
    console.log('Current formData:', formData.value);
}

function update({ values }) {
    console.log('Form values from submit:', values);
    
    // Use the values from the form submission instead of formData
    const payload = values;
    
    console.log('Payload being sent to API:', payload);
    
    // Validate the payload
    const validationErrors = validateFormData(payload);
    if (validationErrors.length > 0) {
        toasted(false, '', validationErrors.join('. '));
        return;
    }
    
    updateReq.send(
        () => updatePrivilege(privilegeUuid, payload),
        (res) => {
            if (res.success) {
                privilegeStore.update(privilegeUuid, { ...privilege.value, ...payload });
                router.push('/privileges');
                toasted(res.success, 'Successfully Updated', res.error);
            } else {
                toasted(false, '', res.error || 'Failed to update privilege');
            }
        }
    );
}

// Watch for changes in the privilege form data
watch(() => privilege.value, (newValue) => {
    if (newValue && Object.keys(newValue).length > 0) {
        formData.value = {
            privilegeName: newValue.privilegeName || '',
            privilegeDescription: newValue.privilegeDescription || '',
            privilegeCategory: newValue.privilegeCategory || ''
        };
        console.log('Privilege data updated from watch:', formData.value);
    }
}, { deep: true });

const goBack = () => {
    router.go(-1);
};
</script>
<template>
    <button @click.prevent="goBack">
        <div class="p-6 flex gap-2 item-center">
            <span class="item-center mt-1">
                <svg width="7" height="13" viewBox="0 0 7 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path opacity="0.6" fill-rule="evenodd" clip-rule="evenodd"
                        d="M5.82539 1.0134C6.03505 1.20471 6.05933 1.54072 5.87962 1.76391L2.15854 6.38525L5.87962 11.0066C6.05933 11.2298 6.03505 11.5658 5.82539 11.7571C5.61572 11.9484 5.30007 11.9226 5.12036 11.6994L1.12037 6.73164C0.959876 6.53232 0.959876 6.23819 1.12037 6.03887L5.12036 1.07113C5.30008 0.847943 5.61572 0.822096 5.82539 1.0134Z"
                        fill="#263558" stroke="#263558" stroke-linecap="round" />
                </svg>
            </span>
            <h3>Go Back</h3>
        </div>
    </button>
    <NewFormParent size="xl" title="Update Privileges">
        <!-- Use v-model with the form component -->
        <PrivilegeForm 
            :privilege="privilege" 
            @update:privilegeName="updateFormData('privilegeName', $event)"
            @update:privilegeDescription="updateFormData('privilegeDescription', $event)"
            @update:privilegeCategory="updateFormData('privilegeCategory', $event)"
        />
        
        <div class="mt-4 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p class="text-sm text-yellow-700">
                <strong>Note:</strong> All fields must be at least 3 characters long. Privilege Name and Category must be less than 50 characters.
            </p>
        </div>
        
        <!-- Debug info to verify form data -->
        <!-- <div v-if="process.env.NODE_ENV === 'development'" class="mt-4 px-4 py-3 bg-gray-100 border border-gray-200 rounded-md">
            <p class="text-sm font-bold">Current Form Data:</p>
            <pre class="text-xs mt-1">{{ JSON.stringify(formData, null, 2) }}</pre>
        </div>
         -->
        <Button 
            size="xl" 
            type="primary" 
            class="flex justify-center items-center mt-3 gap-3 p-2 bg-primary"
            :pending="updateReq.pending.value" 
            @click.prevent="submit(update)"
        >
            Update Privilege
        </Button>
    </NewFormParent>
</template>
