<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { useRoute } from "vue-router";

const store = useStore();
const route = useRoute();

const isRTL = computed(() => store.state.isRTL);
const sidebarMinimize = () => store.commit("sidebarMinimize");

const minimizeSidebar = () => {
  if (window.innerWidth < 1200) {
    sidebarMinimize();
  }
};

// Props
const props = defineProps({
  to: {
    type: String,
    required: false
  },
  navText: {
    type: String,
    required: true,
  },
  subItems: {
    type: Array,
    default: () => [],
  },
});

const hasSubItems = computed(() => props.subItems.length > 0);
const showSubmenu = ref(false);

// 현재 경로와 일치하는지
//const isActive = computed(() => route.path === props.to);

// 클릭 시 열기 또는 이동
const handleClick = () => {
  if (hasSubItems.value) {
    showSubmenu.value = !showSubmenu.value;
  } else {
    minimizeSidebar();
  }
};
</script>

<template>
  <div>
    <!-- 메인 메뉴 (서브메뉴 있을 때) -->
    <div
      v-if="hasSubItems"
      class="nav-link d-flex align-items-center"
      @click="handleClick"
    >
      <div
        class="icon icon-shape icon-sm text-center d-flex align-items-center justify-content-center"
      >
        <slot name="icon"></slot>
      </div>
      <span class="nav-link-text" :class="isRTL ? 'me-1' : 'ms-1'">
        {{ navText }}
      </span>
      <span class="ms-auto">
        <i class="ni" :class="showSubmenu ? 'ni-minimal-up' : 'ni-minimal-down'"></i>
      </span>
    </div>

    <!-- 메인 메뉴 (서브메뉴 없을 때) -->
    <router-link
      v-else
      :to="to"
      class="nav-link d-flex align-items-center"
      @click="minimizeSidebar"
    >
      <div
        class="icon icon-shape icon-sm text-center d-flex align-items-center justify-content-center"
      >
        <slot name="icon"></slot>
      </div>
      <span class="nav-link-text" :class="isRTL ? 'me-1' : 'ms-1'">
        {{ navText }}
      </span>
    </router-link>

    <!-- 하위 메뉴 -->
    <ul v-if="hasSubItems && showSubmenu" class="nav flex-column ms-4">
      <li v-for="item in subItems" :key="item.to" class="nav-item">
        <router-link
          class="nav-link"
          :to="item.to"
          @click="minimizeSidebar"
          :class="{ active: route.path === item.to }"
        >
          <span class="nav-link-text">{{ item.name }}</span>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.nav-link.active {
  background-color: #f5f5f5;
  font-weight: bold;
}
</style>