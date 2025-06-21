<script setup>
import axios from 'axios';
import { ref } from 'vue';
import TabulatorCard from '@/examples/Cards/TabulatorCard.vue';
import Swal from 'sweetalert2';

// 검색 객체
const searchReleaseCode = ref('');
const searchLotCode = ref('');
const searchProdName = ref('');
const lotHistoryList = ref([]);


// 제품 목록 조건에 따른 검색
const searchLotHistoryList = async () => {
  const params = {};

  if (searchReleaseCode.value.trim()) params.releaseCode = searchReleaseCode.value.trim();
  if (searchLotCode.value.trim()) params.lotCode = searchLotCode.value.trim();
  if (searchProdName.value.trim()) params.prodName = searchProdName.value.trim();

  try {
    const result = await axios.get('/api/lotHistoryList', { params });
    lotHistoryList.value = result.data.map((item, idx) => ({
      rowNum: idx + 1,
      releaseCode: item.release_code,
      releaseDetailCode: item.release_detail_code,
      lot: item.lot,
      inboundCheckCode: item.inbound_check_code,
      workPerfCode: item.work_perf_code,
      outsouInboundCode: item.outsou_inbound_code,
      outsouOrderCode: item.outsou_order_code,
      workProcessCode: item.work_process_code,
      workInstCode: item.work_inst_code,
      materialName: item.material_name,
      lotCode: item.lot_code,
    }));
  } catch (err) {
    console.error("API 호출 오류:", err);
  }
};
const lotHistoryListColumns = [
  { title: "No", field: "rowNum", width: 80 },
  { title: '출고코드', field: 'releaseCode', width: 150 },
  { title: '출고상세코드', field: 'releaseDetailCode', width: 150 },
  { title: '완제품 LOT', field: 'lot', width: 200 },
  { title: '입고검수코드', field: 'inboundCheckCode', width: 150 },
  { title: '작업실적코드', field: 'workPerfCode', width: 150 },
  { title: '외주입고코드', field: 'outsouInboundCode', width: 150 },
  { title: '외주코드', field: 'outsouOrderCode', width: 150 },
  { title: '작업공정코드', field: 'workProcessCode', width: 150 },
  { title: '작업지시코드', field: 'workInstCode', width: 150 },
  { title: '자재명', field: 'materialName', width: 150 },
  { title: '원자재 LOT', field: 'lotCode', width: 150 }
];

// 초기화 버튼 클릭 시 검색조건 입력란 비움움
const resetFilter = () => {
  searchItemName.value = '';
  searchOutsouCode.value = '';
};

// 형태 변환
const formatDate = (str) => {
  if (!str) return '';
  const date = moment(str);
  return date.isValid() ? date.format('YYYY-MM-DD') : '';
};
const formatInt = (val) => {
  if (val === null || val === undefined || val === '') return '';
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? '' : parsed;
};
</script>

<template>
  <div class="container-fluid p-3">
    <div class="row search-color">
      <div class="row mb-2">
        <div class="col-md-3">
          <label class="form-label">출고 코드</label>
          <input type="text" class="form-control" v-model="searchReleaseCode">
        </div>
        <div class="col-md-3">
          <label class="form-label">LOT코드</label>
          <input type="text" class="form-control" v-model="searchLotCode">
        </div>
        <div class="col-md-3">
          <label class="form-label">자재명</label>
          <input type="text" class="form-control" v-model="searchProdName">
        </div>
        <div class="col-md-3 d-flex align-items-end">
          <button class="btn btn-secondary me-2" @click="resetFilter">초기화</button>
          <button class="btn btn-primary" @click="searchLotHistoryList">조회</button>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 d-flex flex-column">
        <tabulator-card
          card-title="LOT 내역"
          :height="650"
          :table-data="lotHistoryList"
          :table-columns="lotHistoryListColumns"
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