<!--자재 발주서 -->
<script setup>
import { ref, onMounted } from "vue";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import axios from "axios";

import ArgonButton from "@/components/ArgonButton.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";

// --- 1. 상태(State) 정의 ---
const materialData = ref([]);
const productData = ref([]); // '발주 요청서' 테이블의 데이터
const companyList = ref([]);  // 공급처 목록
const materialTableCard = ref(null);
const productTableCardRef = ref(null); // '발주 요청서' 테이블을 감싸는 카드 컴포넌트의 ref

// --- 2. Tabulator 컬럼 정의 (가장 안정적인 일반 상수 형태) ---

const materialColumns = [
  { formatter: "rowSelection", titleFormatter: "rowSelection", hozAlign: "center", headerSort: false, width: 60, cellClick: (e, cell) => cell.getRow().toggleSelect() },
  { title: "자재코드", field: "material_code", width: 150 },
  { title: "자재명", field: "material_name" },
  { title: "자재유형", field: "material_type" },
  { title: "현재고", field: "current_stock" },
];

const productColumns = [
  { title: "자재명", field: "material_name", width: 250 },
  { title: "단위", field: "unit", width: 80 },
  { 
    title: "주문수량", 
    field: "order_qty", 
    width: 150, hozAlign: "right", 
    editor: "input",
    cellEdited: (cell) => {
      const data = cell.getRow().getData();
      cell.getRow().getCell("total_price").setValue((Number(data.order_qty) || 0) * (Number(data.unit_price) || 0));
    }
  },
  { 
    title: "단가", 
    field: "unit_price", 
    width: 120, hozAlign: "right", 
    editor: "input", 
    formatter: "money", 
    formatterParams: { symbol: "₩", precision: 0 },
    cellEdited: (cell) => {
      const data = cell.getRow().getData();
      cell.getRow().getCell("total_price").setValue((Number(data.order_qty) || 0) * (Number(data.unit_price) || 0));
    }
  },
  { 
    title: "합계", 
    field: "total_price", 
    width: 160, hozAlign: "right", 
    formatter: "money", 
    formatterParams: { symbol: "₩", precision: 0 }
  },
  { 
    title: "공급처", 
    field: "company", 
    editor: "list",
    formatter: (cell) => {
      const value = cell.getValue();
      const company = companyList.value.find(c => c.cp_code === value);
      return company ? company.cp_name : value;
    },
    // 초기 옵션은 비워두고, 나중에 동적으로 채웁니다.
    editorParams: { values: [], autocomplete: true, listOnEmpty: true, freetext: true }
  },
  { title: "발주일자", field: "order_date" },
  { title: "납기일자", field: "deadline", editor: "date" },
];

// --- 3. 라이프사이클 훅 ---
onMounted(() => {
  fetchMaterials();
  fetchCompanies();
});

// --- 4. 메소드(함수) 정의 ---

// Tabulator 인스턴스를 가져오는 헬퍼 함수
const getTabulatorInstance = (refInstance) => {
  if (!refInstance.value || !refInstance.value.$el) return null;
  const element = refInstance.value.$el.querySelector('.tabulator');
  if (!element) return null;
  return Tabulator.findTable(element)[0] || null;
};

const fetchMaterials = async () => {
  try {
    const response = await axios.get('/api/matorder');
    materialData.value = Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("자재 목록 로딩 오류", error);
    materialData.value = [];
  }
};

const fetchCompanies = async () => {
  try {
    const response = await axios.get('/api/companies');
    companyList.value = response.data;
    // 데이터를 가져온 후, 컬럼 에디터를 업데이트합니다.
    updateCompanyColumnEditor();
  } catch (error) {
    console.error("공급처 목록 로딩 실패", error);
  }
};

const addSelectedMaterials = () => {
  const materialTableInstance = getTabulatorInstance(materialTableCard);
  if (!materialTableInstance) return;
  const selectedData = materialTableInstance.getSelectedData();
  if (selectedData.length === 0) {
    alert("추가할 자재를 선택해주세요");
    return;
  }
  const newProducts = selectedData
    .filter(material => !productData.value.some(p => p.material_code === material.material_code))
    .map(material => ({
       material_code: material.material_code,
       material_name: material.material_name,
       unit: material.unit || '',
       order_qty: 1,
       unit_price: material.unit_price || 0,
       total_price: (1 * (material.unit_price || 0)),
       color: material.color || '',
       company: '',
       order_date: new Date().toISOString().split('T')[0],
       deadline: ''
    }));

  if (newProducts.length > 0) {
    // ✨ Vue의 반응형 데이터를 직접 수정합니다.
    productData.value.push(...newProducts);
  } else if (selectedData.length > 0) {
    alert("이미 추가된 자재입니다.");
  }
  materialTableInstance.deselectRow();
};

const saveOrder = async () => {
  const productTableInstance = getTabulatorInstance(productTableCardRef);
  if (!productTableInstance) return;
  
  // Tabulator에서 현재 데이터를 직접 가져옵니다.
  const currentTableData = productTableInstance.getData();
  if (currentTableData.length === 0) {
    alert("저장할 발주 요청서가 없습니다.");
    return;
  }
  
  // 유효성 검사
  for (const row of currentTableData) {
    if (!row.order_qty || !row.unit_price || !row.deadline || !row.company) {
      alert(`'${row.material_name}'의 모든 필수 항목(주문수량, 단가, 납기일자, 공급처)을 입력/선택해주세요.`);
      return;
    }
  }
  
  const processedData = currentTableData.map(p => ({
    material_code: p.material_code,
    deadline: p.deadline,
    cp_code: p.company,
    unit_price: p.unit_price,
    total_price: Number(p.order_qty) * Number(p.unit_price),
    order_qty: p.order_qty,
  }));

  try {
    const response = await axios.post('/api/matorder/save', processedData);
    alert(response.data.message);

    const orderedMaterialCodes = processedData.map(p => p.material_code);
    materialData.value = materialData.value.filter(material => !orderedMaterialCodes.includes(material.material_code));
    productData.value = []; // 이 데이터를 비우면, :table-data 바인딩에 의해 테이블이 비워집니다.
  } catch (error) {
    console.error("저장 실패:", error);
    alert(error.response?.data?.message || "저장에 실패했습니다.");
  }
};

const updateCompanyColumnEditor = () => {
  const tabulatorInstance = getTabulatorInstance(productTableCardRef);
  if (!tabulatorInstance) {
    // 인스턴스가 아직 준비되지 않았으면, 100ms 후에 다시 시도합니다.
    setTimeout(updateCompanyColumnEditor, 100);
    return;
  }
  const column = tabulatorInstance.getColumn("company");
  if (!column) return;

  const newOptions = companyList.value.map(c => ({ label: c.cp_name, value: c.cp_code }));
  column.updateDefinition({
    editorParams: { values: newOptions, autocomplete: true, listOnEmpty: true, freetext: true }
  });
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
              ref="productTableCardRef"
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