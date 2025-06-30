import icons from "@/utils/icons";

// icon set called streamline
export default [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: icons.dashboard,
  },
  {
    path: "/payer_list",
    name: "Payer List",
    icon: icons.payerList,
    privilege: ["CREATE_USER"],
    // category: "Admin",
  },
  {
    path: "/provider_list",
    name: "Providers list",
    icon: icons.Activeprovider,
    privilege: ["CREATE_USER"],
  },
  {
    path: "/payer_contracts",
    name: "Payer Conttracts",
    icon: icons.payerContracts,
    privilege: ["CREATE_USER"],
    // category: "Admin",
  },
  {
    path: "/services",
    name: "Services",
    icon: icons.Services,
    privilege: ["Create Services"],
  },

  {
    name: "Credits",
    icon: icons.Credits,
    privilege: ["Create Services"],
    //  category: "Payers",
    navs: [
      {
        path: "/credit_services",
        name: "Create Claims",
        icon: icons.creditservices,
        // category: "main",
        privilege: ["Create Services"],
      },
      {
        path: "/submit_claims",
        name: "Submit Claims",
        icon: icons.approveClaims,
        category: "Pages",
        privilege: ["Create Services"],
      },
      {
        path: "/claim-approval",
        name: "Claim Approval",
        icon: icons.Authorization,
        category: "Pages",
        privilege: ["Create Services"],
      },
      {
        path: "/track_claims",
        name: "Track Claims",
        icon: icons.completedClaims,
        category: "pages",
        privilege: ["Create Services"],
      },
    ],
  },
  {
    path: "/insured_list",
    name: "Employees list",
    icon: icons.active_insured_persons,
    privilege: ["Create Employees"],
  },
  {
    name: "Claims",
    icon: icons.claimManagement,
    privilege: ["Create Employees"],
    category: "Payers",
    navs: [
      {
        path: "/submitted_claims",
        name: "New Claims",
        category: "pages",
        privilege: ["Create Employees"],
      },
      {
        path: "/clinical_approval",
        name: "Clinical Approval",
        category: "Pages",
        privilege: ["Create Employees"],
      },
      {
        path: "/financial_approval",
        name: "Financial Approval",
        category: "Pages",
        privilege: ["Create Employees"],
      },
      {
        path: "/Payment",
        name: "Payment",
        category: "service",
        privilege: ["Create Employees"],
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
