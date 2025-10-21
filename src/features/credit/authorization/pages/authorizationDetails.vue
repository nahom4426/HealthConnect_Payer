<script setup>
import { computed, ref, watch } from "vue";
import Table from "@/components/Table.vue";
import Button from "@/components/Button.vue";
import DefaultPage from "@/components/DefaultPage.vue";
import {
  convertBase64Image,
  formatCurrency,
  formatDateToYYMMDD,
} from "@/utils/utils";
import { useRoute } from "vue-router";
import { usePagination } from "@/composables/usePagination";
import DynamicForm from "../form/DynamicForm.vue";
import { openModal } from "@customizer/modal-x";
import { getAuthorizationDetail, getAllAuthorizationDetail } from "../api/authorizationApi";
import icons from "@/utils/icons";

const route = useRoute();
const id = ref(route.params?.id);

const pagination = usePagination({
  cb: (data) => getAuthorizationDetail(route.params?.id),
});

// Get the actual data content from pagination
const contentData = computed(() => {
  return pagination.data?.value || [];
});

function handleDetails(row) {
  console.log('Details Of CreditServices modal opened with row:', row)
  if (row.dispensingUuid) {
    openModal('DetailsOfCreditServices', {
      dispensingUuid: row.dispensingUuid,
      claim: row, // Pass the row data for immediate display while loading
      onUpdated: (updatedClaim) => {
        claimServicesStore.update(updatedClaim.dispensingUuid, updatedClaim);
        addToast({
          type: 'success',
          title: 'Updated',
          message: 'Claim updated successfully'
        });
      },
      onCancel: () => {
        // Handle cancel if needed
      }
    });
  } else if (typeof props.onEdit === 'function') {
    props.onEdit(row);
  }
}

// Get first item for summary cards
const firstItem = computed(() => contentData.value[0] || {});

const aboutPayer = computed(() => [
  { title: "payer Name", value: firstItem.value.payerName || "N/A" },
  { title: "catagory", value: firstItem.value.catagory || "N/A" },
  { title: "Contact", value: firstItem.value.payerPhoneNumber || "N/A" },
]);

const claimSummary = computed(() => [
  { 
    title: "Claim Amount", 
    value: firstItem.value.totalAmount 
      ? formatCurrency(firstItem.value.totalAmount) 
      : "N/A" 
  },
  {
    title: "Medication Items",
    value: firstItem.value.medicationItems?.length || "0",
  },
  { 
    title: "Dispensing Date", 
    value: firstItem.value.dispensingDate 
      ? formatDateToYYMMDD(new Date(firstItem.value.dispensingDate)) 
      : "N/A" 
  },
]);

const profilePicture = computed(() => firstItem.value.profileLogo);

async function processProfilePicture() {
  if (!profilePicture.value) return;
  
  try {
    if (profilePicture.value.startsWith("data:image/jpeg")) return;
    profilePicture.value = await convertBase64Image(
      profilePicture.value,
      "image/jpeg",
      0.85
    );
  } catch (error) {
    console.error("Error processing profile picture:", error);
  }
}

watch(profilePicture, () => {
  processProfilePicture();
});

const exporting = ref(false);

async function fetchAllAuthorizationRows() {
  const all = await getAllAuthorizationDetail(id.value, 5000000);
  return Array.isArray(all) ? all : [];
}

function flattenRows(rows) {
  return rows.map((r) => ({
    invoiceNumber: r.invoiceNumber,
    batchCode: r.batchCode,
    providerName: r.providerName,
    payerName: r.payerName,
    insuredName: r.insuredName,
    dispensingDate: r.dispensingDate,
    branchName: r.branchName,
    claimStatus: r.claimStatus,
    totalAmount: r.totalAmount,
    insuranceCoverage: r.insuranceCoverage,
    patientResponsibility: r.patientResponsibility,
    medicationItems: (r.medicationItems || [])
      .map((m) => `${m.medicationName} — Qty: ${m.quantity}, Unit: ${formatCurrency(m.unitPrice)}, Total: ${formatCurrency(m.totalPrice)}`)
      .join(" | "),
  }));
}

