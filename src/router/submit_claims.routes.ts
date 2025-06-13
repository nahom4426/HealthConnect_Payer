import SubmitClaims from "@/features/credit/submit_claims/pages/submitClaims.vue";
import SubmitClaimsDetails from "@/features/credit/submit_claims/pages/submitClaimsDetails.vue";
import SubmitClaimsIndex from "@/features/credit/submit_claims/pages/submitClaimsIndex.vue";

export default [
    {
        path: '/submit_claims',
        name: 'SubmitClaims',
        component: SubmitClaimsIndex,
        // meta: {
        //   requiresAuth: true,
        //   privileges: ['create_user','View_card'],
        // },
        children: [
          {
            path: '',
            component: SubmitClaims,
          },
          {
            path: 'detail/:submitClaimsUuid',
            name: 'Submit Claims Details',
            component: SubmitClaimsDetails,
            props: true,
            // meta: {
            //   requiresAuth: true,
            //   privileges: ['create_user','View_card'],
            // }
          }
        ]
      },
   
]