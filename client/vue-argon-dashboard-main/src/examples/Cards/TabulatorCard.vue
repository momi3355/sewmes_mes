<script setup>
import { ref, onMounted, watch } from "vue";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator_bootstrap5.min.css"; // Bootstrap 5 테마 CSS

const tabulatorTableRef = ref(null);
let tabulatorInstance = null;

const props = defineProps({
  cardTitle: {
    type: String,
    default: "데이터 테이블",
  },
  tableData: {
    type: Array,
    default: () => [],
  },
  tableColumns: {
    type: Array,
    default: () => [],
  },
  tabulatorOptions: {
    type: Object,
    default: () => ({}),
  },
});

const initializeTabulator = () => {
  if (tabulatorTableRef.value && props.tableColumns.length > 0) {
    if (tabulatorInstance) {
      tabulatorInstance.destroy();
    }

    tabulatorInstance = new Tabulator(tabulatorTableRef.value, {
      height: "350px",
      data: props.tableData,
      columns: props.tableColumns,
      layout: "fitColumns",
      pagination: false, // 페이징 기능 비활성화
      reactiveData: true,
      theme: "bootstrap",
      // 추가 옵션 병합
      ...props.tabulatorOptions,
    });
  }
};

onMounted(() => {
  initializeTabulator();
});

watch(
  () => props.tableData,
  (newData) => {
    if (tabulatorInstance) {
      tabulatorInstance.setData(newData);
    }
  },
  { deep: true }
);

watch(
  () => props.tableColumns,
  (newColumns) => {
    if (tabulatorInstance) {
      initializeTabulator();
    }
  },
  { deep: true }
);
</script>

<template>
  <div class="card">
    <div class="p-3 pt-0 text-center card-body">
      <div class="table-title">
        <h6 class="mb-0 text-start">{{ cardTitle }}</h6>
      </div>
      <hr class="my-3 horizontal dark" />
      <div ref="tabulatorTableRef"></div>
    </div>
  </div>
</template>

<style scoped>
.table-title {
  border: 1px solid black;
  margin: 10px;
  padding: 5px;
}

/* 카드 본문과 Tabulator 테이블 사이의 여백 */
.card-body > div[ref="tabulatorTableRef"] {
  margin-top: 1rem;
}

/* Argon Dashboard의 폰트와 Tabulator의 기본 폰트가 다를 경우 조절 */
.tabulator-col,
.tabulator-cell {
  font-family: var(--bs-body-font-family);
}

/* --- Tabulator 테이블 헤더(Title) 스타일링 --- */

/* 1. 테이블 헤더 텍스트를 왼쪽으로 정렬 */
.tabulator-col .tabulator-col-content .tabulator-col-title {
  text-align: left !important; /* 왼쪽 정렬 강제 */
  padding-left: 0.75rem; /* Bootstrap input-box의 왼쪽 패딩과 유사하게 */
}

/* 2. 테이블 헤더를 input box처럼 보이게 스타일링 */
.tabulator-col {
  background-color: #ffffff; /* 배경색을 흰색으로 */
  border: 1px solid #ced4da; /* Bootstrap input border 색상 */
  border-radius: 0.25rem; /* 둥근 모서리 */
  margin: 0.25rem; /* 헤더 사이에 약간의 간격 */
  box-shadow: none; /* 그림자 제거 */
  box-sizing: border-box; /* 패딩과 보더가 너비에 포함되도록 */
  /* 너비를 명시적으로 고정하지 않으면, fitData에 따라 내용에 맞게 조절됩니다. */
}

/* 헤더 보더가 겹치는 문제 해결 */
.tabulator-col:first-child {
  margin-left: 0;
}
.tabulator-col:last-child {
  margin-right: 0;
}

/* Tabulator 기본 헤더 배경색 및 보더 제거 */
.tabulator-header {
  background-color: transparent !important; /* 헤더 컨테이너 배경 투명 */
  border-bottom: none !important; /* 하단 보더 제거 */
}

/* 정렬 아이콘 스타일 조정 (옵션) */
.tabulator-sortable .tabulator-col .tabulator-col-content .tabulator-arrow {
  color: #495057; /* 화살표 색상 */
  margin-left: auto; /* 화살표를 오른쪽으로 밀기 */
  margin-right: 0.5rem; /* 오른쪽 패딩 */
}
</style>
