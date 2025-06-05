<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useApiRequest } from '@/composables/useApiRequest';
import { getRoleById, updateRolebyId } from '../Api/RoleApi';
import { useRoles } from '../store/roleStore';
import { ref } from 'vue';
import NewFormParent from '../components/NewFormParent.vue';
import PrivilegesDataProvider from '../../privilege/components/PrivilegesDataProvider.vue';
import Button from '@/components/Button.vue';
import RoleForm from '../form/RoleForm.vue';
import { toasted } from '@/utils/utils';
import { useForm } from '@/components/new_form_builder/useForm';
const router = useRouter();

const roleStore = useRoles();
const route = useRoute()
const roleUuid = route.params.roleUuid
const role = ref(roleStore.roles.find((el) => el.roleUuid == roleUuid) || {});
const req = useApiRequest()
const updateReq = useApiRequest()
const { submit } = useForm('roleForm')

if (!Object.keys(role.value).length) {
    req.send(
        () => getRoleById(roleUuid),
        (res) => {
            if (res.success) {
                role.value = res.data;
            }
        }
    );
    console.log(role);
}
function update({ values }) {
    console.log("Form values before formatting:", values);
    
    // Get the privileges from the form or from the role object
    let privileges = values.privileges;
    
    // If privileges is missing from values, try to get it from the hidden input directly
    if (!privileges) {
        const privilegesInput = document.querySelector('input[name="privileges"]');
        if (privilegesInput) {
            privileges = privilegesInput.value;
        }
    }
    
    // If still no privileges, try to get from the role object
    if (!privileges && role.value && role.value.privileges) {
        privileges = role.value.privileges;
    }
    
    // Parse privileges if it's a string
    if (typeof privileges === 'string') {
        try {
            // Check if it's a JSON string
            if (privileges.startsWith('[')) {
                privileges = JSON.parse(privileges);
            } else {
                // If it's not a JSON string, wrap it in an array
                privileges = [privileges];
            }
        } catch (e) {
            console.error("Error parsing privileges:", e);
            privileges = [];
        }
    }
    
    // Ensure privileges is an array
    if (!Array.isArray(privileges)) {
        privileges = [];
    }
    
    // Extract just the UUIDs if privileges contains objects
    const privilegeUuids = privileges.map(priv => {
        if (typeof priv === 'string') {
            return priv;
        } else if (priv && priv.privilegeUuid) {
            return priv.privilegeUuid;
        }
        return null;
    }).filter(uuid => uuid !== null);
    
    // Format the data for the API
    const formattedData = {
        roleName: values.roleName,
        roleDescription: values.roleDescription,
        privilegeUuid: privilegeUuids // Send only the UUIDs
    };
    
    // Check if privileges exist
    if (!formattedData.privilegeUuid.length) {
        console.error("No privileges found in form values");
        toasted(false, '', 'No privileges selected. Please select at least one privilege.');
        return;
    }
    
    console.log("Formatted data for API:", formattedData);
    
    updateReq.send(
        () => updateRolebyId(roleUuid, formattedData),
        (res) => {
            if (res.success) {
                // Update the store with the original values to maintain UI consistency
                roleStore.update(roleUuid, { 
                    ...role.value, 
                    roleName: values.roleName,
                    roleDescription: values.roleDescription,
                    privileges: privileges // Keep the full privileges for UI
                });
                router.push('/roles');
                toasted(res.success, 'Successfully Updated', res.error);
            } else {
                toasted(false, '', res.error || 'Failed to update role');
            }
        }
    );
}

const goBack = () => {
    router.go(-1);
}

</script>
<template>
    <button @click.prevent="goBack">
        <div class="p-6 flex gap-2 item-center ">

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
    <NewFormParent size="xl" title="Update Roles">
        <PrivilegesDataProvider :pre-page="500" v-slot="{ privileges, pending }">
            <RoleForm v-if="!pending" :selectPrivilege="role?.privileges" :privileges="privileges" :roles="role" />
        </PrivilegesDataProvider>
        <Button size="sm" type="primary" class="flex justify-center items-center mt-3 gap-3 p-2 bg-primary"
            :pending="updateReq.pending.value" @click="submit(update)">
            Update Role
        </Button>

    </NewFormParent>
</template>
