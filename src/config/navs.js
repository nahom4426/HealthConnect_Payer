import icons from "@/utils/icons";

// icon set called streamline
export default [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: icons.dashboard,
  },
  {
    name: "Contracts",
    icon: icons.contracts,
    privilege: ["Create Employees"],
    //  category: "Payers",
    navs: [
      {
        path: "/payer_contracts",
        name: "Active Contracts",
        icon: icons.active_contracts,
        privilege: ["Create Employees"],
        // category: "Admin",
      },
      {
        path: "/new_contract",
        name: "Create Contracts",
        icon: icons.new_contract,
        category: "Pages",
        privilege: ["Create Employees"],
      },
      {
        path: "/pending_contracts",
        name: "Pending Contracts",
        icon: icons.pending_contracts,
        category: "Pages",
        privilege: ["Create Employees"],
      },
    ],
  },
  {
    name: "Contracts",
    icon: icons.contracts,
    privilege: ["Create Services"],
    //  category: "Payers",
    navs: [
        {
      path: "/provider_contracts",
      name: "Active Contracts",
      icon: icons.active_contracts,
      privilege: ["Create Services"],
      // category: "Admin",
    },
      {
        path: "/contract_requests",
        name: "Contracts Requests",
        icon: icons.new_contract,
        category: "Pages",
        privilege: ["Create Services"],
      },
      {
        path: "/pending_contracts",
        name: "Pending Contracts",
        icon: icons.pending_contracts,
        category: "Pages",
        privilege: ["Create Services"],
      },
        {
        path: "/create_contracts",
        name: "Add Payers to Contracts",
        icon: icons.pending_contracts,
        category: "Pages",
        privilege: ["Create Services"],
      },
    ],
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
        name: "Credits Services",
        icon: icons.creditservices,
        // category: "main",
        privilege: ["Create Services"],
      },
      {
        path: "/submit_claims",
        name: "Create Claims",
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
      // {
      //   path: "/submitted_claims",
      //   name: "New Claims",
      //   category: "pages",
      //   privilege: ["Create Employees"],
      // },
      {
        path: "/clinical_approval",
        name: "Audit",
        category: "Pages",
        privilege: ["Create Employees"],
      },
      {
        path: "/financial_approval",
        name: "Approval",
        category: "Pages",
        privilege: ["Create Employees"],
      },
      {
        path: "/payment",
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
    name: "Privilege",
    icon: icons.privilege,
    privilege: ["CREATE_USER"],

  },
  {
    path: "/setting",
    name: "Theme",
    icon: icons.setting,
  },
];
