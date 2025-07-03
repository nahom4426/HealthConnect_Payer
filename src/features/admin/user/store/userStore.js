import { ref } from "vue";
import { defineStore } from "pinia";
import { getAllUser } from "../Api/UserApi";

export const useUserStore = defineStore("userStore", () => {
  const users = ref([]);

  function set(data) {
    users.value = data;
  }

  function getAll() {
    return users.value;
  }

  function add(data) {
    return users.value.push(data);
  }

  function update(id, data) {
    const idx = users.value.findIndex((el) => el.userUuid == id);
    if (idx == -1) return;

    users.value.splice(idx, 1, data);
  }

  function remove(id) {
    const idx = users.value.findIndex((el) => el.userUuid == id);
    if (idx == -1) return;
    users.value.splice(idx, 1);
  }

  function updateStatus(id, status) {
    const idx = users.value.findIndex((el) => el.userUuid == id);
    if (idx == -1) return;

    users.value[idx].userStatus = status;
  }

  // Add fetchUsers function to load users from API
  async function fetchUsers() {
    try {
      const response = await getAllUser();
      if (response.success) {
        set(response.data);
      } else {
        throw new Error(response.error || "Failed to fetch users");
      }
      return response;
    } catch (error) {}
  }

  return {
    users,
    set,
    getAll,
    add,
    update,
    remove,
    updateStatus,
    fetchUsers,
  };
});

// For backward compatibility
export const useUsers = useUserStore;
