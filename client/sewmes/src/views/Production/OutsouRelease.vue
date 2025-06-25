<script setup>
import axios from 'axios';
import { onBeforeMount, ref, onMounted } from 'vue';
import { useStore } from "vuex";
import TabulatorCard from '@/examples/Cards/TabulatorCard.vue';
import ArgonButton from "@/components/ArgonButton.vue";
import Swal from 'sweetalert2';
import { formatToDate } from '@/utils/dateUtils';

// 부서별 권한 관련
const store = useStore(); 
const dept = ref("");
onBeforeMount(() => {
  dept.value = store.state.user.dept;
})
const canShow = (allowedDepts) => {
  return allowedDepts.includes(dept.value);
};

const releaseMaterialTableRef = ref(null);
const outsouOrderTableRef = ref(null);

// 검색 객체
const searchProdName = ref('');
const searchOutsouCode = ref('');
const searchCpName = ref('');
const searchReleaseState = ref('0o1o');
const searchRegDateStart = ref('');
const searchRegDateEnd = ref('');
const searchDeadDateStart = ref('');
const searchDeadDateEnd = ref('');
const outsouOrderData = ref([]);

// 외주자재출고 리스트를 가져오기 위한 객체
const selectedOutsouOrderCode = ref('');
const releaseMaterialList = ref([]);

