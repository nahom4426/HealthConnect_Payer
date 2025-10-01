import AwashIntegrationIndex from "@/features/awash_integration/pages/AwashIntegrationIndex.vue";
import AwashServices from "@/features/awash_integration/pages/AwashServices.vue";
import AwashClaims from "@/features/awash_integration/pages/AwashClaims.vue";

export default [
  {
    path: "/awash-integration",
    name: "Awash Integration",
    component: AwashIntegrationIndex,
    meta: {
      requiresAuth: true,
      privilege: ["Create Services"],
    },
    children: [
      {
        path: "",
        name: "Awash Services",
        component: AwashServices,
      },
      {
        path: "claims",
        name: "Awash Claims",
        component: AwashClaims,
      },
    ],
  },
];
