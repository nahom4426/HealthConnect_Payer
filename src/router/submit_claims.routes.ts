import SubmitClaims from "@/features/credit/submit_claims/pages/submitClaims.vue";
import SubmitClaimsDetails from "@/features/credit/submit_claims/pages/submitClaimsDetails.vue";
import SubmitClaimsIndex from "@/features/credit/submit_claims/pages/submitClaimsIndex.vue";

export default [
    {
        path: '/submit_claims',
        name: 'SubmitClaims',
        component: SubmitClaimsIndex,
        meta: {
          requiresAuth: true,
          privilege: ['Create Services'], // Changed from privileges to privilege to match what the router checks
        },
        children: [
          {
            path: '',
            name: 'Submit Claims List',
            component: SubmitClaims,
          },
          {
            path: 'detail/:submitClaimsUuid',
            name: 'Submit Claims Details',
            component: SubmitClaimsDetails,
            props: true,
            meta: {
              requiresAuth: true,
              privilege: ['Create Services'], // Changed from privileges to privilege to match what the router checks
            }
          }
        ]
      },
   
]