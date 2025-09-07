<script setup>
import pdfMake from 'pdfmake/build/pdfmake.js';
import pdfFonts from 'pdfmake/build/vfs_fonts.js';
import { ref, onMounted } from "vue";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

// Configure fonts for Ethiopian text
pdfMake.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Bold.ttf',
  },
  'NotoSansEthiopic': {
    normal: 'Roboto-Regular.ttf', // Fallback to Roboto for now
    bold: 'Roboto-Bold.ttf',
  }
};

const props = defineProps({
  content: {
    type: Object,
  },
  blob: {
    type: Blob,
  },
});

const file = ref("");

onMounted(() => {
  if (props.content) {
    const pdf = pdfMake.createPdf({
      pageMargins: [40, 60, 40, 40],
      ...props.content,
      defaultStyle: {
        font: "Roboto", // Use Roboto as fallback
        fontSize: 11,
        lineHeight: 1.4,
        ...props.content?.defaultStyle,
      },
      styles: {
        ...props.content?.styles,
        header: {
          alignment: "center",
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 20],
          ...props.content?.styles?.header,
        },
      },
    });
    
    pdf.getBlob((blob) => {
      file.value = URL.createObjectURL(blob);
    });
  } else if (props.blob) {
    file.value = URL.createObjectURL(props.blob);
  }
});
</script>
<template>
  <embed
    v-if="file"
    type="application/pdf"
    :src="file"
    frameborder="0"
    width="100%"
    height="100%"
    class="w-full h-full"
  />
  <div v-else class="flex items-center justify-center h-full">
    <p class="text-gray-500">Loading PDF...</p>
  </div>
</template>

