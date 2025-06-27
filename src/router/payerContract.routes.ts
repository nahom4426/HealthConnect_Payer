import AddPayerContract from "@/features/payer_contracts/pages/AddPayerContract.vue";
import PayerContracts from "@/features/payer_contracts/pages/PayerContracts.vue";
import ProviderList from "@/features/providers/pages/ActiveProviders.vue";
import AddProvider from "@/features/providers/pages/AddProvider.vue";
import InactiveProviders from "@/features/providers/pages/InactiveProviders.vue";
import PayerIndex from "@/features/payer_contracts/pages/PayerIndex.vue";
import PayerContractDetails from "@/features/payer_contracts/pages/details.vue";

export default [
	{
		path: '/add_payer_contract',
		name: 'Add Payer Contract',
		component: AddPayerContract
	},
	{
		path: '/payer_contracts',
		name: 'Payer Contracts',
		component: PayerContracts
	},
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
        component: PayerContractDetails,
        props: true,
        // meta: {
        //   requiresAuth: true,
        //   privileges: ['create_user','View_card'],
        // }
      }
    ]
  }
]


