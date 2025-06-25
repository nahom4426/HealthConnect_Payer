<script setup lang="ts">
import ModalParent from "@/components/ModalParent.vue";
import NewFormParent from "@/components/NewFormParent.vue";
import UserForm from "./UserForm.vue";
import { useRouter } from 'vue-router';
import { closeModal } from "@customizer/modal-x";
import { toasted } from "@/utils/utils";
import { ref } from "vue";
import { CreateUser } from '../Api/UserApi';
import { useUsers } from '../store/userStore';

const userStore = useUsers();
const router = useRouter();
const formPending = ref(false);

async function handleSubmit(formValues: any) {
  try {
    formPending.value = true;
    
    const userData = {
      email: formValues.email,
      password: formValues.password,
      title: formValues.title,
      firstName: formValues.firstName,
      fatherName: formValues.fatherName,
      grandFatherName: formValues.grandFatherName,
      gender: formValues.gender,
      mobilePhone: formValues.mobilePhone,
      roleUuid: formValues.roleUuid
    };

    const result = await CreateUser(userData);

    if (result.success) {
      userStore.add(result.data);
      toasted(true, 'User created successfully');
      closeModal();
      router.push('/Users');
    } else {
      throw new Error(result.error || 'Failed to create user');
    }
  } catch (error: any) {
    console.error('User creation error:', error);
    toasted(false, 'Error', error.message || 'Failed to create user');
  } finally {
    formPending.value = false;
  }
}
</script>

<template>
  <ModalParent>
    <NewFormParent 
      class="" 
      size="lg" 
      title="Add User" 
      subtitle="To add a new user, please fill out the information in the fields below."
    >
      <UserForm
        :pending="formPending"
        :onSubmit="handleSubmit"
        :onCancel="() => closeModal()"
      />
    </NewFormParent>
  </ModalParent>
</template>