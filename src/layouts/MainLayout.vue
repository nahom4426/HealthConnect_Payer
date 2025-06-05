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

const authStore = useAuthStore();
const isCollapsed = ref(false);
const route = useRoute();
const breadcrumbs = useBreadcrumb();
const colorStore = useColorStore();
const expandedMenus = ref([]);

function logout() {
  localStorage.removeItem("userDetail");
  window.location.href = "/login";
}

function toggleMenu(name) {
  if (expandedMenus.value.includes(name)) {
    expandedMenus.value = expandedMenus.value.filter((n) => n !== name);
  } else {
    expandedMenus.value.push(name);
  }
}

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value;
}

// Privilege-based filtering
const filteredNavs = computed(() => {
  const privileges = authStore.user?.privileges || [];

  const hasAccess = (path) =>
    privileges.some((p) => p.toLowerCase().includes(path.toLowerCase()));

  return navs
    .map((item) => {
      if (item.navs) {
        const filteredChildren = item.navs.filter((child) =>
          hasAccess(child.path)
        );
        if (filteredChildren.length) {
          return {
            ...item,
            navs: filteredChildren,
          };
        }
        return null;
      } else {
        return hasAccess(item.path) ? item : null;
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
  <div :class="colorStore.color" class="flex h-full w-full bg-[#F6F7FA] ">
    <!-- Drawer gets privilege-filtered navs -->
     <div class="h-full w-navbar-width rounded-lg transition-all duration-300 ml-2 my-3">

       <Drawer
         :is-collapsed="isCollapsed"
         :toggle-sidebar="toggleSidebar"
         :navs="filteredNavs"
         :expanded-menus="expandedMenus"
         :toggle-menu="toggleMenu"
       />
     </div>

    <div class="flex flex-col flex-1 overflow-hidden rounded-lg bg-[#f6f6f8]">
      <div class="h-navbar-height bg-white flex items-center rounded-lg justify-between px-4 py-6 mx-4 mt-3 mb-3 shadow-sm">
        <!-- Left side: Page title -->
        <div class="flex flex-col p-4">
          <h1 class="text-lg font-medium text-gray-800">{{ breadcrumbs.breadcrumbs[breadcrumbs.breadcrumbs.length - 1]?.name || 'HealthConnect' }}</h1>
          <p class="text-xs text-gray-500">Sample Data Analytics</p>
        </div>
        
        <!-- Right side: Notification, Language selector, and User profile -->
        <div class="flex items-center gap-4">
          <!-- Notification bell -->
          <button class="p-2  px-4 py-6 rounded-lg bg-[#F6F7FA] hover:bg-gray-100">
            <i v-html="icons.notification || '<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 24 24\'><path fill=\'currentColor\' d=\'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z\'/></svg>'" />
          </button>
          
          <!-- Language selector -->
          <div class="flex items-center gap-1 px-4 py-6 rounded-lg bg-[#F6F7FA] hover:bg-gray-100 cursor-pointer">
            <span class="text-sm font-medium">Eng</span>
            <i v-html="icons.chevron_down || '<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\'><path fill=\'currentColor\' d=\'M7 10l5 5 5-5z\'/></svg>'" />
          </div>
          
          <!-- User profile dropdown -->
          <Dropdown v-slot="{ setRef, toggleDropdown }">
            <div class="flex items-center gap-2 px-4 py-4 rounded-lg bg-[#F6F7FA] hover:bg-gray-100 cursor-pointer">
              <div class="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center overflow-hidden">
                <img src="/src/assets/img/profile.png" alt="User avatar" class="w-full h-full object-cover" onerror="this.style.display='none'" />
                <span v-if="!$event?.target?.src" class="font-bold text-black">{{ authStore.user?.firstName?.charAt(0) || 'U' }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-medium">{{ authStore.user?.firstName || 'Birhane Araya' }}</span>
                <span class="text-xs text-gray-500">{{ authStore.user?.role || 'Admin' }}</span>
              </div>
             <button @click.prevent="toggleDropdown">
                <i v-html="icons.chevron_down"></i>
              </button>
              </div>
            <div
            class="flex shadow-lg border p-2 mt-2 rounded flex-col gap-2 w-60 bg-[#F6F7FA]"
              :ref="setRef"
            >
              <button
                @click="logout()"
                class="p-2 flex items-center gap-2 rounded-lg hover:bg-gray-100"
              >
                <i v-html="icons.logout || '<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' viewBox=\'0 0 24 24\'><path fill=\'currentColor\' d=\'M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z\'/></svg>'" />
                <span>Logout</span>
              </button>
            </div>
          </Dropdown>
         
        </div>
      </div>

      <div class="show-scrollbar h-[calc(100%-var(--navbar-height))] rounded-lg border-[1px] mx-4 px-4 py-4  overflow-auto">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* These styles are now in the Drawer component */
</style>

