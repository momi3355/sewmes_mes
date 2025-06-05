<script setup>
import { computed } from "vue";
import { useStore } from "vuex";

const store = useStore();
const isRTL = computed(() => store.state.isRTL);
const isNavFixed = computed(() => store.state.isNavFixed);

defineProps({
  currentPage: {
    type: String,
    default: "",
  },
  currentDirectory: {
    type: String,
    default: "",
  },
});
</script>
<template>
  <nav aria-label="breadcrumb">
    <ol
      class="px-0 pt-1 pb-0 mb-0 bg-transparent breadcrumb me-sm-6 text-dark"
    >
      <li class="text-sm breadcrumb-item">
        <a
          class="text-dark opacity-8"
          href="#"
          >Pages</a
        >
      </li>
      <li
        class="text-sm breadcrumb-item active text-dark"
        aria-current="page"
      >
        {{ currentPage }}
      </li>
    </ol>
    <h6
      class="mb-0 font-weight-bolder text-dark"
    >
      {{ currentDirectory }}
    </h6>
  </nav>
</template>
