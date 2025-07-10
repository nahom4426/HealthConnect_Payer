<script setup>
import { onMounted, ref, watch } from "vue";

const props = defineProps({
  trigger: {
    type: Boolean,
    default: false,
  },
  particleCount: {
    type: Number,
    default: 150,
  },
  duration: {
    type: Number,
    default: 2000,
  },
  size: {
    type: Number,
    default: 4,
  },
  width: {
    type: Number,
    default: 6,
  },
  height: {
    type: Number,
    default: 6,
  },
  colors: {
    type: Array,
    default: () => [
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffff00",
      "#ff00ff",
      "#00ffff",
      "#ff8800",
      "#8800ff",
      "#0088ff",
      "#ff0088",
      "#88ff00",
      "#00ff88",
      "#ffcc00",
      "#cc00ff",
      "#00ccff",
      "#ff6600",
    ],
  },
});

const containerRef = ref(null);

function createFireworks() {
  if (!containerRef.value) return;

  // Reset container
  containerRef.value.innerHTML = "";
  containerRef.value.style.height = "2px";

  setTimeout(() => {
    containerRef.value.style.transition = `height ${props.duration}ms ease-in-out`;
    containerRef.value.style.height = "300px";

    for (let i = 0; i < props.particleCount; i++) {
      setTimeout(() => {
        const firework = document.createElement("div");
        firework.className = "absolute rounded-tl-lg round-br-lg ";
        firework.style.width = `${props.width}px`;
        firework.style.height = `${props.height}px`;
        firework.style.backgroundColor =
          props.colors[Math.floor(Math.random() * props.colors.length)];
        firework.style.left = `${Math.random() * 100}%`;
        firework.style.top = "0px";
        firework.style.transform = "translateY(0)";
        firework.style.opacity = "1";
        firework.style.transition = `all ${props.duration}ms ease-out`;

        // Randomize movement pattern
        const xMovement = Math.random() * 100 - 50;

        const rotation = Math.random() * 360;
        const scale = Math.random() * 0.5 + 1;

        containerRef.value.appendChild(firework);

        setTimeout(() => {
          firework.style.transform = `translateY(${
            Math.random() * 100 + 150
          }px) translateX(${xMovement}px) rotate(${rotation}deg) scale(${scale})`;
          firework.style.opacity = "0.5";

          setTimeout(() => {
            firework.remove();
          }, props.duration / 2);
        }, 50);
      }, i * (props.duration / props.particleCount));
    }

    setTimeout(() => {
      containerRef.value.style.height = "1px";
    }, props.duration);
  }, 50);
}

watch(
  () => props.trigger,
  (newVal) => {
    if (newVal) {
      createFireworks();
    }
  }
);

onMounted(() => {
  if (props.trigger) {
    createFireworks();
  }
});
</script>

<template>
  <div
    ref="containerRef"
    class="fireworks-container relative w-full overflow-visible pointer-events-none"
  ></div>
</template>

<style scoped>
.fireworks-container {
  height: 1px;
  transition: height 1s ease-in-out;
}

.fireworks-container :deep(div) {
  will-change: transform, opacity;
}
</style>
