
<script setup>
import Input from '@/components/new_form_elements/Input.vue';
import InputPassword from '@/components/new_form_elements/InputPassword.vue';
import Select from '@/components/new_form_elements/Select.vue';
import { useApiRequest } from '@/composables/useApiRequest';
import { getAllRole } from '../../role/Api/RoleApi';
import Form from '@/components/new_form_builder/Form.vue';
import { ref, onMounted, computed, watch } from 'vue';

const props = defineProps({
    roles: {
        type: Array,
        default: () => []
    },
    user: {
        type: Object,
        default: () => ({})
    }
});

// Create a computed property to format roles for the dropdown
const roleOptions = computed(() => {
    if (!props.roles || !Array.isArray(props.roles) || props.roles.length === 0) {
        console.warn('Roles is empty or not an array:', props.roles);
        return [];
    }
    
    // Map roles to the format expected by the Select component
    return props.roles.map(role => ({
        label: role.roleName,
        value: role.roleUuid
    }));
});

// Create a computed property for the user's role UUID
const userRoleUuid = computed(() => {
    // Find the role UUID based on the roleName
    if (props.user && props.user.roleName && props.roles && props.roles.length > 0) {
        const matchingRole = props.roles.find(role => 
            role.roleName && props.user.roleName && 
            role.roleName.toLowerCase() === props.user.roleName.toLowerCase()
        );
        
        if (matchingRole) {
            console.log('Found matching role:', matchingRole);
            return matchingRole.roleUuid;
        } else {
            console.warn('No matching role found for:', props.user.roleName);
            return '';
        }
    }
    return '';
});

// Format the user's gender to match the options in the dropdown
const formattedGender = computed(() => {
    if (props.user && props.user.gender) {
        // Capitalize the first letter
        return props.user.gender.charAt(0).toUpperCase() + props.user.gender.slice(1).toLowerCase();
    }
    return '';
});

// Debug logs
console.log('User data:', props.user);
console.log('Roles data:', props.roles);
console.log('Role options:', roleOptions.value);
console.log('User role UUID:', userRoleUuid.value);
console.log('Formatted gender:', formattedGender.value);
</script>
<template>
    <Form class="grid grid-cols-3 gap-5 mt-3 p-6" id="userform" :inner="false">
        <Input name="email" validation="required|email" label="Email" :value="user?.email || ''" :attributes="{
            placeholder: 'Enter User Email',
        }" />
        <Select name="title" label="Title" validation="required" :value="user?.title || ''"
            :options="['Mr', 'Ms.', 'Dr.', 'Prof']" :attributes="{
                placeholder: 'Select Title',
            }">
        </Select>
        <Input name="firstName" validation="required|alpha" :value="user?.firstName || ''" label="First Name"
            :attributes="{
                placeholder: 'Enter firstname',
            }" />
        <Input name="fatherName" validation="required|alpha" :value="user?.fatherName || ''" label="Father Name"
            :attributes="{
                placeholder: 'Enter fathername',
            }" />
        <Input name="grandFatherName" validation="required|alpha" :value="user?.grandFatherName || ''"
            label="Grandfather Name" :attributes="{
                placeholder: 'Enter grandfathername',
            }" />
        <Select name="gender" label="Gender" :value="formattedGender" validation="required"
            :options="['Female', 'Male']" :attributes="{
                placeholder: 'Select Gender',
            }">
        </Select>

        <Input name="mobilePhone" label="Mobile Phone" :value="user?.mobilePhone || ''" validation="required|phone"
            :attributes="{
                placeholder: 'mobile phone',
            }" />
        <Select 
            :obj="true" 
            name="roleUuid" 
            label="Role" 
            validation="required" 
            :value="userRoleUuid"
            :options="roleOptions" 
            :attributes="{
                placeholder: 'Select Role',
            }"
        >
        </Select>
        
        <!-- Debug info (remove in production) -->
        <div class="col-span-3 text-xs text-gray-500 mt-4 p-2 bg-gray-100 rounded" v-if="false">
            <p>Role options count: {{ roleOptions.length }}</p>
            <p>Selected role UUID: {{ userRoleUuid }}</p>
            <p>User role name: {{ user?.roleName }}</p>
        </div>
    </Form>
</template>
