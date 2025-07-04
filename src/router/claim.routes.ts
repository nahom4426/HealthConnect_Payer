import ClinicalApproval from "@/features/claim/pages/clinicalApproval/ClinicalApproval.vue";
import ClinicalDetail from "@/features/claim/pages/clinicalApproval/ClinicalDetail.vue";
import ClinicalIndex from "@/features/claim/pages/clinicalApproval/ClinicalIndex.vue";
import FinancialApproval from "@/features/claim/pages/financialApproval/FinancialApproval.vue";
import FinancialApprovalDetail from "@/features/claim/pages/financialApproval/FinancialApprovalDetail.vue";
import FinancialClaimIndex from "@/features/claim/pages/financialApproval/FinancialClaimIndex.vue";
import ClaimPaymentDetail from "@/features/claim/pages/payment/ClaimPaymentDetail.vue";
import Payment from "@/features/claim/pages/payment/Payment.vue";
import PaymentIndex from "@/features/claim/pages/payment/PaymentIndex.vue";
import SubmittedClaimDetail from "@/features/claim/pages/submittedClaim/SubmittedClaimDetail.vue";
import SubmittedClaimIndex from "@/features/claim/pages/submittedClaim/SubmittedClaimIndex.vue";
import SubmittedClaims from "@/features/claim/pages/submittedClaim/SubmittedClaims.vue";
import TrackClaim from "@/features/credit/track_claim/pages/TrackClaim.vue";

export default [
   {
    
    path: "/submitted_claims",
    name: "Submitted Claim",
    component: SubmittedClaimIndex,
    children: [
      { path: "",
        name: "Submitted",
        component: SubmittedClaims,
      },
      {
        path: "detail/:id",
        name: "Claims Detail",
        component: SubmittedClaimDetail,
      }
    ]
  },
{  
    path: "/clinical_approval",
    name: "Submitted Claims",
    component: ClinicalIndex,
    children: [
      { path: "",
        name: "Clinical Approval",
        component: ClinicalApproval,},
      {
        path: "detail/:id",
        name: "Clinical Approval Detail",
        component: ClinicalDetail,
      }
    ]
  },
  {
    
    path: "/financial_approval",
    name: "Financial Approval",
    component: FinancialClaimIndex,
    children: [
      { 
        path: "",
        name: "Financial Approval",
        component: FinancialApproval,},
      {
        path: "detail/:id",
        name: "Financial Approval Detail",
        component: FinancialApprovalDetail,
      }
    ]
  },
  

 
  
  {
    path: "/track_claims",
    name: "Track Claims",
    component: TrackClaim,
  },

  {
    
    path: "/payment",
    name: "Payment",
    component: PaymentIndex,
    children: [
      { 
        path: "",
        name: "Claim Payment",
        component: Payment,},
      {
        path: "detail/:id",
        name: "Claim Payment Detail",
        component: ClaimPaymentDetail,
      }
    ]
  },
 
  
];