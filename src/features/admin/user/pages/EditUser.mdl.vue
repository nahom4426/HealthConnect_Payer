<script setup lang="ts">
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import UserForm from "./UserForm.vue";
import { closeModal } from "@customizer/modal-x";
import { ref, onMounted } from "vue";
import { updateUserById, getUserById } from "../Api/UserApi";
import { useUsers } from "../store/userStore";
import { useApiRequest } from "@/composables/useApiRequest";
import { useToast } from '@/toast/store/toast';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
});

const userUuid = ref(props.data?.userUuid || '');
const userData = ref(props.data?.user || {});
const pending = ref(false);
const error = ref('');
const userStore = useUsers();
const { addToast } = useToast();
const req = useApiRequest();

onMounted(async () => {
  console.log('EditUser modal received data:', props.data);
  
  if (userUuid.value && (!userData.value || Object.keys(userData.value).length === 0)) {
    await fetchUserData();
  }
});

async function fetchUserData() {
  try {
    pending.value = true;
    
    req.send(
      () => getUserById(userUuid.value),
      (res) => {
        if (res.success) {
          userData.value = res.data;
          console.log('Fetched user data:', userData.value);
        } else {
          error.value = res.error || 'Failed to fetch user data';
          addToast({
            type: 'error',
            title: 'Error',
            message: error.value
          });
        }
        pending.value = false;
      }
    );
  } catch (err) {
    error.value = err.message || 'An error occurred while fetching user data';
    addToast({
      type: 'error',
      title: 'Error',
      message: error.value
    });
    pending.value = false;
  }
}

async function handleSubmit(formValues) {
  try {
    pending.value = true;
    console.log('Form submitted with values:', formValues);
    
    // Format the gender to lowercase for the API if needed
    const userPayload = {
      ...formValues,
      gender: formValues.gender?.toLowerCase(), // Convert to lowercase for API
    };
    
    console.log('Sending user payload:', userPayload);
    
    req.send(
      () => updateUserById(userUuid.value, userPayload),
      (res) => {
        if (res.success) {
          const updatedUser = {
            ...userData.value,
            ...formValues,
            userUuid: userUuid.value,
            // Preserve the original roleName
            roleName: userData.value.roleName
          };
          
          // Update the store
          userStore.update(userUuid.value, updatedUser);
          
          addToast({
            type: 'success',
            title: 'Success',
            message: 'User updated successfully'
          });
          
          // Call the onUpdated callback if provided
          if (props.data.onUpdated && typeof props.data.onUpdated === 'function') {
            props.data.onUpdated(updatedUser);
          }
          
          closeModal();
        } else {
          error.value = res.error || 'Failed to update user';
          addToast({
            type: 'error',
            title: 'Error',
            message: error.value
          });
        }
        pending.value = false;
      }
    );
  } catch (err) {
    error.value = err.message || 'An error occurred while updating user';
    addToast({
      type: 'error',
      title: 'Error',
      message: error.value
    });
    pending.value = false;
  }
}
</script>

<template>
  <ModalParent>
    <NewFormParent 
      class="" 
      size="lg" 
      title="Edit User" 
      subtitle="Update the user information in the fields below."
    >
      <div class="bg-white rounded-lg">
        <div v-if="error" class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {{ error }}
        </div>
        
        <div v-if="!userUuid || Object.keys(userData).length === 0" class="p-4 mb-4 text-sm text-yellow-700 bg-yellow-100 rounded-lg">
          Loading user data...
        </div>
        
        <UserForm
          v-else
          :initial-data="userData"
          :is-edit="true"
          :pending="pending || req.pending.value"
          :onSubmit="handleSubmit"
          :onCancel="() => closeModal()"
        />
      </div>
    </NewFormParent>
  </ModalParent>
</template>

<style scoped>
/* Additional styling if needed */
</style>
