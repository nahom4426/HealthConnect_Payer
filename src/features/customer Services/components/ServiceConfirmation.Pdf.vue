<script setup>
import PdfMaker from "@/components/PdfMaker.vue";
import { formatCurrency, getBgbase64Url } from "@/utils/utils";
import { ref } from "vue";

const props = defineProps({
  claim: {
    type: Object,
    Required: true,
  },
  services: {
    type: Array,
    Required: true,
  },
});
console.log(props.services);
const totalValue = ref(
  props.services.reduce((acc, service) => acc + service.amount, 0)
);

const certificateInfo = Array.isArray(props.claim)
  ? props.claim
  : [props.claim];
const content = ref();

function generateTableBody(services) {
  // Start with the header row
  let body = [
    [
      { text: "S.N.", style: "tableHeader" },
      { text: "Item Code", style: "tableHeader" },
      { text: "Description", style: "tableHeader" },
      { text: "Quantity", style: "tableHeader" },
      { text: "Unit Price", style: "tableHeader" },
      { text: "Service Date", style: "tableHeader" },
      { text: "Total Price", style: "tableHeader" },
    ],
  ];

  services.forEach((service, index) => {
    body.push([
      { text: `${index + 1}`, style: "rowHeight" },
      { text: `` },
      { text: `${service.item}`, fontSize: 10 },
      { text: `${service.qty}`, fontSize: 10 },
      { text: `${formatCurrency(service.unitPrice)}`, fontSize: 10 },
      { text: `${service.providedDate}`, fontSize: 10 },
      { text: `${formatCurrency(totalValue.value)}`, fontSize: 10 },
    ]);
  });

  // Add an extra row
  body.push([
    { text: "Total Amount", colSpan: 6, alignment: "right", bold: true },
    "",
    "",
    "",
    "",
    "",
    { text: `${formatCurrency(totalValue.value)} `, fontSize: 10, bold: true },
  ]);

  return body;
}

