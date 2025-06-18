<!-- OutsouInboundTestModal.vue -->
<script setup>
import axios from 'axios';
import { defineProps, defineEmits, ref, computed, onMounted, watch } from 'vue';
import Swal from 'sweetalert2';

const semiProductQualityTest = ref([]);
const defectCounts = ref({});

const props = defineProps({
  isOpen: Boolean,
  prodName: String,
  outsouInboundCode: String,
  inboundQty:Number,
  userCode:String, userName:String
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
// 기존 검사 정보 가져오기
const fetchExistingDefectDetail = async (inboundCode) => {
  try {
    const result = await axios.get(`/api/defectDetail/${inboundCode}`);
    // 반환: [{ quality_code, test_name, test_method, defect_qty }, ...]
    return result.data;
  } catch (err) {
    console.error("기존 불량 검사 조회 실패:", err);
    return [];
  }
};
const fetchTestItems = async () => {
  try {
    const result = await axios.get('/api/semiProductQualityTest');
    const baseItems = result.data.map(item => ({
      qualityCode: item.quality_code,
      testName: item.test_name,
      testMethod: item.test_method
    }));
    semiProductQualityTest.value = baseItems;

    // 👉 기존 불량 정보 불러오기
    const existingDefects = await fetchExistingDefectDetail(props.outsouInboundCode);

    // 👉 testName => defectQty 매핑
    const existingDefectMap = Object.fromEntries(
      existingDefects.map(d => [d.test_name, d.defect_qty])
    );

    // 👉 defectCounts 초기값 세팅
    defectCounts.value = Object.fromEntries(
      baseItems.map(item => [item.testName, existingDefectMap[item.testName] ?? 0])
    );
  } catch (err) {
    console.error('검사 항목 조회 실패:', err);
  }
};

onMounted(() => {
  if (props.isOpen) fetchTestItems();
});
watch(() => props.isOpen, (opened) => {
  if (opened) fetchTestItems();
});
const close = () => emit('close');
//
const save = async () => {
  try {
    const defectArray = Object.entries(defectCounts.value)
      .filter(([_, qty]) => qty > 0)
      .map(([qualityCode, defectQty]) => ({
        quality_code: qualityCode,
        defect_qty: defectQty
      }));

    await axios.post('/api/saveInboundInspection', {
      outsouInboundCode: props.outsouInboundCode,
      userCode: props.userCode,
      passQty: passQty.value,
      defectList: defectArray
    });
//    { 전달되는 데이터 예시
//   "outsouInboundCode": "OR4",
//   "userCode": "EMP01",
//   "passQty": 95,
//   "defectList": [
//     { "quality_code": "Q1", "defect_qty": 5 },
//     { "quality_code": "Q2", "defect_qty": 0 }
//   ]
// }

    Swal.fire({ title: "완료", text: "검사 저장이 완료되었습니다", icon: "success" });
    emit('saved'); // 검사 완료 시 부모에 알림
    close();  // 모달 닫기
  } catch (err) {
    console.error('검사 저장 실패:', err);
    Swal.fire({ title: "오류", text: "저장 중 오류가 발생했습니다", icon: "error" });
  }
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
            <th style="width: 25%;">항목</th>
            <th style="width: 55%;">검사방법</th>
            <th style="width: 20%;">불합격개수</th>
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
                v-model.number="defectCounts[test.qualityCode]"
                min="0"
                style="width: 80px;"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <div class="mt-3">
        <p><strong>합격수량:</strong> {{ passQty }}</p>
        <p><strong>불합격수량:</strong> {{ defectTotal }}</p>
        <p><strong>검수자:</strong> {{ userName }}</p>
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