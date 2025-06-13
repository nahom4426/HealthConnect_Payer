import CreditServices from "@/features/credit/credit_services/pages/creditServices.vue";
import CreditServicesDetails from "@/features/credit/credit_services/pages/creditServicesDetails.vue";
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
            component: CreditServices,
          },
          {
            path: 'detail/:creditServicesUuid',
            name: 'Credit Services Details',
            component: CreditServicesDetails,
            props: true,
            // meta: {
            //   requiresAuth: true,
            //   privileges: ['create_user','View_card'],
            // }
          }
        ]
      },
   
]