<script setup>
  import { ref } from 'vue';
  import Input from './Input.vue'
import icons from '@/utils/icons';

  const props = defineProps({
    attributes: {
      type: Object,
    }
  })

  const text = ref(props.attributes?.type == 'text' ? true : false)

  function toggleType() {
    
    text.value = !text.value
  }

</script>

<template>
  <Input :attributes="{
    ...attributes,
    type: text ? 'text' : 'password'
  }" >
  <template #left>
      <div @click="toggleType"  class="h-full w-12 grid place-items-center ">
                <span v-html="text ? icons.password : icons.eye" />

      </div>
    </template>
    <!-- <template #right>
      <div @click="toggleType" class="h-full w-12 grid place-items-center ">
        <span v-html="text ? icons.eye : icons.eyeSlash" />
      </div>
    </template> -->
  </Input>
</template>