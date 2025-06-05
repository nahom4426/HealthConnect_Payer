// Add this to your existing institution routes
{
  path: '/institution/alerts',
  name: 'Institution Alerts',
  component: () => import('@/features/institutions/pages/InstitutionAlerts.vue')
}