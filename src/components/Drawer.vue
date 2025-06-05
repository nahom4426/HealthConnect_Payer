<script setup>
import navs from "@/config/navs";
import icons from "@/utils/icons";
import { useAuthStore } from "@/stores/auth";
import { useColorStore } from "@/stores/colorStore";
import { ref, computed, onMounted, onUnmounted, defineProps, defineEmits } from "vue";
import { useRouter, useRoute } from "vue-router";

const auth = useAuthStore();
const colorStore = useColorStore();
const route = useRoute();
const router = useRouter();

const isDarkMode = ref(false);
const isMobile = ref(false);
const expandedMenus = ref([]);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);

  const savedTheme = localStorage.getItem("darkMode");
  isDarkMode.value = savedTheme === "true";
  applyTheme();

  // Expand menu if route matches
  navs.forEach((item) => {
    if (item.navs?.some((child) => child.path === route.path)) {
      expandedMenus.value.push(item.name);
    }
  });
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
});

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem("darkMode", isDarkMode.value);
  applyTheme();
};

const applyTheme = () => {
  const root = document.documentElement;
  root.classList.toggle("dark-mode", isDarkMode.value);
};

// Props and emits
const props = defineProps({
  isCollapsed: Boolean,
  toggleSidebar: Function
});
const emit = defineEmits(["toggle-sidebar", "toggle-menu"]);

// Privilege logic
const userData = computed(() => auth.auth || {});
const hasPrivilege = (requiredPrivileges) => {
  if (!requiredPrivileges || requiredPrivileges.length === 0) return true;
  const userPrivileges = userData.value.privileges || [];
  const userRole = userData.value.roleName;
  return userRole === "Super Admin" || userPrivileges.includes("All Privileges") ||
    requiredPrivileges.some((priv) => userPrivileges.includes(`ROLE_${priv}`));
};

// Filtered navs
const filteredNavs = computed(() => {
  return navs
    .map((item) => {
      if (item.navs) {
        const filteredChildren = item.navs.filter(child => hasPrivilege(child.privilege));
        return hasPrivilege(item.privilege) || filteredChildren.length > 0
          ? { ...item, navs: filteredChildren }
          : null;
      }
      return hasPrivilege(item.privilege) ? item : null;
    })
    .filter(Boolean);
});

const toggleMenu = (name) => {
  if (props.isCollapsed || isMobile.value) props.toggleSidebar();
  expandedMenus.value = expandedMenus.value.includes(name)
    ? expandedMenus.value.filter((n) => n !== name)
    : [name];
  emit("toggle-menu", name);
};

const handleSingleItemClick = () => {
  if (props.isCollapsed || isMobile.value) props.toggleSidebar();
};
</script>

