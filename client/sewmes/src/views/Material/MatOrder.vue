<!--자재 발주서 -->
<script setup>
import { ref, onMounted } from "vue";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import axios from "axios";
import Swal from 'sweetalert2';

import ArgonButton from "@/components/ArgonButton.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";

// --- 1. 상태(State) 정의 ---
const searchField1 = ref('');
const searchField2 = ref('');
const searchMaterialType = ref('');

const materialData = ref([]);
const productData = ref([]); // '발주 요청서' 테이블의 데이터
const companyList = ref([]);  // 공급처 목록
const materialTableCard = ref(null);
const productTableCardRef = ref(null); // '발주 요청서' 테이블을 감싸는 카드 컴포넌트의 ref

// --- 2. Tabulator 컬럼 정의 (가장 안정적인 일반 상수 형태) ---

const resetSearch = () => {
  searchField1.value = '';
  searchField2.value = '';
  searchMaterialType.value = '';

  fetchMaterials();
}

const materialColumns = [
  { formatter: "rowSelection", titleFormatter: "rowSelection", hozAlign: "center",
    headerSort: false, width: 60, cellClick: (e, cell) => cell.getRow().toggleSelect() },
  { title: "자재코드", field: "material_code", width: 150 },
  { title: "자재명", field: "material_name" },
  { title: "자재유형", field: "material_type" },
  { title: "현재고", field: "current_stock" },
];

const productColumns = [
  { formatter: "rowSelection", titleFormatter: "rowSelection", hozAlign: "center",
    headerSort: false, width: 60, cellClick: (e, cell) => cell.getRow().toggleSelect() },
  { title: "자재명", field: "material_name", width: 250 },
  { title: "단위", field: "unit", width: 80 },
  { 
    title: "주문수량", 
    field: "order_qty", 
    width: 150, hozAlign: "left", 
    editor: "input",
    cellEdited: (cell) => {
      const data = cell.getRow().getData();
      cell.getRow().getCell("total_price").setValue((Number(data.order_qty) || 0) * (Number(data.unit_price) || 0));
    }
  },
  { 
    title: "단가", 
    field: "unit_price", 
    width: 120, hozAlign: "left", 
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
    width: 160, hozAlign: "left", 
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
    const response = await axios.get('/api/matorderview');
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
    Swal.fire({
      title: "",
      text: "추가할 자재를 선택하십시오",
      icon: "error"
    });
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
     Swal.fire({
      title: "",
      text: "이미 추가된 자재입니다.",
      icon: "error"
    });
  }
  materialTableInstance.deselectRow();
};

const delOrder = async () => {
  const productTableInstance = getTabulatorInstance(productTableCardRef);
  if (!productTableInstance) return;
  const selectedData = productTableInstance.getSelectedRows();
  if (selectedData?.length > 0) {
    selectedData.forEach(e => {
      if (e.getData()) {
        const row = productData.value.filter(el => el.material_name !== e.getData().material_name);
        if (row) productData.value = row;
      }
    });
  }
};

const saveOrder = async () => {
  const productTableInstance = getTabulatorInstance(productTableCardRef);
  if (!productTableInstance) return;
  
  // Tabulator에서 현재 데이터를 직접 가져옵니다.
  const currentTableData = productTableInstance.getData();
  if (currentTableData.length === 0) {
    Swal.fire({
      title: "필수 입력 항목",
      text: "저장할 발주 요청서가 없습니다.",
      icon: "error"
    });
    return;
  }
  
  // 유효성 검사
  for (const row of currentTableData) {
    if (!row.order_qty || !row.unit_price || !row.deadline || !row.company) {
      Swal.fire({
        title: "필수 입력 항목",
        text: "주문수량, 단가, 납기일자, 공급처을 입력해주세요.",
        icon: "error"
      });
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
  
  //console.log(processedData);
  const response = await axios.post('/api/matorder/save', processedData);
  if (response?.status === 200) {
    Swal.fire({
      title: "성공",
      text: "자재 발주 되었습니다.",
      icon: "success"
    });
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
  <!-- ✨ 1. 모든 검색 요소를 이 하나의 row 안에 넣습니다. -->
  <div class="row searchbox mb-3 align-items-end">
    
    <!-- 자재코드 -->
    <div class="col-md-2">
      <label class="form-label">자재코드</label>
      <input type="text" class="form-control" v-model="searchField1">
    </div>
    
    <!-- 자재명 -->
    <div class="col-md-2">
      <label class="form-label">자재명</label>
      <input type="text" class="form-control" v-model="searchField2">
    </div>

    <!-- 자재유형 -->
    <div class="col-md-2">
      <label for="material-type-select" class="form-label">자재유형</label>
      <select id="material-type-select" class="form-control" v-model="searchMaterialType">
        <option value="">전체</option>
        <option value="0b1b">원자재</option>
        <option value="0b1b">부자재</option>
      </select>
    </div>

    <!-- ✨ 2. 버튼 영역도 같은 row 안으로 이동시킵니다. -->
    <div class="col-md-auto">
      <button class="btn btn-secondary me-2" @click="resetSearch">초기화</button>
      <button class="btn btn-primary">조회</button>
    </div>
    </div>
  </div> <!-- ✨ <div class="row ..."> 가 여기서 끝납니다. -->
  
  <div class="row mt-4">
          <div class="col-lg-12">
            <tabulator-card
              ref="materialTableCard"
              card-title="공급필요 자재 목록"
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
                  <button class="btn btn-secondary" @click="delOrder">삭제</button>
                  <button class="btn btn-success" @click="saveOrder">저장</button>
                </template>
              </tabulator-card>
            </div>
          </div>
        </div>
      </div>
</template>
<style scoped>
.searchbox {
  background-color: #ffffff;
  border-radius: 1rem;
  margin-left: 0px;
  margin-right: 3px;
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
  margin-left: 10px;
}
.btn-success {
  margin-left: 10px;
}
.form-label {
  font-size: large;
  margin-bottom: 15px;
}
.mb-3 {
  height: 120px;
  margin-right: 22px;
}
.form-control {
  margin-left: 5px;
}
.btn.btn-secondary.me-2 {
  margin: 13px;
}  
.btn.btn-primary {
  margin: 13px;
}
.col-md-2 {
  padding-bottom: 20px;
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