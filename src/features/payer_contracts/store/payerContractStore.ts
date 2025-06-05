import { defineStore } from "pinia";
import { ref } from "vue";

// Status type (adjust if needed)
export type Status = "ACTIVE" | "INACTIVE" | "PENDING"; // or import from "@/types/interface"

// Provider interface
export interface Provider {
  providerUuid: string;
  email: string;
  providerName: string;
  description: string;
  telephone: string;
  category: string;
  level: string;
  address1: string;
  address2: string;
  address3: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  status: Status;
}

export const useProviders = defineStore("providerStore", () => {
  const providers = ref<Provider[]>([]);

  function getAll(): Provider[] {
    return providers.value;
  }

  function set(data: Provider[]): void {
    console.log("Setting providers in store:", data);
    providers.value = data;
  }

  // Alias for set
  function setProviders(data: Provider[]): void {
    console.log("Setting providers with setProviders:", data);
    set(data);
  }

  // Alias for set
  function setAll(data: Provider[]): void {
    console.log("Setting providers with setAll:", data);
    set(data);
  }

  function add(data: Provider): void {
    console.log("Adding provider to store:", data);
    providers.value.unshift(data);
  }

  function update(id: string, data: Partial<Provider>): void {
    console.log(`Updating provider with UUID: ${id}`, data);
    
    // Debug: log all provider UUIDs to check for matches
    console.log("Available provider UUIDs:", providers.value.map(p => p.providerUuid));
    
    const idx = providers.value.findIndex((el) => el.providerUuid === id);
    if (idx === -1) {
      console.warn(`[Provider Store] No provider found with UUID: ${id}`);
      // If not found by UUID, try to add it instead
      if (data.providerUuid) {
        console.log("Provider not found for update, adding instead:", data);
        add(data as Provider);
      }
      return;
    }

    // Use splice for reactive updates
    providers.value.splice(idx, 1, {
      ...providers.value[idx],
      ...data,
    });
    console.log("Provider updated successfully");
  }

  function remove(id: string): void {
    const idx = providers.value.findIndex((el) => el.providerUuid === id);
    if (idx === -1) {
      console.warn(`[Provider Store] No provider found with UUID: ${id}`);
      return;
    }

    providers.value.splice(idx, 1);
  }

  // Update provider status
  function updateStatus(id: string, status: Status): void {
    console.log(`Updating status for provider with UUID: ${id} to ${status}`);
    update(id, { status });
  }

  return {
    providers,
    getAll,
    set,
    setProviders,
    setAll,
    add,
    update,
    updateStatus,
    remove,
  };
});
