<script setup>
import Drawer from "@/components/Drawer.vue";
import Dropdown from "@/components/Dropdown.vue";
import { useAuthStore } from "@/stores/auth";
import { useBreadcrumb } from "@/stores/breadCrumbsStore";
import { useColorStore } from "@/stores/colorStore";
import icons from "@/utils/icons";
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import navs from "@/config/navs"; // Make sure you import this
import NavBar from "@/components/NavBar.vue";

const authStore = useAuthStore();
const isCollapsed = ref(false);
const route = useRoute();
const breadcrumbs = useBreadcrumb();
const colorStore = useColorStore();
const expandedMenus = ref([]);

function toggleMenu(name) {
  if (expandedMenus.value.includes(name)) {
    expandedMenus.value = expandedMenus.value.filter((n) => n !== name);
  } else {
    expandedMenus.value.push(name);
  }
}

function toggleSidebar(status) {
  if (!status) {
    document.documentElement.style.setProperty("--drawer-width", "50px");
  } else {
    document.documentElement.style.setProperty("--drawer-width", "16rem");
  }
  isCollapsed.value = !isCollapsed.value;
}

const filteredNavs = computed(() => {
  const privileges = authStore.user?.authorities || [];
  const userRole = authStore.user?.roleName;

  const hasAccess = (path, requiredPrivileges) => {
    if (!requiredPrivileges || requiredPrivileges.length === 0) return true;
    
    // Super Admin or user with All Privileges can access everything
    if (userRole === "Super Admin" || privileges.includes("All Privileges")) {
      return true;
    }
    
    // If user has no authorities and privileges are required, deny access
    if (privileges.length === 0) {
      return false;
    }
    
    // Check if user has any of the required privileges
    return requiredPrivileges.some((priv) => 
      privileges.includes(`ROLE_${priv}`)
    );
  };

  return navs
    .map((item) => {
      if (item.navs) {
        const filteredChildren = item.navs.filter((child) =>
          hasAccess(child.path, child.privilege)
        );
        if (filteredChildren.length) {
          return {
            ...item,
            navs: filteredChildren,
          };
        }
        return null;
      } else {
        return hasAccess(item.path, item.privilege) ? item : null;
      }
    })
    .filter(Boolean);
});

onMounted(() => {
  filteredNavs.value.forEach((item) => {
    if (item.navs?.some((child) => child.path === route.path)) {
      expandedMenus.value.push(item.name);
    }
  });
});
</script>

<template>
  <div
    :class="colorStore.color"
    class="flex h-full p-3 box-border gap-6 w-full bg-[#F6F7FA]"
  >
    <div class="h-full w-navbar-width rounded-lg transition-all duration-300">
      <Drawer
        :is-collapsed="isCollapsed"
        :toggle-sidebar="toggleSidebar"
        :navs="filteredNavs"
        :expanded-menus="expandedMenus"
        :toggle-menu="toggleMenu"
      />
    </div>

    <div class="flex flex-col gap-6 flex-1 pr-6 overflow-hidden">
      <NavBar :breadcrumbs="breadcrumbs" />

      <div
        class="show-scrollbar  w-full h-[calc(100%-var(--navbar-height))] overflow-auto"
      >
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