<template>
  <div
    :class="[
      props.isCollapsed ? 'w-[70px] md:w-[50px]' : 'w-[260px]',
      'h-screen __drawer border-r rounded-lg bg-white text-[#75778B] p-3 space-y-2 overflow-y-auto scrollbar-hide transition-all duration-300 flex flex-col relative',
      isMobile ? 'fixed z-50' : 'relative'
    ]"
  >
    <!-- Mobile overlay -->
    <div 
      v-if="isMobile && !props.isCollapsed"
      class="fixed inset-0 bg-black/50 z-40 md:hidden"
      @click="props.toggleSidebar"
    ></div>

    <!-- Header -->
    <div :class="[ 'flex items-center px-3 py-4 border-b ', props.isCollapsed ? 'flex-col gap-3' : 'flex-row justify-between' ]">
      
      <div :class="[ 'flex items-center bg-white rounded-lg gap-2', props.isCollapsed ? 'flex-col p-2' : 'flex-row px-3 pt-2 w-full' ]">
         <button v-if="props.isCollapsed" @click="props.toggleSidebar" class="text-[#75778B] hover:bg-primary hover:text-white hover:bg-white/10 p-2 rounded-full">
        <i v-html="icons.chevron_right" />
      </button>
        <div class=" w-6 h-6  flex items-center justify-center border-primary flex-shrink-0">
          <img class="w-5 h-5" src="/src/assets/logo.svg" alt="HealthConnect Logo" />
        </div>
        <span v-if="!props.isCollapsed" class="text-md font-bold text-[#02676B] hover:bg-primary hover:text-white">HealthConnect</span>
      </div>
    </div>

    <!-- Toggle button positioned at the edge -->
    <button 
    v-if="!props.isCollapsed"
      @click="props.toggleSidebar" 
      class="absolute -right-1 top-10 z-50 text-[#75778B] hover:bg-primary hover:text-white hover:bg-white/10 p-2 rounded-full"
    >
      <i v-html="icons.chevron_left" />
    </button>

    <!-- Navigation Items -->
      <div class="flex-1 flex flex-col space-y-1 overflow-hidden">
    <template v-for="item in filteredNavs" :key="item.name || item.path">
      <!-- Category Label -->
      <div 
        v-if="item.category && !props.isCollapsed" 
        class="text-[11px] uppercase tracking-wider text-[#75778B] hover:bg-primary hover:text-white mt-4 mb-1 px-3 transition-colors duration-200"
      >
        {{ item.category }}
      </div>

      <!-- Parent Group -->
      <template v-if="item.navs && item.navs.length">
        <button
          @click="toggleMenu(item.name)"
          class="flex justify-between items-center px-3 py-2.5 rounded-lg hover:bg-primary text-[#75778B] hover:text-white transition-all duration-200"
          :class="{ '': expandedMenus.includes(item.name) }"
        >
          <span class="flex items-center gap-3">
            <i v-html="item.icon" class="text-[18px] w-[26px] transition-transform duration-200"></i>
            <span v-if="!props.isCollapsed" class="text-sm font-medium">{{ item.name }}</span>
          </span>
          <span v-if="!props.isCollapsed" class="pr-4 w-6 h-6 flex items-center justify-center">
            <i v-html="icons.chevron_down" class="transition-all duration-200 text-[14px]"
               :class="{ ' rotate-180': expandedMenus.includes(item.name) }" />
          </span>
        </button>

        <!-- Child Items -->
        <transition-group
          name="child-items"
          tag="div"
          v-show="expandedMenus.includes(item.name) && !props.isCollapsed"
          class="pl-9 mt-1 space-y-1 overflow-hidden"
        >
          <RouterLink
            v-for="child in item.navs"
            :key="child.path"
            :to="child.path"
            class="block px-3 py-2 rounded-lg text-sm text-[#75778B] hover:bg-primary hover:text-white transition-all duration-200"
            :class="{ 'text-white bg-primary font-medium': route.path === child.path }"
            @click="isMobile ? props.toggleSidebar() : null"
          >
            <span class="flex items-center gap-3">
              <i v-html="child.icon" class="text-[15px] transition-transform duration-200" />
              <span class="transition-all duration-200">{{ child.name }}</span>
            </span>
          </RouterLink>
        </transition-group>
      </template>

      <!-- Single Link -->
      <template v-else>
        <RouterLink
          :to="item.path"
          @click="handleSingleItemClick"
          class="block px-3 py-3 rounded-lg text-[#75778B] hover:bg-primary hover:text-white transition-all duration-200"
          :class="{ 'text-white bg-primary': route.path === item.path }"
        >
          <span class="flex items-center gap-3">
            <i v-html="item.icon" class="text-[18px] transition-transform duration-200"></i>
            <span v-if="!props.isCollapsed" class="text-sm font-medium transition-all duration-200">{{ item.name }}</span>
          </span>
        </RouterLink>
      </template>
    </template>
  </div>

    <!-- Dark mode toggle -->
    <div class="flex items-center w-full gap-3 justify-center py-5 text-white">
      <button
        @click="toggleDarkMode"
        class="p-2 rounded-full hover:bg-white/10"
        :title="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
      >
        <i v-html="isDarkMode ? icons.sun : icons.moon" class="text-lg" />
      </button>
      <span v-if="!props.isCollapsed" class="text-sm font-medium">
        {{ isDarkMode ? "Dark Mode" : "Light Mode" }}
      </span>
      <label v-if="!props.isCollapsed" class="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" v-model="isDarkMode" @change="toggleDarkMode" class="sr-only peer" />
        <div class="w-11 h-6 bg-gray-200 rounded-full after:absolute after:top-[2px] after:left-[2px] after:bg-primary after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary after:peer-checked:bg-white peer-checked:after:translate-x-full"></div>
      </label>
    </div>
  </div>
</template>

<style scoped>
.__drawer {
  --drawer-width: 260px;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.router-link-active {
  @apply bg-primary text-white px-3 py-4 my-4 rounded-lg;
}

i {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
:root.dark-mode {
  --primary: 56 57 148;
  --bg-color: 30 30 40;
  --text-color: 240 240 250;
  color-scheme: dark;
}

:root.dark-mode body {
  background-color: rgb(var(--bg-color));
  color: rgb(var(--text-color));
}
:root.dark-mode .__drawer {
  background-color: rgb(20, 20, 30);
  border-color: rgb(40, 40, 50);
}
:root.dark-mode .__drawer .router-link-exact-active {
  background-color: rgba(255, 255, 255, 0.1);
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
  transform: translateX(4px);
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
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 60%;
  width: 3px;
  background-color: currentColor;
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
