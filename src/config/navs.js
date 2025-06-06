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
    icon: icons.Services,
  },
  {
    path: "/credit-services",
    name: "Credit Services",
    icon: icons.creditservices,
    //privilage: [],
    //role: ''
  },
  {
    name: "Claims",
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