// 제품 목록 조건에 따른 검색
const searchOutsouOrder = async () => {
  const params = {};

  if (searchProdName.value.trim()) params.prodName = searchProdName.value.trim();
  if (searchOutsouCode.value.trim()) params.outsouCode = searchOutsouCode.value.trim();
  if (searchCpName.value.trim()) params.cpName = searchCpName.value.trim();
  if (searchReleaseState.value) params.releaseState = searchReleaseState.value;

  if (searchRegDateStart.value) params.regStart = searchRegDateStart.value;
  if (searchRegDateEnd.value) params.regEnd = searchRegDateEnd.value;
  if (searchDeadDateStart.value) params.deadStart = searchDeadDateStart.value;
  if (searchDeadDateEnd.value) params.deadEnd = searchDeadDateEnd.value;

  try {
    const result = await axios.get('/api/outsouOrderList', { params });
    outsouOrderData.value = result.data.map((item, idx) => ({
      rowNum: idx + 1,
      outsouOrderCode: item.outsou_order_code,
      workProcessCode: item.work_process_code,
      prodCode: item.prod_code,
      prodName: item.prod_name,
      regDate: formatDate(item.reg_date),
      deadDate: formatDate(item.dead_date),
      cpName: item.cp_name,
      cpCode: item.cp_code,
      orderQty: formatInt(item.order_qty),
      releaseState: item.release_state,                    // 실제 비교용
      releaseStateLabel: convertCode(item.release_state)   // 보기용
    }));
  } catch (err) {
    console.error("API 호출 오류:", err);
  }
};
const outsouOrderColumns = [
  { title: "No", field: "rowNum", width: 75 },
  { title: '품명', field: 'prodName'},
  { title: '상태', field: 'releaseStateLabel', width: 130 },
  { title: '외주발주코드', field: 'outsouOrderCode', width: 150 },
  { title: '등록일', field: 'regDate', width: 150 },
  { title: '납기일', field: 'deadDate', width: 150 },
  { title: '외주업체명', field: 'cpName', width: 150 },
  { title: '주문수량', field: 'orderQty', width: 150 },
  { title: '작업공정코드', field: 'workProcessCode', width: 150 },
  { title: "업체코드", field: "cpCode", visible: false }
];
const tabulatorOptions = {
  selectableRows: 1,
  rowFormatter: function(row) {
    const rowData = row.getData();
    if (selectedOutsouOrderCode.value && rowData.outsouOrderCode === selectedOutsouOrderCode.value.outsouOrderCode) {
      row.getElement().classList.add("selected-row");
    } else {
      row.getElement().classList.remove("selected-row");
    }
  }
};
// 초기화 버튼 클릭 시 검색조건 입력란 비움움
const resetFilter = () => {
  searchProdName.value = '';
  searchOutsouCode.value = '';
  searchCpName.value = '';
  searchReleaseState.value = '';
  searchRegDateStart.value = '';
  searchRegDateEnd.value = '';
  searchDeadDateStart.value = '';
  searchDeadDateEnd.value = '';
};
// =========================================================================
// 선택된 외주발주 건에 따른 자재 출력
const loadReleaseMaterial = async () => {
  if (!selectedOutsouOrderCode.value) return;
  try {
    const result = await axios.get(`/api/releaseMaterialList?outsouOrderCode=${selectedOutsouOrderCode.value}`);
    const list = Array.isArray(result.data) ? result.data : [];
    releaseMaterialList.value = list.map((item, idx) => ({
      rowNum: idx + 1,
      outsouOrderCode: item.outsou_order_code,
      holdCode: item.hold_id,
      itemName: item.item_name, // 자재명, (반)제품명 둘다 포함
      regDate: formatDate(item.reg_date),
      deadDate: formatDate(item.dead_date),
      cpName: item.cp_name,
      releaseQty: formatInt(item.release_qty),
      releaseState: convertCode(item.release_state)
    }));
  } catch (err) {
    console.error("API 호출 오류:", err);
  }
};
// 공통코드 변환환
const convertCode = (code) => {
  switch (code) {
    case '0o1o': return '출고 전';
    case '0o2o': return '출고 완료';
    default: return code;
  }
};
const releaseMaterialColumns = [
  { title: "No", field: "rowNum", width: 80 },
  { title: '명칭', field: 'itemName' },
  { title: '등록일', field: 'regDate', width: 150 },
  { title: '납기일', field: 'deadDate', width: 150 },
  { title: '외주업체명', field: 'cpName', width: 150 },
  { title: '출고수량', field: 'releaseQty', width: 120 },
  { title: '자재 상태', field: 'releaseState', width: 120 },
  { title: '외주발주코드', field: 'outsouOrderCode', width: 150 },
  { title: '자재홀드코드', field: 'holdCode', width: 150 }
];
// 외주발주 출고처리 - 단일 선택된 건 처리
const handleReleaseComplete = async () => {
  if (!selectedOutsouOrderCode.value) {
    Swal.fire({ title: "미선택", text: "출고 처리할 외주발주 건을 선택하세요", icon: "error" });
    return;
  }

  // 현재 선택된 건을 전체 목록에서 찾음
  const selectedRow = outsouOrderData.value.find(row => row.outsouOrderCode === selectedOutsouOrderCode.value);

  if (!selectedRow) {
    Swal.fire({ title: "선택 오류", text: "선택된 외주발주 건을 찾을 수 없습니다", icon: "error" });
    return;
  }

  if (selectedRow.releaseState !== '0o1o') {
    Swal.fire({ title: "선택 불가", text: "이미 출고 완료된 건입니다", icon: "error" });
    return;
  }
  // 확인/취소 메시지 
  const result = await Swal.fire({
    title: '출고 완료 처리',
    text: '정말로 출고 완료 처리하시겠습니까?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: '예, 진행합니다',
    cancelButtonText: '취소'
  });

  if (!result.isConfirmed) return;

  try {
    // 1. 출고 처리 API 실행
    await axios.post('/api/outsouReleaseProc', {
      outsouOrderCode: selectedOutsouOrderCode.value
    });

    // 2. 외주입고 등록 API 실행
    const inboundPayload = {
      outsouOrderCode: selectedRow.outsouOrderCode,
      orderQty: selectedRow.orderQty,
      deadDate: selectedRow.deadDate,
      prodCode: selectedRow.prodCode, // 이 정보가 없다면 백엔드에서 조회 필요
      cpCode: selectedRow.cpCode
    };

    await axios.post('/api/outsouInboundAutoInsert', inboundPayload);

    Swal.fire({ title: "출고 및 입고 완료", text: "출고 및 외주입고 등록 완료", icon: "success" });
    await searchOutsouOrder();
    selectedOutsouOrderCode.value = '';
  } catch (err) {
    console.error("출고 또는 입고 처리 실패:", err);
    Swal.fire({ title: "오류", text: "출고 또는 입고 처리 중 오류 발생", icon: "error" });
  }
};

const tabulatorEvent = [
  {
    eventName: "rowClick",
    eventAction: 
      async (e, row) => {
      const data = row.getData();
      selectedOutsouOrderCode.value = data.outsouOrderCode;
      await loadReleaseMaterial();

      const tableInstance = releaseMaterialTableRef.value?.$el?.querySelector('.tabulator')?.__tabulator__;
      if (tableInstance) {
        tableInstance.redraw(true);
      }
    }
  }
];
// 형태 변환
const formatDate = (str) => {
  if (!str) return '';
  return new Date(str).toISOString().slice(0, 10);
};
const formatInt = (val) => {
  return parseInt(val, 10);
};
onMounted(() => {
  searchOutsouOrder();
  searchOutsouOrder();
});
</script>

