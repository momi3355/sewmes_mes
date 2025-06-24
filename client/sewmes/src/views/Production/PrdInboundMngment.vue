<script setup>
import axios from 'axios';
import { useStore } from "vuex";
import { onBeforeMount, ref, onMounted } from 'vue';
import TabulatorCard from '@/examples/Cards/TabulatorCard.vue';
import PrdInboundTestModal from './PrdInboundTestModal.vue';
import ArgonButton from "@/components/ArgonButton.vue";
import moment from 'moment';
import Swal from 'sweetalert2';
import { formatToDate } from '@/utils/dateUtils';

// 부서별 권한 관련
const dept = ref("");
onBeforeMount(() => {
  dept.value = store.state.user.dept;
})
const canShow = (allowedDepts) => {
  return allowedDepts.includes(dept.value);
};

const productTableRef = ref(null);
// 사원정보 가져오기
const store = useStore();
const userCode = store.state.user.emp_num;
const userName = store.state.user.emp_name;
// 검색 객체
const searchProdName = ref('');
const searchTestState = ref('not_tested');
const searchRegDateStart = ref('');
const searchRegDateEnd = ref('');
const searchCheckDateStart = ref('');
const searchCheckDateEnd = ref('');

const productTestList = ref([]);


// 완제품 검수 페이지 출력을 위한 객체
const selectedWorkPerfCode = ref(null);
const isTestModalOpen = ref(false);

// 완제품 검사 내역 출력을 위한 객체
const inboundTestHistory = ref([]);

// 제품 목록 조건에 따른 검색
const searchPrdInboundList = async () => {
  const params = {};

  if (searchProdName.value.trim()) params.prodName = searchProdName.value.trim();
  if (searchTestState.value) params.testState = searchTestState.value;

  if (searchRegDateStart.value) params.regStart = searchRegDateStart.value;
  if (searchRegDateEnd.value) params.regEnd = searchRegDateEnd.value;
  if (searchCheckDateStart.value) params.checkStart = searchCheckDateStart.value;
  if (searchCheckDateEnd.value) params.checkEnd = searchCheckDateEnd.value;

  try {
    const result = await axios.get('/api/productTestList', { params });
    productTestList.value = result.data.map((item, idx) => ({
      rowNum: idx + 1,
      workPerfCode: item.work_perf_code,
      workInstCode: item.work_inst_code,
      workProcessCode: item.work_process_code,
      prodCode: item.prod_code,
      prodName: item.prod_name,
      inboundCheckCode: item.inbound_check_code,
      regDate: formatDate(item.work_inst_reg_date),
      checkDate: formatDate(item.check_date),
      prodQty: formatInt(item.prod_qty),
      defectQtySum: formatInt(item.defect_qty_sum),
      passQty: formatInt(item.pass_qty),
      empNum: item.emp_num,
      empName: item.emp_name
    }));
  } catch (err) {
    console.error("API 호출 오류:", err);
  }
};

const getTestStatus = ({ defectQtySum, passQty }) => {
  const defect = formatInt(defectQtySum);
  const pass = formatInt(passQty);

  if (pass === 0 && defect === 0) return "검사 전";
  if (pass > 0 && defect > 0) return "검사 완료";
  return "검사 전";
};

const productTestColumns = [
  { title: "No", field: "rowNum", width: 80 },
  {
    title: "검사 상태",
    width: 150,
    formatter: (cell) => {
      const data = cell.getRow().getData();
      return getTestStatus(data);
    }
  },
  { title: '품명', field: 'prodName', width: 250 },
  { title: '등록일', field: 'regDate', width: 150 },
  { title: '검사일', field: 'checkDate', width: 150 },
  { title: '검사수량', field: 'prodQty', width: 150 },
  { title: '불합격수량', field: 'defectQtySum', width: 150 },
  { title: '합격수량', field: 'passQty', width: 150 },
  { title: '사원이름', field: 'empName', width: 150 },
  { title: '작업실적코드', field: 'workPerfCode', width: 150 },
  { title: '입고검사코드', field: 'inboundCheckCode', width: 150 }
];
const tabulatorOptions = {
  selectableRows: 1,
  rowFormatter: function(row) {
    const rowData = row.getData();
    // selectedOutsouInboundCode가 객체이고, 그 객체의 outsouInboundCode와 현재 행의 코드가 일치하는지 확인
    if (selectedWorkPerfCode.value && rowData.workPerfCode === selectedWorkPerfCode.value.workPerfCode) {
      row.getElement().classList.add("selected-row");
    } else {
      row.getElement().classList.remove("selected-row");
    }
  }
};
// 초기화 버튼 클릭 시 검색조건 입력란 비움움
const resetFilter = () => {
  searchProdName.value = '';
  searchTestState.value = '';
  searchRegDateStart.value = '';
  searchRegDateEnd.value = '';
  searchCheckDateStart.value = '';
  searchCheckDateEnd.value = '';
};

