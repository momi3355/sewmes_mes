<script setup>
import axios from 'axios';
import { useStore } from "vuex";
import { ref, nextTick  } from 'vue';
import TabulatorCard from '@/examples/Cards/TabulatorCard.vue';
import OrderProdListModal from "./OrderProdListModal.vue";
import moment from 'moment';
import Swal from 'sweetalert2';

// tabulatorCardRef 컴포넌트의 ref 선언
const tabulatorCardRef = ref(null);

// 사원정보 가져오기
const store = useStore();
const userCode = store.state.user.emp_num;


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
      orderQty: formatInt(item.total_qty) ,
      prodQty: formatInt(item.prod_qty),
      complete: convertCode(item.complete),
      empName: item.emp_name
    }));
    prodPlanData.value = converted;
  } catch (err) {
    console.error("API 호출 오류:", err);
  }
};
//행추가 함수(주문 없이 생산계획 생성)
const addRow = () => {
    //새로운 행을 위한 NO값 생성
    const newNo = prodPlanData.value.length > 0 ? Math.max(...prodPlanData.value.map(item => item.rowNum || 0)) + 1 : 1;

    //새로운 빈 행 데이터 객체 생성
    const newRow = {
      rowNum: newNo,
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
    }
    prodPlanData.value.push(newRow);

}
// 저장 기능
const saveProcess = async () => {
  await nextTick(); // DOM 업데이트 이후 실행 보장

  const tableInstance = tabulatorCardRef.value?.getTabulator?.();
  if (!tableInstance) {
    console.warn("Tabulator 인스턴스를 찾을 수 없음");
    return;
  }

  const selectedRows = tableInstance.getSelectedData();
  if (selectedRows.length === 0) {
    Swal.fire({ title: "미선택", text: "저장할 데이터를 선택해주세요", icon: "error" });
    return;
  }

  const payload = selectedRows.map(item  => ({
    prodPlanCode: item.prodPlanCode || '', // 신규는 ''
    orderDetailCode: item.orderDetailCode || null,
    prodCode: item.prodCode || '',
    prodQty: parseInt(item.prodQty || '0', 10),
    startDate: item.startDate || '',
    endDate: item.endDate || '',
    complete: '1a2a',
    empNum: userCode,
  }));

  try {
    await axios.post('/api/saveProdPlans', { plans: payload });
    alert("저장 완료");
    Swal.fire({ title: "저장 완료", text: "저장이 완료 되었습니다.", icon: "success" });
    await searchProdPlan(); // 목록 갱신
  } catch (err) {
    console.error("저장 실패:", err);
    Swal.fire({ title: "오류", text: "저장 중 오류 발생", icon: "error" });
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
  {
    formatter: "rowSelection", titleFormatter: "rowSelection",
    hozAlign: "center", headerSort: false, width: 40,
    cssClass: 'non-editable-cell'
  },
  { title: "No", field: "rowNum", width: 80, cssClass: 'non-editable-cell' },
  { title: '주문상세번호', field: 'orderDetailCode', width: 150, cssClass: 'non-editable-cell' },
  { title: '품번', field: 'prodCode', editor: "input", width: 150 },
  { title: '품명', field: 'prodName', width: 300, cssClass: 'non-editable-cell' },
  { title: '시작일', field: 'startDate', editor: "input", width: 150 },
  { title: '종료일', field: 'endDate', editor: "input", width: 150 },
  { title: '주문수량', field: 'orderQty', width: 150, cssClass: 'non-editable-cell' },
  { title: '생산수량', field: 'prodQty', editor: "input", width: 150 },
  { title: '완료여부', field: 'complete', width: 150, cssClass: 'non-editable-cell' },
  { title: '사원이름', field: 'empName', width: 150, cssClass: 'non-editable-cell' }
];
const tabulatorOptions = {
  selectable: true,
  selectablePersistence: false,
};
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
    eventName: "rowClick",
    eventAction: 
      async (e, row) => {
        

      const tableInstance = tabulatorCardRef.value?.$el?.querySelector('.tabulator')?.__tabulator__;
      if (tableInstance) {
        tableInstance.redraw(true);
      }
    }
  }
];
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
//주문목록 모달에서 데이터받아, 작업지시서 화면의 그리드에 표시될 데이터 추가하는 함수
const handleSelectedOrder = (plans) => {
    const newProdPlans = plans.map((plan, index) => ({
        rowNum: prodPlanData.value.length + index + 1,
        prodPlanCode: '',
        orderDetailCode: plan.orderDetailCode,
        orderCode: plan.orderCode,
        prodCode: plan.prodCode,
        prodName: plan.prodName,
        startDate: '',
        endDate: '',
        orderQty: plan.totalQty,
        prodQty: '',
        complete: '',
        empNum: ''

    }));
    prodPlanData.value = [...prodPlanData.value, ...newProdPlans];

};
const isModalOpen = ref(false); //초기상태

