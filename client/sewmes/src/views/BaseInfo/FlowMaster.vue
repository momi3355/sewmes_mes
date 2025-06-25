<script setup>
import axios from 'axios';
import { onBeforeMount, ref, onMounted } from 'vue';
import { useStore } from "vuex";
import TabulatorCard from '@/examples/Cards/TabulatorCard.vue';
import ProcessSearchModal from "./ProcessSearchModal.vue";
import groupcodelist from "../../assets/js/utils/groupcodelist";
import Swal from 'sweetalert2';

const productTableRef = ref(null);
const flowTableRef = ref(null);

const searchProdCategory = ref('');
const searchProdName = ref('');
const selectedProdCode = ref('');
const selectedProdName = ref('');
const selectedImage = ref(null);
const selectedProcessFlowCode = ref('');

const prodData = ref([]);
const processList = ref([]);
// 공통 코드 변환 객체, 함수 ======================
const prodTypeList = ref([]);
const prodTypeMap = ref({});

// 부서별 권한 관련
const store = useStore(); 
const dept = ref("");
onBeforeMount(() => {
  dept.value = store.state.user.dept;
})
const canShow = (allowedDepts) => {
  return allowedDepts.includes(dept.value);
};

const loadProdTypeList = async () => {
  await groupcodelist.groupCodeList('0J', prodTypeList);
  // 리스트를 Map 형태로 변환
  prodTypeMap.value = Object.fromEntries(
    prodTypeList.value.map(item => [item.detail_code, item.detail_name])
  );
};
// 공통코드 변환
const convertCode = (code) => {
  return prodTypeMap.value[code] || code;
};
// =============================

// 공정 정보 가져오기 모달 객체
const isSearchModalOpen = ref(false);
const modalTargetRow = ref(null);


