import { defineStore } from "pinia";
import { ref } from "vue";

export const usePayment = defineStore("paymentStore", () => {
  const payment = ref([]);

  function set(data) {
    payment.value = data || [];
  }

  function getAll() {
    return payment.value;
  }

  function remove(id) {
    const idx = payment.value.findIndex((el) => el.dispensingUuid == id);
    if (idx > -1) {
      payment.value.splice(idx, 1);
    }
  }

  function add(data) {
    payment.value.unshift(data);
  }

  function update(id, data) {
    const idx = payment.value.findIndex((el) => el.dispensingUuid == id);
    if (idx > -1) {
      payment.value.splice(idx, 1, data);
    }
  }

  return {
    set,
    add,
    remove,
    update,
    getAll,
    payment,
  };
});
