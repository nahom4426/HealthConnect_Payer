import icons from "@/utils/icons";

// icon set called streamline
export default [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: icons.dashboard,
  // category: "main",
  // privilege: ['Read-Privileges'],
  },
  

  //  {
  //   name: "Insured Persons",
  //   icon: icons.Insured,
  //   // privilege: ['Read-Privileges'],
  //   navs: [
  //     {
  //       path: "/create_insured_person",
  //       name: "Add Insured Person",
  //       icon: icons.create_insured_person,
  //       // privilege: ['Read-Privileges'],
  //     },
  //     {
  //       path: "/active_insured_persons",
  //       name: "Insured Persons",
  //       icon: icons.active_insured_persons,
  //       // privilege: ['Read-Privileges'],
  //     },
  //   ],
  // },
  // {
  //   name: "Provider Contracts",
  //   icon: icons.ProviderContract,
  //   navs: [
  //     {
  //       path: "/create_contract",
  //       name: "Create Contract",
  //       icon: icons.ProviderContract,
  //     },
  //     {
  //       path: "/active_contracts",
  //       name: "Active Contracts",
  //       icon: icons.active_contracts,
  //     },
  //     {
  //       path: "/suspended_contracts",
  //       name: "Suspended Contracts",
  //       icon: icons.suspended_contracts,
  //     },
  //   ],
  // },
  // {
  //   name: "Provider Settings",
  //   icon: icons.ProviderSetting,
  //   navs: [
  //     {
  //       path: "/add_provider",
  //       name: "Add Provider",
  //       icon: icons.provider,
  //     },
  //     {
  //       path: "/provider_list",
  //       name: "Active Providers",
  //       icon: icons.Activeprovider,
  //     },
  //     {
  //       path: "/inactive_providers",
  //       name: "Inactive Providers",
  //       icon: icons.inActiveprovider,
  //     },
  //   ],
  // },
  // // {
  // //   name: "Institution Settings",
  // //   icon:icons.Instution,
  // //   navs: [
  // //     {
  // //       path: "/create_institution",
  // //       name: "Add Institution",
  // //       icon: icons.provider,
  // //     },
  // //     {
  // //       path: "/payer_list",
  // //       name: "Active Institution",
  // //       icon: icons.ActiveInstution,
  // //     },
  // //     {
  // //       path: "/suspended_institution",
  // //       name: "Inactive Institution",
  // //       icon:icons.inActiveInstution,
  // //     },
  // //   ],
  // // },
  // //  {
  // //   name: "Finance",
  // //   icon: icons.finance,
  // //   // privilege: ['Read-Privileges'],
  // //   navs: [
  // //     {
  // //       path: "/premium_receipt",
  // //       name: "Premium Receipt",
  // //       icon: icons.premium_receipt,
  // //       privilege: ['ROLE_Read_Premium_Receipt'],
  // //     },
  // //     {
  // //       path: "/claim_payment",
  // //       name: "Claim Payment",
  // //       icon: icons.claim_payment,
  // //       privilege: ['ROLE_Read_Claim_Payment'],
  // //     },
  // //     {
  // //       path: "/paid_claims",
  // //       name: "Paid Claims",
  // //       icon: icons.paid_claims,
  // //       privilege: ['ROLE_Read_Paid_Claims'],
  // //     },
  // //     {
  // //       path: "/other_payments",
  // //       name: "Other Payments",
  // //       icon: icons.other_payments,
  // //       privilege: ['ROLE_Read_Other_Payments'],
  // //     },
  // //   ],
  // // },
  // {
  //   path: "/eligibility_check",
  //   name: "Eligibility Check",
  //   icon: icons.eligibility,
  //   category: "Provider",
  // },
  // {
  //   path: "/provide_Services",
  //   name: "Provide Service",
  //   icon: icons.services,
  // },

  // {
  //   path: "/credit-services",
  //   name: "Credit Services",
  //   icon: icons.creditservices,
  //  //privilage: [],
  //   //role: ''
  // },
  // {
  //   path: "/credit-invoices",
  //   name: "Credit Invoice",
  //   icon: icons.creditinvoice,
  //   //privilage: [],
  //   //role: '',
  // },
  // {
  //   name: "Authorization",
  //   icon: icons.Authorization,
  //      navs: [
  //     {
  //       path: "/add_new_policy",
  //       name: "requested Authorizations",
  //       icon: icons.add_new_policy,
  //     },
  //     {
  //       path: "/import_policy",
  //       name: "Approved Authorizations",
  //       icon: icons.import_policy,
  //     },
  //     {
  //       path: "/issued_policy",
  //       name: "Rejected Authorizations",
  //       icon: icons.issued_policy,
  //     },
  //   ],
  // },
  // {
  //   path: "/services",
  //   name: "Services",
  //   icon: icons.Services, },
     {
    path: "/payer_list",
    name: "Payer List",
    icon: icons.payerList,
  // category: "Admin",
  },
   {
        path: "/provider_list",
        name: "Providers list",
        icon: icons.Activeprovider,
      },
      {
    path: "/payer_contracts",
    name: "Payer Conttracts",
    icon: icons.payerContracts,
  // category: "Admin",
  },
   {
    path: "/services",
    name: "Services",
    icon: icons.Services, },
     {
    path: "/credit-services",
    name: "Credit Services",
    icon: icons.creditservices,
   //privilage: [],
    //role: ''
  },
  {
    name: "Claims Management",
    icon: icons.claimManagement,
    //  privilege: ['Read-Privileges'],
      //  category: "Payers",
    navs: [
      {
        path: "/cash_claims",
        name: "Cash Claims",
        icon: icons.cashClaims,
        // category: "main",
        // privilege: ['Read-Privileges'],
      },
      {
        path: "/credit_claims",
        name: "Credit Claims",
        icon: icons.creditClaims,
        category: "Pages",
        // privilege: ['Read-Privileges'],
      },
      {
        path: "/process_claims",
        name: "Process Claims",
        icon: icons.processClaims,
        category: "Pages",
        // privilege: ['Read-Privileges'],
      },
      {
        path: "/verify_claims",
        name: "Verify Claims",
        icon: icons.verifyClaims,
        category: "service",
        // privilege: ['Read-Privileges'],
      },
      {
        path: "/approve_claims",
        name: "Approve Claims",
        icon: icons.approveClaims,
        category: "main",
        // privilege: ['Read-Privileges'],
      },
      {
        path: "/authorize_claims",
        name: "Authorize Claims",
        icon: icons.authorizeClaims,
        // privilege: ['Read-Privileges'],
      },
      {
        path: "/completed_claims",
        name: "Completed Claims",
        icon: icons.completedClaims,
        // privilege: ['Read-Privileges'],
      },
    ],
  },
 {
    path: "/users",
    name: "Users",
    icon: icons.users,
  
  },
   {
    path: "/roles",
    name: "Roles",
    icon: icons.role,
 
  },
   {
    path: "/privileges",
    name: "Privilage",
    icon: icons.privilege,

  },
  {
    path: "/setting",
    name: "Theme",
    icon: icons.setting,
  },
];