// 제품 목록 조건에 따른 검색
const searchProduct = async () => {
  const params = {};
  if (searchProdCategory.value.trim()) params.cate = searchProdCategory.value.trim();
  if (searchProdName.value.trim()) params.name = searchProdName.value.trim();

  try {
    const result = await axios.get('/api/flowProductList', { params });
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
  { title: '품명', field: 'prodName'},
  { title: '카테고리', field: 'category', width: 150,
    formatter: (cell) => convertCode(cell.getValue())  
  }
];

const allowedNames = ['프린트', '자수'];
const processColumns = [
  { title: "No", field: "rowNum", width: 80, headerSort: false },
  {
    title: '공정번호',
    field: 'processCode',
    width: 120,
    cellClick: (e, cell) => {
      const row = cell.getRow();
      openProductSearchModal(row); // 선택된 RowComponent 전달
    }
  },
  {
    title: '공정이름',
    field: 'processName',
    width: 150
  },
  {
    title: '상세',
    field: 'detail'
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
          Swal.fire({ title: "실행 오류", text: "먼저 저장 버튼을 눌러 공정을 저장한 후 이미지 등록이 가능합니다", icon: "error" });
          return;
        }
        onImageUploadClick(row.flowCode);
      }
    },
    width: 110
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
    const count = converted.length + 5;
    while (converted.length < count) {
      converted.push({  
                        rowNum: converted.length + 1,
                        flowCode: '',     
                        processCode: '',
                        processName: '',
                        detail: '',
                        image: '',
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
  if (!selectedProdCode.value) {
    Swal.fire({ title: "미선택", text: "제품코드를 선택하세요", icon: "error" });
    return;
  }

  // 전체에서 유효한 항목만 추출
  const validFlows = processList.value.filter(p => {
    const seq = Number(p.processSeq);
    return p.processCode && Number.isInteger(seq) && seq > 0;
  });

  // 공정코드만 있고 순서(processSeq)가 잘못된 경우가 있는지
  const hasInvalidRows = processList.value.some(p => {
    return (
      p.processCode && // 공정코드는 입력되어 있고
      (!p.processSeq || isNaN(p.processSeq) || Number(p.processSeq) <= 0) // 순서가 없거나 잘못됨
    );
  });

  if (hasInvalidRows) {
    Swal.fire({
      title: "오류",
      text: "공정코드는 입력되었지만 순서가 비어있는 항목이 있습니다.",
      icon: "warning"
    });
    return;
  }
  // 중복 순서 검사
  const seen = new Set();
  const duplicates = validFlows.filter(p => {
    const key = Number(p.processSeq);
    if (seen.has(key)) return true;
    seen.add(key);
    return false;
  });

  if (duplicates.length > 0) {
    Swal.fire({
      title: "오류",
      text: "입력된 공정 순서 번호 중 중복된 항목이 있습니다.",
      icon: "warning"
    });
    return;
  }

  // 3. 유효한 항목이 아예 없을 경우
  if (validFlows.length === 0) {
    Swal.fire({
      title: "저장할 항목 없음",
      text: "공정코드와 순서가 모두 입력된 항목이 없습니다.",
      icon: "warning"
    });
    return;
  }

  try {
    await axios.post('/api/flowSave', {
      prodCode: selectedProdCode.value,
      flows: validFlows
    });
    await loadProcesses();
    Swal.fire({ title: "완료", text: "저장 완료", icon: "success" });
  } catch (err) {
    console.error("저장 오류:", err);
    Swal.fire({ title: "오류", text: "저장 중 오류 발생", icon: "error" });
  }
};

const deleteProcessFlow = async () => {
  if (!selectedProcessFlowCode.value && !modalTargetRow.value) {
    Swal.fire({ title: "미선택", text: "삭제할 공정을 선택해주세요", icon: "error" });
    return;
  }
  // 확인/취소 메시지 
  const result = await Swal.fire({
    title: '공정 흐름 삭제',
    text: '정말 삭제하시겠습니까?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: '예, 진행합니다',
    cancelButtonText: '취소'
  });

  if (!result.isConfirmed) return;
  
  if (selectedProcessFlowCode.value) {
    try {
      await axios.delete(`/api/flowDelete/${selectedProcessFlowCode.value}`);
      Swal.fire({ title: "완료", text: "삭제 완료", icon: "success" });
      await loadProcesses();
      selectedImage.value = null;
      selectedProcessFlowCode.value = '';
    } catch (err) {
      console.error("삭제 실패:", err);
      Swal.fire({ title: "오류", text: "삭제 중 오류 발생", icon: "error" });
    }
      selectedImage.value = null;
      selectedProcessFlowCode.value = '';
      return;
  }

  // DB에 저장되지 않은 행일 경우 → 해당 행 초기화
  if (modalTargetRow.value) {
    modalTargetRow.value.update({
      processCode: '',
      processName: '',
      detail: '',
      image: '',
    });
    Swal.fire({ title: "초기화", text: "입력된 내용이 초기화되었습니다.", icon: "info" });
    selectedImage.value = null;
    selectedProcessFlowCode.value = '';
    modalTargetRow.value = null;
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
      Swal.fire({ title: "완료", text: "이미지 업로드 완료", icon: "success" });
    } catch (err) {
      console.error('업로드 실패:', err);
    }
  };

  fileInput.click();
};
const productTableEvents = [
  {
    eventName: "rowClick",
    eventAction: async (e, row) => {
      const data = row.getData();
      selectedProdCode.value = data.prodCode;
      selectedProdName.value = data.prodName;
      await loadProcesses();
      
      const instance = productTableRef.value.getTabulator();
      if (instance) instance.redraw(true);

      modalTargetRow.value = null;
    }
  }
];
const flowTableEvents = [
  {
    eventName: "rowMoved",
    eventAction: onRowMoved
  },
  {
    eventName: "rowClick",
    eventAction: async (e, row) => {
      const rowData = row.getData();
      selectedProcessFlowCode.value = rowData.flowCode;
      if (!allowedNames.includes(rowData.processName)) return;

      if (!rowData.flowCode) {
        selectedImage.value = null;
        return;
      }

      try {
        const url = `/api/flowImage/${rowData.flowCode}?t=${Date.now()}`;
        selectedImage.value = url;
      } catch (err) {
        console.error("이미지 불러오기 실패", err);
        selectedImage.value = null;
      }

      const tableInstance = flowTableRef.value?.$el?.querySelector('.tabulator')?.__tabulator__;
      if (tableInstance) tableInstance.redraw(true);
    }
  }
];
const tabulatorOptions = {
  selectableRows: 1,
  rowFormatter: function(row) {
    const rowData = row.getData();
    // selectedOutsouInboundCode가 객체이고, 그 객체의 outsouInboundCode와 현재 행의 코드가 일치하는지 확인
    if (selectedProdCode.value && rowData.prodCode === selectedProdCode.value.prodCode) {
      row.getElement().classList.add("selected-row");
    } else {
      row.getElement().classList.remove("selected-row");
    }
    if (selectedProcessFlowCode.value && rowData.flowCode === selectedProcessFlowCode.value.flowCode) {
      row.getElement().classList.add("selected-row");
    } else {
      row.getElement().classList.remove("selected-row");
    }
  }
};
// 공정 정보 가져오기 모달 ====================
const openProductSearchModal = (row) => {
  isSearchModalOpen.value = true;
  modalTargetRow.value = row;
};

const handleProcessSelect = (item) => {
  if (!modalTargetRow.value) return;
  modalTargetRow.value.update({
    processCode: item.processCode,
    processName: item.processName
  });
};

onMounted(() => {
  loadProdTypeList();
  searchProduct();
  groupcodelist.groupCodeList('0J',prodTypeList);
})
</script>

<template>
  <div class="container-fluid p-3">
    <div class="search-area bg-white rounded p-3 mb-3 shadow-sm">
      <div class="row">
        <div class="col-md-2">
          <label class="form-label search-label">제품 카테고리</label>
          <select class="form-select" v-model="searchProdCategory">
            <option value="">선택안함</option>
            <option v-for="type in prodTypeList":key="type.detail_code" :value="type.detail_code">
              {{ type.detail_name }}
            </option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label search-label">제품명 포함 단어</label>
          <input type="text" class="form-control" v-model="searchProdName">
        </div>
        <div class="col-md-2 d-flex align-items-end gap-2">
          <button class="btn btn-outline-secondary w-50" @click="resetProductFilter">초기화</button>
          <button class="btn btn-primary w-50" @click="searchProduct">조회</button>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-5 d-flex flex-column">
        <tabulator-card
          ref="productTableRef"
          card-title="제품목록"
          :height="670"
          :table-data="prodData"
          :table-columns="productColumns"
          :tabulator-options="tabulatorOptions"
          :on="productTableEvents"
        />
      </div>

      <div class="col-md-7 d-flex flex-column">
        <tabulator-card
          ref="flowTableRef"
          card-title="공정순서"
          :table-data="processList"
          :table-columns="processColumns"
          :tabulator-options="tabulatorOptions"
          :on="flowTableEvents"
        >
          <template #actions>
            <button class="btn btn-success me-2" @click="loadProcesses" v-if="canShow(['0c2c', '0c5c'])">불러오기</button>
            <button class="btn btn-primary me-2" @click="saveProcesses" v-if="canShow(['0c2c', '0c5c'])">저장</button>
            <button class="btn btn-danger" @click="deleteProcessFlow" v-if="canShow(['0c2c', '0c5c'])">삭제</button>
          </template>
        </tabulator-card>
        <div class="mt-3 flex-grow-1">
          <label class="form-label">이미지 보기</label>
          <div class="border" style="height: 200px; background: #eee">
            <img v-if="selectedImage" :src="selectedImage" style="max-height: 100%; max-width: 100%" />
          </div>
        </div>
      </div>
      <ProcessSearchModal
        :isOpen="isSearchModalOpen"
        :targetInfo="{
          rowNum: modalTargetRow?.getData()?.rowNum,
        }"
        @select="handleProcessSelect"
        @close="() => { isSearchModalOpen = false }"
      />
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
/* 선택된 행의 스타일 */
.selected-row {
  background-color: #e0e0e0 !important; /* 원하는 강조 색상으로 변경 */
  font-weight: bold; /* 선택된 행의 텍스트를 굵게 */

}.search-label {
  font-size: medium;
}
.full-height {
  height: 840px;
  display: flex;
  flex-direction: column;
}
</style>
