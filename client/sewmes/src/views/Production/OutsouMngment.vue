<script setup>
import axios from 'axios';
import { ref, onMounted } from 'vue';
import TabulatorCard from '@/examples/Cards/TabulatorCard.vue';
import OutsouNullDeadListModal from './OutsouNullDeadListModal.vue';
import ArgonButton from "@/components/ArgonButton.vue";

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
  {
  formatter: "rowSelection",  // 행 선택 체크박스를 생성합니다.
  titleFormatter: "rowSelection", // 헤더에 '전체 선택' 체크박스를 생성합니다.
  hozAlign: "center",
  headerSort: false,          // 이 열은 정렬 기능을 비활성화합니다.
  cellClick: function(e, cell) { // 셀의 아무 곳이나 클릭해도 체크되도록 합니다.
    cell.getRow().toggleSelect();
  },
   width: 10
  },
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

const fetchNullDeadCount = async () => {
  try {
    const result = await axios.get('/api/outsouOrderNullDeadCount');
    nullDeadCount.value = result.data[0]["COUNT(*)"];
  } catch (err) {
    console.error("미등록 외주발주 수 조회 오류:", err);
  }
};

// 외주발주 출고처리
const handleReleaseComplete = async () => {
  const table = tabulatorCardRef.value?.getTabulator?.();
  if (!table) {
    alert("테이블이 초기화되지 않았습니다.");
    return;
  }

  const selectedRows = table.getSelectedData();
  if (selectedRows.length === 0) {
    alert("출고 처리할 외주발주 건을 선택하세요.");
    return;
  }

  
  const toRelease = selectedRows.filter(row => row.releaseState === '0o1o');

  if (toRelease.length === 0) {
    alert("이미 출고 완료된 건입니다.");
    return;
  }

  try {
    for (const row of toRelease) {
      await axios.post('/api/outsouReleaseProc', {
        outsouOrderCode: row.outsouOrderCode
      });
    }

    alert("출고 처리 완료");
    await searchOutsouOrder();  // 목록 재조회
    await fetchNullDeadCount(); // 미등록건 수 재조회
  } catch (err) {
    console.error("출고 처리 실패:", err);
    alert("출고 처리 중 오류 발생");
  }
};
// 형태 변환
const formatDate = (str) => {
  if (!str) return '';
  return new Date(str).toISOString().slice(0, 10);
};
const formatInt = (val) => {
  return parseInt(val, 10);
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
onMounted(() => {
  fetchNullDeadCount();
  openModal();
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
          <button class="btn btn-primary me-2" @click="searchOutsouOrder">조회</button>
          <button class="btn btn-secondary" @click="resetOutsouOrderFilter">초기화</button>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 d-flex flex-column">
        <tabulator-card
          ref="tabulatorCardRef"
          card-title="외주발주"
          :table-data="outsouOrderData"
          :table-columns="outsouOrderColumns"
          :on="tabulatorEvent"
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
</style>
