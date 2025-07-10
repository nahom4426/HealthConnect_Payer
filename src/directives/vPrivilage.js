import { useAuthStore } from "@/stores/auth";

function checkPrivilege(el, { value, modifiers }) {
  if (!value && !modifiers) return;

  const authStore = useAuthStore();
  let user = authStore.auth?.user;

  if (!user) {
    let storedUser = localStorage.getItem("userDetail");
    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  }

  if (
    user?.authorities.includes("All Privileges") ||
    user.roleName === "ADMIN"
  )
    return;

  if (modifiers?.role && value) {
    if (user.roleName !== value) {
      el.remove();
    }
    return;
  }

  if (value instanceof Array) {
    let privileges = user?.authorities;

    const found = value?.find((privilege) => {
      return privileges?.includes(`ROLE_${privilege}`);
    });

    if (!found) {
      el.remove();
    }
  }
}

const vPrivilege = {
  mounted: checkPrivilege,
  updated: checkPrivilege,
};

export default vPrivilege;
