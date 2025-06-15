<!-- OutsouInboundTestModal.vue -->
<script setup>
import axios from 'axios';
import { defineProps, defineEmits, ref, computed, onMounted, watch } from 'vue';

const semiProductQualityTest = ref([]);
const defectCounts = ref({});

const props = defineProps({
  isOpen: Boolean,
  prodName: String,
  outsouInboundCode: String,
  inboundQty:Number
});

const emit = defineEmits(['close', 'saved']);

// 총 불합격 수량 계산
const defectTotal = computed(() =>
  Object.values(defectCounts.value).reduce((sum, val) => sum + (val || 0), 0)
);

// 합격 수량 계산
const passQty = computed(() =>
  props.inboundQty - defectTotal.value
);

const fetchTestItems = async () => {
  try {
    const result = await axios.get('/api/semiProductQualityTest');
    const data = result.data;

    let dataArray = [];

    if (Array.isArray(data)) {
      dataArray = data;
    } else if (typeof data === 'object' && data !== null) {
      dataArray = [data]; // 단일 객체일 경우 배열로 변환
    }

    semiProductQualityTest.value = dataArray.map(item => ({
      qualityCode: item.quality_code,
      testName: item.test_name,
      testMethod: item.test_method
    }));

    defectCounts.value = Object.fromEntries(
      dataArray.map(item => [item.test_name, 0])
    );
  } catch (err) {
    console.error('검사 항목 조회 실패:', err);
  }
};

onMounted(() => {
  if (props.isOpen) fetchTestItems();
});
watch(() => props.isOpen, (newVal) => {
  if (newVal) fetchTestItems();
});
const close = () => emit('close');
const save = () => {
  emit('saved', {
    outsouInboundCode: props.outsouInboundCode,
    defectCounts: defectCounts.value,
    passQty: passQty.value,
    defectQty: defectTotal.value
  });
  close();
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <h4>품질 검사</h4>
      <p><strong>품명:</strong> {{ prodName }}</p>
      <p><strong>외주입고번호:</strong> {{ outsouInboundCode }}</p>
      <p><strong>검수수량:</strong> {{ inboundQty }}</p>

      <table class="table table-bordered mt-3">
        <thead>
          <tr>
            <th>항목</th>
            <th>검사방법</th>
            <th>불합격개수</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(test, idx) in semiProductQualityTest" :key="test.qualityCode">
            <td>{{ test.testName }}</td>
            <td>{{ test.testMethod }}</td>
            <td>
              <input
                type="number"
                class="form-control"
                v-model.number="defectCounts[test.testName]"
                min="0"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div class="mt-3">
        <p><strong>합격수량:</strong> {{ passQty }}</p>
        <p><strong>불합격수량:</strong> {{ defectTotal }}</p>
      </div>

      <div class="d-flex justify-content-end gap-2 mt-3">
        <button class="btn btn-primary" @click="save">검사완료</button>
        <button class="btn btn-secondary" @click="close">취소</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal-content {
  background: white;
  padding: 30px;
  width: 700px;
  border-radius: 10px;
}
</style>