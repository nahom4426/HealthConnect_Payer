import CreditServices from "@/features/credit/credit_services/pages/creditServices.vue";
import CreditServicesIndex from "@/features/credit/credit_services/pages/creditServicesIndex.vue";

export default [
    {
        path: '/credit_services',
        name: 'CreditServices',
        component: CreditServicesIndex,
        // meta: {
        //   requiresAuth: true,
        //   privileges: ['create_user','View_card'],
        // },
        children: [
          {
            path: '',
            name: 'Credit Services List',
            component: CreditServices,
          },
          
        ]
      },
   
]