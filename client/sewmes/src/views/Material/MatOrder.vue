<!--자재 발주서 -->
<script setup>
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { ref, onMounted } from "vue"; // Import ref and onMounted
import axios from "axios";

import ArgonButton from "@/components/ArgonButton.vue";
import DefaultInfoCard from "@/examples/Cards/DefaultInfoCard.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";


const searchField1 = ref('');
const searchField2 = ref('');
const materialData = ref([]);
const productData = ref([]);

let materialTabulatorInstance = null;
const materialTableCard = ref(null);

// 추가 버튼 클릭하면 실행
const addSelectedMaterials = () => {
  console.log("추가 버튼 클릭됨");
  
  if(!materialTableCard.value || !materialTableCard.value.$el){
    console.error("컴포넌트의 참조를 찾을 수 없음.");
    return;
  }
  
  const tabulatorElement = materialTableCard.value.$el.querySelector('.tabulator');
    if(!tabulatorElement){
      console.error("Tabulator에서 '.tabulator' 클래스 요소를 찾을 수 없음");
      return;
    }

  const tabulatorInstance = Tabulator.findTable(tabulatorElement)[0];
    if(!tabulatorInstance){
      console.error("Tabulator 인스턴스를 찾을 수 없음");
      return;
    }
    console.log("Tabulator 인스턴스를 성공적으로 찾음", tabulatorInstance);

  const selectedData = tabulatorInstance.getSelectedData();
  if (selectedData.length === 0) {
      alert("추가할 자재를 선택해주세요");
      return;
    }
    console.log("선택된 자재 데이터: ", selectedData);
  
  const newProducts = selectedData
    .filter(material => !productData.value.some(p => p.material_code === material.material_code))
    .map(material => ({
      material_code: material.material_code,
      material_name: material.material_name,
      unit: material.unit || '',
      order_qty: 1,
      unit_price: material.unit_price || '0',
      total_price: (1 * (material.unit_price || 0)),
      color: material.color || '',
      size: '',
      company: '',
      order_date: new Date().toISOString().split('T')[0],
      deadline: ''
    }));
    if(newProducts.length > 0){
      productData.value.push(...newProducts);
    } else if(selectedData.length > 0){
      alert("이미 추가된 자재입니다.");
    }

    tabulatorInstance.deselectRow();
};

onMounted(() => {
  fetchMaterials();
});

const fetchMaterials = async() => {
  try{
    const response = await
    axios.get('/api/matorder');
    materialData.value = response.data;
    console.log(response.data);
    console.log("자재 목록 로딩 성공");
  } catch(error){
    console.error("자재 목록 로딩 오류", error);
  }
};

const materialColumns = [
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
  { title: "자재코드", field: "material_code", width: 150, editor: "input" },
  { title: "자재명", field: "material_name", hozAlign: "left"},
  { title: "자재유형", field: "material_type", hozAlign: "left"},
  { title: "재고량", field: "stock", hozAlign: "left"},
];

