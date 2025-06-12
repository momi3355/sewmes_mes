<script setup>
import axios from 'axios';
import { ref } from 'vue';
import TabulatorCard from '@/examples/Cards/TabulatorCard.vue';
import OrderProdListModal from "./OrderProdListModal.vue";
import ArgonButton from "@/components/ArgonButton.vue";
// 검색 객체
const searchProdName = ref('');
const searchProdCode = ref('');
const searchComplete = ref('');
const searchStartDateStart = ref('');
const searchStartDateEnd = ref('');
const searchEndDateStart = ref('');
const searchEndDateEnd = ref('');
const searchOrderCode = ref('');
const prodPlanData = ref([]);

// 제품 목록 조건에 따른 검색
const searchProdPlan = async () => {
  const params = {};

  if (searchProdName.value.trim()) params.prodName = searchProdName.value.trim();
  if (searchProdCode.value.trim()) params.prodCode = searchProdCode.value.trim();
  if (searchComplete.value) params.complete = searchComplete.value;
  if (searchOrderCode.value.trim()) params.orderCode = searchOrderCode.value.trim();

  if (searchStartDateStart.value) params.startDateStart = searchStartDateStart.value;
  if (searchStartDateEnd.value) params.startDateEnd = searchStartDateEnd.value;
  if (searchEndDateStart.value) params.endDateStart = searchEndDateStart.value;
  if (searchEndDateEnd.value) params.endDateEnd = searchEndDateEnd.value;

  try {
    const result = await axios.get('/api/prodPlanList', { params });
    const plans = Array.isArray(result.data) ? result.data : [];
    const converted = plans.map((item, idx) => ({
      rowNum: idx + 1,
      prodPlanCode: item.prod_plan_code,
      orderDetailCode: item.order_detail_code,
      orderCode: item.order_code,
      prodCode: item.prod_code,
      prodName: item.prod_name,
      startDate: formatDate(item.start_date),
      endDate: formatDate(item.end_date),
      orderQty: formatInt(item.order_qty),
      prodQty: formatInt(item.prod_qty),
      complete: convertCode(item.complete),
      empNum: item.empNum
    }));
    const count = converted.length + 5;
    while (converted.length < count) {
    converted.push({  
      rowNum: converted.length + 1,
      prodPlanCode: '',
      orderDetailCode: '',
      orderCode: '',
      prodCode: '',
      prodName: '',
      startDate: '',
      endDate: '',
      orderQty: '',
      prodQty: '',
      complete: '',
      empNum: ''
      });
    }
    prodPlanData.value = converted;
  } catch (err) {
    console.error("API 호출 오류:", err);
  }
};
// 공통코드 변환환
const convertCode = (code) => {
  switch (code) {
    case '1a1a': return '완료';
    case '1a2a': return '미완료';
    default: return code;
  }
};
const prodPlanColumns = [
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
  { title: '주문번호', field: 'orderCode', width: 200 },
  { title: '품번', field: 'prodCode', width: 200 },
  { title: '품명', field: 'prodName', width: 300 },
  { title: '시작일', field: 'startDate', width: 200 },
  { title: '종료일', field: 'endDate', width: 200 },
  { title: '주문수량', field: 'orderQty', width: 200 },
  { title: '생산수량', field: 'prodQty', width: 200 },
  { title: '완료여부', field: 'complete', width: 150 },
  { title: '사원번호', field: 'empNum', width: 150 }
];

