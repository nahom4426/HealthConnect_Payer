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
  <div
    :class="colorStore.color"
    class="flex h-full py-3 pl-3 gap-6 w-full bg-[#F6F7FA]"
  >
    <div class="h-screen w-navbar-width rounded-lg transition-all duration-300">
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
        class="show-scrollbar h-[calc(100%-var(--navbar-height))] overflow-auto"
      >
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
