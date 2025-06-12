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

const checkTableCard = ref(null);
const selectedMaterial = ref(null);

// 모달 컴포넌트 참조
const checkModal = ref(null);

// 모달을 여는 함수
const openCheckModal = (item) => {
  if (checkModal.value) {
    selectedMaterial.value = item;
    checkModal.value.openModal();
  }
};
const matcheckData = ref([]);

onMounted(() => {
  fetchMaterials(); 
});

// 자재 데이터를 가져오는 함수
const fetchMaterials = async () => {
  try {
    const response = await 
    axios.get('/api/matcheck');
    
    matcheckData.value = response.data;

    console.log("수입검사 리스트 로딩 성공");
  } catch (error){
    console.error("수입검사 리스트 로딩 실패", error);
  }
};

// 날짜 형식 변환 함수
const dateFormatter = (cell) => {
  const value = cell.getValue();

  if(!value){
    return "";
  }
  return value.split('T')[0];
};


const materialColumns = [
  { title: "발주번호", field: "material_order_code", width: 150},
  { title: "자재명", field: "material_name", minWidth: 200, hozAlign: "left", sorter: "number" },
  { title: "수입량", field: "inbound_qty", width: 100, hozAlign: "left"},
  { title: "공급처", field: "cp_name", minWidth: 150, hozAlign: "left"},
  { title: "수입일자", 
    field: "inbound_date", 
    width: 150, 
    hozAlign: "center", 
    formatter: dateFormatter
  },
];


// 선택된 행들을 처리하는 함수
const handleMatRowClick = (e, row) => {
  const rowData = row.getData();
  console.log("선택된 행: ", rowData);
  console.log("Row clicked:", row.getData());
};

// 어떤 행이 선택되었는지 알아내는 함수
const startCheck = () => {
  if(!checkTableCard.value || !checkTableCard.value.$el){
    console.error("TabulatorCard 컴포넌트의 참조를 찾을 수 없음.");
    return;
  }
  const tabulatorElement = 
  checkTableCard.value.$el.querySelector('.tabulator');
    if(!tabulatorElement){
      console.error("TabulatorCard에서 .tabulator 클래스를 찾지 못함");
      return;
    }
  const tabulatorInstance = 
  Tabulator.findTable(tabulatorElement)[0];
    if(!tabulatorInstance) {
      console.error("Tabulator 인스턴스를 찾지 못함");
      return;
    }
  const selectedRows = tabulatorInstance.getSelectedData();
    if(selectedRows.length === 0){
      alert("검사할 자재를 선택해주세요.");
      return;
    }
  const selectedItem = selectedRows[0];
  openCheckModal(selectedItem);
}

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
            <tabulator-card
            ref="checkTableCard"
              card-title="수입검사 대기 목록"
              :table-data="matcheckData"
              :table-columns="materialColumns"
              :tabulator-options="{
                paginationSize: 7,
                selectableRows: 1,
              }"
            >
              <template #actions>
                <ArgonButton color="success" variant="gradient" @click="startCheck">
                  수입검사
                </ArgonButton>
              </template>
            </tabulator-card>
          </div>
        </div>
      </div>
    </div>
  </div>
  <MatCheckModal ref="checkModal" :item="selectedMaterial" />
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

.date-input-wrapper {
  position: relative;
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
</style>