const openModal = () => {
    isModalOpen.value = true; //isModalOpen 값 true 변경해 모달 열기
};
const closeModal = () => {
    isModalOpen.value = false;
};
// 사용자 날짜 입력 편의성
const formatToDate = (input) => {
  const today = new Date();
  const currentYear = today.getFullYear().toString();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');

  input = input.replace(/\D/g, '');

  let y = '', m = '', d = '';

  if (input.length === 8) {
    y = input.slice(0, 4);
    m = input.slice(4, 6);
    d = input.slice(6, 8);
  } else if (input.length === 6) {
    y = '20' + input.slice(0, 2);
    m = input.slice(2, 4);
    d = input.slice(4, 6);
  } else if (input.length === 4) {
    y = currentYear;
    m = input.slice(0, 2);
    d = input.slice(2, 4);
  } else if (input.length === 1 || input.length === 2) {
    y = currentYear;
    m = currentMonth;
    d = input.padStart(2, '0');
  } else {
    return input;
  }

  // 숫자 변환
  const yearNum = parseInt(y, 10);
  const monthNum = Math.max(1, Math.min(parseInt(m, 10), 12));

  // 각 월의 말일 계산
  const getLastDay = (year, month) => {
    return new Date(year, month, 0).getDate(); // 다음 달 0일 = 해당 월의 말일
  };

  const lastDay = getLastDay(yearNum, monthNum);
  const dayNum = Math.max(1, Math.min(parseInt(d, 10), lastDay));

  // 0패딩 후 반환
  const fixedMonth = String(monthNum).padStart(2, '0');
  const fixedDay = String(dayNum).padStart(2, '0');

  return `${yearNum}-${fixedMonth}-${fixedDay}`;
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
            <input
              type="text"
              class="form-control"
              v-model="searchStartDateStart"
              @blur="searchStartDateStart = formatToDate(searchStartDateStart)"
              @keyup.enter="searchStartDateStart = formatToDate(searchStartDateStart)"
            >
            <span>~</span>
            <input
              type="text"
              class="form-control"
              v-model="searchStartDateEnd"
              @blur="searchStartDateEnd = formatToDate(searchStartDateEnd)"
              @keyup.enter="searchStartDateEnd = formatToDate(searchStartDateEnd)"
            >
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
          <button class="btn btn-secondary me-2" @click="resetFilter">초기화</button>
          <button class="btn btn-primary" @click="searchProdPlan">조회</button>
        </div>
      </div>
    </div>
    <div class="row mt-3">
      <div class="d-flex justify-content-between align-items-center">
        <!-- 왼쪽: 조회 버튼 -->
        <div>
          <button class="btn btn-info" style="width: 150px;" @click="openModal">주문 제품 목록 조회</button>
        </div> 
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 d-flex flex-column">
        <tabulator-card
          ref="tabulatorCardRef"
          card-title="생산계획 목록"
          :table-data="prodPlanData"
          :table-columns="prodPlanColumns"
          :on="tabulatorEvent"
          :tabulatorOptions="tabulatorOptions"
        >
          <template #actions>
            <button class="btn btn-secondary me-2" @click="addRow">행추가</button>
            <button class="btn btn-success me-2" @click="saveProcess">저장</button>
            <button class="btn btn-delete" @click="deleteProcess" style="background-color: red; color: black;">삭제</button>
          </template>
        </tabulator-card>
      </div>
      <OrderProdListModal
        :isModalOpen="isModalOpen"
        @selectOrder="handleSelectedOrder"
        @closeModal="closeModal"
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
::v-deep(.non-editable-cell) {
  background-color: #f0f0f0 !important;
  color: #777 !important;
} 
</style>
