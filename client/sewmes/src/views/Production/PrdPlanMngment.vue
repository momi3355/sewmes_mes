<script setup>
import axios from 'axios';
import { useStore } from "vuex";
import { ref, nextTick, onMounted  } from 'vue';
import TabulatorCard from '@/examples/Cards/TabulatorCard.vue';
import OrderProdListModal from "./OrderProdListModal.vue";
import ProductSearchModal from "./ProductSearchModal.vue";
import moment from 'moment';
import Swal from 'sweetalert2';
import { formatToDate } from '@/utils/dateUtils';


// tabulatorCardRef 컴포넌트의 ref 선언
const tabulatorCardRef = ref(null);

// 사원정보 가져오기
const store = useStore();
const userCode = store.state.user.emp_num;


// 검색 객체
const searchProdName = ref('');
const searchProdCode = ref('');
const searchComplete = ref('1a2a');
const searchStartDateStart = ref('');
const searchStartDateEnd = ref('');
const searchEndDateStart = ref('');
const searchEndDateEnd = ref('');
const searchOrderCode = ref('');
const prodPlanData = ref([]);

// 제품목록 가져오기 모달 객체
const isSearchModalOpen = ref(false);
const modalTargetRow = ref(null);

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
const saveProdPlan = async () => {
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
    Swal.fire({ title: "저장 완료", text: "저장이 완료 되었습니다.", icon: "success" });
    await searchProdPlan(); // 목록 갱신
  } catch (err) {
    console.error("저장 실패:", err);
    Swal.fire({ title: "오류", text: "저장 중 오류 발생", icon: "error" });
  }
};
// 생산계획 삭제
const deleteProdPlan = async () => {
  const tableInstance = tabulatorCardRef.value?.getTabulator?.();
  if (!tableInstance) {
    console.warn("Tabulator 인스턴스를 찾을 수 없음");
    return;
  }
    const selectedRows = tableInstance.getSelectedData();
  if (selectedRows.length === 0) {
    Swal.fire({ title: "미선택", text: "삭제할 데이터를 선택해주세요", icon: "error" });
    return;
  }

   // 확인/취소 메시지 
  const result = await Swal.fire({
    title: '생산계획 삭제',
    text: '정말로 삭제 처리하시겠습니까?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: '예, 진행합니다',
    cancelButtonText: '취소'
  });

  if (!result.isConfirmed) return;

  const deletePlanList = selectedRows.map(item  => ({
    prodPlanCode: item.prodPlanCode
  }));
  
  try {
    await axios.post('/api/prodPlanDelete', { plans: deletePlanList });
    Swal.fire({ title: "삭제 완료", text: "삭제 되었습니다.", icon: "success" });
    await searchProdPlan(); // 목록 갱신
  } catch (err) {
    console.error("삭제 실패:", err);
    Swal.fire({ title: "오류", text: "삭제 중 오류 발생", icon: "error" });
  }
}


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
  { title: '품번', field: 'prodCode', width: 150, cssClass: 'non-editable-cell',
      cellClick: (e, cell) => {
      const row = cell.getRow();
      openProductSearchModal(row); // 선택된 RowComponent 전달
    }
  },
  { title: '품명', field: 'prodName', width: 300, cssClass: 'non-editable-cell',
      cellClick: (e, cell) => {
      const row = cell.getRow();
      openProductSearchModal(row);
    }
  },
  {
    title: '시작일',
    field: 'startDate',
    editor: "input",
    width: 150,
    editorParams: {
      elementAttributes: {
        placeholder: "YYYYMMDD"
      },
      // 사용자가 입력 완료 후 → 날짜 형식 보정
      // Tabulator가 셀 값을 update하기 전에 호출됨
      selectContents: true,
      // 아래는 기본 input element에 이벤트를 걸 수 있는 방법
      inputFormatter: (value) => {
        return formatToDate(value);
      }
    },
    cellEdited: (cell) => {
      const rawValue = cell.getValue();
      const fixed = formatToDate(rawValue);
      cell.setValue(fixed, true); // `mutate=true` 옵션으로 재입력 방지
    }
  },
  {
    title: '종료일',
    field: 'endDate',
    editor: "input",
    width: 150,
    editorParams: {
      elementAttributes: {
        placeholder: "YYYYMMDD"
      },
      selectContents: true,
      inputFormatter: (value) => {
        return formatToDate(value);
      }
    },
    cellEdited: (cell) => {
      const rawValue = cell.getValue();
      const fixed = formatToDate(rawValue);
      cell.setValue(fixed, true);
    }
  },
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
  },
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
// 제품목록 가져오기 모달 ============================
const openProductSearchModal = (row) => {
  isSearchModalOpen.value = true;
  modalTargetRow.value = row;
};

