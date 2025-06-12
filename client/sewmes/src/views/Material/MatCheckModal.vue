<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  item: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['complete']);

// --- ✨ 1. 데이터 구조 변경: 각 항목의 불합격 수량을 객체로 관리 ---
const inspectionResults = ref({
  width: 0,         // 폭 불합격 수량
  color: 0,         // 색상 불합격 수량
  contamination: 0, // 오염 불합격 수량
  tensile: 0,       // 인장강도 불합격 수량
});

// --- ✨ 2. computed 속성으로 실시간 총계 계산 ---
// 모든 불합격 수량의 합계를 계산하는 computed 속성
const totalUnqualifiedQty = computed(() => {
  // `inspectionResults` 객체의 모든 값(불합격 수량들)을 더합니다.
  return Object.values(inspectionResults.value).reduce((sum, qty) => sum + Number(qty || 0), 0);
});

// 총 수입량에서 총 불합격 수량을 뺀 최종 합격 수량을 계산
const finalQualifiedQty = computed(() => {
  const totalInbound = props.item.inbound_qty || 0;
  const newQualified = totalInbound - totalUnqualifiedQty.value;
  // 합격 수량이 음수가 되지 않도록 방지
  return newQualified < 0 ? 0 : newQualified;
});


// 모달 상태 및 기본 정보 (기존과 동일)
const isModalVisible = ref(false);
const checkDate = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

// --- ✨ 3. 모달 열 때 모든 불합격 수량 초기화 ---
const openModal = () => {
  // 모달을 열 때 모든 검사 항목의 불합격 수량을 0으로 리셋
  inspectionResults.value = {
    width: 0,
    color: 0,
    contamination: 0,
    tensile: 0,
  };
  isModalVisible.value = true;
};

const closeModal = () => {
  isModalVisible.value = false;
};

// --- ✨ 4. 입력값 유효성 검사 (개선) ---
const validateInput = () => {
  const totalInbound = props.item.inbound_qty || 0;
  if (totalUnqualifiedQty.value > totalInbound) {
    alert(`총 불합격 갯수가 총 수입량(${totalInbound})을 초과할 수 없습니다.`);
    // UX 개선을 위해 마지막에 입력한 값을 0으로 되돌리는 등의 로직을 추가할 수 있습니다.
    // 여기서는 알림만 표시합니다.
  }
};


const completeInspection = () => {
  validateInput(); // 완료 전 최종 검사
  if (totalUnqualifiedQty.value > (props.item.inbound_qty || 0)) {
    return; // 유효성 검사 실패 시 완료 처리 중단
  }
  
  emit('complete', {
    item_id: props.item.id, // 부모가 어떤 아이템인지 식별할 ID
    qualified_qty: finalQualifiedQty.value,
    unqualified_qty: totalUnqualifiedQty.value,
    details: inspectionResults.value // 각 항목별 불합격 수량도 함께 전달
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
              <th>항목</th>
              <th>기준값</th>
              <th>수입량</th>
              <th>합격개수</th>
              <th>불합격개수</th>
            </tr>
          </thead>
          <tbody>
            <!-- ✨ 5. 템플릿 수정: rowspan과 v-model을 각 항목에 맞게 바인딩 -->
            <tr>
              <td>폭</td>
              <td>140~152cm</td>
              <td :rowspan="4" class="inbound_qty">{{ item.inbound_qty }}</td>
              <td :rowspan="4">{{ finalQualifiedQty }}</td>
              <td>
                <input type="number" class="input-cell" v-model.number="inspectionResults.width" @input="validateInput" min="0">
              </td>
            </tr>
            <tr>
              <td>색상 일치</td>
              <td>일치해야 함</td>
              <td>
                <input type="number" class="input-cell" v-model.number="inspectionResults.color" @input="validateInput" min="0">
              </td>
            </tr>
            <tr>
              <td>오염여부</td>
              <td>없음</td>
              <td>
                <input type="number" class="input-cell" v-model.number="inspectionResults.contamination" @input="validateInput" min="0">
              </td>
            </tr>
            <tr>
              <td>인장 강도</td>
              <td>>=40kgf</td>
              <td>
                <input type="number" class="input-cell" v-model.number="inspectionResults.tensile" @input="validateInput" min="0">
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="modal-footer">
        <button class="btn btn-primary" @click="completeInspection">검사완료</button>
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
}
.input-cell:focus {
  outline: 1px solid #8ab4f8;
  background-color: #f8f9fa;
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
</style>