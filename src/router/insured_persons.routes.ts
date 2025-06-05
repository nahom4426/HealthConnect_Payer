import CreateInsuredPersons from "@/features/insured_persons/pages/CreateInsuerdPersons.vue";
import ActiveInsuredPersons from "@/features/insured_persons/pages/ActiveInsuredPersons.vue";
import SuspendedInsuredPersons from "@/features/insured_persons/pages/SuspendedInsuredPersons.vue";
import InsuredPersonView from "@/features/insured_persons/components/InsuredPersonView.vue";

export default [
    {
        path: '/create_insured_person',
        name: 'CreateInsuredPerson',
        component: CreateInsuredPersons
    },
    {
        path: '/active_insured_persons',
        name: 'ActiveInsuredPersons',
        component: ActiveInsuredPersons
    },
    {
        path: '/suspended_insured_persons',
        name: 'SuspendedInsuredPersons',
        component: SuspendedInsuredPersons
    },
    {
        path: '/insured-persons/:insuredPersonId',
        name: 'InsuredPersonView',
        component: InsuredPersonView,
        props: true
    }
]