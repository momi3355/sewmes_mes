<!--자재 수입검사 관리-->
<script setup>
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { onBeforeMount, ref, onMounted } from "vue"; // Import ref and onMounted
import { useStore } from "vuex";
import axios from "axios";
import Swal from 'sweetalert2';


import ArgonButton from "@/components/ArgonButton.vue";
import DefaultInfoCard from "@/examples/Cards/DefaultInfoCard.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import MatCheckModal from '@/views/Material/MatCheckModal.vue';

const store = useStore();

const searchField1 = ref('');
const searchField2 = ref('');
const searchField3 = ref('');
const searchDate = ref('');

const checkTableCard = ref(null);
const selectedMaterial = ref(null);
const userInfo = ref(null);

// 모달 컴포넌트 참조
const isTestModalOpen = ref(false);

// 부서별 권한 관련 
const dept = ref("");
onBeforeMount(() => {
  dept.value = store.state.user.dept;
})
const canShow = (allowedDepts) => {
  return allowedDepts.includes(dept.value);
};

// 모달을 여는 함수
const openCheckModal = (item) => {
  //console.log("모달로 전달할 데이터 (item): ", JSON.stringify(item, null, 2));
  selectedMaterial.value = item;
  
  userInfo.value = store.state.user;
  isTestModalOpen.value = true;
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
  { title: "수입량", field: "order_qty", width: 100, hozAlign: "left"},
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
      Swal.fire({
      title: "",
      text: "검사할 자재를 선택하십시오.",
      icon: "error"
    });
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

const handleCheckComplete = async (checkData) => {
  if (checkData.details && typeof checkData.details.color !== 'undefined') {
    console.log("typeof checkData.details.color:", typeof checkData.details.color);
  }
  try{
    console.log("서버로 보낼 최종 데이터(checkData): ", JSON.stringify(checkData, null, 2));
    const response = await axios.post('/api/material/complete-check', checkData);
    if(response.data.success){
      alert('검사 결과가 성공적으로 저장되었습니다.');
      fetchCheckList();
    } else{
      alert('저장에 실패했습니다.: ' + response.data.message);
    } 
  } catch(error){
      console.error('검사 결과 저장 API 호출 오류', error);
      alert('서버에 저장하는 도중 오류가 발생했습니다.');
    }
  };
  const fetchCheckList = async () => {
    try{
      const response = await axios.get('/api/matcheck');
      checkListData.value = response.data;
      console.log("서버로부터 받은 검수 대기목록: ", checkListData.value);
    } catch(error){
      console.error("수입검사 대기 목록 로딩 실패", error);
    }
  };

function refreshPage() {
  location.reload()
  loadData()
};
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
            <label for="date" class="form-label search-label">수입일자</label>
            <div class="date-input-wrapper">
              <input type="date" id="date" class="form-control" max="2039-12-31" min="2000-01-01">
            </div>
          </div>
            <!-- 버튼 -->
            <div class="col-md-2 d-flex align-items-end gap-2">
              <button class="btn btn-outline-secondary w-50" @click="resetFilter">초기화</button>
              <button class="btn btn-primary w-50" @click="searchLotHistoryList">조회</button>
            </div>
          </div>
        </div>

        <!-- 3. 테이블 영역 -->
        <tabulator-card 
          ref="checkTableCard" 
          card-title="수입검사 대기 목록" 
          :table-data="matcheckData"
          :table-columns="materialColumns" 
          :tabulator-options="{ selectableRows : 1 }" 
          height="800px"
        >
          <template #actions>
            <ArgonButton class="check" color="success" variant="gradient" @click="startCheck" v-if="canShow(['0c3c', '0c5c'])">
              수입검사
            </ArgonButton>
          </template>
        </tabulator-card>

      </div>
    </div>
  </div>

  <!-- 모달은 템플릿의 최상위 레벨에 두는 것이 일반적입니다. -->
  <MatCheckModal 
    :isOpen="isTestModalOpen" 
    :checkData="selectedMaterial" 
    :userInfo="userInfo"
    @close="isTestModalOpen = false" 
    @refresh="refreshPage" 
  />
</template>
<style scoped>

.date-input-wrapper {
  position: relative;
}

/* .date-input-wrapper::after {
  content: '📅';
  font-size: 1.2rem;
  color: #adb5bd;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none; 
} */

.date-input-wrapper input[type="date"]::-webkit-calendar-picker-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  opacity: 0; 
  cursor: pointer;
}
.form-label {
  font-size: large;
  margin: 10px;
  margin-top: 12px;
}
.mb-3 {
  height: 120px;
}
.form-control {
  margin-left: 5px;
}
.search-label {
  font-size: medium;
  margin: 5px;
}
.full-height {
  height: 840px;
  display: flex;
  flex-direction: column;
}
.check {
  width: 170px;
}
</style>