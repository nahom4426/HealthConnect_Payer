<script setup>
// import pdfMake from "pdfmake/build/pdfmake.js";
// import pdfFonts from "pdfmake/build/vfs_fonts.js";
import { ref } from "vue";

// pdfMake.vfs = pdfFonts.pdfMake.vfs;
// pdfMake.fonts = {
//   Roboto: {
//     normal: "Roboto-Regular.ttf",
//     bold: "Roboto-Medium.ttf",
//     italics: "Roboto-Italic.ttf",
//     bolditalics: "Roboto-MediumItalic.ttf",
//   },
//   NotoSansEthiopic: {
//     normal: "NotoSansEthiopic-Regular.ttf",
//     bold: "NotoSansEthiopic-Bold.ttf",
//     black: "NotoSansEthiopic-Black.ttf",
//   },
// };

const props = defineProps({
  content: {
    type: Object,
  },
  blob: {
    type: Blob,
  },
});

// if(!props.blob || !props.content) {
//   throw new Error('[Content] or Blob is required')
// }

const file = ref("");

if (props.content) {
  pdfMake
    .createPdf({
      pageMargins: [20, 140, 20, 20],
      ...props.content,
      defaultStyle: {
        font: "NotoSansEthiopic",
        fontSize: 11,
      },
      styles: {
        ...props.content?.styles,
        header: {
          alignment: "center",
          fontSize: 20,
          bold: true,
          decoration: "underline",
          ...props.content?.styles?.header,
        },
      },
    })
    .getBlob((blob) => {
      file.value = URL.createObjectURL(blob);
    });
} else if (props.blob) {
  file.value = URL.createObjectURL(props.blob);
}
</script>
<template>
  <embed
    type="application/pdf"
    :src="file"
    frameborder="0"
    width="100%"
    height="600"
  />
</template>
