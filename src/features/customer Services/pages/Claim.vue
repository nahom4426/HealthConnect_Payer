<script setup>
import NewFormParent from "@/components/NewFormParent.vue";
import ClaimForm from "../components/ClaimForm.vue";
import Button from "@/components/Button.vue";
import icons from "@/utils/icons";
import ServiceProvider from "./serviceProvider.vue";
import ServiceFilter from "../components/ServiceFilter.vue";
import ServiceTable from "../components/ServiceTable.vue";
import { ref } from "vue";
import { useApiRequest } from "@/composables/useApiRequest";
import {
  addServiceProvided,
  submitClaim,
  submitClaimAttachment,
} from "../api/claimApi";
import { useAuthStore } from "@/stores/auth";
import { Icon } from "@iconify/vue";
import router from "@/router";
import { useRoute } from "vue-router";
import { toasted } from "@/utils/utils";
import { addUsedServices } from "@/features/prices/api/serviceApi";
import { useCoverage } from "../store/coverageStore";
import { useAddedServices } from "../store/addServicesStore";
const addServiceStore = useAddedServices();
const addedServices = ref([]);
const api = useApiRequest();
const route = useRoute();
const today = new Date();
const formattedDate = today.toISOString().split("T")[0];
const coverageStore = useCoverage();
function addService({ values, reset }) {
  let file = values.attachment[0];
  let fileName = values.attachment[0]?.name;
  const fd = new FormData();
  fd.append("file", file);
  api.send(
    () =>
      addServiceProvided(
        {
          claimUuid: route.params.Uuid,
          eligibleServiceUuid: values?.eligibleServiceUuid,
          qty: values?.qty,
          providedDate: formattedDate,
          packageUuid: values?.packageUuid,
        },
        fd
      ),
    (res) => {
      if (res.success) {
        let coverage = coverageStore.coverage.find(
          (el) => el?.packageUuid == values.packageUuid
        );
        values.packageName = coverage.packageName;
        addServiceStore.add(values);
        addedServices.value.unshift(values);

        reset();
      }
      toasted(res.success, " Service Added Successfully", res.error);
    }
  );
}
function removeService(id) {
  const idx = addedServices.value.findIndex((el) => el.packageUuid == id);
  if (idx > -1) {
    addedServices.value.splice(idx, 1);
  } else {
    return;
  }
}
const diagnosis = ref("");
const importReq = useApiRequest();
const progress = ref();
let controller;
function importMembers(ev, claim) {
  if (controller) {
    controller.abort();
  }

  controller = new AbortController();
  let file = ev.target.files[0];
  let fileName = ev.target.files[0]?.name;
  const fd = new FormData();
  fd.append("file", file);
  importReq.send(
    () =>
      submitClaimAttachment(
        { fileNames: fileName, claimUuid: claim?.claimUuid },
        fd,
        {
          signal: controller.signal,
          onUploadProgress: (ev) => {
            const per = (ev.loaded / ev.total) * 100;
            progress.value.setAttribute("data-per", Math.floor(per));
            progress.value.style.setProperty("width", `${per}%`);
          },
        }
      ),
    (res) => {
      if (res.success) {
        addedServices.value = [];
      }
      toasted(
        res.success,
        "Claim Prepared and synchronized successfully ",
        res.error
      );
    }
  );
}

