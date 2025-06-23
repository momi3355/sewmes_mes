<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import TabulatorCard from '@/examples/Cards/TabulatorCard.vue';


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
  searchReleaseCode.value = '';
  searchLotCode.value = '';
  searchProdName.value = '';
};

onMounted(() => {
  searchLotHistoryList();
})
</script>

<template>
  <div class="container-fluid p-3">
    <div class="search-area bg-white rounded p-3 mb-3 shadow-sm">
      <div class="row">
        <div class="col-md-2">
          <label class="form-label search-label">출고 코드</label>
          <input type="text" class="form-control" v-model="searchReleaseCode">
        </div>
        <div class="col-md-2">
          <label class="form-label search-label">LOT코드</label>
          <input type="text" class="form-control" v-model="searchLotCode">
        </div>
        <div class="col-md-2">
          <label class="form-label search-label">자재명</label>
          <input type="text" class="form-control" v-model="searchProdName">
        </div>
        <div class="col-md-2 d-flex align-items-end gap-2">
          <button class="btn btn-outline-secondary w-50" @click="resetFilter">초기화</button>
          <button class="btn btn-primary w-50" @click="searchLotHistoryList">조회</button>
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
.search-label {
  font-size: medium;
}
.full-height {
  height: 840px;
  display: flex;
  flex-direction: column;
}
</style>