import ActiveProviderIndex from "@/features/provider_contract/active_provider_contracts/pages/ActiveProviderIndex.vue";
import ProviderContracts from "@/features/provider_contract/active_provider_contracts/pages/ProviderContracts.vue";
import ProviderDetails from "@/features/provider_contract/active_provider_contracts/pages/providerDetails.vue";
import AddContractForKenema from "@/features/provider_contract/add_contracts_for_kenema/pages/addContractForKenema.vue";
import AddProviderContractIndex from "@/features/provider_contract/add_contracts_for_kenema/pages/addProviderContractIndex.vue";
import ViewContractRequests from "@/features/provider_contract/contract_requests/components/viewContractRequests.vue";
import ContractRequests from "@/features/provider_contract/contract_requests/pages/contractRequests.vue";
import ProviderContractIndex from "@/features/provider_contract/contract_requests/pages/ProviderContractIndex.vue";


export default [
	{
		path: '/contract_requests',
		name: 'Contract Requests',
		component: ProviderContractIndex,
		children: [
			{
				path: '',
				name: 'Contract Requests',
				component: ContractRequests,
			},
			{
				path: 'detail/:contractHeaderUuid',
				name: 'provider Contract Details',
				component: ProviderDetails,
				props: true,
			},
			// {
			// 	path: 'new',
			// 	name: 'New Payer Contract',
			// 	component: NewContracts,
			// },
	   {
	  path: 'view/:id',
	  name: 'Contract Request Details',
	  component: ViewContractRequests,
	}
		]
	},
	{
		path: '/provider_contracts',
		name: 'Provider Contract',
		component: ActiveProviderIndex,
		children: [
			{
				path: '',
				name: 'Provider Contracts ',
				component: ProviderContracts,
			},
			{
				path: 'detail/:contractHeaderUuid',
				name: 'Provider Contract Details',
				component: ProviderDetails,
				props: true,
			}
		]
	},
		{
		path: '/create_contracts',
		name: 'Create Contract',
		component: AddProviderContractIndex,
		children: [
			{
				path: '',
				name: 'Provider Contracts List',
				component: AddContractForKenema,
			}
		]
	},

	// {
	// 	path: '/pending_contracts',
	// 	name: 'Pending Contracts',
	// 	component: PayerIndex,
	// 	children: [
	// 		{
	// 			path: '',
	// 			name: 'Pending Contracts List',
	// 			component: Pending_contracts,
	// 		}
	// 		// {
	// 		// 	path: 'detail/:contractHeaderUuid',
	// 		// 	name: 'Pending Contract Details',
	// 		// 	component: Details,
	// 		// 	props: true,
	// 		// }
	// 	]
	// }

];