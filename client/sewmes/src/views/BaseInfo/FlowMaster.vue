<script setup>
import axios from 'axios';
import { ref } from 'vue';
import TabulatorCard from '@/examples/Cards/TabulatorCard.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const productTableRef = ref(null);

// 필터 영역
const searchProdCategory = ref('');
const searchProdName = ref('');
// 공정 흐름 선택 영역역
const selectedProdCode = ref('');
const selectedProdName = ref('');
const selectedImage = ref(null);

const prodData = ref([]);
const processList = ref([]);

// 제품 조건 검색
const searchProduct = async () => {
  const params = {};
  if (searchProdCategory.value.trim()) params.cate = searchProdCategory.value.trim();
  if (searchProdName.value.trim()) params.name = searchProdName.value.trim();

  try {
    const result = await axios.get('/api/productList', { params });
    prodData.value = result.data.map((item, idx) => ({
      rowNum: idx + 1,
      prodCode: item.prod_code,
      prodName: item.prod_name,
      category: convertCode(item.category)
    }));
  } catch (err) {
    console.error("API 호출 오류:", err);
  }
};

const productRowFormatter = (row) => {
  const element = row.getElement();
  if (row.getData().prodCode === selectedProdCode.value) {
    element.style.backgroundColor = '#ffe5e5';
    element.style.color = '#d00000';
    element.style.fontWeight = 'bold';
  } else {
    element.style.backgroundColor = '';
    element.style.color = '';
    element.style.fontWeight = '';
  }
};

const productColumns = [
  { title: "No", field: "rowNum", width: 80 },
  { title: '품번', field: 'prodCode', width: 150 },
  { title: '품명', field: 'prodName', width: 250 },
  { title: '카테고리', field: 'category', width: 150 }
];

const processColumns = [
  { title: '공정번호', field: 'processCode', width: 120 },
  { title: '공정이름', field: 'processName', width: 150 },
  { title: '상세', field: 'detail', width: 200 },
  {
    title: '이미지',
    field: 'image',
    formatter: () => '<button class="btn btn-sm btn-secondary">등록</button>',
    width: 100
  }
];

const resetProductFilter = () => {
  searchProdName.value = '';
  searchProdCategory.value = '';
};

const onProductClick = async (e, row) => {
  const data = row.getData();
  selectedProdCode.value = data.prodCode;
  selectedProdName.value = data.prodName;
  await loadProcesses();

  const tableInstance = productTableRef.value?.$el?.querySelector('.tabulator')?.__tabulator__;
  if (tableInstance) {
    tableInstance.redraw(true);
  }
};

const loadProcesses = async () => {
  if (!selectedProdCode.value) return;
  try {
    const result = await axios.get(`/api/flowList?prodCode=${selectedProdCode.value}`);
    const flows = result.data || [];
    const padded = [...flows];
    while (padded.length < 7) {
      padded.push({ processCode: '', processName: '', detail: '', image: '' });
    }
    processList.value = padded;
  } catch (err) {
    console.error("공정 불러오기 오류:", err);
  }
};

const saveProcesses = async () => {
  try {
    const validList = processList.value.filter(p => p.processCode);
    await axios.post('/api/flowSave', {
      prodCode: selectedProdCode.value,
      flows: validList.map((f, idx) => ({
        ...f,
        processSeq: idx + 1
      }))
    });
    alert('저장 완료');
  } catch (err) {
    console.error("저장 오류:", err);
  }
};

const deleteSelected = async () => {
  if (!selectedProdCode.value) return;
  try {
    await axios.delete(`/api/flowDelete/${selectedProdCode.value}`);
    alert('삭제 완료');
    processList.value = [];
  } catch (err) {
    console.error("삭제 오류:", err);
  }
};

const convertCode = (code) => {
  switch (code) {
    case '0j1j': return '상의';
    case '0j2j': return '하의';
    default: return code;
  }
};
</script>

<template>
  <div class="container-fluid p-3">
    <div class="row search-color">
      <div class="row mb-2">
        <div class="col-md-2">
          <label class="form-label">제품 카테고리</label>
          <select class="form-select" v-model="searchProdCategory">
            <option value="">선택안함</option>
            <option value="0j1j">상의</option>
            <option value="0j2j">하의</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label">제품명 포함 단어</label>
          <input type="text" class="form-control" v-model="searchProdName">
        </div>
        <div class="col-md-2 d-flex align-items-end">
          <button class="btn btn-primary me-2" @click="searchProduct">조회</button>
          <button class="btn btn-secondary" @click="resetProductFilter">초기화</button>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6 d-flex flex-column">
        <tabulator-card
          ref="productTableRef"
          card-title="제품목록"
          :table-data="prodData"
          :table-columns="productColumns"
          :tabulator-options="{
            rowDblClick: onProductClick,
            rowFormatter: productRowFormatter
          }"
        />
      </div>

      <div class="col-md-6 d-flex flex-column">
        <tabulator-card
          card-title="공정순서"
          :table-data="processList"
          :table-columns="processColumns"
          :tabulator-options="{ movableRows: true }"
        />
        <div class="d-flex justify-content-between mt-2 mb-2">
          <button class="btn btn-success" @click="loadProcesses">불러오기</button>
          <div>
            <button class="btn btn-primary me-2" @click="saveProcesses">저장</button>
            <button class="btn btn-danger" @click="deleteSelected">삭제</button>
          </div>
        </div>
        <div class="mt-3 flex-grow-1">
          <label class="form-label">이미지 보기</label>
          <div class="border" style="height: 200px; background: #eee">
            <img v-if="selectedImage" :src="selectedImage" style="max-height: 100%; max-width: 100%" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn {
  min-width: 80px;
}
.search-color {
  margin: 10px;
  padding: 20px;
  border-radius: 15px;
  background-color: #FFF;
}
.flex-grow-1 {
  flex-grow: 1;
}
</style>