const handleProductSelect = (item) => {
  if (!modalTargetRow.value) return;
  modalTargetRow.value.update({
    prodCode: item.prodCode,
    prodName: item.prodName
  });
};

onMounted(() => {
  searchProdPlan();
})
</script>

<template>
  <div class="container-fluid p-3">
    <div class="search-area bg-white rounded p-3 mb-3 shadow-sm">
      <div class="row">
        <!-- 등록일 -->
        <div class="col-md-2">
          <label class="form-label search-label">시작일</label>
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
        <div class="col-md-2">
          <label class="form-label search-label">종료일</label>
          <div class="d-flex align-items-center gap-2">
            <input
              type="text"
              class="form-control"
              v-model="searchEndDateStart"
              @blur="searchEndDateStart = formatToDate(searchEndDateStart)"
              @keyup.enter="searchEndDateStart = formatToDate(searchEndDateStart)"
            >
            <span>~</span>
            <input
              type="text"
              class="form-control"
              v-model="searchEndDateEnd"
              @blur="searchEndDateEnd = formatToDate(searchEndDateEnd)"
              @keyup.enter="searchEndDateEnd = formatToDate(searchEndDateEnd)"
            >
          </div>
        </div>
        <div class="col-md-1">
          <label class="form-label search-label">주문번호</label>
          <input type="text" class="form-control" v-model="searchOrderCode">
        </div>
        <div class="col-md-1">
            <label class="form-label search-label">품번</label>
            <input type="text" class="form-control" v-model="searchProdCode">
          </div>
          <div class="col-md-2">
            <label class="form-label search-label">품명 포함 단어</label>
            <input type="text" class="form-control" v-model="searchProdName">
          </div>
        <div class="col-md-1">
          <label class="form-label search-label">완료 여부</label>
          <select class="form-select" v-model="searchComplete">
            <option value="">선택안함</option>
            <option value="1a1a">완료</option>
            <option value="1a2a">미완료</option>
          </select>
        </div>
        <div class="col-md-2 d-flex align-items-end gap-2">
          <button class="btn btn-outline-secondary w-50" @click="resetFilter">초기화</button>
          <button class="btn btn-primary w-50" @click="searchProdPlan">조회</button>
        </div>
      </div>
    </div>
    <div class="row mt-3">
      <div class="d-flex justify-content-between align-items-center">
        <!-- 왼쪽: 조회 버튼 -->
        <div>
          <button class="btn btn-info" style="width: 200px;" @click="openModal">주문 제품 목록 조회</button>
        </div> 
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 d-flex flex-column">
        <tabulator-card
          ref="tabulatorCardRef"
          card-title="생산계획 목록"
          :height="550"
          :table-data="prodPlanData"
          :table-columns="prodPlanColumns"
          :on="tabulatorEvent"
          :tabulatorOptions="tabulatorOptions"
        >
          <template #actions>
            <button class="btn btn-secondary me-2" @click="addRow">행추가</button>
            <button class="btn btn-success me-2" @click="saveProdPlan">저장</button>
            <button class="btn btn-delete" @click="deleteProdPlan" style="background-color: red; color: black;">삭제</button>
          </template>
        </tabulator-card>
      </div>
      <OrderProdListModal
        :isModalOpen="isModalOpen"
        @selectOrder="handleSelectedOrder"
        @closeModal="closeModal"
      />
      <ProductSearchModal
        :isOpen="isSearchModalOpen"
        :targetInfo="{
          rowNum: modalTargetRow?.getData()?.rowNum,
          orderDetailCode: modalTargetRow?.getData()?.orderDetailCode
        }"
        @select="handleProductSelect"
        @close="() => { isSearchModalOpen = false }"
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
.search-label {
  font-size: medium;
}
.full-height {
  height: 840px;
  display: flex;
  flex-direction: column;
}
</style>
