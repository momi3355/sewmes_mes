<script setup>
import axios from 'axios';
import { ref } from 'vue';
import TabulatorCard from '@/examples/Cards/TabulatorCard.vue';
import { useRouter } from 'vue-router';

const productTableRef = ref(null);

const searchProdCategory = ref('');
const searchProdName = ref('');
const selectedProdCode = ref('');
const selectedProdName = ref('');
const selectedImage = ref(null);

const prodData = ref([]);
const processList = ref([]);

// 제품 목록 조건에 따른 검색
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

const productColumns = [
  { title: "No", field: "rowNum", width: 80 },
  { title: '품번', field: 'prodCode', width: 150 },
  { title: '품명', field: 'prodName', width: 250 },
  { title: '카테고리', field: 'category', width: 150 }
];

const allowedNames = ['프린트', '자수'];
const processColumns = [
  { title: "No", field: "rowNum", width: 80, headerSort: false },
  {
    title: '공정번호',
    field: 'processCode',
    editor: "input",
    width: 120
  },
  {
    title: '공정이름',
    field: 'processName',
    editor: "input",
    width: 150
  },
  {
    title: '상세',
    field: 'detail',
    editor: "input",
    width: 200
  },
  {
    title: '이미지',
    field: 'image',
    formatter: (cell) => {
      const row = cell.getData();
      const name = row.processName;
      if (allowedNames.includes(name)) {
        return `<button class="btn btn-sm btn-secondary upload-btn" style="margin-bottom:0">등록</button>`;
      }
      return '';
    },
    cellClick: (e, cell) => {
      const row = cell.getData();
      if (allowedNames.includes(row.processName)) {
        if (!row.flowCode) {
          alert("먼저 저장 버튼을 눌러 공정을 저장한 후 이미지 등록이 가능합니다.");
          return;
        }
        onImageUploadClick(row.flowCode);
      }
    },
    width: 100
  },
    {
    title: '순서',
    field: 'processSeq',
    editor: "input",
    width: 100
  }
];
// 초기화 버튼 클릭 시 검색조건 입력란 비움움
const resetProductFilter = () => {
  searchProdName.value = '';
  searchProdCategory.value = '';
};
// prod_code를 기준으로 공정흐름 목록 가져오기기
const loadProcesses = async () => {
  if (!selectedProdCode.value) return;
  try {
    const result = await axios.get(`/api/flowList?prodCode=${selectedProdCode.value}`);
    const flows = Array.isArray(result.data) ? result.data : [];
    const converted = flows.map((f, idx) => ({
      rowNum: idx + 1,
      flowCode: f.flow_code,
      processCode: f.process_code,
      processName: f.process_name,
      detail: f.detail,
      image: '',
      processSeq: f.process_seq
    }));
    while (converted.length < 10) {
      converted.push({  
                        rowNum: converted.length + 1,
                        flowCode: '',     
                        processCode: '',
                        processName: '',
                        detail: '',
                        image: '',
                        rowNum: converted.length + 1
                      });
    }
    processList.value = converted;
  } catch (err) {
    console.error("공정 불러오기 오류:", err);
  }
};

const processTableRef = ref(null); // ref 등록

const onRowMoved = () => {
  const table = processTableRef.value?.getInstance();
  if (!table) return;

  const newData = table.getData();
  const cleaned = newData.filter(row => row.processCode);
  const reordered = cleaned.map((item, idx) => ({
    ...item,
    rowNum: idx + 1,
    processSeq: idx + 1,
  }));

  while (reordered.length < 10) {
    reordered.push({ processCode: '', processName: '', detail: '', image: '', rowNum: reordered.length + 1 });
  }

  processList.value = reordered;
};
// 공정흐름 한번에 저장장
const saveProcesses = async () => {
  try {
    const flows = processList.value
      .filter(p => p.processCode && p.processSeq)  // 필수 값만
      .map((row, idx) => ({
        flowCode: row.flowCode || null, // 기존 있던 flowCode 유지
        processCode: row.processCode,
        processSeq: Number(row.processSeq)
      }));

    await axios.post('/api/flowSave', {
      prodCode: selectedProdCode.value,
      flows
    });
    await loadProcesses();
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
// 공통코드 변환환
const convertCode = (code) => {
  switch (code) {
    case '0j1j': return '상의';
    case '0j2j': return '하의';
    default: return code;
  }
};
// flow_code를 외래키로 하여 t_process_flow_attach 테이블에 이미지 저장장
const onImageUploadClick = async (flowCode) => {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';

  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('flowCode', flowCode);

    try {
      await axios.post('/api/flowImageUpload', formData);
      alert('이미지 업로드 완료');
    } catch (err) {
      console.error('업로드 실패:', err);
    }
  };

  fileInput.click();
};
const tabulatorEvent = [
  {
    eventName: "rowDblClick",
    eventAction: 
      async (e, row) => {
      const data = row.getData();
      selectedProdCode.value = data.prodCode;
      selectedProdName.value = data.prodName;
      await loadProcesses();

      const tableInstance = productTableRef.value?.$el?.querySelector('.tabulator')?.__tabulator__;
      if (tableInstance) {
        tableInstance.redraw(true);
      }
    }
  },
  {
    eventName: "rowMoved",
    eventAction: onRowMoved
  },
  {
    eventName: "rowClick", // 행 클릭 시 flow_code를 기준으로 이미지 불러오기기
    eventAction: 
    async (e, row) => {
      const rowData = row.getData();

      if (!allowedNames.includes(rowData.processName)) return;
      
      if (!rowData.flowCode) {
        selectedImage.value = null;
        return;
      }
      try {
        const url = `/api/flowImage/${rowData.flowCode}?t=${Date.now()}`; // 캐시 방지용 타임스탬프
        selectedImage.value = url;
      } catch (err) {
        console.error("이미지 불러오기 실패", err);
        selectedImage.value = null;
      }
    }
  },

];

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
          :on="tabulatorEvent"
        />
        <div v-if="selectedProdCode" class="text-danger mt-1">선택 제품: {{ selectedProdName }}</div>
      </div>

      <div class="col-md-6 d-flex flex-column">
        <tabulator-card
          card-title="공정순서"
          :table-data="processList"
          :table-columns="processColumns"
          :on="tabulatorEvent"
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
