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
  // Create PDF content with Ethiopian text
  pdfContent.value = {
    content: [
      {
        text: 'ለኢትዮጲያ ኤሌክትሪክ ኃይል',
        style: 'header',
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      {
        text: 'ጉዳዩም የዱቤ ሽያጭ ክፍያን ይመለከታል',
        alignment: 'right',
        margin: [0, 0, 0, 20]
      },
      {
        text: 'ከላይ በርዕሱ ለመግለጽ እንደተሞከረው የከነማ ፋርማሲዎች ድርጅት ከድርጅታችሁ ጋር በገባው ውል መሰረት ለሰራተኞቻችሁ የዱቤ ግዥ የየወሩን በወሩ መጨረሻ ከየፋርማሲዎቻችን ተሰብስቦ በሚመጣው ደረሰኝ እንደሚከፍል ይታወቃል፡፡',
        margin: [0, 0, 0, 15],
        alignment: 'justify'
      },
      {
        text: 'በመሆኑም ቀደም ሲል ለክፍያ ከላክናቸው ሰነዶች መሀል በህግ አግባብ እየታ መሆናቸውን በ16/10/2017 ባመጣችሁት ደብዳቤ መግለፃችሁ ይታወቃል ስለሆነም የታህሳስ 2017 ወደ ድርጅታችን ተመላሽ ባደረጋችሁት ሰነዶች በድጋሚ ለፖሊስ ምርመራ እንፈልገዋለን ብላችሁ በገለፃችሁት መሰረት ከዚህ ደብዳቤ ጋር 27 ገፅ ኦርጅናል የመድሀኒት ማዘዣዎች የዱቤ የክፍያ ደረሰኞችን እንዲሁም በብር መጠን 178,518.13 ተመላሽ ስናደርግ ቀሪውን',
        margin: [0, 0, 0, 15],
        alignment: 'justify'
      },
      {
        text: 'የጥር 2017 503,789.35 እና የየካቲት 2017 228,453.25 በድምሩ 732,242.60 (ሰባት መቶ ሰላሳ ሁለት ሺ ሁለት መቶ አርባ ሁለት ብር60/100)ለፎረንሲ ምርመራ ለፖሊስ መሰጠቱን በ16/10/2017 በደብዳቤ ማሳወቃችሁ ይታወቀል ቀሪውን በብር መጠን 1,486,755.43 (አንድ ሚልዮን አራት መቶ ሰማንያ ስድስት ሺ ሰባት መቶ ሀምሳ አምስት ብር 43/100)ክፍያ እንድትፈፅሙልን እያሳወቅን',
        margin: [0, 0, 0, 15],
        alignment: 'justify'
      },
      {
        text: 'ክፍያዎቹ እንዲያመቻችሁ በተቋማችሁ በኩል ውል የተገባላቸው የዱቤ ተጠቃሚዎች በተለያየ መድሀኒት ቤቶቻችን በአካል በመቅረብ መድሀኒትና የህክምና መገልገያ የወሰዱበትን',
        margin: [0, 0, 0, 10],
        alignment: 'justify'
      },
      {
        ol: [
          'የድርጅታችሁን የዱቤ ተጠቃሚዎች የመድሀኒት ማዘዣዎች /prescripton/ዋናውን ኮፒ',
          'የዱቤ ታካሚዎችችሁ በዋናው የዱቤ መሸጫ ደረሰኝ ላይ በመድሀኒት ማዘዣው መሰረት በሀኪም የታዘዘላቸውን መድሀኒት ፈርመው የወሰዱበትን ዋናውን የዱቤ ሽያጭ ደረሰኞች ቀደም ሲል በደብዳቤ ጋር አባሪአድርገን የላክንላችሁ መሆኑን እየገለጽን ሆኖም ለአከፋፈል እንዲያመቻችሁ በህግ የተያዙትን ቀንሰን በድርጅታችን በተከፈተው የኢትዮጲያ ንግድ ባንክ የሂሳብ ቁጥር 1000001440547 በአጠቃላይ የተጠቀማችሁ ክፍያውን እንድትፈፅሙልን በአክብሮት እንገልፃለን.',
        ],
        margin: [0, 0, 0, 20]
      },
      {
        text: 'ከሠላምታ ጋር',
        alignment: 'center',
        margin: [0, 30, 0, 40]
      },
      {
        text: 'ለጉለሌ ክ/ከተማ ጤና መድን ጽ/ቤት',
        style: 'header',
        alignment: 'center',
        margin: [0, 0, 0, 10]
      },
      {
        text: 'አዲስ አበባ',
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      {
        text: 'ጉዳዩም የዱቤ ሽያጭ ክፍያን ይመለከታል',
        alignment: 'right',
        margin: [0, 0, 0, 20]
      },
      {
        text: 'ከላይ በርዕሱ ለመግለጽ እንደተሞከረው የከነማ ፋርማሲዎች ድርጅት ከድርጅታችሁ ጋር በገባው ውል መሰረት ለማጤአባሎቻችሁ የዱቤ ግዥ የየወሩን በወሩ መጨረሻ ከየፋርማሲዎቻችን ተሰብስቦ በሚመጣው ደረሰኝ እንደሚከፍል ይታወቃል፡፡',
        margin: [0, 0, 0, 15],
        alignment: 'justify'
      },
      {
        text: 'በመሆኑም ቀደም ሲል ለክፍያ ከላክንላችሁ ከሀምሌ 2014-ሰኔ 2015 በብር መጠን 705,568.90\nከሀምሌ 2015-ሰኔ 2016 በብር መጠን 2,245,589.56\nከሀምሌ 2016-መጋቢት 2017 በብር መጠን2,787,511.68\nከሀምሌ 2015-መጋቢት 2017 በብርመጠን 5,738,670.14',
        margin: [20, 0, 0, 15],
        alignment: 'left'
      },
      {
        text: 'በክሊኒካል ኦዲት ተቀናሽ ተደርጎል ሆኖም የከነማ ፋርማሲዎች ድርጅት ተቀናሽ የተደረጉትን ሰነዶች ተመላሽ አድርጋችሁልን የሂሳብ ማጣራት እንድናደርግ ከዚህ በታች የተዘረዘሩትን ኮሚቴዎችን ወደ ክፍለ ከተማችሁ ስንልክ መልካም ትብብራችሁን እየጠየቅን',
        margin: [0, 0, 0, 15],
        alignment: 'justify'
      },
      {
        ol: [
          'ወ/ሮ አልጋነሽ መንበረ',
          'ወ/ሮ አዲስ ጠና',
          'አቶ አበራ አስታጥቄ',
          'አቶ ጀማነ ስዩም',
          'አቶ ደመቀ አለሙ'
        ],
        margin: [0, 0, 0, 20]
      },
      {
        text: 'ከሠላምታ ጋር',
        alignment: 'center',
        margin: [0, 30, 0, 0]
      }
    ],
    styles: {
      header: {
        fontSize: 16,
        bold: true,
        alignment: 'center'
      }
    },
    defaultStyle: {
      font: 'NotoSansEthiopic',
      fontSize: 12,
      lineHeight: 1.5
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
    <div class="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
      <div class="flex justify-between items-center p-4 border-b">
        <h3 class="text-lg font-semibold">Claim Document</h3>
        <button
          @click="closeModal()"
          class="text-gray-500 hover:text-gray-700 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          ×
        </button>
      </div>
      
      <div class="flex-1 overflow-hidden">
        <PdfMaker 
          v-if="pdfContent"
          :content="pdfContent"
          class="w-full h-full"
        />
      </div>
    </div>
  </div>
</template>