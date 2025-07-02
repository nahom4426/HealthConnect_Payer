import ProviderList from "@/features/providers/pages/ActiveProviders.vue";
import AddProvider from "@/features/providers/pages/AddProvider.vue";
import InactiveProviders from "@/features/providers/pages/InactiveProviders.vue";
import NewContract from "@/features/payer_contract/new_contracts/pages/Contracts.vue";
import PayerContracts from "@/features/payer_contract/active_payer_contracts/pages/PayerContracts.vue";
import PayerIndex from "@/features/payer_contract/active_payer_contracts/pages/PayerIndex.vue";
import Details from "@/features/payer_contract/active_payer_contracts/pages/payerContractDetails.vue";
import NewContracts from "@/features/payer_contract/new_contracts/components/newContract.vue";
import PayerContractIndex from "@/features/payer_contract/new_contracts/pages/PayerContractIndex.vue";
import EditContract from "@/features/payer_contract/new_contracts/components/editContract.vue";
import Pending_contracts from "@/features/payer_contract/pending_contracts/pages/pending_contracts.vue";

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
			},
			{
				path: 'new',
				name: 'New Payer Contract',
				component: NewContracts,
			},
       {
      path: 'edit/:id',
      name: 'Edit Payer Contract',
      component:EditContract,
    }
		]
	},
	{
		path: '/payer_contracts',
		name: 'Payer Contract',
		component: PayerIndex,
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
			}
		]
	},
	{
		path: '/pending_contracts',
		name: 'Pending Contracts',
		component: PayerIndex,
		children: [
			{
				path: '',
				name: 'Pending Contracts List',
				component: Pending_contracts,
			}
			// {
			// 	path: 'detail/:contractHeaderUuid',
			// 	name: 'Pending Contract Details',
			// 	component: Details,
			// 	props: true,
			// }
		]
	}

];