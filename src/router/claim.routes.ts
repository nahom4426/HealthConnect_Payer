import ClinicalApproval from "@/features/claim/pages/clinicalApproval/ClinicalApproval.vue";
import FinancialApproval from "@/features/claim/pages/financialApproval/FinancialApproval.vue";
import Payment from "@/features/claim/pages/payment/Payment.vue";
import SubmittedClaims from "@/features/claim/pages/submittedClaim/SubmittedClaims.vue";

export default [
  {
    path: "/submitted_claims",
    name: "Submitted Claims",
    component: SubmittedClaims,
  },
  {
    path: "/clinical_approval",
    name: "Clinical Approval",
    component: ClinicalApproval,
  },
  {
    path: "/financial_approval",
    name: "Financial Approval",
    component: FinancialApproval,
  },{
    path: "/Payment",
    name: "Payment",
    component: Payment,
  },
  
];