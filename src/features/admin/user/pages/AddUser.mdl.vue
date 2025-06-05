<script setup lang="ts">
import Button from '@/components/Button.vue';
import Input from '@/components/new_form_elements/Input.vue';
import InputPassword from '@/components/new_form_elements/InputPassword.vue';
import Select from '@/components/new_form_elements/Select.vue';
import NewFormParent from '../../role/components/NewFormParent.vue';
import { closeModal } from '@customizer/modal-x';
import { useApiRequest } from '@/composables/useApiRequest';
import { CreateUser } from '../Api/UserApi';
import { useUsers } from '../store/userStore';
import { allRequest, toasted } from '@/utils/utils';
import { getAllRole } from '../../role/Api/RoleApi';
import { useForm } from '@/components/new_form_builder/useForm';
import Form from '@/components/new_form_builder/Form.vue';
import { useRouter } from 'vue-router';
import { ref, computed } from 'vue';

const router = useRouter();
const { submit } = useForm('addform');
const user = useUsers();
const req = useApiRequest();
const rolereq = useApiRequest();
const roles = ref([]);
const formData = ref({
    email: '',
    password: '',
    title: '',
    firstName: '',
    fatherName: '',
    grandFatherName: '',
    gender: '',
    mobilePhone: '',
    roleUuid: ''
});

// Fetch roles
rolereq.send(() => getAllRole({ page: 1, limit: 500 }), (response) => {
    console.log("Roles response:", response);
    if (response && response.success && Array.isArray(response.data)) {
        roles.value = response.data;
        console.log("Roles set:", roles.value);
    }
});

// Create a computed property for role options
const roleOptions = computed(() => {
    console.log("Computing role options from:", roles.value);
    if (!roles.value || !Array.isArray(roles.value) || roles.value.length === 0) {
        return [];
    }
    
    // Map the roles to the format expected by the Select component
    return roles.value.map(role => ({
        label: role.roleName,
        value: role.roleUuid
    }));
});

function create({ values }) {
    console.log("Form values:", values); // Log the submitted values
    
    // Ensure all form fields are included
    const userData = {
        ...formData.value,
        ...values
    };
    
    console.log("Complete user data:", userData);
    
    // Show loading state
    req.pending.value = true;
    
    // Call the API
    CreateUser(userData)
        .then(res => {
            console.log("API response:", res);
            req.pending.value = false;
            
            if (res.success) {
                user.add(res.data);
                router.push('/Users');
                closeModal();
                toasted(true, 'User Created');
            } else {
                // Don't show a toast here, as responseHandler already shows one
                console.error("Error creating user:", res.error);
            }
        })
        .catch(error => {
            req.pending.value = false;
            // Don't show a toast here, as the API service already shows one
            console.error("Exception creating user:", error);
        });
}

// Update form data when inputs change
function updateFormData(field, value) {
    formData.value[field] = value;
}
</script>

<template>
    <div class="bg-black/50 min-h-full p-10 grid place-items-center">
        <NewFormParent title="Add User" size="lg">
            <Form :inner='false' class="grid grid-cols-3 gap-5 mt-3 p-6" id="addform">
                <Input 
                    name="email" 
                    validation="required|email" 
                    label="Email" 
                    :attributes="{
                        placeholder: 'Enter User Email',
                    }"
                    v-model="formData.email"
                    @update:modelValue="updateFormData('email', $event)"
                />
                <InputPassword 
                    name="password" 
                    label="Password" 
                    validation="required"
                    :attributes="{ placeholder: 'Password', autocomplete: 'new-password' }"
                    v-model="formData.password"
                    @update:modelValue="updateFormData('password', $event)"
                />
                <Select 
                    name="title" 
                    label="Title" 
                    validation="required" 
                    :options="['Mr', 'Ms.', 'Dr.', 'Prof']"
                    :attributes="{
                        type: 'text',
                        placeholder: 'Title',
                    }"
                    v-model="formData.title"
                    @update:modelValue="updateFormData('title', $event)"
                >
                </Select>
                <Input 
                    name="firstName" 
                    validation="required|alpha" 
                    label="First Name" 
                    :attributes="{
                        placeholder: 'Enter firstname',
                    }"
                    v-model="formData.firstName"
                    @update:modelValue="updateFormData('firstName', $event)"
                />
                <Input 
                    name="fatherName" 
                    validation="required|alpha" 
                    label="Father Name" 
                    :attributes="{
                        placeholder: 'Enter fathername',
                    }"
                    v-model="formData.fatherName"
                    @update:modelValue="updateFormData('fatherName', $event)"
                />
                <Input 
                    name="grandFatherName" 
                    validation="required|alpha" 
                    label="Grandfather Name" 
                    :attributes="{
                        placeholder: 'Enter grandfathername',
                    }"
                    v-model="formData.grandFatherName"
                    @update:modelValue="updateFormData('grandFatherName', $event)"
                />
                <Select 
                    name="gender" 
                    label="Gender" 
                    validation="required" 
                    :options="['Female', 'Male']" 
                    :attributes="{
                        type: 'text',
                        placeholder: 'select gender',
                    }"
                    v-model="formData.gender"
                    @update:modelValue="updateFormData('gender', $event)"
                >
                </Select>

                <Input 
                    name="mobilePhone" 
                    label="Mobile Phone" 
                    validation="required|phone" 
                    :attributes="{
                        placeholder: 'mobile phone',
                    }"
                    v-model="formData.mobilePhone"
                    @update:modelValue="updateFormData('mobilePhone', $event)"
                />
                <Select 
                    :obj="true" 
                    name="roleUuid" 
                    label="Role" 
                    validation="required"
                    :options="roleOptions"
                    :attributes="{
                        placeholder: 'Select Role',
                    }"
                    v-model="formData.roleUuid"
                    @update:modelValue="updateFormData('roleUuid', $event)"
                >
                </Select>
            </Form>
            <template #bottom>
                <div class="p-2">
                    <Button type="primary" :pending="req.pending.value" @click.prevent="submit(create)" class="w-full">
                        Add User
                    </Button>
                </div>
            </template>
        </NewFormParent>
    </div>
</template>