<template>
  <div class="container-fluid p-3">
    <div class="search-area bg-white rounded p-3 mb-3 shadow-sm">
      <div class="row">
        <!-- 등록일 -->
        <div class="col-md-2">
          <label class="form-label search-label">등록일</label>
          <div class="d-flex align-items-center gap-2">
            <input
              type="text"
              class="form-control"
              v-model="searchRegDateStart"
              @blur="searchRegDateStart = formatToDate(searchRegDateStart)"
              @keyup.enter="searchRegDateStart = formatToDate(searchRegDateStart)"
            >
            <span>~</span>
            <input
              type="text"
              class="form-control"
              v-model="searchRegDateEnd"
              @blur="searchRegDateEnd = formatToDate(searchRegDateEnd)"
              @keyup.enter="searchRegDateEnd = formatToDate(searchRegDateEnd)"
            >
          </div>
        </div>

        <!-- 납기일 -->
        <div class="col-md-2">
          <label class="form-label search-label">납기일</label>
          <div class="d-flex align-items-center gap-2">
            <input
              type="text"
              class="form-control"
              v-model="searchDeadDateStart"
              @blur="searchDeadDateStart = formatToDate(searchDeadDateStart)"
              @keyup.enter="searchDeadDateStart = formatToDate(searchDeadDateStart)"
            >
            <span>~</span>
            <input
              type="text"
              class="form-control"
              v-model="searchDeadDateEnd"
              @blur="searchDeadDateEnd = formatToDate(searchDeadDateEnd)"
              @keyup.enter="searchDeadDateEnd = formatToDate(searchDeadDateEnd)"
            >
          </div>
        </div>
        <div class="col-md-2">
          <label class="form-label search-label">품명 포함 단어</label>
          <input type="text" class="form-control" v-model="searchProdName">
        </div>
        <div class="col-md-1">
          <label class="form-label search-label">외주 코드</label>
          <input type="text" class="form-control" v-model="searchCpCode">
        </div>
        <div class="col-md-2">
          <label class="form-label search-label">외주업체명 포함 단어</label>
          <input type="text" class="form-control" v-model="searchCpName">
        </div>
        <div class="col-md-1">
          <label class="form-label search-label">출고 상태</label>
          <select class="form-select" v-model="searchReleaseState">
            <option value="">선택안함</option>
            <option value="0o1o">출고 전</option>
            <option value="0o2o">출고 완료</option>
          </select>
        </div>
        <div class="col-md-2 d-flex align-items-end gap-2">
          <button class="btn btn-outline-secondary w-50" @click="resetFilter">초기화</button>
          <button class="btn btn-primary w-50" @click="searchOutsouOrder">조회</button>
        </div>
        
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 d-flex flex-column">
        <tabulator-card
          ref="outsouOrderTableRef"
          card-title="외주발주 목록"
          :height="300"
          :table-data="outsouOrderData"
          :table-columns="outsouOrderColumns"
          :tabulator-options="tabulatorOptions"
          :on="tabulatorEvent"
        />
        <tabulator-card
          card-title="출고자재 목록"
          :height="300"
          :table-data="releaseMaterialList"
          :table-columns="releaseMaterialColumns"
          :on="tabulatorEvent"
        >
          <template #actions>
            <ArgonButton style="width: 150px;" color="success" variant="gradient" @click="handleReleaseComplete" v-if="canShow(['0c2c', '0c5c'])">
              출고 완료
            </ArgonButton>
          </template>
        </tabulator-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn {
  min-width: 80px;
}
.search-color {
  margin: 10px;
  padding: 20px;
  border-radius: 15px;
  background-color: #FFF;
}
/* 선택된 행의 스타일 */
.selected-row {
  background-color: #e0e0e0 !important; /* 원하는 강조 색상으로 변경 */
  font-weight: bold; /* 선택된 행의 텍스트를 굵게 */
}
.search-label {
  font-size: medium;
}
.full-height {
  height: 840px;
  display: flex;
  flex-direction: column;
}
</style>
