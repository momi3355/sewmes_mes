<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import Swal from 'sweetalert2';




const props = defineProps({
    isModalOpen: Boolean
});

const outsouOrderList = ref([]); // 주문제품 목록
const tabulatorCardRef = ref(null); // TabulatorCard의 getTabulator 메서드에 접근하기 위한 ref

const modalTableColumns = [
    // ... 컬럼 정의 (이전 코드 유지) ...
    { formatter: "rowSelection", titleFormatter: "rowSelection", hozAlign: "center", headerSort: false, width: 40, cssClass: 'tabulator-checkbox-column' },
    { title: "외주발주코드", field: "outsouOrderCode", width: 150 },
    { title: "품명", field: "prodName", width: 200 },
    { title: "주문수량", field: "orderQty", width: 150 },
    {
      title: "외주업체명", field: "cpName", width: 150,
      cellClick: (e, cell) => {
        const rowData = cell.getRow().getData();
        openCpSelectModal(rowData); // 모달 열기
      }
    },
    { title: "납기일자", field: "deadDate", editor: "input", width: 150 },
    { title: "등록일자", field: "regDate", width: 150},
    { title: "작업공정코드", field: "workProcessCode", width: 150 },
    { title: "업체코드", field: "cpCode", visible: false }
];

const fetchOrderProdList = async () => {
    const params = {};
    params.state = '0n1n';
    try {
        const result = await axios.get('/api/outsouOrderNotDeadList');

        outsouOrderList.value = result.data.map((item, idx) => ({
        rowNum: idx + 1,
        outsouOrderCode: item.outsou_order_code,
        workProcessCode: item.work_process_code,
        prodCode: item.prod_code,
        prodName: item.prod_name,
        orderQty: formatInt(item.order_qty),
        cpName: item.cp_name,
        regDate: formatDate(item.reg_date),
        deadDate: formatDate(item.dead_date)
    }));
  } catch (err) {
    console.error("API 호출 오류:", err);
  }
};

const selectedSave = async () => {
  const table = tabulatorCardRef.value?.getTabulator?.();
  if (!table) return;

  const selectedData = table.getSelectedData(); // 선택된 행 가져오기
  const plansToUpdate = selectedData
    .filter(row => row.deadDate) // deadDate가 입력된 경우만
    .map(row => ({
      outsouOrderCode: row.outsouOrderCode,
      deadDate: row.deadDate,
      cpCode: row.cpCode
    }));

  if (plansToUpdate.length === 0) {
    Swal.fire({ title: "미입력", text: "선택된 행 중 납기일자가 입력된 행이 없습니다", icon: "error" });
    return;
  }

  try {
    await axios.put('/api/updateOutsouDeadDate', plansToUpdate);
    await Swal.fire({
      title: "완료",
      text: "납기일자 저장 완료.",
      icon: "success"
    });
    emit('saved');
    handleCloseModal(); // 모달 닫기
  } catch (err) {
    console.error("납기일자 저장 오류:", err);
    Swal.fire({ title: "실패", text: "납기일자 저장 실패", icon: "error" });
  }
};
watch(() => props.isModalOpen, (isOpen) => {
    if (isOpen) {
        console.log("모달 열림 감지: 데이터 로드 시작.");
        fetchOrderProdList();
    } else {
        // 이 부분은 현재 문제가 해결될 때까지 주석 처리하는 것을 고려해볼 수 있습니다.
        // productionPlans.value = [];
        console.log("모달 닫힘 감지");
    }
}, { immediate: true });
const emit = defineEmits(['closeModal']);
const handleCloseModal = () => {
    emit('closeModal');
};
// 형태 변환
const formatDate = (str) => {
  if (!str) return '';
  return new Date(str).toISOString().slice(0, 10);
};
const formatInt = (val) => {
  return parseInt(val, 10);
};
// 외주업체명 찾기 모달
const cpModalOpen = ref(false);
const cpCandidates = ref([]);
const targetRow = ref(null);

const openCpSelectModal = async (rowData) => {
  try {
    const res = await axios.get('/api/getCpListByProdCode', {
      params: { prodCode: rowData.prodCode }
    });
    cpCandidates.value = res.data;
    targetRow.value = rowData;
    cpModalOpen.value = true;
  } catch (err) {
    console.error("외주업체 리스트 로드 실패", err);
  }
};

const selectCp = (cp) => {
  if (!targetRow.value) return;

  targetRow.value.cpCode = cp.cp_code;
  targetRow.value.cpName = cp.cp_name;

  const table = tabulatorCardRef.value?.getTabulator?.();
  const rows = table?.getRows();

  const rowComponent = rows?.find(r => r.getData().outsouOrderCode === targetRow.value.outsouOrderCode);
  if (rowComponent) {
    rowComponent.update({
      cpCode: cp.cp_code,
      cpName: cp.cp_name
    });
  }

  cpModalOpen.value = false;
};
</script>

<template>
  <div class="modal-overlay" v-if="props.isModalOpen">
      <div class="modal-content">
          <TabulatorCard
              ref="tabulatorCardRef"
              :tableData="outsouOrderList"
              cardTitle="납기일자 미등록 목록"
              :tableColumns="modalTableColumns"
              :tabulatorOptions="{ pagination: false, selectable: true }" >
              <template #actions>
                  </template>
          </TabulatorCard>

          <div class="modal-actions">
              <button class="btn btn-primary" @click="selectedSave">저장</button>
              <button class="btn btn-secondary ms-2" @click="handleCloseModal">닫기</button>
          </div>
      </div>
  </div>
  <!-- 외주 업체 선택 모달 -->
  <div class="modal-overlay" v-if="cpModalOpen">
    <div class="modal-content" style="width: 500px;">
      <h4>외주업체 선택</h4>
      
      <table class="table table-bordered table-hover w-100">
        <thead>
          <tr>
            <th style="text-align: left; padding: 8px;">외주처명</th>
            <th style="text-align: left; padding: 8px;">외주코드</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="cp in cpCandidates" 
            :key="cp.cp_code" 
            @click="selectCp(cp)"
            style="cursor: pointer;"
          >
            <td style="padding: 8px;">{{ cp.cp_name }}</td>
            <td style="padding: 8px;">{{ cp.cp_code }}</td>
          </tr>
        </tbody>
      </table>

      <div class="text-end mt-3">
        <button class="btn btn-secondary" @click="cpModalOpen = false">취소</button>
      </div>
    </div>
  </div>
  <!-- 외주 업체 선택 모달 끝 -->
</template>

<style scoped>
/* 기존 스타일 유지 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 80%; /* 모달 너비 조절 */
    max-width: 1350px; /* 최대 너비 설정 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
}

.modal-grid {
    flex-grow: 1; /* 그리드가 사용 가능한 공간을 채우도록 함 */
    margin-bottom: 20px; /* 버튼과의 간격 */
    /* Tabulator 높이를 CSS로 제어하려면 height: 300px; 등을 여기에 넣을 수도 있음 */
}

.modal-actions {
    text-align: right;
}
</style>