// 완제품 입고검수 페이지 출력
const openModal = () => {
  if (!selectedWorkPerfCode.value) return Swal.fire({ title: "미선택", text: "완제품 입고 건을 먼저 선택하세요", icon: "error" });
  
  const testStatus = getTestStatus(selectedWorkPerfCode.value);
  if (testStatus !== "검사 전") {
    return Swal.fire({ title: "선택 불가", text: `이미 검사가 진행된 건입니다. (상태: ${testStatus})`, icon: "error" });
  }
  
  isTestModalOpen.value = true;
};
const tabulatorEvent = [
  {
    eventName: "rowClick",
    eventAction: 
      async (e, row) => {
      const data = row.getData();
      selectedWorkPerfCode.value = data;
      await loalTestHistory();

      const tableInstance = productTableRef.value?.$el?.querySelector('.tabulator')?.__tabulator__;
      if (tableInstance) {
        tableInstance.redraw(true);
      }
    }
  }
];

// 선택된 완제품 입고 건 검사 내역 출력 ===============================================
const loalTestHistory = async () => {
  if (!selectedWorkPerfCode.value) return;
  try {
    const result = await axios.get(`/api/inboundTestHistory?inboundCheckCode=${selectedWorkPerfCode.value.inboundCheckCode}`);
    const list = Array.isArray(result.data) ? result.data : [];
    inboundTestHistory.value = list.map((item, idx) => ({
      qualityCode: item.quality_code,
      testName: item.test_name,
      testMethod: item.test_method,
      defectQty: formatInt(item.defect_qty)
    }));
  } catch (err) {
    console.error("API 호출 오류:", err);
  }
};
const inboundTestHistoryColumns = [
  { title: '검사명', field: 'testName', width: 150 },
  { title: '검사 방법', field: 'testMethod', width: 200 },
  { title: '불합격수량', field: 'defectQty', width: 150 }
];
// 형태 변환
const formatInt = (val) => {
  const num = parseInt(val);
  return isNaN(num) ? 0 : num;
};
const formatDate = (str) => {
  if (!str) return '';
  const date = moment(str);
  return date.isValid() ? date.format('YYYY-MM-DD') : '';
};
// 검사 완료 시 페이지 재조회
const handleAfterTestSaved = () => {
  isTestModalOpen.value = false;
  selectedWorkPerfCode.value = null;
  searchPrdInboundList(); // 다시 조회
};
onMounted(() => {
  searchPrdInboundList();
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
          <label class="form-label search-label">검사일</label>
          <div class="d-flex align-items-center gap-2">
            <input
              type="text"
              class="form-control"
              v-model="searchCheckDateStart"
              @blur="searchCheckDateStart = formatToDate(searchCheckDateStart)"
              @keyup.enter="searchCheckDateStart = formatToDate(searchCheckDateStart)"
            >
            <span>~</span>
            <input
              type="text"
              class="form-control"
              v-model="searchCheckDateEnd"
              @blur="searchCheckDateEnd = formatToDate(searchCheckDateEnd)"
              @keyup.enter="searchCheckDateEnd = formatToDate(searchCheckDateEnd)"
            >
          </div>
        </div>
        <div class="col-md-2">
          <label class="form-label search-label">품명 포함 단어</label>
          <input type="text" class="form-control" v-model="searchProdName">
        </div>
        <div class="col-md-1">
          <label class="form-label search-label">검사 상태</label>
          <select class="form-select" v-model="searchTestState">
            <option value="">선택안함</option>
            <option value="not_tested">검사 전</option>
            <option value="pass">검사 완료</option>
          </select>
        </div>
        <div class="col-md-2 d-flex align-items-end gap-2">
          <button class="btn btn-outline-secondary w-50" @click="resetFilter">초기화</button>
          <button class="btn btn-primary w-50" @click="searchPrdInboundList">조회</button>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-8 d-flex flex-column">
        <tabulator-card
          ref="productTableRef"
          card-title="완제품 입고 대기 목록"
          :height="550"
          :table-data="productTestList"
          :table-columns="productTestColumns"
          :tabulator-options="tabulatorOptions"
          :on="tabulatorEvent"
        >
          <template #actions>
            <ArgonButton style="width: 150px;" color="success" variant="gradient" @click="openModal" v-if="canShow(['0c2c', '0c5c'])">
              검수 진행
            </ArgonButton>
          </template>
        </tabulator-card>
        <PrdInboundTestModal
          :isOpen="isTestModalOpen"
          :prodName="selectedWorkPerfCode?.prodName"
          :workPerfCode="selectedWorkPerfCode?.workPerfCode"
          :prodQty="selectedWorkPerfCode?.prodQty"
          :userCode="userCode"
          :userName="userName"
          @close="isTestModalOpen = false"
          @saved="handleAfterTestSaved"
        />
      </div>
      <div class="col-md-4 d-flex flex-column">
        <tabulator-card
          card-title="완제품 검수 불량 내역"
          :height="550"
          :table-data="inboundTestHistory"
          :table-columns="inboundTestHistoryColumns"
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
