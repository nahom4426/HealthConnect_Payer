import MainLayout from "@/layouts/MainLayout.vue";
import { useBreadcrumb, type BreadcrumbRoutes } from "@/stores/breadCrumbsStore";
import { createRouter, createWebHistory } from "vue-router";
import Login from "@/pages/Login.vue";
import { useAuthStore } from "@/stores/auth";
import priceRoutes from "./service.routes";
import Dashboard from "@/features/Dashboard/pages/Dashboard.vue";
import claimRoutes from "./claim.routes";
// import institutionRoutes from "./institution.routes";
import adminRoutes from "./admin.routes";
import instutionSetingRoutes from "./institution_settings.routes";
import insuredPersonRoutes from "./insured_persons.routes";
import Provider_contractsRoutes from "./providerContract.routes";
import providerRoutes from "./providers.routes"
import payerContractRoutes from "./payerContract.routes";
import creditServicesRoutes from "./credit_services.routes";
import submitClaimsRoutes from "./submit_claims.routes";
import authorizationRoutes from "./authorization.routes";
import Profile from "@/features/profile/pages/profile.vue";
import product_settingsRoutes from "./product_settings.routes";

function addMetaToRoutes(routes) {
  return routes.map(route => {
    // If the route has a privilege property in its meta, make sure it's also marked as requiresAuth
    if (route.meta?.privilege && !route.meta.requiresAuth) {
      route.meta.requiresAuth = true;
    }
    
    // If the route has children, process them recursively
    if (route.children) {
      route.children = addMetaToRoutes(route.children);
    }
    
    return route;
  });
}

const router = createRouter({
  history: createWebHistory(),
  routes: addMetaToRoutes([
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
        
        ...priceRoutes,
        ...claimRoutes,
        ...adminRoutes,
        ...instutionSetingRoutes,
        ...insuredPersonRoutes,
        ...Provider_contractsRoutes,
        ...providerRoutes,
        ...payerContractRoutes,
        ...creditServicesRoutes,
        ...submitClaimsRoutes,
        ...authorizationRoutes,
        ...product_settingsRoutes,
       
      ],
    },
  ]),
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
  console.log("Navigation guard triggered:", { to: to.path, from: from.path });
  
  if (!auth.auth?.accessToken) {
    const userDetail = localStorage.getItem("userDetail");
    if (userDetail) {
      try {
        const parsedDetail = JSON.parse(userDetail);
        auth.setAuth({
          user: parsedDetail,
          accessToken: parsedDetail?.token,
        });
        console.log("Restored auth from localStorage");
      } catch (e) {
        localStorage.removeItem("userDetail");
        console.error("Failed to parse userDetail from localStorage", e);
      }
    }
  }

  if (to.path === "/login" && auth.auth?.accessToken) {
    console.log("Already logged in, redirecting from login page");
    return { path: from.path || '/dashboard' };
  }

  if (to.path === '/') {
    console.log("Root path, redirecting to dashboard");
    return { path: '/dashboard' };
  }

  const isProtectedRoute = to.path !== '/login' && 
                          !to.path.startsWith('/public/') && 
                          to.matched.some(record => record.name === 'home');
  
  console.log("Route protection check:", { 
    isProtectedRoute,
    path: to.path,
    meta: to.meta,
    matched: to.matched.map(r => r.name)
  });

  if (isProtectedRoute) {
    if (!auth.auth?.accessToken) {
      console.log("No access token, redirecting to login");
      return {
        path: '/login',
        query: { redirect: to.fullPath }
      };
    }

    console.log("User info:", {
      roleName: auth.auth?.user?.roleName,
      authorities: auth.auth?.user?.authorities
    });

    // Super Admin or user with All Privileges can access everything
    if (
      auth.auth?.user?.authorities?.includes("All Privileges") ||
      auth.auth?.user?.roleName === "Super Admin"
    ) {
      console.log("User is Super Admin or has All Privileges, access granted");
      return true;
    }

    // Check if the route requires specific privileges
    if (to.meta?.privilege && to.meta.privilege.length > 0) {
      console.log("Route requires specific privileges:", to.meta.privilege);
      
      // User has no authorities, deny access
      if (!auth.auth?.user?.authorities || auth.auth.user.authorities.length === 0) {
        console.log("User has no authorities, access denied");
        return { path: '/dashboard' };
      }
      
      // Check if user has any of the required privileges
      const hasRequiredPrivilege = to.meta.privilege.some(privilege => 
        auth.auth.user.authorities.includes(`ROLE_${privilege}`)
      );
      
      if (!hasRequiredPrivilege) {
        console.log("User lacks required privileges, access denied");
        return { path: '/dashboard' };
      }
      
      console.log("User has required privileges, access granted");
    }
    
    // If no specific privileges are required, allow access
    return true;
  }

  return true;
});

export default router;
