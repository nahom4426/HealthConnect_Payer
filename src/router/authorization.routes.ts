import Authorization from "@/features/credit/authorization/pages/authorization.vue";
import AuthorizationDetails from "@/features/credit/authorization/pages/authorizationDetails.vue";
import AuthorizationIndex from "@/features/credit/authorization/pages/authorizationIndex.vue";
import BatchAuthorization from "@/features/credit/authorization/pages/BatchAuthorization.vue";


export default [
    {
        path: '/claim-approval',
        name: 'Claim Approval',
        component: AuthorizationIndex,
        meta: {
          requiresAuth: true,
          privilege: ['Create Services'], // Changed from privileges to privilege to match what the router checks
        },
        children: [
          {
            path: '',
            name: 'Claim Approval',
            component: BatchAuthorization,
          },
          {
            path: 'detail/:id',
            name: 'Authorization Details',
            component: AuthorizationDetails,
            props: true,
            meta: {
              requiresAuth: true,
              privilege: ['Create Services'], // Changed from privileges to privilege to match what the router checks
            }
          }
        ]
      },
   
]