<script setup lang="ts">
import Form from "@/components/new_form_builder/Form.vue";
import Input from "@/components/new_form_elements/Input.vue";
import Select from "@/components/new_form_elements/Select.vue";
import { useAuthStore } from "@/stores/auth";
const authStore = useAuthStore();
</script>

<template>
  <div>
    <Form class="space-y-6" id="ProfileForm" :inner="false">
      <div
        class="border border-base-clr/20 grid grid-cols-2 gap-6 rounded-md p-5"
      >
        <Input
          label="First Name"
          validation="required"
          :value="authStore.auth?.user?.firstName"
          name="firstName"
          
        />
        <Input
          label="Father’s Name"
          :value="authStore.auth?.user?.fatherName"
          validation="required"
          name="fatherName"
        /><Input
          label="Grandfather’s Name"
          :value="authStore.auth?.user?.grandFatherName"
          validation="required"
          name="grandFatherName"
        />
        <Select label="Gender"
            name="gender"
            :options="['MALE','FEMALE']"
            :attributes="{
                type:'text',
                placeholder:'Enter Your Gender'
            }"
            :value="authStore.auth?.user?.gender"

            />
      </div>
      <div
        class="border border-base-clr/20 grid grid-cols-2 gap-6 rounded-md p-5"
      >
        <Input
          label="Phone Number"
          :value="authStore.auth?.user?.mobilePhone"
          validation="required"
          name="phone"
        />
        <Input
          label="Email"
          :value="authStore.auth?.user?.email"
          validation="required"
          name="birthDate"
        />
      </div>
    </Form>
  </div>
</template>