async function exportExcel() {
  if (exporting.value) return;
  exporting.value = true;
  try {
    const rows = await fetchAllAuthorizationRows();
    const XLSX = await import("xlsx");
    const header = [
      "Invoice",
      "Insured",
      "Payer",
      "Date",
      "Branch",
      "Status",
      "Total",
      "Coverage",
      "Patient Share",
      "Medications",
    ];

    const data = rows.map((r) => [
      r.invoiceNumber ?? "",
      r.insuredName ?? "",
      r.payerName ?? "",
      r.dispensingDate ? formatDateToYYMMDD(new Date(r.dispensingDate)) : "",
      r.branchName ?? "",
      r.claimStatus ?? "",
      r.totalAmount != null ? formatCurrency(r.totalAmount) : "",
      r.insuranceCoverage != null ? formatCurrency(r.insuranceCoverage) : "",
      r.patientResponsibility != null ? formatCurrency(r.patientResponsibility) : "",
      (r.medicationItems || [])
        .map((m) => `${m.medicationName} — Qty: ${m.quantity}, Unit: ${formatCurrency(m.unitPrice)}, Total: ${formatCurrency(m.totalPrice)}`)
        .join(" | "),
    ]);

    const aoa = [header, ...data];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Set column widths for better readability
    ws["!cols"] = [
      { wch: 14 }, // Invoice
      { wch: 22 }, // Insured
      { wch: 18 }, // Payer
      { wch: 12 }, // Date
      { wch: 16 }, // Branch
      { wch: 12 }, // Status
      { wch: 14 }, // Total
      { wch: 14 }, // Coverage
      { wch: 16 }, // Patient Share
      { wch: 60 }, // Medications
    ];

    // Enable autofilter on header row
    const range = XLSX.utils.decode_range(ws["!ref"] || `A1:${XLSX.utils.encode_col(header.length - 1)}${aoa.length}`);
    ws["!autofilter"] = { ref: XLSX.utils.encode_range({ r: 0, c: 0 }, { r: range.e.r, c: range.e.c }) };

    XLSX.utils.book_append_sheet(wb, ws, "Authorizations");
    XLSX.writeFile(wb, `authorization_${id.value}.xlsx`);
  } finally {
    exporting.value = false;
  }
}

