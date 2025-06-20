<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import TabulatorCard from '@/examples/Cards/TabulatorCard.vue';

// 검색 객체
const searchProdName = ref('');
const searchCpName = ref('');
const searchOutsouInboundCode = ref('');
const searchRegDateStart = ref('');
const searchRegDateEnd = ref('');
const searchInboundDateStart = ref('');
const searchInboundDateEnd = ref('');

const outsouDefectList = ref([]);

// 조건에 따른 검색
const searchInboundDefect = async () => {
  const params = {};

  if (searchProdName.value.trim()) params.prodName = searchProdName.value.trim();
  if (searchCpName.value.trim()) params.cpName = searchCpName.value.trim();
  if (searchOutsouInboundCode.value) params.inboundCode = searchOutsouInboundCode.value;

  if (searchRegDateStart.value) params.regStart = searchRegDateStart.value;
  if (searchRegDateEnd.value) params.regEnd = searchRegDateEnd.value;
  if (searchInboundDateStart.value) params.inboundStart = searchInboundDateStart.value;
  if (searchInboundDateEnd.value) params.inboundEnd = searchInboundDateEnd.value;

  try {
    const result = await axios.get('/api/outsouInboundDefectList', { params });
    outsouDefectList.value = result.data.map((item, idx) => ({
      rowNum: idx + 1,
      defectHistoryCode: item.defect_history_code,
      outsouInboundCode: item.outsou_inbound_code,
      prodName: item.prod_name,
      regDate: formatDate(item.reg_date),
      inboundDate: formatDate(item.inbound_date),
      cpName: item.cp_name,
      defectQty: formatInt(item.defect_qty),
      empName: item.emp_name
    }));
  } catch (err) {
    console.error("API 호출 오류:", err);
  }
};

const outsouDefectColumns = [
  { title: "No", field: "rowNum", width: 80 },
  { title: '품명', field: 'prodName', width: 250 },
  { title: '등록일', field: 'regDate', width: 150 },
  { title: '입고일', field: 'inboundDate', width: 150 },
  { title: '외주업체명', field: 'cpName', width: 200 },
  { title: '불합격수량', field: 'defectQty', width: 150 },
  { title: '사원이름', field: 'empName', width: 150 },
  { title: '외주입고코드', field: 'outsouInboundCode', width: 150 }
];

// 초기화 버튼 클릭 시 검색조건 입력란 비움움
const resetFilter = () => {
  searchProdName.value = '';
  searchCpName.value = '';
  searchOutsouInboundCode.value = '';
  searchRegDateStart.value = '';
  searchRegDateEnd.value = '';
  searchInboundDateStart.value = '';
  searchInboundDateEnd.value = '';
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
  searchInboundDefect();
})
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
          <label class="form-label">입고일</label>
          <div class="d-flex align-items-center gap-2">
            <input type="text" class="form-control" v-model="searchInboundDateStart">
            <span>~</span>
            <input type="text" class="form-control" v-model="searchInboundDateEnd">
          </div>
        </div>
      </div>
      <div class="row mb-2">
        <div class="col-md-3">
          <label class="form-label">외주입고코드</label>
          <input type="text" class="form-control" v-model="searchOutsouInboundCode">
        </div>
        <div class="col-md-3">
          <label class="form-label">외주업체명 포함 단어</label>
          <input type="text" class="form-control" v-model="searchCpName">
        </div>
        <div class="col-md-3">
          <label class="form-label">품명 포함 단어</label>
          <input type="text" class="form-control" v-model="searchProdName">
        </div>
        <div class="col-md-3 d-flex align-items-end">
          <button class="btn btn-primary me-2" @click="searchInboundDefect">조회</button>
          <button class="btn btn-secondary" @click="resetFilter">초기화</button>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 d-flex flex-column">
        <tabulator-card
          card-title="외주입고불량내역"
          :height="600"
          :table-data="outsouDefectList"
          :table-columns="outsouDefectColumns"
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
</style>
