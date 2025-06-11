<script setup>
import axios from 'axios';
import { ref } from 'vue';
import TabulatorCard from '@/examples/Cards/TabulatorCard.vue';

// 검색 객체
const searchProdName = ref('');
const searchCpName = ref('');
const searchTestState = ref('');
const searchRegDateStart = ref('');
const searchRegDateEnd = ref('');
const searchInboundDateStart = ref('');
const searchInboundDateEnd = ref('');

const outsouReceiveList = ref([]);

// 제품 목록 조건에 따른 검색
const searchOutsouReceive = async () => {
  const params = {};

  if (searchProdName.value.trim()) params.prodName = searchProdName.value.trim();
  if (searchCpName.value.trim()) params.cpName = searchCpName.value.trim();
  if (searchTestState.value) params.testState = searchTestState.value;

  if (searchRegDateStart.value) params.regStart = searchRegDateStart.value;
  if (searchRegDateEnd.value) params.regEnd = searchRegDateEnd.value;
  if (searchInboundDateStart.value) params.inboundStart = searchInboundDateStart.value;
  if (searchInboundDateEnd.value) params.inboundEnd = searchInboundDateEnd.value;

  try {
    const result = await axios.get('/api/outsouInboundReceiveList', { params });
    outsouReceiveList.value = result.data.map((item, idx) => ({
      rowNum: idx + 1,
      outsouInboundCode: item.outsou_inbound_code,
      outsouOrderCode: item.outsou_order_code,
      prodCode: item.prod_code,
      prodName: item.prod_name,
      regDate: formatDate(item.reg_date),
      inboundDate: formatDate(item.inbound_date),
      cpCode: item.cp_code,
      cpName: item.cp_name,
      inboundQty: formatInt(item.inbound_qty),
      defectQty: formatInt(item.defect_qty),
      passQty: formatInt(item.pass_qty),
      empNum: item.emp_num,
      empName: item.emp_name
    }));
  } catch (err) {
    console.error("API 호출 오류:", err);
  }
};

const outsouReceiveColumns = [
  { title: "No", field: "rowNum", width: 80 },
  {
    title: "검사 상태",
    width: 150,
    formatter: (cell) => {
      const data = cell.getRow().getData();
      const inbound = data.inboundQty;
      const defect = data.defectQty;
      const pass = data.passQty;

      if (pass === null || pass === undefined) return "검사 전";
      if (inbound === pass) return "합격";
      if (inbound > pass) return "부분 합격";
      if (inbound === defect) return "불합격";
      return "알 수 없음";
    }
  },
  { title: '품명', field: 'prodName', width: 250 },
  { title: '등록일', field: 'regDate', width: 150 },
  { title: '입고일', field: 'inboundDate', width: 150 },
  { title: '외주업체명', field: 'cpName', width: 200 },
  { title: '입고수량', field: 'inboundQty', width: 150 },
  { title: '불합격수량', field: 'defectQty', width: 150 },
  { title: '합격수량', field: 'passQty', width: 150 },
  { title: '사원이름', field: 'empName', width: 150 },
  { title: '외주발주코드', field: 'outsouOrderCode', width: 150 },
  { title: '외주입고코드', field: 'outsouInboundCode', width: 150 }
];

// 초기화 버튼 클릭 시 검색조건 입력란 비움움
const resetFilter = () => {
  searchProdName.value = '';
  searchCpName.value = '';
  searchTestState.value = '';
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
          <label class="form-label">외주업체명 포함 단어</label>
          <input type="text" class="form-control" v-model="searchCpName">
        </div>
        <div class="col-md-3">
          <label class="form-label">품명 포함 단어</label>
          <input type="text" class="form-control" v-model="searchProdName">
        </div>
        <div class="col-md-2">
          <label class="form-label">검사 상태</label>
          <select class="form-select" v-model="searchTestState">
            <option value="">선택안함</option>
            <option value="not_tested">검사 전</option>
            <option value="pass">합격</option>
            <option value="partial_pass">부분 합격</option>
            <option value="fail">불합격</option>
          </select>
        </div>
        <div class="col-md-3 d-flex align-items-end">
          <button class="btn btn-primary me-2" @click="searchOutsouReceive">조회</button>
          <button class="btn btn-secondary" @click="resetFilter">초기화</button>
        </div>
      </div>
    </div>
    <div class="row mt-3">
      <div class="d-flex justify-content-end">
          <button class="btn btn-info" style="width: 150px;" @click="openModal">검수 진행</button>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 d-flex flex-column">
        <tabulator-card
          card-title="외주입고목록"
          :table-data="outsouReceiveList"
          :table-columns="outsouReceiveColumns"
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
