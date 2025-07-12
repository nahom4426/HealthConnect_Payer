import ProviderList from "@/features/providers/pages/ActiveProviders.vue";
import AddProvider from "@/features/providers/pages/AddProvider.vue";
import InactiveProviders from "@/features/providers/pages/InactiveProviders.vue";

export default [
	{
		path: '/add_provider',
		name: 'add providers',
		component: AddProvider
	},
	{
		path: '/provider_list',
		name: 'Providers List',
		component: ProviderList,
		meta: {
		  requiresAuth: true,
		  privilege: ['CREATE_USER'], // Changed from privileges to privilege to match what the router checks
		},
	},

	{
		path: '/inactive_providers',
		name: 'inactive providers',
		component: InactiveProviders
	},
]