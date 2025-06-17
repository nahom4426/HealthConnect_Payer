import BatchDetail from "@/features/credit Invoice/components/BatchDetail.vue";
import Claim from "@/features/customer Services/pages/Claim.vue";
import CreditServiceIndex from "@/features/customer Services/pages/CreditServiceIndex.vue";
import CreditServices from "@/features/customer Services/pages/CreditServices.vue";
import ServiceConfirmationSlip from "@/features/customer Services/components/ServiceConfirmationSlip.vue";

export default [
  {
    path: '/credit-services',
    name: 'Credit Services',
    component: CreditServiceIndex,
    children: [
      {
        path: "",
        name: "CreditServicesIndex", // Changed name to avoid conflict
        component: CreditServices,
      },
      {
        path: 'claim/:Uuid',
        name: "Claim",
        component: Claim,
      },
      {
        path: 'Credit-Invoice/slip/:Uuid',
        name: "ClaimSlipDetails", // Unique name for clarity
        component: ServiceConfirmationSlip,
      },
      {
        path: 'claim-batch-details/:Uuid/:payerUuid',
        name: 'ClaimBatchDetail', // Unique name for clarity
        component: BatchDetail,
      }
    ]
  }
];