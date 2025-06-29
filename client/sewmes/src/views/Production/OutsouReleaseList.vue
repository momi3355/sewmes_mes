<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import TabulatorCard from '@/examples/Cards/TabulatorCard.vue';
import { formatToDate } from '@/utils/dateUtils';

// 검색 객체
const searchItemName = ref('');
const searchOutsouCode = ref('');
const searchCpName = ref('');
const searchReleaseState = ref('');
const searchRegDateStart = ref('');
const searchRegDateEnd = ref('');
const searchDeadDateStart = ref('');
const searchDeadDateEnd = ref('');
const outsouReleaseMaterialList = ref([]);


// 제품 목록 조건에 따른 검색
const searchReleaseMaterial = async () => {
  const params = {};

  if (searchItemName.value.trim()) params.itemName = searchItemName.value.trim();
  if (searchOutsouCode.value.trim()) params.outsouCode = searchOutsouCode.value.trim();
  if (searchCpName.value.trim()) params.cpName = searchCpName.value.trim();
  if (searchReleaseState.value) params.releaseState = searchReleaseState.value;

  if (searchRegDateStart.value) params.regStart = searchRegDateStart.value;
  if (searchRegDateEnd.value) params.regEnd = searchRegDateEnd.value;
  if (searchDeadDateStart.value) params.deadStart = searchDeadDateStart.value;
  if (searchDeadDateEnd.value) params.deadEnd = searchDeadDateEnd.value;

  try {
    const result = await axios.get('/api/outsouReleaseMaterialList', { params });
    outsouReleaseMaterialList.value = result.data.map((item, idx) => ({
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
const outsouReleaseMaterialColumns = [
  { title: "No", field: "rowNum", width: 80 },
  { title: '외주발주코드', field: 'outsouOrderCode', width: 150 },
  { title: '자재홀드코드', field: 'holdCode', width: 150 },
  { title: '명칭', field: 'itemName' },
  { title: '등록일', field: 'regDate', width: 200 },
  { title: '납기일', field: 'deadDate', width: 200 },
  { title: '외주업체명', field: 'cpName', width: 200 },
  { title: '출고수량', field: 'releaseQty', width: 150 },
  { title: '자재 상태', field: 'releaseState', width: 150 }
];

// 초기화 버튼 클릭 시 검색조건 입력란 비움움
const resetFilter = () => {
  searchItemName.value = '';
  searchOutsouCode.value = '';
  searchCpName.value = '';
  searchReleaseState.value = '';
  searchRegDateStart.value = '';
  searchRegDateEnd.value = '';
  searchDeadDateStart.value = '';
  searchDeadDateEnd.value = '';
};
const tabulatorEvent = [
  {
    eventName: "rowDblClick",
    eventAction: 
      async (e, row) => {
      const data = row.getData();
      selectedProdCode.value = data.prodCode;
      selectedProdName.value = data.prodName;
      await loadProcesses();

      const tableInstance = productTableRef.value?.$el?.querySelector('.tabulator')?.__tabulator__;
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
  searchReleaseMaterial();
})
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
          <label class="form-label search-label">자재명 포함 단어</label>
          <input type="text" class="form-control" v-model="searchItemName">
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
          <button class="btn btn-outline-secondary w-50" @click="searchReleaseMaterial">조회</button>
          <button class="btn btn-primary w-50" @click="resetFilter">초기화</button>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 d-flex flex-column">
        <tabulator-card
          card-title="외주출고자재"
          :height="650"
          :table-data="outsouReleaseMaterialList"
          :table-columns="outsouReleaseMaterialColumns"
          :on="tabulatorEvent"
        />
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
.search-label {
  font-size: medium;
}
.full-height {
  height: 840px;
  display: flex;
  flex-direction: column;
}
</style>