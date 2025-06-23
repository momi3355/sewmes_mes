<template>
  <div class="modal-overlay" v-if="isOpen">
    <div class="modal-content" style="width: 600px;">
    <h4>공정순서 번호 : {{ props.targetInfo.rowNum }}</h4>
      <input type="text" class="form-control mb-2" v-model="keyword" @input="search" @keydown="handleKeydown" />
      <ul
        class="list-group"
        style="max-height: 300px; height: 300px; overflow-y: auto;"
      >
        <li
          v-for="(item, index) in results"
          :key="item.processCode"
          :class="['list-group-item', { active: index === selectedIndex }]"
          @dblclick="select(item)"
          @click="selectedIndex = index"
        >
          {{ item.processName }} | {{ item.processCode }} | {{ item.detail }}
        </li>
      </ul>
      <div class="text-end mt-2">
        <button class="btn btn-secondary" @click="$emit('close')">닫기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';

const props = defineProps({ isOpen: Boolean,
    targetInfo: {
        type: Object,
        default: () => ({ rowNum: '', orderDetailCode: '' })
    }
});
const emit = defineEmits(['close', 'select']);

const keyword = ref('');
const results = ref([]);
const selectedIndex = ref(0);

// 입력칸과 결과 초기화
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    keyword.value = '';
    results.value = [];
    selectedIndex.value = 0;
  }
});


const search = async () => {
  if (!keyword.value.trim()) {
    results.value = [];
    return;
  }
  const res = await axios.get('/api/processSearch', { params: { keyword: keyword.value } });
  results.value = res.data.slice(0, 10);
  selectedIndex.value = 0;
};

const select = (item) => {
  emit('select', item);
  emit('close');
};

const handleKeydown = (e) => {
  if (e.key === 'ArrowDown') {
    selectedIndex.value = Math.min(selectedIndex.value + 1, results.value.length - 1);
  } else if (e.key === 'ArrowUp') {
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
  } else if (e.key === 'Enter') {
    if (results.value[selectedIndex.value]) {
      select(results.value[selectedIndex.value]);
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white; padding: 20px; border-radius: 8px;
}
.active {
  background-color: #007bff;
  color: white;
}
</style>
