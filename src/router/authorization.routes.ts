import Authorization from "@/features/credit/authorization/pages/authorization.vue";
import AuthorizationDetails from "@/features/credit/authorization/pages/authorizationDetails.vue";
import AuthorizationIndex from "@/features/credit/authorization/pages/authorizationIndex.vue";


export default [
    {
        path: '/authorization',
        name: 'Authorization',
        component: AuthorizationIndex,
        // meta: {
        //   requiresAuth: true,
        //   privileges: ['create_user','View_card'],
        // },
        children: [
          {
            path: '',
            name: 'Authorization List',
            component: Authorization,
          },
          {
            path: 'detail/:authorizationUuid',
            name: 'Authorization Details',
            component: AuthorizationDetails,
            props: true,
            // meta: {
            //   requiresAuth: true,
            //   privileges: ['create_user','View_card'],
            // }
          }
        ]
      },
   
]