function cancelImport() {
  controller.abort();
}
const submitApi = useApiRequest();
const authStore = useAuthStore();
const comment = ref("");
function submit(claim) {
  submitApi.send(
    () =>
      submitClaim({
        claimUuid: claim?.claimUuid,
        approvedByProviderUuid: authStore.auth?.user?.providerUuid,
        providerComment: comment.value,
        approverFullName: "Abebe",
      }),
    (res) => {
      toasted(res.success, "Sucessfully importted", res.error);
      if (res.success) {
      }
    }
  );
}
</script>
<template>
  <NewFormParent class="!p-0 bg-gray-100" size="xl" title="Claim Detail">
    <div class="flex flex-col gap-5">
      <div
        v-if="importReq.pending.value"
        class="backdrop-blur-sm w-full z-10 grid place-items-center fixed inset-0 bg-dark/40"
      >
        <div class="w-1/2 h-full p-4 flex flex-col justify-center">
          <div class="bg-white rounded p-4 flex items-center gap-2">
            <p>Importing Attachment</p>
            <div class="h-10 flex-1 rounded overflow-hidden bg-accent relative">
              <div
                ref="progress"
                class="progress flex-1 absolute rounded w-0 top-0 left-0 inset-0 bg-primary"
              />
            </div>
            <Button
              @click="cancelImport"
              class="border border-red-500 text-red-500"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <ServiceProvider
        v-slot="{ attachments, claims, pending, services, coverage }"
        :claimUuid="$route.params.Uuid"
      >
        <!-- <div
           v-else-if="Object.keys(claims || {}).length > 1"
           class="flex flex-col gap-2 items-center"
         >
           <div
             class="flex-1 w-full flex justify-center py-5 h-full size-28 *:h-56"
             v-html="icons.no_data"
           />
           <p class="text-xl">
             {{ placeholder ? placeholder : "No Data Found" }}
           </p>
         </div> -->

        <div v-if="!pending" class="flex flex-col gap-4">
          <ClaimForm
            :attachments="attachments"
            :services="services"
            :claims="claims"
          />
          <ServiceTable
            v-if="addServiceStore.addedServices.length"
            :addedServices="addServiceStore.addedServices"
            :removeService="removeService"
            :headers="{
              head: [
                'Id',
                'Name',
                'Assured Id ',
                'Relationship',
                'Institution Name',
                'Insurance Name',
                'actions',
              ],
              row: [
                'providedDate',
                'packageName',
                'itemCode',
                'itemDescription',
                'qty',
                'unitPrice',
                'amount',
                '',
              ],
            }"
            :rows="addedServices"
          ></ServiceTable>

          <ServiceFilter
            :addedServices="addedServices"
            :removeService="removeService"
            :services="services"
            :coverage="coverage"
            :addService="addService"
          />
          <div class="flex flex-col gap-8">
            <div class="flex justify-between items-center">
              <div class="flex flex-col gap-2 px-2 font-semibold opacity-80">
                <label for="">Diagnosis</label>
                <textarea
                  v-model="diagnosis"
                  placeholder="Write your diagnosis here ..."
                  class="bg-gray-100 w-96 p-2 rounded-md"
                ></textarea>
                <label for="">Comment</label>
                <textarea
                  v-model="comment"
                  placeholder="write your comments here..."
                  class="bg-gray-100 w-96 p-2 rounded-md"
                ></textarea>
              </div>
              <div class="border-b py-2 flex items-center justify-between">
                <p class="font-semibold px-4 text-md">Adding Attachment</p>
                <label>
                  <p
                    v-ripple
                    class="cursor-pointer px-4 py-1 h-8 rounded flex items-center gap-2 border border-primary text-primary"
                  >
                    <i v-html="icons.import" />
                    Add Attachment
                    <input
                      @change="importMembers($event, claims)"
                      type="file"
                      class="hidden"
                    />
                  </p>
                </label>
              </div>
            </div>
            <div class="flex w-full gap-4 justify-">
              <div v-if="addServiceStore.addedServices.length" class="">
                <Button
                  v-if="!submitApi.pending.value"
                  @click.prevent="submit(claims)"
                  class="bg-primary text-white"
                  >Submit</Button
                >
                <Button v-else>
                  <Icon icon="svg-spinners:3-dots-scale" class="text-2xl"
                /></Button>
              </div>
              <Button
                @click.prevent="
                  router.push(`/Credit-Invoice/slip/${claims?.claimUuid}`)
                "
                class="bg-secondary text-white"
                >Print Service Slip</Button
              >
            </div>
          </div>
        </div>

        <div
          v-else-if="pending"
          class="h-full w-full flex justify-center items-center"
        >
          <i class="animate-spin" v-html="icons.spinner" />
        </div>
      </ServiceProvider>
    </div>
  </NewFormParent>
</template>
