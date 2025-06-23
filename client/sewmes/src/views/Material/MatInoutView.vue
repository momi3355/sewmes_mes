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
    hozAlign: "left",
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
  <!-- 1. 가장 바깥쪽을 하나의 container-fluid로 감싸고, 내부 패딩을 조절합니다. -->
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-12">

        <!-- 2. 검색 영역 -->
        <div class="search-area bg-white rounded p-3 mb-4 shadow-sm">
          <div class="row align-items-end">
            <!-- 자재명 -->
            <div class="col-md-3">
              <label class="form-label search-label">자재명</label>
              <input type="text" class="form-control" v-model="searchProdName">
            </div>
            <div class="col-md-2">
              <label for="date" class="form-label search-label">입/출고일자</label>
              <div class="date-input-wrapper">
                <input type="date" id="date" class="form-control" max="2039-12-31" min="2000-01-01">
              </div>
            </div>
            <div class="col-md-1">
              <label for="material-type" class="form-label">유형</label>
              <select id="material-type" class="form-control" v-model="searchMaterialType">
                <option value="">전체</option>
                <option value="원자재">입고</option>
                <option value="부자재">출고</option>
              </select>
            </div>
            <!-- 버튼 -->
            <div class="col-md-2 d-flex justify-content-end gap-2">
              <button class="btn btn-secondary" @click="resetFilter">초기화</button>
              <button class="btn btn-primary" @click="searchLotHistoryList">조회</button>
            </div>
          </div>
        </div>

        <div class="row mt-4">
          <div class="col-lg-12">
            <!-- 
              수정된 부분: 
              1. 버튼을 TabulatorCard 안으로 옮깁니다.
              2. <template #actions>로 감싸줍니다.
            -->
            <tabulator-card card-title="자재 입/출고 내역" :table-data="inOutData" :table-columns="inOutColumns"
              :tabulator-options="tabulatorEvent" height="700px">
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
.btn-primary {
 width: 80px;
 margin: 0px;
}
.btn-secondary {
 width: 80px;
 margin: 0px;
}
.removebtn {
  width: 70px;
}
.form-label {
  font-size: medium;
}
select.form-control {
  /* 1. 기본 브라우저 화살표 숨기기 */
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  /* 2. 배경 이미지로 SVG 화살표 아이콘 추가 */
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right .75rem center; /* 오른쪽 끝에서 약간 떨어진 중앙에 위치 */
  background-size: 16px 12px;
  
  /* 3. 텍스트가 화살표를 덮지 않도록 오른쪽 패딩 추가 */
  padding-right: 2.5rem;
}
</style>