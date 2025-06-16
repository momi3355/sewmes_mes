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
const searchCpName = ref('');
const searchTestState = ref('not_tested');
const searchRegDateStart = ref('');
const searchRegDateEnd = ref('');
const searchInboundDateStart = ref('');
const searchInboundDateEnd = ref('');

const outsouReceiveList = ref([]);

// 외주입고검수 페이지 출력을 위한 객체
const selectedOutsouInboundCode = ref(null);
const isTestModalOpen = ref(false);

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

const getTestStatus = ({ inboundQty, defectQty, passQty }) => {
  const inbound = formatInt(inboundQty);
  const defect = formatInt(defectQty);
  const pass = formatInt(passQty);

  if (pass === 0 && defect === 0) return "검사 전";
  if (pass === inbound) return "합격";
  if (pass < inbound && pass > 0) return "부분 합격";
  if (inbound === defect) return "불합격";
  return "검사 전";
};

const outsouReceiveColumns = [
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
  { title: '입고일', field: 'inboundDate', width: 150 },
  { title: '외주업체명', field: 'cpName', width: 200 },
  { title: '입고수량', field: 'inboundQty', width: 150 },
  { title: '불합격수량', field: 'defectQty', width: 150 },
  { title: '합격수량', field: 'passQty', width: 150 },
  { title: '사원이름', field: 'empName', width: 150 },
  { title: '외주발주코드', field: 'outsouOrderCode', width: 150 },
  { title: '외주입고코드', field: 'outsouInboundCode', width: 150 }
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
  searchCpName.value = '';
  searchTestState.value = '';
  searchRegDateStart.value = '';
  searchRegDateEnd.value = '';
  searchInboundDateStart.value = '';
  searchInboundDateEnd.value = '';
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
    <div class="row">
      <div class="col-md-12 d-flex flex-column">
        <tabulator-card
          ref="productTableRef"
          card-title="외주입고목록"
          :height="450"
          :table-data="outsouReceiveList"
          :table-columns="outsouReceiveColumns"
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
