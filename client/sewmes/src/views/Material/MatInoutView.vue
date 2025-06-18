<!--자재 입출고 조회-->
<script setup>
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { ref, onMounted } from "vue"; // Import ref and onMounted
import axios from "axios";

import ArgonButton from "@/components/ArgonButton.vue";

import DefaultInfoCard from "@/examples/Cards/DefaultInfoCard.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";

const userData = ref([]);



const userColumns = [
 {
  formatter: "rowSelection",  // 행 선택 체크박스를 생성합니다.
  titleFormatter: "rowSelection", // 헤더에 '전체 선택' 체크박스를 생성합니다.
  hozAlign: "center",
  headerSort: false,          // 이 열은 정렬 기능을 비활성화합니다.
  cellClick: function(e, cell) { // 셀의 아무 곳이나 클릭해도 체크되도록 합니다.
    cell.getRow().toggleSelect();
  },
   width: 1
},
  { title: "자재코드", field: "mat_code", editor: "input" },
  { title: "자재명", field: "mat_name", hozAlign: "left", sorter: "number" },
  { title: "공급처", field: "company", hozAlign: "left"},
  { title: "수량", field: "qty", hozAlign: "left"},
  { title: "유형", field: "category", hozAlign: "left"},
  { title: "입/출고일자", field: "inout_date", hozAlign: "left"},
  { title: "구분", field: "in_out", hozAlign: "left"},
];


// 선택된 행들을 처리하는 함수
const handleUserRowClick = (e, row) => {
  console.log("Row clicked:", row.getData());
};

// 선택된 행들을 가져오는 함수
const getSelectedRows = (tableRef) => {
  if (tableRef) {
    const selectedRows = tableRef.getRows().filter(row => row.getData().selected);
    console.log("Selected rows:", selectedRows.map(row => row.getData()));
    return selectedRows;
  }
};

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
            <label for="date">수입일자:</label>
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
              :table-data="userData"
              :table-columns="userColumns"
              :tabulator-options="{
                paginationSize: 7,
                rowClick: handleUserRowClick,
              }"
            >
              <!-- actions 슬롯에 버튼을 삽입합니다 -->
              <template #actions>
                <ArgonButton color="info" variant="gradient">
                  PDF로 저장
                </ArgonButton>
              </template>
            </tabulator-card>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>
<style scoped>
 .col-lg-12{
  margin-top: 85px;
}
 .searchbox{
  background-color: #FFFFFF;
  border-radius: 1rem;
  margin: 30px;
 }
 .btn{
  padding: 10px;
  margin: 0px;
 }
 .btn-secondary.me-2{
  margin-right: 10px;
 }
 /* date input을 감싸는 wrapper */
.date-input-wrapper {
  position: relative;
}

/* 1. 장식용 아이콘을 wrapper의 가상요소로 만듭니다 (클릭 불가) */
.date-input-wrapper::after {
  content: '📅';
  font-size: 1.2rem;
  color: #adb5bd;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none; /* 아이콘이 클릭 이벤트를 방해하지 않도록 설정 */
}

/* 2. 실제 달력 버튼을 투명하게 만들어 아이콘 위에 겹칩니다. */
.date-input-wrapper input[type="date"]::-webkit-calendar-picker-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  opacity: 0; /* 중요: 눈에 보이지 않게 하지만, 공간과 기능은 유지 */
  cursor: pointer;
}
</style>