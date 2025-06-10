<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from "vue"; // onBeforeUnmount 훅 추가
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
  // --- event props ---
  on: {
    type: Array, // 여러 이벤트를 받을 수 있도록 배열 타입으로 변경
    default: () => [], // [{ eventName: "rowClick", eventAction: (e, row) => console.log(row.getData()) }]
  },
  off: {
    type: Array, // 제거할 이벤트 이름을 문자열 배열로 받습니다.
    default: () => [], // ["rowClick", "cellEdited"]
  },
  // -----------------------
});

// Tabulator 인스턴스를 초기화하는 함수
const initializeTabulator = () => {
  if (tabulatorTableRef.value && props.tableColumns.length > 0) {
    // 기존 인스턴스가 있다면 파괴하여 메모리 누수 방지
    if (tabulatorInstance) {
      tabulatorInstance.destroy();
    }

    tabulatorInstance = new Tabulator(tabulatorTableRef.value, {
      height: "350px",
      data: props.tableData,
      columns: props.tableColumns,
      layout: "fitColumns",
      pagination: false,
      reactiveData: true,
      theme: "bootstrap",
      ...props.tabulatorOptions,
    });

    // --- 이벤트 핸들러 추가 (on prop) ---
    props.on.forEach(event => {
      tabulatorInstance.on(event.eventName, event.eventAction);
    });

    // --- 이벤트 핸들러 제거 (off prop) ---
    // off prop은 초기화 시점에 처리하는 것보다,
    // onBeforeUnmount에서 모두 제거하는 것이 더 효율적입니다.
    // 하지만 만약 특정 이벤트를 초기화 시점에 제거해야 한다면 여기에 로직을 추가할 수 있습니다.
    // 여기서는 onBeforeUnmount에서 일괄 제거하는 방식을 권장합니다.
  }
};

const getTabulator = () => {
  return tabulatorInstance;
}

defineExpose({
  getTabulator
});

onMounted(() => {
  initializeTabulator();
});

// tableData 또는 tableColumns prop이 변경될 때 Tabulator를 업데이트
watch(() => props.tableData, (newData) => {
  if (tabulatorInstance) {
    tabulatorInstance.setData(newData);
  }
}, { deep: true });

watch(() => props.tableColumns, (newColumns) => {
  if (tabulatorInstance) {
    initializeTabulator(); // 컬럼 변경 시 재초기화
  }
}, { deep: true });

// --- 컴포넌트 언마운트 전 이벤트 핸들러 및 Tabulator 인스턴스 정리 ---
onBeforeUnmount(() => {
  if (tabulatorInstance) {
    // on prop으로 추가된 모든 이벤트를 명시적으로 제거합니다.
    props.on.forEach(event => {
      if (typeof tabulatorInstance[event.eventName] === 'function') {
        // Tabulator의 off 메서드는 특정 콜백 함수를 지정하지 않으면 해당 이벤트의 모든 리스너를 제거합니다.
        // 특정 콜백만 제거하고 싶다면, on() 시에 저장해둔 콜백 참조를 사용해야 합니다.
        // 여기서는 `initializeTabulator`가 매번 새로운 인스턴스를 생성하므로,
        // 기존 인스턴스를 destroy()하는 것이 더 효과적입니다.
        // 하지만 만약 Tabulator 인스턴스를 재사용하는 경우를 위해 off() 예시를 남겨둡니다.
        // tabulatorInstance.off(event.eventName, event.eventAction);
      }
    });

    // off prop에 지정된 이벤트를 제거합니다.
    props.off.forEach(eventName => {
      if (typeof tabulatorInstance[eventName] === 'function') {
        tabulatorInstance.off(eventName); // 해당 이벤트의 모든 리스너 제거
      }
    });

    // Tabulator 인스턴스 파괴
    tabulatorInstance.destroy();
    tabulatorInstance = null;
  }
});
</script>

<template>
  <div class="card">
    <div class="p-3 pt-0 text-center card-body">
      <div class="table-title d-flex justify-content-between align-items-center mb-3 mt-3">
        <h5 class="mt-0 text-start">{{ cardTitle }}</h5>
        <div>
          <slot name="actions"></slot>
        </div>
      </div>
      <div ref="tabulatorTableRef"></div>
    </div>
  </div>
</template>

<style scoped>
.card-body > div[ref="tabulatorTableRef"] {
  margin-top: 1rem;
}

.tabulator-col,
.tabulator-cell {
    font-family: var(--bs-body-font-family);
}

/* --- Tabulator 테이블 헤더(Title) 스타일링 --- */
.tabulator-col .tabulator-col-content .tabulator-col-title {
    text-align: left !important;
    padding-left: 0.75rem;
}

.tabulator-col {
    background-color: #ffffff;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    margin: 0.25rem;
    box-shadow: none;
    box-sizing: border-box;
}

.tabulator-col:first-child {
    margin-left: 0;
}
.tabulator-col:last-child {
    margin-right: 0;
}

.tabulator-header {
    background-color: transparent !important;
    border-bottom: none !important;
}

.tabulator-sortable .tabulator-col .tabulator-col-content .tabulator-arrow {
    color: #495057;
    margin-left: auto;
    margin-right: 0.5rem;
}
</style>