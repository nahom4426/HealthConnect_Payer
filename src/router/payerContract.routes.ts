import AddPayerContract from "@/features/payer_contracts/pages/AddPayerContract.vue";
import PayerContracts from "@/features/payer_contracts/pages/PayerContracts.vue";
import ProviderList from "@/features/providers/pages/ActiveProviders.vue";
import AddProvider from "@/features/providers/pages/AddProvider.vue";
import InactiveProviders from "@/features/providers/pages/InactiveProviders.vue";

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

]