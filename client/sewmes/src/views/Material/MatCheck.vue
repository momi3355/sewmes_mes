<!--자재 수입검사 관리-->
<script setup>
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { ref, onMounted } from "vue"; // Import ref and onMounted
import axios from "axios";

import ArgonButton from "@/components/ArgonButton.vue";
import DefaultInfoCard from "@/examples/Cards/DefaultInfoCard.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import MatCheckModal from '@/views/Material/MatCheckModal.vue';


const searchField1 = ref('');
const searchField2 = ref('');
const searchField3 = ref('');
const searchDate = ref('');

// 2. 모달 컴포넌트를 참조하기 위한 ref를 만듭니다.
const checkModal = ref(null);

// 3. 모달을 여는 함수를 만듭니다.
const openCheckModal = () => {
  if (checkModal.value) {
    checkModal.value.openModal();
  }
};

// 처음에는 데이터가 없는 빈 배열로 시작합니다.
const materialData = ref([]);

// onMounted: Vue 컴포넌트가 화면에 그려진 직후에 자동으로 실행되는 함수입니다.
onMounted(() => {
  fetchMaterials(); // 컴포넌트가 로드되면 바로 DB에서 데이터를 가져옵니다.
});

// 백엔드 서버로부터 자재 데이터를 가져오는 비동기 함수
const fetchMaterials = async () => {
  try {
    // 백엔드 서버의 API 주소로 GET 요청을 보냅니다.
    const response = await axios.get('http://localhost:3000/api/materials');
    
    // 성공적으로 데이터를 받아오면, materialData의 값을 서버에서 받은 데이터로 교체합니다.
    materialData.value = response.data;
    
    console.log('DB 데이터를 성공적으로 불러왔습니다.');
  } catch (error) {
    console.error('데이터를 불러오는 중 오류가 발생했습니다:', error);
  }
};



const materialColumns = [
  {
  formatter: "rowSelection",  // 행 선택 체크박스를 생성합니다.
  // titleFormatter: "rowSelection", // 헤더에 '전체 선택' 체크박스를 생성합니다.
  title: "",
  hozAlign: "center",
  headerSort: false,          // 이 열은 정렬 기능을 비활성화합니다.
  cellClick: function(e, cell) { // 셀의 아무 곳이나 클릭해도 체크되도록 합니다.
    cell.getRow().toggleSelect();
  },
   width: 1
},
  { title: "발주번호", field: "order_no", width: 150, editor: "input" },
  { title: "자재명", field: "mat_name", hozAlign: "left", sorter: "number" },
  { title: "발주수량", field: "order_qty", hozAlign: "left", formatter: "link" },
  { title: "입고수량", field: "inbound_qty", hozAlign: "left"},
  { title: "공급처", field: "company", hozAlign: "left"},
  { title: "수입일자", field: "inbound_date", hozAlign: "left"},
];


// 선택된 행들을 처리하는 함수
const handleMatRowClick = (e, row) => {
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
        <!-- 상단 검색 영역 -->
        <div class="row searchbox mb-3">
          <div class="col-md-2">
            <label class="form-label">자재명</label>
            <!-- v-model을 선언된 변수와 연결 -->
            <input type="text" class="form-control" v-model="searchField1">
          </div>
          <div class="col-md-2">
            <label class="form-label">자재코드</label>
            <input type="text" class="form-control" v-model="searchField2">
          </div>
          <div class="col-md-2">
            <label class="form-label">공급처</label>
            <input type="text" class="form-control" v-model="searchField3">
          </div>
          <div class="col-md-2">
            <label for="date" class="form-label">수입일자</label>
            <div class="date-input-wrapper">
              <!-- v-model을 searchDate와 연결 -->
              <input type="date"
                id="date"
                class="form-control"
                v-model="searchDate"
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
              card-title="수입검사 대기 목록"
              :table-data="materialData"
              :table-columns="materialColumns"
              :tabulator-options="{
                paginationSize: 7,
                rowClick: handleMatRowClick, selectable: 1
              }"
            >
              <!-- actions 슬롯에 버튼을 삽입합니다 -->
              <template #actions>
                <ArgonButton color="success" variant="gradient" @click="openCheckModal">
                  수입검사
                </ArgonButton>
              </template>
            </tabulator-card>
          </div>
        </div>
        
      </div>
    </div>
  </div>
  <MatCheckModal ref="checkModal" />
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