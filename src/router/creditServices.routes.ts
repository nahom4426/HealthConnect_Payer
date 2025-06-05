import BatchDetail from "@/features/credit Invoice/components/BatchDetail.vue";
import CreditInvoice from "@/features/credit Invoice/pages/CreditInvoice.vue";
import CreditInvoiceIndex from "@/features/credit Invoice/pages/CreditInvoiceIndex.vue";
import ServiceConfirmationSlip from "@/features/customer Services/components/ServiceConfirmationSlip.vue";
import Claim from "@/features/customer Services/pages/Claim.vue";
import CreditServiceIndex from "@/features/customer Services/pages/CreditServiceIndex.vue";
import CreditServices from "@/features/customer Services/pages/CreditServices.vue";

export default[
    {
      path:'/credit-services',
      name:'Credit Services',
      Component:CreditServiceIndex,
      children:[
        {
          path: "",
          name: "Credit Services",
          component: CreditServices,
        },
        {
          path:'/claim/:Uuid',
          name: "Claim",
          component:Claim
        },
        {
          path:'/Credit-Invoice/slip/:Uuid',
          name: "claim-slip-details",
          component:ServiceConfirmationSlip
        },
        {
          path:'/claim-batch-details/:Uuid/:payerUuid',
          name: 'Claim Batch Detail',
          component: BatchDetail
        }
      ]
    }
    
     
]