async function exportPdf() {
  if (exporting.value) return;
  exporting.value = true;
  try {
    const rows = await fetchAllAuthorizationRows();
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "A4" });
    const head = [[
      "Insured",
      "Date",
      "Branch",
      "Total",
      "Medications",
    ]];
    const body = rows.map((r) => [
      r.insuredName,
      r.dispensingDate ? formatDateToYYMMDD(new Date(r.dispensingDate)) : "",
      r.branchName,
      r.totalAmount != null ? formatCurrency(r.totalAmount) : "",
      (r.medicationItems || [])
        .map((m) => `${m.medicationName} — Qty: ${m.quantity}`)
        .join(", "),
    ]);
    // Title/Header with Payer in subtitle
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    const title = `Authorization Details`;
    doc.text(title, doc.internal.pageSize.getWidth() / 2, 28, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(117, 117, 117);
    const payerName = rows?.[0]?.payerName ? `Payer: ${rows[0].payerName}` : "Payer: -";
    doc.text(`${payerName}  •  Ref: ${String(id.value ?? "")}  •  Generated: ${formatDateToYYMMDD(new Date())}` , doc.internal.pageSize.getWidth() / 2, 44, { align: "center" });

    autoTable(doc, {
      head,
      body,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak", lineWidth: 0.1, lineColor: [200, 200, 200], valign: "middle" },
      headStyles: { fillColor: [33, 150, 243], textColor: [255, 255, 255], fontStyle: "bold", halign: "center" },
      bodyStyles: { textColor: [55, 71, 79] },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 150 },  // Insured
        1: { cellWidth: 75, halign: "center" },   // Date
        2: { cellWidth: 140 },  // Branch
        3: { cellWidth: 90, halign: "right" },    // Total
        4: { cellWidth: 370 },  // Medications
      },
      startY: 64,
      margin: { left: 20, right: 20, top: 64, bottom: 36 },
      didDrawPage: (data) => {
        // Footer with page numbers
        const pageCount = (doc).internal.getNumberOfPages();
        const pageSize = doc.internal.pageSize;
        const pageWidth = pageSize.getWidth();
        const pageHeight = pageSize.getHeight();
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}` , pageWidth - 60, pageHeight - 12);
      }
    });
    doc.save(`authorization_${id.value}.pdf`);
  } finally {
    exporting.value = false;
  }
}
</script>

<template>
  <DefaultPage :first="false">
    <template #first>
      <div class="flex w-full gap-4">
        <!-- Profile Picture (20%) -->
        <div class="w-1/5 bg-base-clr3 rounded-lg p-4 flex flex-col items-center justify-center">
          <img
            v-if="profilePicture"
            :src="profilePicture"
            alt="Profile picture"
            class="w-full h-auto max-h-40 object-contain"
          />
          <div v-else class="text-gray-500 text-center">No logo available</div>
        </div>

        <!-- About Payer (40%) -->
        <div class="w-2/5 bg-base-clr3 rounded-lg p-4">
          <DynamicForm
            header="About Payer"
            customClass="h-full"
            :data="aboutPayer"
          />
        </div>

        <!-- Claim Summary (40%) -->
        <div class="w-2/5 bg-base-clr3 rounded-lg p-4">
          <DynamicForm
            header="Claim Summary"
            customClass="h-full"
            :data="claimSummary"
          />
        </div>
      </div>
    </template>

    <div class="bg-base-clr3 rounded-md p-4 mt-4">
      <div class="flex justify-end gap-2 mb-3">
        <Button :disabled="exporting" @click="exportExcel">Export Excel</Button>
        <Button :disabled="exporting" @click="exportPdf">Export PDF</Button>
      </div>
      <Table
        :pending="pagination.pending.value"
        :rows="contentData"
        :headers="{
          head: [
            'Invoice ID',
            'Patient Name',
            'Dispensing Date',
            'Branch',
            'Credit Amount',
            'Status',
            'Actions',
          ],
          row: [
            'invoiceNumber',
            'insuredName',
            'dispensingDate',
            'branchName',
            'totalAmount',
            'claimStatus'
          ],
        }"
        :cells="{
          dispensingDate: (date) => formatDateToYYMMDD(new Date(date)),
          totalAmount: (amount) => formatCurrency(amount),
          claimStatus: (status) => status?.toUpperCase() || 'N/A'
        }"
      >
        <template #actions="{ row }">
          <div class="flex gap-2">
            <Button
              @click.prevent="handleDetails(row)"
              class="!text-white"
              type="primary"
              size="xs"
            >
              View
            </Button>
          </div>
        </template>
      </Table>
      <div
        v-if="firstItem.claimStatus !== 'APPROVED'"
          class="flex justify-end mt-4 gap-2"
        >
          <div class="flex justify-end gap-4 mt-8">
    <Button 
 @click="openModal('ClaimRejection', route.params?.id)"
  class="bg-gradient-to-r from-red-600 to-red-700 text-white py-1 px-4 rounded-lg shadow hover:shadow-md transition-all"
>
       <!-- :disabled="!validationPerformed" -->
        <span class="flex items-center gap-2">
          <i v-html="icons.close" class="w-4 h-4"></i>
          Reject
        </span>
      </Button>
      <Button 
         @click="openModal('ClaimApproval', route.params?.id)"
        class="bg-gradient-to-r from-primary to-primary text-white py-1 px-4 rounded-lg shadow hover:shadow-md transition-all"
        :class="{'animate-pulse': allServicesValid && validationComplete}"
        
      >
      <!-- :disabled="!validationPerformed || !allServicesValid" -->
        <span class="flex items-center gap-2">
          <i v-html="icons.check" class="w-4 h-4"></i>
          Approve
        </span>
      </Button>
    </div>
        </div>
    </div>
  </DefaultPage>
</template>

<style scoped>
.profile-image {
  max-height: 160px;
  object-fit: contain;
}
</style>