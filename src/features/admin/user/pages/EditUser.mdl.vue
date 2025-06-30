<script setup lang="ts">
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import UserForm from "./UserForm.vue";
import Button from "@/components/Button.vue";
import { closeModal } from "@customizer/modal-x";
import { toasted } from "@/utils/utils";
import { ref, onMounted, watch } from "vue";
import { updateUserById } from "../Api/UserApi";
import { useUsers } from "../store/userStore";

// In modal-x, props are passed via the 'data' prop
const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

// Initialize the users store
const usersStore = useUsers();

const error = ref('');
const pending = ref(false);
const userData = ref({});
const userUuid = ref('');

onMounted(() => {
  
  if (props.data) {
    userUuid.value = props.data.userUuid || '';
    userData.value = props.data.user || {};
    
 
  }
});

watch(() => props.data, (newData) => {
  if (newData) {
    userUuid.value = newData.userUuid || '';
    userData.value = newData.user || {};
  }
}, { deep: true });

async function handleSubmit(formValues: any) {
  try {
    pending.value = true;
    error.value = '';

    if (!userUuid.value) {
      throw new Error('User UUID is missing');
    }

    const userPayload = {
      email: formValues.email,
      password: formValues.password || undefined,
      title: formValues.title,
      firstName: formValues.firstName,
      fatherName: formValues.fatherName,
      grandFatherName: formValues.grandFatherName,
      gender: formValues.gender,
      mobilePhone: formValues.mobilePhone,
      roleUuid: formValues.roleUuid,
      userUuid: userUuid.value
    };

    const result = await updateUserById(userUuid.value, userPayload);

    const isSuccess = result && (result.success || result.status === 200 || result.status === 'success');

    if (isSuccess) {
      const updatedUser = {
        ...userData.value,
        ...formValues,
        userUuid: userUuid.value
      };

      // Update the store
      usersStore.update(userUuid.value, updatedUser);
      toasted(true, 'User updated successfully');

      // Call the onUpdated callback if provided
      if (props.data.onUpdated && typeof props.data.onUpdated === 'function') {
        props.data.onUpdated(updatedUser);
      }

      closeModal();
    } else {
      throw new Error(result?.error || 'Failed to update user');
    }
  } catch (err) {
    error.value = err.message || 'An error occurred while updating user';
    toasted(false, 'Failed to update user', error.value);
  } finally {
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
          :pending="pending"
          :onSubmit="handleSubmit"
          :onCancel="() => closeModal()"
          :roles="data.roles || []"
        />
      </div>
    </NewFormParent>
  </ModalParent>
</template>

<style scoped>
/* Additional styling if needed */
</style>