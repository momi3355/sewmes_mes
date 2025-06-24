<!--예약 자재 재고 조회-->
<script setup>
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { ref, onMounted } from "vue"; // Import ref and onMounted
import axios from "axios";


import ArgonButton from "@/components/ArgonButton.vue";

import DefaultInfoCard from "@/examples/Cards/DefaultInfoCard.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import Swal from "sweetalert2";

const searchField1 = ref('');
const searchField2 = ref('');
const searchField3 = ref('');
const searchMaterialType = ref('');

const holdListCard = ref(null);
const materialData = ref([]);



const materialColumns = [
  { title: "자재코드", field: "material_code", hozAlign: "left" },
  { title: "자재명", field: "material_name", hozAlign: "left"},
  // { title: "LOT", field: "lot_code",  hozAlign: "left"},
  { title: "자재유형", field: "material_type",  hozAlign: "left"},
  { title: "홀드수량", field: "hold_qty", hozAlign: "left"},
  { title: "출고수량", field: "release_qty", hozAlign: "left"},
  { title: "단위", field: "unit", hozAlign: "left"},
  // { title: "입고일자", field: "inbound_date", hozAlign: "left"},
  { title: "완료여부", field: "use_yn", hozAlign: "left"},
];


// 선택된 행들을 처리하는 함수
const handleMatRowClick = (e, row) => {
  console.log("Row clicked:", row.getData());
};

const deleteSelectedHolds = async () => {
  const tabulatorInstance = getTabulatorInstance(holdListCard);
  if(!tabulatorInstance){
    alert("테이블 인스턴스를 찾을 수 없음.");
    return;
  }

  const selectedRows = tabulatorInstance.getSelectedRows();
  if(selectedRows.length === 0){
    Swal.fire({
      title: "필수 입력 항목",
      text: "삭제할 항목을 선택해주세요.",
      icon: "error"
    });
    return;
  }

  const holdIdsToDelete = selectedRows.map(row => row.hold_id);
  if(!confirm(`${holdIdsToDelete.length}개의 항목을 정말 삭제하시겠습니까?`)){
    return;
  }
  try{
    const response = await
    axios.post('/api/material/hold/delete', {
      ids: holdIdsToDelete
    });
    alert(response.data.message);
    fetchHoldList();
  } catch(error){
    console.error("삭제 실패: ", error);
    alert("사용중인 자재는 삭제할 수 없습니다.");
  }
};

const fetchHoldList = async () => {
  try{
    const response = await axios.get("/api/material/hold");
    materialData.value = response.data;
  } catch(error){
    console.error("홀드 목록 조회 실패", error);
  }
};

const getTabulatorInstance = (refInstance) => {
  if(!refInstance.value || !refInstance.value.$el) return null;
  const element = refInstance.value.$el.querySelector('.tabulator');
  return Tabulator.findTable(element)?.[0] || null;
};

// 선택된 행들을 가져오는 함수
const getSelectedRows = (tableRef) => {
  if (tableRef) {
    const selectedRows = tableRef.getRows().filter(row => row.getData().selected);
    console.log("Selected rows:", selectedRows.map(row => row.getData()));
    return selectedRows;
  }
};

onMounted(() => {
  fetchHoldList();
});

</script>

<template>
  <div class="container-fluid p-3 full-height">
    <div class="search-area bg-white rounded p-3 mb-3 shadow-sm">
      <div class="row">
        <!-- 상단 검색 영역 -->
        <div class="col-md-2">
          <label class="form-label search-label">자재명</label>
          <input type="text" class="form-control" v-model="searchField1">
        </div>
        <!-- '수입일자'를 '자재유형' 드롭다운으로 변경 -->
        <div class="col-md-2">
          <label for="material-type" class="form-label search-label">자재유형</label>
          <select id="material-type" class="form-control" v-model="searchMaterialType">
            <option value="">전체</option>
            <option value="원자재">원자재</option>
            <option value="부자재">부자재</option>
            <option value="소모품">소모품</option>
          </select>
        </div>
        
        <div class="col-md-2 d-flex align-items-end gap-2">
          <button class="btn btn-outline-secondary w-50">초기화</button>
          <button class="btn btn-primary w-50">조회</button>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <!-- 
          수정된 부분: 
          1. 버튼을 TabulatorCard 안으로 옮깁니다.
          2. <template #actions>로 감싸줍니다.
        -->
        <tabulator-card
          ref="holdListCard"
          card-title="예약 자재 목록"
          :table-data="materialData"
          :table-columns="materialColumns"
          :tabulator-options="tabulatorEvent"
          style="height: 800px;"
          height="700px"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-label {
  font-size: medium;
}
</style>