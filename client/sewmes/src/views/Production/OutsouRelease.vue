<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import TabulatorCard from '@/examples/Cards/TabulatorCard.vue';
import ArgonButton from "@/components/ArgonButton.vue";

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
      prodName: item.prod_name,
      regDate: formatDate(item.reg_date),
      deadDate: formatDate(item.dead_date),
      cpName: item.cp_name,
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
  { title: '품명', field: 'prodName', width: 200 },
  { title: '상태', field: 'releaseStateLabel', width: 130 },
  { title: '외주발주코드', field: 'outsouOrderCode', width: 150 },
  { title: '등록일', field: 'regDate', width: 150 },
  { title: '납기일', field: 'deadDate', width: 150 },
  { title: '외주업체명', field: 'cpName', width: 150 },
  { title: '주문수량', field: 'orderQty', width: 150 },
  { title: '작업공정코드', field: 'workProcessCode', width: 150 }
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
  { title: '명칭', field: 'itemName', width: 200 },
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
    alert("출고 처리할 외주발주 건을 선택하세요.");
    return;
  }

  // 현재 선택된 건을 전체 목록에서 찾음
  const selectedRow = outsouOrderData.value.find(row => row.outsouOrderCode === selectedOutsouOrderCode.value);

  if (!selectedRow) {
    alert("선택된 외주발주 건을 찾을 수 없습니다.");
    return;
  }

  if (selectedRow.releaseState !== '0o1o') {
    alert("이미 출고 완료된 건입니다.");
    return;
  }

  try {
    await axios.post('/api/outsouReleaseProc', {
      outsouOrderCode: selectedOutsouOrderCode.value
    });

    alert("출고 처리 완료");
    await searchOutsouOrder();  // 목록 재조회
    selectedOutsouOrderCode.value = ''; // 선택 초기화 필요 시
  } catch (err) {
    console.error("출고 처리 실패:", err);
    alert("출고 처리 중 오류 발생");
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
});
</script>

<template>
  <div class="container-fluid p-3">
    <div class="row search-color">
      <div class="row mb-2">
        <!-- 등록일 -->
        <div class="col-md-3">
          <label class="form-label">등록일</label>
          <div class="d-flex align-items-center gap-2">
            <input type="text" class="form-control" v-model="searchRegDateStart">
            <span>~</span>
            <input type="text" class="form-control" v-model="searchRegDateEnd">
          </div>
        </div>

        <!-- 납기일 -->
        <div class="col-md-3">
          <label class="form-label">납기일</label>
          <div class="d-flex align-items-center gap-2">
            <input type="text" class="form-control" v-model="searchDeadDateStart">
            <span>~</span>
            <input type="text" class="form-control" v-model="searchDeadDateEnd">
          </div>
        </div>
        <div class="col-md-3">
          <label class="form-label">품명 포함 단어</label>
          <input type="text" class="form-control" v-model="searchProdName">
        </div>
      </div>
      <div class="row mb-2">
        <div class="col-md-3">
          <label class="form-label">외주 코드</label>
          <input type="text" class="form-control" v-model="searchCpCode">
        </div>
        <div class="col-md-3">
          <label class="form-label">외주업체명 포함 단어</label>
          <input type="text" class="form-control" v-model="searchCpName">
        </div>
        <div class="col-md-2">
          <label class="form-label">출고 상태</label>
          <select class="form-select" v-model="searchReleaseState">
            <option value="">선택안함</option>
            <option value="0o1o">출고 전</option>
            <option value="0o2o">출고 완료</option>
          </select>
        </div>
        <div class="col-md-3 d-flex align-items-end">
          <button class="btn btn-secondary me-2" @click="resetFilter">초기화</button>
          <button class="btn btn-primary" @click="searchOutsouOrder">조회</button>
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
            <ArgonButton style="width: 150px;" color="success" variant="gradient" @click="handleReleaseComplete">
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
</style>
