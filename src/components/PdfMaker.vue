<script setup>
import { ref, onMounted } from "vue";
import pdfMake from 'pdfmake/build/pdfmake.js';
import pdfFonts from 'pdfmake/build/vfs_fonts.js';

// ✅ This is the correct line now:
pdfMake.vfs = pdfFonts;

console.log("✅ pdfMake.vfs assigned from pdfFonts:", Object.keys(pdfMake.vfs));


console.log("✅ pdfFonts object:", pdfFonts);
console.log("✅ pdfFonts.vfs keys:", pdfFonts?.vfs ? Object.keys(pdfFonts.vfs) : "vfs is undefined");
console.log("✅ pdfMake.vfs after assignment:", pdfMake?.vfs ? Object.keys(pdfMake.vfs) : "vfs not set");

const props = defineProps({
  content: {
    type: Object,
  },
  blob: {
    type: Blob,
  },
});

const file = ref("");

// Utility: Load font as base64
async function loadFontAsBase64(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load font: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.byteLength; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  } catch (error) {
    console.error('❌ Error loading font from:', url, error);
    return null;
  }
}

// Mount logic
onMounted(async () => {
  if (props.content) {
    // If Ethiopian fonts are requested
    if (props.content?.defaultStyle?.font === "NotoSansEthiopic") {
      console.log("🔤 Ethiopian fonts requested. Loading...");

      try {
        const [regularBase64, boldBase64] = await Promise.all([
          loadFontAsBase64("/fonts/NotoSansEthiopic-Regular.ttf"),
          loadFontAsBase64("/fonts/NotoSansEthiopic-Bold.ttf"),
        ]);

        if (regularBase64 && boldBase64) {
          // ✅ Add to VFS
          pdfMake.vfs["NotoSansEthiopic-Regular.ttf"] = regularBase64;
          pdfMake.vfs["NotoSansEthiopic-Bold.ttf"] = boldBase64;

          console.log("✅ Ethiopian fonts added to VFS:", Object.keys(pdfMake.vfs).filter(k => k.includes('NotoSans')));

          // ✅ Register font
          pdfMake.fonts = {
            ...pdfMake.fonts,
            NotoSansEthiopic: {
              normal: "NotoSansEthiopic-Regular.ttf",
              bold: "NotoSansEthiopic-Bold.ttf",
              italics: "NotoSansEthiopic-Regular.ttf",
              bolditalics: "NotoSansEthiopic-Bold.ttf"
            }
          };

          console.log("✅ pdfMake.fonts now includes NotoSansEthiopic:", pdfMake.fonts);

          // Delay to ensure fonts are ready
          setTimeout(() => {
            createPdf();
          }, 100);
        } else {
          throw new Error("Ethiopian font base64 conversion failed");
        }
      } catch (error) {
        console.warn("⚠️ Ethiopian fonts failed to load. Falling back to Roboto.", error);
        if (props.content.defaultStyle) {
          props.content.defaultStyle.font = "Roboto";
        }
        createPdf();
      }
    } else {
      createPdf();
    }
  } else if (props.blob) {
    file.value = URL.createObjectURL(props.blob);
  }
});

function createPdf() {
  console.log("🛠 Creating PDF with fonts:", pdfMake.fonts);

  const pdf = pdfMake.createPdf({
    pageMargins: [40, 60, 40, 40],
    ...props.content,
    defaultStyle: {
      font: props.content?.defaultStyle?.font || "Roboto",
      fontSize: props.content?.defaultStyle?.fontSize || 11,
      lineHeight: props.content?.defaultStyle?.lineHeight || 1.4,
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
}
</script>
<template>
  <embed type='application/pdf' :src='file' frameborder="0" width="100%" height="600" class="h-screen" />
</template>
