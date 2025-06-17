<script setup>
import navs from "@/config/navs";
import icons from "@/utils/icons";
import { useAuthStore } from "@/stores/auth";
import { useColorStore } from "@/stores/colorStore";
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  defineProps,
  defineEmits,
} from "vue";
import { useRouter, useRoute } from "vue-router";

const auth = useAuthStore();
const colorStore = useColorStore();
const route = useRoute();
const router = useRouter();

const isDarkMode = ref(false);
const isMobile = ref(false);
const expandedMenus = ref([]);
function handleSingleItemClick() {
  // Your logic for handling the item click
  console.log('Item clicked:', navItem);
}
const props = defineProps({
  isCollapsed: Boolean,
  toggleSidebar: Function,
});
const emit = defineEmits(["toggle-sidebar", "toggle-menu"]);

const userData = computed(() => auth.auth || {});
const hasPrivilege = (requiredPrivileges) => {
  if (!requiredPrivileges || requiredPrivileges.length === 0) return true;
  const userPrivileges = userData.value.privileges || [];
  const userRole = userData.value.roleName;
  return (
    userRole === "Super Admin" ||
    userPrivileges.includes("All Privileges") ||
    requiredPrivileges.some((priv) => userPrivileges.includes(`ROLE_${priv}`))
  );
};

const filteredNavs = computed(() => {
  return navs
    .map((item) => {
      if (item.navs) {
        const filteredChildren = item.navs.filter((child) =>
          hasPrivilege(child.privilege)
        );
        return hasPrivilege(item.privilege) || filteredChildren.length > 0
          ? { ...item, navs: filteredChildren }
          : null;
      }
      return hasPrivilege(item.privilege) ? item : null;
    })
    .filter(Boolean);
});

const toggleMenu = (name) => {
  // if (props.isCollapsed || isMobile.value) props.toggleSidebar();
  expandedMenus.value = expandedMenus.value.includes(name)
    ? expandedMenus.value.filter((n) => n !== name)
    : [name];
  emit("toggle-menu", name);
};
</script>

<template>
  <div
    class="h-full rounded-2xl w-drawer-width bg-white overflow-auto space-y-4 transition-all duration-300 flex flex-col"
  >
    <div
      @click="
        isCollapsed ? props.toggleSidebar(true) : props.toggleSidebar(false)
      "
      :class="isCollapsed ? 'rotate-180' : ''"
      class="size-6 cursor-pointer rounded-full border shadow-s flex items-center justify-center border-[#F6F7FA] top-left bg-white"
    >
      <i v-html="icons.chevron_left"></i>
    </div>
    <div class="space-y-4 flex-shrink-0">
      <div class="flex gap-2 py-4 w-full items-center justify-center">
        <img
          class="size-8"
          src="/src/assets/logo.svg"
          alt="HealthConnect Logo"
        />
        <span
          v-if="!props.isCollapsed"
          class="text-md font-bold days-one text-primary"
          >HealthConnect</span
        >
      </div>
      <div class="border border-b border-[#F6F7FA]"></div>
    </div>
    <div
      :class="[props.isCollapsed ? 'items-center' : 'px-4']"
      class="pb-4 overflow-scroll scrollbar-hide h-full text-base-clr"
    >
      <div class="flex flex-col justify-center overflow-x-hidden gap-2">
        <template v-for="item in filteredNavs" :key="item.name || item.path">
          <template v-if="item.navs && item.navs.length">
           <button
  @click="toggleMenu(item.name)"
  class="flex justify-between w-full items-center h-12 rounded-lg hover:bg-primary hover:text-white transition-all duration-200"
  :class="{
    'bg-[#DFF1F1]': expandedMenus.includes(item.name) && !isCollapsed,
    '': !expandedMenus.includes(item.name) || isCollapsed
  }"
>
  <span class="flex items-center gap-4 ml-3">
    <i v-html="item.icon"></i>
    <span
      v-if="!props.isCollapsed"
      class="text-sm md:whitespace-nowrap font-medium"
      >{{ item.name }}</span
    >
  </span>
  <i
    v-if="!isCollapsed"
    class="mr-3"
    v-html="icons.chevron_down"
    :class="{ 'rotate-180': expandedMenus.includes(item.name) }"
  />
</button>

            <div
              name="child-items"
              tag="div"
              class="pl-1 mt-2 space-y-2 border-l"
              :class="[isCollapsed ? '' : 'ml-6']"
            >
              <RouterLink
                v-show="expandedMenus.includes(item.name)"
                v-for="child in item.navs"
                :key="child.path"
                :to="child.path"
                class="flex h-12 pl-3 rounded-lg hover:bg-primary hover:text-white"
              >
                <span class="flex items-center gap-3">
                  <i v-html="child.icon" />
                  <span v-if="!isCollapsed" class="wh">{{ child.name }}</span>
                </span>
              </RouterLink>
            </div>
          </template>
          <template v-else>
            <RouterLink
              :to="item.path"
              @click="handleSingleItemClick"
              class="flex h-12 rounded-lg hover:bg-primary hover:text-white transition-all duration-200"
              :class="[isCollapsed ? 'justify-center' : ' pl-3']"
            >
              <span class="flex items-center gap-3">
                <i v-html="item.icon"></i>
                <span
                  v-if="!props.isCollapsed"
                  class="text-sm font-medium transition-all duration-200"
                  >{{ item.name }}</span
                >
              </span>
            </RouterLink>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.__drawer {
  overflow-y: scroll;
  /* --drawer-width: 260px; */
}

.router-link-active {
  @apply bg-primary text-white  rounded-lg;
}

.top-left {
  position: absolute;
  top: 45px;
  left: calc(var(--drawer-width));
}
i {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

html {
  transition: background-color 0.3s ease;
}
@media (max-width: 767px) {
  .__drawer {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  .__drawer:not(.is-collapsed) {
    transform: translateX(0);
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  }
}
</style>

<style scoped>
/* ... (keep all your existing styles) */

/* Add these new animation styles */
.child-items-enter-active,
.child-items-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.child-items-enter-from,
.child-items-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.child-items-move {
  transition: transform 0.3s ease;
}

/* Hover animations */
.router-link-active,
button {
  transition: all 0.2s ease;
}

.router-link-active:hover,
button:hover {
  transform: translateX(2px);
}

.router-link-active:hover i,
button:hover i {
  transform: scale(1.1);
}

/* Active link animation */
.router-link-active {
  position: relative;
}

.router-link-active::after {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 60%;
  width: 3px;
  border-radius: 0 3px 3px 0;
  transition: all 0.3s ease;
}

/* Dark mode specific animations */
:root.dark-mode .router-link-active:hover,
:root.dark-mode button:hover {
  transform: translateX(4px) scale(1.02);
}

/* Mobile specific animations */
@media (max-width: 767px) {
  .__drawer {
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .__drawer:not(.is-collapsed) {
    transform: translateX(0);
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  }
}
</style>
