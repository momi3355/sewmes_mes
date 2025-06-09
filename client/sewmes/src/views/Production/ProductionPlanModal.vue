<script setup>
import { ref, onMounted, watch, onUnmounted,nextTick } from "vue";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator_bootstrap5.min.css"; // Bootstrap 5 테마 CSS
import axios from 'axios'; // axios 임포트

// props  부모컴포넌트로부터 받을 속성
const props = defineProps({
  isModalOpen: {
    type: Boolean,
    default: false
  }
});

//emits :부모컴포넌트로 보낼 이벤트
const emit = defineEmits(['select-plans', 'close-modal']);

//모달 내부에서 사용될 반응형 데이터
const productionPlans = ref([]);

const modalTabulatorRef = ref(null); // <template>의 ref와 이름 일치 확인
let modalTabulatorInstance = null;

//생산계획 목록 테이블 컬럼
const modalTableColumns = [
  {
    formatter: "rowSelection",
    titleFormatter: "rowSelection",
    hozAlign: "center",
    headerSort: false,
    width: 40,
    cssClass: 'tabulator-checkbox-column'
  },
  { title: "생산계획코드", field: "prod_plan_code", width: 150 },
  { title: "제품코드", field: "prod_code", width: 150 },
  
  { title: "생산계획수량", field: "prod_qty", width: 150 },
  { title: "생산계획등록일자", field: "reg_date", width: 150 },
  { title: "납기일자", field: "dead_date", width: 150 }
];


// Tabulator 초기화 함수
const initializeModalTabulator = () => {
  if (modalTabulatorRef.value) {
    if (modalTabulatorInstance) {
      modalTabulatorInstance.destroy(); // 기존 인스턴스가 있으면 파괴
    }
    modalTabulatorInstance = new Tabulator(modalTabulatorRef.value, {
      height: "300px", // 모달 내 그리드 높이
      data: productionPlans.value, // 초기 데이터 설정
      columns: modalTableColumns, // 컬럼 설정
      layout: "fitColumns", // 컬럼 너비를 컨테이너에 맞춤
      pagination: false, // 페이징 비활성화 (필요 시 활성화)
      selectable: true, // 행 선택 가능하도록 설정 (클릭 시 선택/해제)
      theme: "bootstrap", // 임포트된 CSS에 맞게 "bootstrap" 테마 사용
    });
  }
};

// 생산계획 데이터를 백엔드에서 불러오는 함수
const fetchProductionPlans = async () => {
  try {
    const response = await axios.get('/production-plans', {
        params: {
            complete: 'N' // 완료 여부 'N'인 데이터만 요청 (백엔드에서 처리 필요)
        }
    });
    if (response.data.success) {
      productionPlans.value = response.data.data;
    } else {
      console.error("생산계획 데이터 로드 실패:", response.data.message);
      alert(`생산계획 데이터 로드 실패: ${response.data.message}`);
    }
  } catch (error) {
    console.error("생산계획 데이터 로드 중 오류 발생:", error);
    if (error.response) {
      alert(`생산계획 조회 중 서버 오류: ${error.response.data.message || error.response.statusText}`);
    } else if (error.request) {
      alert("네트워크 오류: 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지, DB 연결 상태를 확인하세요.");
    } else {
      alert(`생산계획 조회 중 예상치 못한 오류: ${error.message}`);
    }
  }
};

// "선택" 버튼 클릭 시 호출될 함수 (부모에게 선택된 데이터 전달)
const handleSelectedPlans = () => {
  if (modalTabulatorInstance) {
    const selectedData = modalTabulatorInstance.getSelectedData();
    if (selectedData.length === 0) {
      alert("생산계획을 하나 이상 선택해주세요.");
      return;
    }
    emit('select-plans', selectedData);
    emit('close-modal');
  }
};

// "닫기" 버튼 클릭 시 호출될 함수 (모달 닫기)
const handleCloseModal = () => {
  emit('close-modal');
};


// 컴포넌트 마운트 시 Tabulator 초기화
onMounted(() => {
  
});

// `productionPlans` 데이터가 변경될 때 Tabulator 데이터 업데이트
watch(() => productionPlans.value, (newData) => {
  if (modalTabulatorInstance) {
    modalTabulatorInstance.setData(newData);
  }
}, { deep: true });

// `isModalOpen` prop이 true로 변경될 때마다 (즉, 모달이 열릴 때) 생산계획 데이터를 다시 불러옴
watch(() => props.isModalOpen, (newVal) => {
  if (newVal) {
    fetchProductionPlans();
    nextTick(()=>{
      initializeModalTabulator();
    });
  }else {
    // 모달이 닫힐 때 Tabulator 인스턴스 파괴 (메모리 누수 방지)
    if (modalTabulatorInstance) {
      modalTabulatorInstance.destroy();
      modalTabulatorInstance = null;
    }
  }
});

// 컴포넌트 언마운트 시 Tabulator 인스턴스 파괴 (메모리 누수 방지)
onUnmounted(() => {
  if (modalTabulatorInstance) {
    modalTabulatorInstance.destroy();
    modalTabulatorInstance = null;
  }
});
</script>

<template>
  <div class="modal-overlay" v-if="props.isModalOpen">
    <div class="modal-content">
      <h2>생산계획서 목록</h2>
      <div ref="modalTabulatorRef" class="modal-grid"></div> <div class="modal-actions"> <button class="btn btn-primary" @click="handleSelectedPlans">선택</button>
        <button class="btn btn-secondary ms-2" @click="handleCloseModal">닫기</button>
      </div>
    </div>
  </div>
</template>

<style scoped>

/* 모달 오버레이 (전체 화면 덮는 반투명 배경) */
.modal-overlay {
  position: fixed; 
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 반투명 검정 배경 */
  display: flex;
  justify-content: center; /* 가로 중앙 정렬 */
  align-items: center; /* 세로 중앙 정렬 */
  z-index: 1000; /*  다른 요소들 위에 표시되도록 높은 z-index 설정 */
}

/* 모달 내용 컨테이너 */
.modal-content {
  background-color: #ffffff; /* 흰색 배경 */
  padding: 20px;
  border-radius: 8px; /* 둥근 모서리 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* 그림자 효과 */
  margin-left:300px;
  margin-right:300px;
  min-width: 70%; /* 최소 너비 */
  max-width: 95%; /* 화면 너비의 최대 90% */
  max-height: 90%; /* 화면 높이의 최대 90% */
  overflow: auto; /* 내용이 넘칠 경우 스크롤바 생성 */
  display: flex;
  flex-direction: column; /* 자식 요소들을 세로로 정렬 */
}

/* 모달 제목 */
.modal-content h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.5rem;
  color: #333;
}

/* Tabulator 그리드가 들어갈 영역 */
.modal-grid {
    margin-top: 20px;
    margin-bottom: 20px;
    flex-grow: 1; /* 남은 공간을 그리드가 채우도록 */
    /* Tabulator의 height 옵션과 함께 사용되어야 합니다. */
}

/* 모달 하단 버튼 영역 */
.modal-actions {
    display: flex;
    justify-content: flex-end; /* 버튼을 오른쪽으로 정렬 */
    padding-top: 15px;
    border-top: 1px solid #eee; /* 버튼 위에 구분선 */
    gap: 10px; /* 버튼 사이 간격 (Flexbox 속성) */
}


</style>