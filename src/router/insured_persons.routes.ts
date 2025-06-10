import CreateInsuredPersons from "@/features/insured_persons/pages/CreateInsuerdPersons.vue";
import InsuredPersons from "@/features/insured_persons/pages/InsuredPersons.vue";
import SuspendedInsuredPersons from "@/features/insured_persons/pages/SuspendedInsuredPersons.vue";
import InsuredPersonView from "@/features/insured_persons/components/InsuredPersonView.vue";
import InsuredPersonsIndex from "@/features/insured_persons/pages/InsuredPersonsIndex.vue";
import InsuredDetails from "@/features/insured_persons/pages/insuredDetails.vue";

export default [
    {
        path: '/create_insured_person',
        name: 'CreateInsuredPerson',
        component: CreateInsuredPersons
    },
   
        {
        path: '/insured_list',
        name: 'InsuredPersons',
        component: InsuredPersonsIndex,
        // meta: {
        //   requiresAuth: true,
        //   privileges: ['create_user','View_card'],
        // },
        children: [
          {
            path: '',
            component: InsuredPersons,
          },
          {
            path: 'detail/:insuredPersonUuid',
            name: 'Insured Person Details',
            component: InsuredDetails,
            props: true,
            // meta: {
            //   requiresAuth: true,
            //   privileges: ['create_user','View_card'],
            // }
          }
        ]
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