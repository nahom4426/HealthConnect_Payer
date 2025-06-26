import MainLayout from "@/layouts/MainLayout.vue";
import { useBreadcrumb, type BreadcrumbRoutes } from "@/stores/breadCrumbsStore";
import { createRouter, createWebHistory } from "vue-router";
import Login from "@/pages/Login.vue";
import { useAuthStore } from "@/stores/auth";
import creditInvoicesRoutes from "./creditInvoices.routes";
import priceRoutes from "./service.routes";
import Dashboard from "@/features/Dashboard/pages/Dashboard.vue";
import eligibility_checkRoutes from "./eligibility_check.routes";
import claimRoutes from "./claim.routes";
// import institutionRoutes from "./institution.routes";
import adminRoutes from "./admin.routes";
import instutionSetingRoutes from "./institution_settings.routes";
import insuredPersonRoutes from "./insured_persons.routes";
import product_settingRoutes from "./product_settings.routes";
import Provider_contractsRoutes from "./provider_contracts.routes";
import providerRoutes from "./providers.routes"
import finance from "./finance.routes.ts"
import payerContractRoutes from "./payerContract.routes";
import creditServicesRoutes from "./credit_services.routes";
import submitClaimsRoutes from "./submit_claims.routes";
import authorizationRoutes from "./authorization.routes";
import Profile from "@/features/admin/profile/pages/profile.vue";
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    
    {
      path: "/main",
      name: "home",
      component: MainLayout,
      children: [
        {
          path: '/dashboard',
          name: 'Dashboard',
          component: Dashboard,
        },
        {
          path: '/profile',
          name: 'profile',
          component: Profile,
        },
        
        ...creditInvoicesRoutes,
        ...priceRoutes,
        ...eligibility_checkRoutes,
        ...claimRoutes,
        ...adminRoutes,
        // ...institutionRoutes,
        ...instutionSetingRoutes,
        ...insuredPersonRoutes,
        ...product_settingRoutes,
        ...Provider_contractsRoutes,
        ...providerRoutes,
        ...finance,
        ...payerContractRoutes,
        ...creditServicesRoutes,
        ...submitClaimsRoutes,
        ...authorizationRoutes,
       
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  const routes = to.matched.reduce((routes: BreadcrumbRoutes[], route) => {
    if(routes.find(el => el.name == route.name)) return routes
    const routesSplit = route.path.split('/')
    const path = routesSplit.reduce((state: string[], el, idx) => {
      const res = el.startsWith(":")
      if(res) {
        const name = el.match(/:([a-zA-Z]+)/)?.[1]
        console.log(name, to.params[name as string])
        state.push(to.params[name as string] as string)
      } else {
        state.push(el)
      }
      return state
    }, [])
    routes.push({
      name: route.name as string,
      path: path.join('/'),
    })
    return routes
  }, [])

  const breadcrumb = useBreadcrumb()

  breadcrumb.breadcrumbs = routes
  next()
})
router.beforeEach(async (to, from) => {
  const auth = useAuthStore();
  
  if (!auth.auth?.accessToken) {
    const userDetail = localStorage.getItem("userDetail");
    if (userDetail) {
      try {
        const parsedDetail = JSON.parse(userDetail);
        auth.setAuth({
          user: parsedDetail,
          accessToken: parsedDetail?.token,
        });
      } catch (e) {
        localStorage.removeItem("userDetail");
      }
    }
  }

  if (to.path === "/login" && auth.auth?.accessToken) {
    return { path: from.path || '/dashboard' };
  }

  if (to.path === '/') {
    return { path: '/dashboard' };
  }

  const isProtectedRoute = to.path !== '/login' && 
                          !to.path.startsWith('/public/') && 
                          to.matched.some(record => record.name === 'home');

  if (isProtectedRoute) {
    if (!auth.auth?.accessToken) {
      return {
        path: '/login',
        query: { redirect: to.fullPath }
      };
    }

    if (
      auth.auth?.user?.privileges?.includes("All Privileges") ||
      auth.auth?.user?.roleName === "Super Admin"
    ) {
      return true;
    }

    if (to.meta?.requiresAuth) {
      if (auth.auth?.user?.roleName === to.meta?.role) {
        return true;
      }

      const privileges = auth.auth.user?.privileges || [];
      const requiredPrivileges = to.meta?.privileges || [];
      
      const hasRequiredPrivilege = requiredPrivileges.some((privilege: any) => 
        privileges.includes(`ROLE_${privilege}`)
      );

      if (hasRequiredPrivilege) {
        return true;
      }

      return { path: '/forbidden' };
    }
  }

  return true;
});

export default router;
