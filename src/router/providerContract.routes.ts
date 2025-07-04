// import ProviderList from "@/features/providers/pages/ActiveProviders.vue";
// import AddProvider from "@/features/providers/pages/AddProvider.vue";
// import InactiveProviders from "@/features/providers/pages/InactiveProviders.vue";
// import NewContract from "@/features/payer_contract/new_contracts/pages/Contracts.vue";
// import PayerContracts from "@/features/payer_contract/active_payer_contracts/pages/PayerContracts.vue";
// import PayerIndex from "@/features/payer_contract/active_payer_contracts/pages/PayerIndex.vue";
// import Details from "@/features/payer_contract/active_payer_contracts/pages/payerContractDetails.vue";
// import NewContracts from "@/features/payer_contract/new_contracts/components/newContract.vue";
// import PayerContractIndex from "@/features/payer_contract/new_contracts/pages/PayerContractIndex.vue";
// import EditContract from "@/features/payer_contract/new_contracts/components/editContract.vue";
// import Pending_contracts from "@/features/payer_contract/pending_contracts/pages/pending_contracts.vue";

// import Details from "@/features/provider_contract/active_payer_contracts/pages/providerDetails.vue";
import ProviderDetails from "@/features/provider_contract/active_provider_contracts/pages/providerDetails.vue";
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
	}
	// {
	// 	path: '/payer_contracts',
	// 	name: 'Payer Contract',
	// 	component: PayerIndex,
	// 	children: [
	// 		{
	// 			path: '',
	// 			name: 'Payer Contracts List',
	// 			component: PayerContracts,
	// 		},
	// 		{
	// 			path: 'detail/:contractHeaderUuid',
	// 			name: 'Payer Contract Details',
	// 			component: Details,
	// 			props: true,
	// 		}
	// 	]
	// },
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