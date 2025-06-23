<!--자재 입출고 조회-->
<script setup>
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { ref, onMounted } from "vue";
import axios from "axios";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";

// --- 상태(State) 정의 ---
const searchField1 = ref('');
const searchField2 = ref('');
// ✨ 테이블에 바인딩될 데이터 ref (이름을 더 명확하게 변경)
const inOutData = ref([]);
const inOutTableCardRef = ref(null);


// 날짜 변환
const dateFormatter = (cell) => {
  const value = cell.getValue();
  if (!value) {
    return "";
  }
  // 'T'를 기준으로 잘라 날짜 부분만 반환
  return value.split('T')[0];
};

const inOutColumns = [
  {
    formatter: "rowSelection",
    titleFormatter: "rowSelection",
    hozAlign: "center",
    headerSort: false,
    width: 60,
  },
  { title: "자재코드", field: "material_code", width: 150, hozAlign: "left" },
  { title: "자재명", field: "material_name", minWidth: 200, hozAlign: "left" },
  { title: "공급처/사용처", field: "partner", minWidth: 150, hozAlign: "left" }, // ✨ partner
  { title: "수량", field: "qty", hozAlign: "left" }, // ✨ qty
  { title: "유형", field: "category", width: 100 }, // 
  { 
    title: "입/출고일자", 
    field: "inout_date", // ✨ inout_date
    width: 150, 
    hozAlign: "left",
    formatter: dateFormatter,
  },
  { 
    title: "구분", 
    field: "in_out", // ✨ in_out
    width: 80,
    hozAlign: "center",
    // ✨ 구분에 따라 색상을 다르게 표시하는 포매터 (가독성 향상)
    formatter: function(cell) {
      const value = cell.getValue();
      if (value === '입고') {
        cell.getElement().style.color = "blue";
      } else {
        cell.getElement().style.color = "red";
      }
      return value;
    }
  },
];

// --- 메소드(함수) 정의 ---

// ✨ 서버에서 입출고 내역 데이터를 가져오는 함수
const fetchInOutList = async () => {
  try {
    const response = await axios.get('/api/material/inout-list');
    const data = Array.isArray(response.data) ? response.data : [];
    
    inOutData.value = data;

    const tabulatorInstance = getTabulatorInstance();
    if (tabulatorInstance) {
      tabulatorInstance.setData(data);
    } else {
      setTimeout(() => {
        const instance = getTabulatorInstance();
        if (instance) instance.setData(data);
      }, 100);
    }
  } catch(error) {
    console.error("자재 입출고 내역 로딩 오류", error);
  }
};

const getTabulatorInstance = () => {
  if (!inOutTableCardRef.value || !inOutTableCardRef.value.$el) return null;
  const element = inOutTableCardRef.value.$el.querySelector('.tabulator');
  return Tabulator.findTable(element)?.[0] || null;
};



// --- 라이프사이클 훅 ---
// ✨ 컴포넌트가 마운트되면(페이지가 로드되면) 데이터를 가져옵니다.
onMounted(() => {
  fetchInOutList();
});

</script>

<template>
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-12">
        <!-- 상단 검색 영역 (변경 없음) -->
        <div class="row searchbox mb-3">
          <div class="col-md-2">
            <label class="form-label">자재코드</label>
            <input type="text" class="form-control" v-model="searchField1">
          </div>
          <div class="col-md-2">
            <label class="form-label">자재명</label>
            <input type="text" class="form-control" v-model="searchField2">
          </div>
          <div class="col-md-2">
            <label for="date" class="form-label">수입일자:</label>
           <div class="date-input-wrapper">
      <input type="date"
        id="date"
        class="form-control"
        max="2039-12-31"
        min="2000-01-01">
    </div>
    </div>
          <div class="col-md-2 d-flex align-items-end">
            <button class="btn btn-secondary me-2">초기화</button>
            <button class="btn btn-primary">조회</button>
          </div>
        </div>

        <div class="row mt-4">
          <div class="col-lg-12">
            <!-- 
              수정된 부분: 
              1. 버튼을 TabulatorCard 안으로 옮깁니다.
              2. <template #actions>로 감싸줍니다.
            -->
            <tabulator-card
              card-title="자재 입/출고 내역"
              :table-data="inOutData"
              :table-columns="inOutColumns"
              :tabulator-options="tabulatorEvent"
              height="700px"
            >
              <!-- actions 슬롯에 버튼을 삽입합니다 -->
              
            </tabulator-card>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>
<style scoped>
/* --- 전체 레이아웃 --- */
.col-lg-12 {
  margin-top: 85px;
}
.searchbox {
  height: 120px;
  background-color: #FFFFFF;
  border-radius: 1rem;
  margin-left: 3px;
  margin-right: 3px;
  margin-bottom: 30px;
  display: flex;
  align-items: flex-end;
  padding-bottom: 15px; /* col-md-2에 있던 패딩을 부모로 이동 */
}

/* --- 검색 필드 --- */
.form-label {
  font-size: large;
  margin-bottom: 5px; /* 라벨과 입력창 사이 간격 */
  display: block; /* 라벨이 한 줄을 다 차지하도록 함 */
  margin-left: 10px;
}
.form-control {
  margin-left: 5px; /* 입력창 왼쪽 여백 */
  width: calc(100% - 10px); /* 여백을 고려한 너비 계산 */
}

/* --- 날짜 입력 필드 스타일 --- */
.date-input-wrapper {
  position: relative;
  /* form-control과 동일한 왼쪽 여백을 줌 */
  margin-left: 5px;
  width: calc(100% - 10px);
}
.date-input-wrapper input[type="date"] {
  /* margin-left를 제거하여 wrapper 안에서 정렬되도록 함 */
  margin-left: 0;
  width: 100%;
}

.date-input-wrapper::after {
  content: '📅';
  font-size: 1.2rem;
  color: #adb5bd;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}
.date-input-wrapper input[type="date"]::-webkit-calendar-picker-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

/* --- 버튼 --- */
.btn {
  padding: 10px;
  margin: 0;
  margin-bottom: 2px; /* 다른 필드와 높이를 맞추기 위한 미세 조정 */
}
.btn.btn-secondary.me-2 {
  margin-right: 10px;
}
.removebtn {
  width: 70px;
}
.col-md-2{
  margin-top: 7px;
  margin-bottom: 15px;
}

</style>