// 초기화 버튼 클릭 시 검색조건 입력란 비움움
const resetFilter = () => {
  searchProdName.value = '';
  searchProdCode.value = '';
  searchComplete.value = '';
  searchOrderCode.value = '';
  searchStartDateStart.value = '';
  searchStartDateEnd.value = '';
  searchEndDateStart.value = '';
  searchEndDateEnd.value = '';
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
// 모달 스크립트 영역 ===============================================================
//주문목록 모달에서 데이터받아, 작업지시서 화면의 그리드에 표시될 데이터 추가하는 함수
const handleSelectedPlans = (plans) => {
    const newWorkInsts = plans.map((plan, index) => ({
        NO: workInstData.value.length + index + 1,
        work_inst_code: ' ', //지시코드 자동생성 저장전에는 빈값
        prod_plan_code: plan.prod_plan_code,
        prod_code: plan.prod_code, 
        inst_qty: plan.prod_qty,
        dead_date: plan.dead_date, //주문상세테이블과 조인해서 가져올 납기일자
        inst_state: '생산 전', //초기상태
        emp_num: '', // 담당자번호 초기화
        //inst_date: inst_reg_date 저장버튼 누르면 등록일 나오고 지시버튼 누르면 들어가는 내용
    }));
    workInstData.value = [...workInstData.value, ...newWorkInsts];

};
const isModalOpen = ref(false); //초기상태
const openModal = () => {
    isModalOpen.value = true; //isModalOpen 값 true 변경해 모달 열기
};
const closeModal = () => {
    isModalOpen.value = false;
};


</script>

<template>
  <div class="container-fluid p-3">
    <div class="row search-color">
      <div class="row mb-2">
        <!-- 등록일 -->
        <div class="col-md-3">
          <label class="form-label">시작일</label>
          <div class="d-flex align-items-center gap-2">
            <input type="text" class="form-control" v-model="searchStartDateStart">
            <span>~</span>
            <input type="text" class="form-control" v-model="searchStartDateEnd">
          </div>
        </div>

        <!-- 납기일 -->
        <div class="col-md-3">
          <label class="form-label">종료일</label>
          <div class="d-flex align-items-center gap-2">
            <input type="text" class="form-control" v-model="searchEndDateStart">
            <span>~</span>
            <input type="text" class="form-control" v-model="searchEndDateEnd">
          </div>
        </div>
        <div class="col-md-3">
          <label class="form-label">주문번호</label>
          <input type="text" class="form-control" v-model="searchOrderCode">
        </div>
      </div>
      <div class="row mb-2">
        <div class="col-md-3">
          <label class="form-label">품번</label>
          <input type="text" class="form-control" v-model="searchProdCode">
        </div>
        <div class="col-md-3">
          <label class="form-label">품명 포함 단어</label>
          <input type="text" class="form-control" v-model="searchProdName">
        </div>
        <div class="col-md-2">
          <label class="form-label">완료 여부</label>
          <select class="form-select" v-model="searchComplete">
            <option value="">선택안함</option>
            <option value="1a1a">완료</option>
            <option value="1a2a">미완료</option>
          </select>
        </div>
        <div class="col-md-3 d-flex align-items-end">
          <button class="btn btn-primary me-2" @click="searchProdPlan">조회</button>
          <button class="btn btn-secondary" @click="resetFilter">초기화</button>
        </div>
      </div>
    </div>
    <div class="row mt-3">
      <div class="d-flex justify-content-between align-items-center">
        <!-- 왼쪽: 조회 버튼 -->
        <div>
          <button class="btn btn-info" style="width: 150px;" @click="openModal">주문 제품 목록 조회</button>
        </div> 

        <!-- 오른쪽: 저장 및 삭제 버튼 -->
        <div>
          <button class="btn btn-sm btn-success me-2" @click="saveProcess">저장</button>
          <button class="btn btn-sm btn-delete" @click="deleteProcess" style="background-color: red; color: black;">삭제</button>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 d-flex flex-column">
        <tabulator-card
          card-title="생산계획 목록"
          :table-data="prodPlanData"
          :table-columns="prodPlanColumns"
          :on="tabulatorEvent"
        >
          <template #actions>
            <ArgonButton color="success" variant="gradient" @click="openModal">
              주문 제품 목록 조회
            </ArgonButton>
          </template>
        </tabulator-card>
      </div>
      <OrderProdListModal
      v-bind:isModalOpen="isModalOpen"
      v-on:select-plans="handleSelectedPlans"
      v-on:close-modal="closeModal"
      />
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
