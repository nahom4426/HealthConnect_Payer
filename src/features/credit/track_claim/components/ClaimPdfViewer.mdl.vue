<script setup>
import { ref, onMounted } from 'vue';
import { closeModal } from '@customizer/modal-x';
import PdfMaker from '@/components/PdfMaker.vue';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
});

const pdfContent = ref(null);

onMounted(() => {
  pdfContent.value = {
    header: (currentPage, pageCount) => ({
      columns: [
        // {
        //   image: '/images/peaa-logo-left.png', // replace with your left logo path
        //   width: 50,
        //   margin: [10, 10, 0, 0]
        // },
        {
          stack: [
            {
              text: 'አዲስ አበባ ከተማ አስተዳደር ህዝብ እንቅስቃሴ ድርጅት አስተዳደር ሥራ ኤጀንሲ ከነማ ፋርማሲዎች ድርጅት',
              fontSize: 10,
              alignment: 'center',
              margin: [0, 15, 0, 0],
              font: 'NotoSansEthiopic'
            },
            {
              text: 'Addis Ababa City Administration Public Enterprises Administration Authority Kenema Pharmacies Enterprise',
              fontSize: 8,
              alignment: 'center',
              margin: [0, 0, 0, 10]
            }
          ],
          width: '*'
        },
        // {
        //   image: '/images/peaa-logo-right.png', // replace with your right logo path
        //   width: 50,
        //   margin: [0, 10, 10, 0]
        // }
      ]
    }),
    footer: (currentPage, pageCount) => ({
      columns: [
        {
          text: 'ስልክ ቁጥር +251-11-8-27-91-23\nP.O.Box',
          fontSize: 9,
          margin: [10, 0, 0, 10],
          alignment: 'left',
          font: 'NotoSansEthiopic'
        },
        {
          text: `Page ${currentPage} of ${pageCount}`,
          alignment: 'right',
          margin: [0, 0, 10, 10],
          fontSize: 9
        }
      ]
    }),
    content: [
      {
        text: 'ለኢትዮጲያ ኤሌክትሪክ ኃይል',
        style: 'ethiopicHeader',
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      {
        text: 'ጉዳዩም የዱቤ ሽያጭ ክፍያን ይመለከታል',
        alignment: 'right',
        margin: [0, 0, 0, 20]
      },
      {
        text: `ከላይ በርዕሱ ለመግለጽ እንደተሞከረው የከነማ ፋርማሲዎች ድርጅት ከድርጅታችሁ ጋር በገባው ውል መሰረት ለሰራተኞቻችሁ የዱቤ ግዥ የወሩን መጨረሻ ከየፋርማሲዎቻችን ተሰብስቦ በሚመጣው ደረሰኝ እንደሚከፍል ይታወቃል።`,
        margin: [0, 0, 0, 15],
        alignment: 'justify'
      },
      {
        text: `በመሆኑም ቀደም ሲል ለክፍያ ከላክንላችሁ ሰነዶች መካከል በህግ አግባብ እየታ መሆናቸውን በ16/10/2017 ባመጣችሁት ደብዳቤ መግለፃችሁ ይታወቃል። በዚህ መሰረት የታህሳስ 2017 ወደ ድርጅታችን ተመላሽ ባደረጋችሁት 27 ኦሪጅናል የመድሀኒት ማዘዣዎችና የዱቤ ደረሰኞች በብር መጠን 178,518.13 ተመላሽ ስናደርግ ቀሪውን:`,
        margin: [0, 0, 0, 15],
        alignment: 'justify'
      },
      {
        text: `- የጥር 2017: 503,789.35 ብር\n- የየካቲት 2017: 228,453.25 ብር\n- ጠቅላላ: 732,242.60 ብር (ሰባት መቶ ሰላሳ ሁለት ሺ ሁለት መቶ አርባ ሁለት ብር ከ60/100)`,
        margin: [20, 0, 0, 10],
        alignment: 'left'
      },
      {
        text: `በፖሊስ ፎረንሲክ ምርመራ ላይ መላኩን በ16/10/2017 ደብዳቤ እንደተገለፀ ይታወቃል። ቀሪ የሚከፈል ብር መጠን 1,486,755.43 ብር (አንድ ሚልዮን አራት መቶ ሰማንያ ስድስት ሺ ሰባት መቶ ሀምሳ አምስት ብር ከ43/100) እንዲከፈል እንጠይቃለን።`,
        margin: [0, 0, 0, 15],
        alignment: 'justify'
      },
      {
        text: 'ከዚህ በተነሳ እንዲሁም ለክፍያ እንዲያመቻችሁ የሚከተሉትን ነገሮች እንድትሰጡን እንጠይቃለን:',
        margin: [0, 0, 0, 10],
        alignment: 'justify'
      },
      {
        ol: [
          'የዱቤ ተጠቃሚዎች የመድሀኒት ማዘዣዎች /prescription/ ዋና ኮፒዎች።',
          'ዋና የዱቤ መሸጫ ደረሰኞች ፣ በመድሀኒት ማዘዣ መሰረት የታዘዙ መድሀኒቶች በታካሚው ፈርመው የወሰዱበት ደረሰኝ።',
          'እነዚህን በተከፈተው የኢትዮጲያ ንግድ ባንክ ሂሳብ ቁጥር 1000001440547 ላይ እንድትከፍሉ።'
        ],
        margin: [0, 0, 0, 20]
      },
      {
        text: 'ከሠላምታ ጋር',
        alignment: 'center',
        margin: [0, 30, 0, 20]
      },
      {
        text: 'ለጉለሌ ክ/ከተማ ጤና መድን ጽ/ቤት',
        style: 'header',
        alignment: 'center',
        margin: [0, 0, 0, 10]
      },
      {
        text: 'አዲስ አበባ',
        alignment: 'center'
      }
    ],
    styles: {
      ethiopicHeader: {
        fontSize: 18,
        bold: true,
        font: 'NotoSansEthiopic'
      },
      header: {
        fontSize: 16,
        bold: true,
        font: 'NotoSansEthiopic'
      },
      ethiopicText: {
        fontSize: 14,
        font: 'NotoSansEthiopic',
        lineHeight: 1.6
      }
    },
    defaultStyle: {
      font: 'NotoSansEthiopic',
      fontSize: 14,
      lineHeight: 1.6
    },
    fonts: {
      NotoSansEthiopic: {
        normal: '/fonts/NotoSansEthiopic-Regular.ttf',
        bold: '/fonts/NotoSansEthiopic-Bold.ttf'
      }
    }
  };
});
</script>

<template>
  <div 
    @keydown.esc="closeModal()" 
    @click.self="closeModal()"
    class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
  >
    <div class="bg-white rounded-lg w-full flex flex-col max-w-4xl max-h-[90vh] overflow-hidden">
      <div class="flex justify-between items-center p-4 border-b">
        <h3 class="text-lg font-semibold">Claim Document</h3>
        <button
          @click="closeModal()"
          class="text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          aria-label="Close modal"
        >
          ×
        </button>
      </div>
      
      <div class="flex-1 overflow-auto">
        <PdfMaker 
          v-if="pdfContent"
          :content="pdfContent"
          class="w-full h-full"
        />
      </div>
    </div>
  </div>
</template>
