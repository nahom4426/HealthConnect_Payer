import CreateClaims from "@/features/credit/submit_claims/pages/submitClaims.vue";
import CreateClaimsDetails from "@/features/credit/submit_claims/pages/submitClaimsDetails.vue";
import CreateClaimsIndex from "@/features/credit/submit_claims/pages/submitClaimsIndex.vue";

export default [
    {
        path: '/create_claims',
        name: 'Create Claims',
        component: CreateClaimsIndex,
        meta: {
          requiresAuth: true,
          privilege: ['Create Services'], // Changed from privileges to privilege to match what the router checks
        },
        children: [
          {
            path: '',
            name: 'Create Claims List',
            component: CreateClaims,
          },
          {
            path: 'detail/:submitClaimsUuid',
            name: 'Create Claims Details',
            component: CreateClaimsDetails,
            props: true,
            meta: {
              requiresAuth: true,
              privilege: ['Create Services'], // Changed from privileges to privilege to match what the router checks
            }
          }
        ]
      },
   
]