async function genPdfContent() {
  const bg = await getBgbase64Url("/crtificate_header.png");
  const docDefinition = {
    content: [
      certificateInfo.flatMap((claim) => {
        return [
          {
            text: "Service Confirmation Slip",
            color: "#000",
            margin: [0, 140, 0, 10],
            alignment: "center",
            fontSize: 24,
            bold: true,
            decoration: "underline",
          },
          {
            margin: [40, 3],
            columns: [
              {
                width: "auto",
                text: "Name of Service Provider:",
                color: "#000",
                fontSize: 12,
              },
              {
                width: "*",
                text: {
                  text: `${props.claim?.providerName}`,
                  decoration: "underline",
                },
                margin: [5, 0, 0, 0],
                color: "#000",
              },
            ],
          },
          {
            margin: [40, 3],
            columns: [
              {
                width: "auto",
                text: "Name of Institution:",
                color: "#000",
                fontSize: 12,
              },
              {
                width: "*",
                text: {
                  text: `${props.claim?.institutionName}`,
                  decoration: "underline",
                },
                margin: [5, 0, 0, 0],
                color: "#000",
              },
            ],
          },
          {
            margin: [40, 3],
            columns: [
              {
                width: "auto",
                text: "Member Number :",
                color: "#000",
                fontSize: 12,
              },
              {
                width: "*",
                text: {
                  text: `${props.claim?.providerName}`,
                  decoration: "underline",
                },
                margin: [5, 0, 0, 0],
                color: "#000",
              },
            ],
          },
          {
            margin: [40, 3],
            columns: [
              {
                width: "auto",
                text: "Patient Name :",
                color: "#000",
                fontSize: 12,
              },
              {
                width: "*",
                text: {
                  text:
                    props.claim?.relationship !== null
                      ? props.claim?.dependantFirstName +
                        " " +
                        props.claim?.dependantFatherName +
                        " " +
                        props.claim?.dependantGrandFatherName +
                        "(" +
                        props.claim?.relationship +
                        ")"
                      : props.claim?.firstName +
                        " " +
                        props.claim?.fatherName +
                        " " +
                        props.claim?.grandFatherName,
                  decoration: "underline",
                },
                margin: [5, 0, 0, 0],
                color: "#000",
              },
            ],
          },
          {
            margin: [40, 3],
            columns: [
              {
                width: "auto",
                text: "Patient Type :",
                color: "#000",
                fontSize: 12,
              },
              {
                width: "*",
                text: {
                  text:
                    props.claim?.relationship !== null
                      ? props.claim?.relationship
                      : "Main Member",
                  decoration: "underline",
                },
                margin: [5, 0, 0, 0],
                color: "#000",
              },
            ],
          },
          {
            margin: [40, 3],
            columns: [
              {
                width: "auto",
                text: "Service Reference Number :",
                color: "#000",
                fontSize: 12,
              },
              {
                width: "*",
                text: {
                  text: `${props.claim?.providerName}`,
                  decoration: "underline",
                },
                margin: [5, 0, 0, 0],
                color: "#000",
              },
            ],
          },
          {
            margin: [40, 8],
            columns: [
              {
                width: "auto",
                text: "Services Provided :",
                color: "#000",
                fontSize: 12,
              },
            ],
          },
          {
            margin: [40, 6],
            table: {
              widths: ["auto", "*", "*", "auto", "*", "auto", "*"],
              body: generateTableBody(props.services),
            },
          },
          {
            margin: [40, 6],
            columns: [
              {
                width: "auto",
                text: "Service Confirmation By Insured Member :",
                bold: true,
                color: "#000",
                alignment: "start",
              },
              {
                margin: [40, 0],
                width: "auto",
                text: "Service Provided By :",
                bold: true,
                color: "#000",
                alignment: "start",
              },
            ],
          },
          {
            margin: [60, 6],
            columns: [
              {
                width: "auto",
                text: "Patient Name :",
                color: "#000",
                alignment: "start",
              },
              {
                width: "*",
                text: {
                  text:
                    props.claim?.relationship !== null
                      ? props.claim?.dependantFirstName +
                        " " +
                        props.claim?.dependantFatherName +
                        " " +
                        props.claim?.dependantGrandFatherName +
                        "(" +
                        props.claim?.relationship +
                        ")"
                      : props.claim?.firstName +
                        " " +
                        props.claim?.fatherName +
                        " " +
                        props.claim?.grandFatherName,
                  decoration: "underline",
                },
                margin: [10, 0, 0, 0],
                color: "#000",
              },
              {
                margin: [90, 0, 0, 0],
                width: "auto",
                text: "Clinic Name :",
                color: "#000",
                alignment: "start",
              },
              {
                width: "*",
                text: {
                  text: `${props.claim?.providerName}`,
                  decoration: "underline",
                },
                margin: [10, 0, 0, 0],
                color: "#000",
              },
            ],
          },
          {
            margin: [60, 6],
            columns: [
              {
                width: "auto",
                text: "Adult Signature(if Minor) :",
                color: "#000",
                alignment: "start",
              },
              {
                width: "*",
                text: "_____________________",
                margin: [10, 0, 0, 0],
                color: "#000",
              },
              {
                margin: [65, 0, 0, 0],
                width: "auto",
                text: "Receptionist Name :",
                color: "#000",
                alignment: "start",
              },
              {
                width: "*",
                text: "_____________________",
                margin: [10, 0, 0, 0],
                color: "#000",
              },
            ],
          },
          {
            margin: [60, 6],
            columns: [
              {
                width: "auto",
                text: "Signature :",
                color: "#000",
                alignment: "start",
              },
              {
                width: "*",
                text: "_____________________",
                margin: [10, 0, 0, 0],
                color: "#000",
              },
              {
                margin: [70, 0, 0, 0],
                width: "auto",
                text: "Signature :",
                color: "#000",
                alignment: "start",
              },
              {
                width: "*",
                text: "_____________________",
                margin: [10, 0, 0, 0],
                color: "#000",
              },
            ],
          },
          {
            margin: [60, 6],
            columns: [
              {
                width: "auto",
                text: "Date :",
                color: "#000",
                alignment: "start",
              },
              {
                width: "*",
                text: "_____________________",
                margin: [10, 0, 0, 0],
                color: "#000",
              },
              {
                margin: [100, 0, 0, 0],
                width: "auto",
                text: "Date :",
                color: "#000",
                alignment: "start",
              },
              {
                width: "*",
                text: "_____________________",
                margin: [10, 0, 0, 0],
                color: "#000",
              },
            ],
          },
        ];
      }),
    ],
    background: [
      {
        image: bg,
        width: 600, // Adjust width as needed
      },
    ],
  };
  content.value = docDefinition;
}
genPdfContent();
</script>
<template>
  <PdfMaker v-if="content" :content="content" />
</template>
