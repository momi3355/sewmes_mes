<script setup>
import axios from 'axios';
import { useStore } from "vuex";
import { ref, onMounted } from 'vue';
import TabulatorCard from '@/examples/Cards/TabulatorCard.vue';
import OutsouInboundTestModal from './OutsouInboundTestModal.vue';
import ArgonButton from "@/components/ArgonButton.vue";
import moment from 'moment';

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


// 외주입고검수 페이지 출력을 위한 객체
const selectedOutsouInboundCode = ref(null);
const isTestModalOpen = ref(false);

// 제품 목록 조건에 따른 검색
const searchOutsouReceive = async () => {
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
    if (selectedOutsouInboundCode.value && rowData.outsouInboundCode === selectedOutsouInboundCode.value.outsouInboundCode) {
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

// 외주입고검수 페이지 출력
const openModal = () => {
  if (!selectedOutsouInboundCode.value) return alert("외주입고 건을 먼저 선택하세요.");
  
  const testStatus = getTestStatus(selectedOutsouInboundCode.value);
  if (testStatus !== "검사 전") {
    return alert(`이미 검사가 진행된 건입니다. (상태: ${testStatus})`);
  }
  
  isTestModalOpen.value = true;
};
const tabulatorEvent = [
  {
    eventName: "rowClick",
    eventAction: 
      async (e, row) => {
      const data = row.getData();
      selectedOutsouInboundCode.value = data;

      const tableInstance = productTableRef.value?.$el?.querySelector('.tabulator')?.__tabulator__;
      if (tableInstance) {
        tableInstance.redraw(true);
      }
    }
  }
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
  selectedOutsouInboundCode.value = null;
  searchOutsouReceive(); // 다시 조회
};
onMounted(() => {
  searchOutsouReceive();
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
          <label class="form-label">검사일</label>
          <div class="d-flex align-items-center gap-2">
            <input type="text" class="form-control" v-model="searchCheckDateStart">
            <span>~</span>
            <input type="text" class="form-control" v-model="searchCheckDateEnd">
          </div>
        </div>
      </div>
      <div class="row mb-2">
        <div class="col-md-3">
          <label class="form-label">품명 포함 단어</label>
          <input type="text" class="form-control" v-model="searchProdName">
        </div>
        <div class="col-md-2">
          <label class="form-label">검사 상태</label>
          <select class="form-select" v-model="searchTestState">
            <option value="">선택안함</option>
            <option value="not_tested">검사 전</option>
            <option value="pass">검사 완료</option>
          </select>
        </div>
        <div class="col-md-3 d-flex align-items-end">
            <button class="btn btn-secondary me-2" @click="resetFilter">초기화</button>
          <button class="btn btn-primary" @click="searchOutsouReceive">조회</button>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 d-flex flex-column">
        <tabulator-card
          ref="productTableRef"
          card-title="완제품 미입고 목록"
          :height="450"
          :table-data="productTestList"
          :table-columns="productTestColumns"
          :tabulator-options="tabulatorOptions"
          :on="tabulatorEvent"
        >
          <template #actions>
            <ArgonButton style="width: 150px;" color="success" variant="gradient" @click="openModal">
              검수 진행
            </ArgonButton>
          </template>
        </tabulator-card>
        <OutsouInboundTestModal
          :isOpen="isTestModalOpen"
          :prodName="selectedOutsouInboundCode?.prodName"
          :outsouInboundCode="selectedOutsouInboundCode?.outsouInboundCode"
          :inboundQty="selectedOutsouInboundCode?.inboundQty"
          :userCode="userCode"
          :userName="userName"
          @close="isTestModalOpen = false"
          @saved="handleAfterTestSaved"
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
</style>
