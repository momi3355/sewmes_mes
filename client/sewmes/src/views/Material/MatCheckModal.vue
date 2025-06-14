<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['complete']);

// 불합격 수량을 객체로 관리
const checkResults = ref({
  width: 0,     
  color: 0,     
  dirt: 0, 
  tensile: 0,    
});

const checkedValues = ref({
  width: '',
  color: '',
  dirt: '',
  tensile: '',
});
// 실시간 합격량 계산 
// 모든 불합격 수량의 합계를 계산하는 computed 속성
const totalUnqualifiedQty = computed(() => {
  return Object.values(checkResults.value).reduce((sum, qty) => sum + Number(qty || 0), 0);
});

// 총 수입량에서 총 불합격 수량을 뺀 최종 합격 수량을 계산
const finalQualifiedQty = computed(() => {
  const totalInbound = props.item.inbound_qty || 0;
  const newQualified = totalInbound - totalUnqualifiedQty.value;
  // 합격 수량이 음수가 되지 않도록 방지
  return newQualified < 0 ? 0 : newQualified;
});


// 모달 열 때 자동생성되는 날짜
const isModalVisible = ref(false);
const checkDate = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

// 모달 열 때 불합격 수량 초기화 ---
const openModal = () => {
  // 모달을 열 때 모든 검사 항목의 불합격 수량을 0으로 리셋
    checkResults.value = {
    width: 0,
    color: 0,
    dirt: 0,
    tensile: 0,
  };
  // 드롭다운 기본값
  checkedValues.value = {
    width: '',
    color: '일치',
    dirt: '없음',
    tensile: '',
  };
  isModalVisible.value = true;
};

const closeModal = () => {
  isModalVisible.value = false;
};

// 수입량 초과 체크
const validateInput = () => {
  const totalInbound = props.item.inbound_qty || 0;
  if (totalUnqualifiedQty.value > totalInbound) {
    alert(`총 불합격 개수가 수입량(${totalInbound})을 초과할 수 없습니다.`);
  }
};


const completeCheck = () => {
  validateInput(); // 완료 전 최종 검사
  if (totalUnqualifiedQty.value > (props.item.inbound_qty || 0)) {
    return; // 유효성 검사 실패 시 완료 처리 중단
  }
  
  emit('complete', {
    item_id: props.item.id, // 부모가 어떤 아이템인지 식별할 ID
    qualified_qty: finalQualifiedQty.value,
    unqualified_qty: totalUnqualifiedQty.value,
    details: checkResults.value // 각 항목별 불합격 수량도 함께 전달
  });

  alert('검사가 완료되었습니다.');
  closeModal();
};

defineExpose({ openModal });
</script>

<template>
  <div v-if="isModalVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h1>수입 검사</h1>
      </div>

      <div class="modal-body">
        <div class="info-section">
          <p>자재명: {{ item.material_name }}</p>
          <p>입고번호: {{ item.material_order_code }}</p>
          <p>검사일자: {{ checkDate }}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th class="checklist-col">항목</th>
              <th class="reference-col">검사방법</th>
              <th class="inboundqty-col">수입량</th>
              <th class="passqty-col">합격개수</th>
              <th class="unqualified-col">불합격개수</th>
            </tr>
          </thead>
       <!-- MatCheckModal.vue의 <template> 안 -->
<tbody>
  <tr key="width">
    <td>폭</td>
    <td></td>
    <td class="merged-top">
      <span class="centered">{{ item.inbound_qty }}</span>
    </td>
    <td class="merged-top">
      <span class="centered">{{ finalQualifiedQty }}</span>
    </td>
    <td><input type="number" class="input-cell" v-model.number="checkResults.width" @input="validateInput" min="0"></td>
  </tr>
  <tr key="color">
    <td>색상 일치</td>
    <td></td>
    <td class="merged-middle"></td>
    <td class="merged-middle"></td>
    <td><input type="number" class="input-cell" v-model.number="checkResults.color" @input="validateInput" min="0"></td>
  </tr>
  <tr key="dirt">
    <td>오염여부</td>
    <td></td>
    <td class="merged-middle"></td>
    <td class="merged-middle"></td>
    <td><input type="number" class="input-cell" v-model.number="checkResults.dirt" @input="validateInput" min="0"></td>
  </tr>
  <tr key="tensile">
    <td>인장 강도</td>
    <td></td>
    <td class="merged-end"></td>
    <td class="merged-end"></td>
    
    <td><input type="number" class="input-cell" v-model.number="checkResults.tensile" @input="validateInput" min="0"></td>
  </tr>
</tbody>
        </table>
      </div>

      <div class="modal-footer">
        <button class="btn btn-primary" @click="completeCheck">검사완료</button>
        <button class="btn btn-secondary" @click="closeModal">취소</button>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* 스타일은 기존과 동일하므로 생략합니다. */
/* 뒷 배경 오버레이 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 모달창 컨테이너 */
.modal-container {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 700px;
}

/* 헤더 */
.modal-header h1 {
  text-align: center;
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 20px;
}

/* 정보 섹션 */
.info-section {
  margin-bottom: 20px;
  text-align: left;
}
.info-section p {
  margin: 5px 0;
  font-size: 1rem;
}

/* 테이블 스타일 */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
}
th, td {
  border: 1px solid #ccc;
  padding: 12px;
  text-align: center;
  vertical-align: middle;
}
th {
  background-color: #f8f9fa;
  font-weight: 600;
}
.input-cell {
  width: 100%;
  border: none;
  text-align: center;
  padding: 5px;
  box-sizing: border-box;
  background-color: transparent;
  font-size: 1em;
}
.input-cell:focus, .select-cell:focus {
  outline: 1px solid #8ab4f8;
  background-color: #f8f9fa;
}
.checklist-col{
  width: 100px;
}
.reference-col{
  width: 120px;
}
.checkedvalue-col {
  width: 100px;
}
.inboundqty-col{
  width: 90px;
}
.passqty-col{
  width: 90px;
}
.unqualified-col {
  width: 100px;
}

.merged-top-cell {
  /* 위쪽 셀의 아래쪽 테두리를 제거 */
  border-bottom-color: transparent;
}
.merged-cell {
  /* 아래쪽 셀의 위쪽 테두리를 제거 */
  border-top-color: transparent;
}

/* 푸터 (버튼 영역) */
.modal-footer {
  text-align: center;
}
.btn {
  padding: 10px 25px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin: 0 10px;
}
.btn-primary {
  background-color: #82C0C9; /* 이미지의 청록색 */
  color: white;
}
.btn-secondary {
  background-color: #BDBDBD; /* 이미지의 회색 */
  color: white;
}
.merged-top {
  /* 시작 셀: 아래쪽 테두리만 제거 */
  border-bottom-color: transparent;
  position: relative;
}
.merged-middle {
  /* 중간 셀: 위쪽과 아래쪽 테두리 모두 제거 */
  border-top-color: transparent;
  border-bottom-color: transparent;
}
.merged-end {
  /* 마지막 셀: 위쪽 테두리만 제거 */
  border-top-color: transparent;
}
.centered{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 400%;
  display: flex;
  align-items: center;
  justify-content:center;
}
</style>