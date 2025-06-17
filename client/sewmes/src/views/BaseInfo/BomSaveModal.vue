<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';

import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import { dateFormatter, typeFormatter } from '../../assets/js/utils/tableFormatter';
import groupcodelist from '../../assets/js/utils/groupcodelist';

const props = defineProps({
  isModalOpen: Boolean,
  prodCode: String,
});
const emit = defineEmits(['closeModal']);

const prdtype = ref([]);
const catetype = ref([]);
const sizetype = ref([]);
const colortype = ref([]);

const table = ref(null);

const productData = ref([]);
const productColumns = [
  { title: "제품코드", field: "prod_code", width: 220 },
  { title: "제품명", field: "prod_name" },
  {
    title: "제품유형",
    field: "prod_type",
    width: 115,
    formatter: typeFormatter,
    formatterParams: {
      typeArray: prdtype,
    },
  },
  {
    title: "카테고리",
    field: "category",
    width: 115,
    formatter: typeFormatter,
    formatterParams: {
      typeArray: catetype,
    },
  },
  { title: "단위", field: "unit", width: 85 },
  {
    title: "사이즈",
    field: "size",
    width: 100,
    formatter: typeFormatter,
    formatterParams: {
      typeArray: sizetype,
    },
  },
  {
    title: "색상",
    field: "color",
    width: 85,
    formatter: typeFormatter,
    formatterParams: {
      typeArray: colortype,
    },
  },
];

const initialSearchFields = {
  prod_code: "",
  prod_name: "",
  prod_type: "",
  size:"",
  category: "",
};

const searchData = ref({  ...initialSearchFields });

//초기화
const searchResetHandler = () => {
  searchData.value = { ...initialSearchFields };
};

//검색
const searchActionHandler = () => {
  fetchProductList();
};

const fetchProductList = async () => {
  const lots = await axios.get("/api/baseProduct", {
    params: {
      ...searchData.value
    }
  });
  productData.value = lots.data;
}

watch(() => props.isModalOpen, async (isOpen) => {
  if (isOpen) {
    await groupcodelist.groupCodeList("0k", prdtype);
    await groupcodelist.groupCodeList("0j", catetype);
    await groupcodelist.groupCodeList("0h", sizetype);
    await groupcodelist.groupCodeList("0i", colortype);
    fetchProductList();
  }
}, { immediate: true });

const handleCloseModal = () => {
  emit('closeModal');
};

const selectedSave = () => {
  const tabulator = table.value.getTabulator();
  const selectedData = tabulator.getSelectedData();

  if (!selectedData.length) {
    alert("선택한 행이 없습니다.");
    return;
  }

  emit('saved', selectedData); //전달
  handleCloseModal(); //닫기
};
</script>

<template>
  <div class="modal-overlay" v-if="props.isModalOpen">
    <div class="modal-content">
      <div class="search-bar">
        <div>
          <label>제품코드:</label>
          <input v-model="searchData.prod_code" class="form-control-sm" placeholder="제품코드검색" />
        </div>
        <div>
          <label>제품명:</label>
          <input v-model="searchData.prod_name" class="form-control-sm" placeholder="제품검색" />
        </div>
        <div>
          <label>제품유형:</label>
          <select class="form-select-sm" v-model="searchData.prod_type">
            <option selected value="">전체</option>
            <option v-for="type in prdtype" :value="type.detail_code">
              {{ type.detail_name }}
            </option>
          </select>
        </div>
        <div>
          <label>카테고리:</label>
          <select class="form-select-sm" v-model="searchData.category">
            <option selected value="">전체</option>
            <option v-for="type in catetype" :value="type.detail_code">
              {{ type.detail_name }}
            </option>
          </select>
        </div>
        <div>
          <label>사이즈:</label>
          <select class="form-select-sm" v-model="searchData.size">
            <option selected value="">전체</option>
            <option v-for="type in sizetype" :value="type.detail_code">
              {{ type.detail_name }}
            </option>
          </select>
        </div>
        <div class="btn-container">
          <button class="btn btn-secondary" @click="searchResetHandler">초기화</button>
          <button class="btn btn-primary" @click="searchActionHandler">검색</button>
        </div>
      </div>

      <TabulatorCard
          ref="table"
          :tableData="productData"
          cardTitle="제품 리스트"
          :tableColumns="productColumns"
          :tabulatorOptions="{ selectableRows: 1 }" >
      </TabulatorCard>

      <div class="modal-actions">
        <button class="btn btn-success" @click="selectedSave">선택</button>
        <button class="btn btn-secondary ms-2" @click="handleCloseModal">닫기</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.search-bar label {
  margin-right: 8px;
}

/* 기존 스타일 유지 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%; /* 모달 너비 조절 */
  max-width: 1350px; /* 최대 너비 설정 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.modal-grid {
  flex-grow: 1; /* 그리드가 사용 가능한 공간을 채우도록 함 */
  margin-bottom: 20px; /* 버튼과의 간격 */
  /* Tabulator 높이를 CSS로 제어하려면 height: 300px; 등을 여기에 넣을 수도 있음 */
}

.modal-actions {
  text-align: right;
}

.btn-container button {
  margin: 7px;
}
</style>
