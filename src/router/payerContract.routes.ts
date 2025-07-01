
import ProviderList from "@/features/providers/pages/ActiveProviders.vue";
import AddProvider from "@/features/providers/pages/AddProvider.vue";
import InactiveProviders from "@/features/providers/pages/InactiveProviders.vue";
;
import NewContract from "@/features/payer_contract/new_contracts/pages/Contracts.vue";
import PayerContracts from "@/features/payer_contract/active_payer_contracts/pages/PayerContracts.vue";
import PayerIndex from "@/features/payer_contract/active_payer_contracts/pages/PayerIndex.vue";
import Details from "@/features/payer_contract/active_payer_contracts/pages/details.vue";
import NewContracts from "@/features/payer_contract/new_contracts/components/newContract.vue";
import PayerContractIndex from "@/features/payer_contract/new_contracts/pages/PayerContractIndex.vue";

export default [
	{
		path: '/new_contract',
		name: 'Add New Contract',
		component: PayerContractIndex,
      children: [
      {
        path: '',
        name: 'Add New Contracts',
        component: NewContract,
      },
      {
        path: 'detail/:contractHeaderUuid',
        name: 'Payer Contract Details',
        component: Details,
        props: true,
        // meta: {
        //   requiresAuth: true,
        //   privileges: ['create_user','View_card'],
        // }
      },
      {
        path: '/new',
        name: 'New Payer Contract',
        component: NewContracts,
      }
    ]
	},
	// 
	{
    path: '/payer_contracts',
    name: 'Payer Contract',
    component: PayerIndex,
    // meta: {
    //   requiresAuth: true,
    //   privileges: ['create_user','View_card'],
    // },
    children: [
      {
        path: '',
        name: 'Payer Contracts List',
        component: PayerContracts,
      },
      {
        path: 'detail/:contractHeaderUuid',
        name: 'Payer Contract Details',
        component: Details,
        props: true,
        // meta: {
        //   requiresAuth: true,
        //   privileges: ['create_user','View_card'],
        // }
      }
    ]
  }
]