const productColumns = [
  { title: "자재명", field: "material_name", width: 250 },
  { title: "단위", field: "unit", width: 80 },
  { 
    title: "주문수량", 
    field: "order_qty", 
    width: 150, hozAlign: "left", 
    editor: "input",
    cellEdited: function(cell) {
      const row = cell.getRow();
      const data = row.getData();
      const orderQty = Number(data.order_qty) || 0;
      const unitPrice = Number(data.unit_price) || 0;
      row.getCell("total_price").setValue(orderQty * unitPrice);
    }
  },
  { 
    title: "단가", 
    field: "unit_price", 
    width: 120, hozAlign: "left", 
    editor: "input", 
    formatter:"money", formatterParams:{
      symbol:"₩",
      thousand: ",",
      precision: 0,
      decimal: ".",
    },
    cellEdited: function(cell) {
      const row = cell.getRow();
      const data = row.getData();
      const orderQty = Number(data.order_qty) || 0;
      const unitPrice = Number(data.unit_price) || 0;
      row.getCell("total_price").setValue(orderQty * unitPrice);
    }
  },
  { 
    title: "합계", 
    field: "total_price", 
    width: 160, hozAlign: "left", 
    formatter:"money", formatter:"money", 
    formatterParams:{
      symbol:"₩",
      thousand: ",",
      precision: 0,
      decimal: ".",
    },
  },
  { title: "공급처", field: "company", editor: "input" },
  { title: "발주일자", field: "order_date" },
  { title: "납기일자", field: "deadline", editor: "date" },
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

// 저장 버튼 클릭 시 실행될 함수 (유효성 검사 강화)
const saveOrder = async () => {
  // ✨ 1. 유효성 검사를 함수의 가장 앞으로 이동
  if (productData.value.length === 0) {
    alert("저장할 발주 요청서가 없습니다.");
    return; // 함수 즉시 종료
  }

  // 필수 입력 항목에 대한 유효성 검사도 추가 (권장)
  const isInvalid = productData.value.some(p => 
    !p.order_qty || !p.unit_price || !p.company || !p.deadline
  );
  if (isInvalid) {
    alert("주문수량, 단가, 공급처, 납기일자는 필수 입력 항목입니다.");
    return;
  }

  // ✨ 2. 'processedData'를 올바르게 정의
  // (서버로 보내기 전에 합계 등을 다시 계산하는 안정적인 데이터)
  const processedData = productData.value.map(p => ({
    ...p,
    total_price: Number(p.order_qty) * Number(p.unit_price)
  }));

  try {
    // ✨ 3. 백엔드 API 경로 수정 ('/api' 추가) 및 올바른 데이터 전송
    const response = await axios.post('/api/matorder/save', processedData);
    
    // 성공 메시지 출력
    alert(response.data.message);

    // ✨ 4. orderedMaterialCodes 생성 시 올바른 속성 이름(material_code) 사용
    const orderedMaterialCodes = processedData.map(p => p.material_code);
    
    // 목록에서 저장된 자재 제거
    materialData.value = materialData.value.filter(material => 
      !orderedMaterialCodes.includes(material.material_code)
    );
    
    // 발주 요청서 테이블 비우기
    productData.value = [];

  } catch (error) {
    // API 호출 실패 시 에러 처리
    console.error("저장 실패:", error);
    alert(error.response?.data?.message || "저장에 실패했습니다. 서버 로그를 확인해주세요.");
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
        <input type="text" class="form-control" v-model="searchField1">
      </div>
      <div class="col-md-2">
        <label class="form-label">자재코드</label>
        <input type="text" class="form-control" v-model="searchField2">
      </div>
      <div class="col-md-2 d-flex align-items-end">
        <button class="btn btn-secondary me-2">초기화</button>
        <button class="btn btn-primary">조회</button>
      </div>
    </div>
        <div class="row mt-4">
          <div class="col-lg-12">
            <tabulator-card
              ref="materialTableCard"
              card-title="공급할 자재 목록"
              :table-data="materialData"
              :table-columns="materialColumns"
              :tabulator-options="{
                apginationSize: 7,
                rowClick: handleMatRowClick,
              }"
            />
              <div class="button-container">
                <ArgonButton 
                  class="addbutton"
                  color="info" 
                  variant="gradient"
                  @click="addSelectedMaterials"
                >
                  추가
                </ArgonButton>
              </div>
          </div>
            <div class="col-12 mt-4">
              <tabulator-card
                card-title="발주 요청서 작성"
                :table-data="productData"
                :table-columns="productColumns"
              >
               <template #actions>
  <!-- 기존 ArgonButton은 잠시 주석 처리 -->
  <!-- 
  <ArgonButton class="savebtn" color="success" variant="gradient" @click="saveOrder">
    저장
  </ArgonButton> 
  -->

  <!-- ✨ 테스트를 위해 일반 button 태그로 변경 -->
  <button class="btn btn-success" @click="saveOrder">
    저장
  </button>
</template>
              </tabulator-card>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>
<style scoped>
.searchbox {
  background-color: #ffffff;
  border-radius: 1rem;
  margin: 30px;
}

.btn {
  padding: 10px;
  margin: 0;
}

.btn.btn-secondary.me-2 {
  margin-right: 10px;
}

.button-container {
  display: flex;
  justify-content: center;
}

.addbutton {
  width: 140px;
  margin-top: 25px;
}
.savebtn {
  width: 70px;
  margin-top: 25px;
}
</style>