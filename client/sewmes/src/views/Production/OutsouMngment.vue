<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import TabulatorCard from '@/examples/Cards/TabulatorCard.vue';
import OutsouNullDeadListModal from './OutsouNullDeadListModal.vue';
import ArgonButton from "@/components/ArgonButton.vue";
import moment from 'moment';
import { formatToDate } from '@/utils/dateUtils';

const tabulatorCardRef = ref(null);
// 검색 객체
const searchProdName = ref('');
const searchOutsouCode = ref('');
const searchCpName = ref('');
const searchReleaseState = ref('');
const searchRegDateStart = ref('');
const searchRegDateEnd = ref('');
const searchDeadDateStart = ref('');
const searchDeadDateEnd = ref('');
const outsouOrderData = ref([]);

const nullDeadCount = ref(0);

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
// 공통코드 변환환
const convertCode = (code) => {
  switch (code) {
    case '0o1o': return '출고 전';
    case '0o2o': return '출고 완료';
    default: return code;
  }
};
const outsouOrderColumns = [
  { title: "No", field: "rowNum", width: 80 },
  { title: '외주발주코드', field: 'outsouOrderCode', width: 200 },
  { title: '작업공정코드', field: 'workProcessCode', width: 200 },
  { title: '품명', field: 'prodName', width: 300 },
  { title: '등록일', field: 'regDate', width: 200 },
  { title: '납기일', field: 'deadDate', width: 200 },
  { title: '외주업체명', field: 'cpName', width: 200 },
  { title: '주문수량', field: 'orderQty', width: 150 },
  { title: '자재 상태', field: 'releaseStateLabel', width: 150 }
];

// 초기화 버튼 클릭 시 검색조건 입력란 비움움
const resetOutsouOrderFilter = () => {
  searchProdName.value = '';
  searchOutsouCode.value = '';
  searchCpName.value = '';
  searchReleaseState.value = '';
  searchRegDateStart.value = '';
  searchRegDateEnd.value = '';
  searchDeadDateStart.value = '';
  searchDeadDateEnd.value = '';
};
const fetchNullDeadCount = async () => {
  try {
    const result = await axios.get('/api/outsouOrderNullDeadCount');
    const count = result.data[0]["COUNT(*)"];
    nullDeadCount.value = count;
    return count;
  } catch (err) {
    console.error("미등록 외주발주 수 조회 오류:", err);
  }
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
// 모달 스크립트 영역 ===============================================================
const isModalOpen = ref(false); //초기상태
const openModal = () => {
    isModalOpen.value = true; //isModalOpen 값 true 변경해 모달 열기
};
const closeModal = () => {
    isModalOpen.value = false;
};
const handleAfterModalSaved = () => {
  fetchNullDeadCount(); // 저장 이후 납기 미등록 건수 다시 조회
  isModalOpen.value = false; // 모달 닫기
};
onMounted(async () => {
  const count = await fetchNullDeadCount();
  if (count > 0) {
    openModal();
  }
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
          <button class="btn btn-outline-secondary w-50" @click="resetOutsouOrderFilter">초기화</button>
          <button class="btn btn-primary w-50" @click="searchOutsouOrder">조회</button>
        </div>       
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 d-flex flex-column">
        <tabulator-card
          ref="tabulatorCardRef"
          card-title="외주발주 목록"
          :height="650"
          :table-data="outsouOrderData"
          :table-columns="outsouOrderColumns"
        >
          <template #actions>
            <ArgonButton color="success" variant="gradient" @click="openModal">
              외주발주 미등록 <span>{{ nullDeadCount }}</span> 건 조회
            </ArgonButton>
          </template>
        </tabulator-card>
        <OutsouNullDeadListModal
        v-bind:isModalOpen="isModalOpen"
        v-on:close-modal="closeModal"
        @saved="handleAfterModalSaved"
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
