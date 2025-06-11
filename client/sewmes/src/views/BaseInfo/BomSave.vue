<script setup>
import { onMounted, ref } from "vue";
import axios from "axios";

import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";

const bomtype = ref([
  {
    code: "0w1w",
    name: "자재",
  },
  {
    code: "0w2w",
    name: "반제품",
  },
]);
const mattype = ref([
  {
    code: "0l1l",
    name: "원자재",
  },
  {
    code: "0l2l",
    name: "부자재",
  },
  {
    code: "0l3l",
    name: "소모품",
  }
]);
const prdtype = ref([
  {
    code: "0k1k",
    name: "반제품",
  },
  {
    code: "0k2k",
    name: "완제품",
  },
]);
const catetype = ref([
  {
    code: "0j1j",
    name: "상의",
  },
  {
    code: "0j2j",
    name: "하의",
  },
]);

const item_table = ref(null);
const materialData = ref([]);
const bom_table = ref(null);
const productData = ref([]);

const typeFormatter = (cell, formatterParams) => {
  const typeArray = formatterParams.typeArray;
  const code = cell.getValue();

  const foundType = typeArray.find((type) => type.code === code);
  return foundType ? foundType.name : code;
};

const materialColumns = [
  { title: "자재코드", field: "material_code", width: 100 },
  { title: "자재명", field: "material_name", width: 170 },
  {
    title: "자재유형",
    field: "material_type",
    width: 75,
    formatter: typeFormatter,
    formatterParams: {
      typeArray: mattype.value,
    },
  },
  { title: "규격", field: "standard", width: 160 },
];

const productColumns = [
  { title: "제품코드", field: "prod_code", width: 100 },
  { title: "제품명", field: "prod_name", width: 170 },
  {
    title: "제품유형",
    field: "prod_type",
    width: 75,
    formatter: typeFormatter,
    formatterParams: {
      typeArray: prdtype.value,
    },
  },
  {
    title: "카테고리",
    field: "category",
    width: 75,
    formatter: typeFormatter,
    formatterParams: {
      typeArray: catetype.value,
    },
  },
];

const searchData = ref({});
const detailFields = ref({});

//리셋
const resetHandler = () => {
  searchData.value = { ...initialSearchFields };
  // detailFields.value = { ...initialDetailFields };
};

//검색
const searchHandler = async () => {
  //console.log(tabulator.getColumnDefinitions());
  if (searchData.value.prod_type === "0w1w") {
    const item_tabulator = item_table.value.getTabulator();
    console.log(materialColumns);
    item_tabulator.setColumns(materialColumns);

    await item_tabulator.setData("/api/baseMaterial");
    materialData.value = item_tabulator.getData();
  } else if (searchData.value.prod_type === "0w2w") {
    const item_tabulator = item_table.value.getTabulator();
    console.log(productColumns);
    item_tabulator.setColumns(productColumns);

    await item_tabulator.setData("/api/baseProduct");
    productData.value = item_tabulator.getData();
  }
};

const bomClickhandler = () => {

}

const bomResethandler = () => {

}

onMounted(async () => {
  const material = await axios.get("/api/baseMaterial");
  materialData.value = material.data;
});
</script>

<template>
  <div class="container-fluid p-3">
    <div class="row search-color">
      <!-- 상단 검색 영역 -->
      <div class="row mb-3">
        <div class="col-md-2 d-inline-block-custom">
          <label class="form-label">품목코드</label>
          <input
            type="text"
            class="form-control"
            v-model="searchData.prod_code"
          />
        </div>
        <div class="col-md-2">
          <label class="form-label">제품유형</label>
          <select class="form-select" v-model="searchData.prod_type">
            <option selected value="">전체</option>
            <option v-for="type in bomtype" :value="type.code">
              {{ type.name }}
            </option>
          </select>
        </div>
      </div>
      <div class="row mb-3">
        <div class="col-md-2">
          <label class="form-label">품명</label>
          <input
            type="text"
            class="form-control"
            v-model="searchData.prod_name"
          />
        </div>
        <div class="col-md-2">
          <label class="form-label">유형</label>
          <input
            type="text"
            class="form-control"
            v-model="searchData.prod_name"
          />
        </div>
        <div class="col-md-2">
          <label class="form-label">사용여부</label>
          <div class="form-check" v-for="type in usetype">
            <input
              class="form-check-input"
              type="radio"
              v-model="searchData.use_yn"
              :value="type.code"
              :id="'search-'+type.code"
            />
            <label class="form-check-label" :for="'search-'+type.code">
              {{ type.name }}
            </label>
          </div>
        </div>
        <div class="col-md-2 d-flex align-items-end">
          <button class="btn btn-secondary me-2" @click="resetHandler">
            초기화
          </button>
          <button class="btn btn-primary" @click="searchHandler">조회</button>
        </div>
      </div>
    </div>

    <div class="row me-3">
      <div class="col-6 md-3">
        <tabulator-card
          ref="item_table"
          card-title="품목 리스트"
          :table-data="materialData"
          :table-columns="materialColumns"
          :tabulator-options="tabulatorOptions"
          :on="tabulatorEvent"
        />
      </div>
      <div class="col-md-6 d-flex flex-column">
        <div class="card mb-2 flex-grow-1" style="min-height: 180px">
          <div class="card-header pb-0 d-flex justify-content-between align-items-center">
            <span>BOM 정보</span>
            <div class="btn-container">
              <button class="btn btn-sm btn-success" @click="bomClickhandler">저장</button>
              <button class="btn btn-sm btn-secondary" @click="bomResethandler">초기화</button>
            </div>
          </div>
          <div class="card-body p-2">
            <table class="table table-bordered table-sm align-middle mb-2">
              <tbody style="border-width: 1px">
                <tr>
                  <th style="width: 30%">제품코드</th>
                  <td>
                    <input type="text" class="form-control form-control-sm" v-model="detailFields.prod_code"/>
                  </td>
                </tr>
                <tr>
                  <th>제품명</th>
                  <td>
                    <input type="text" class="form-control form-control-sm" v-model="detailFields.prod_name"/>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <tabulator-card
          ref="bom_table"
          card-title="BOM 상세 정보"
          :table-data="productData"
          :table-columns="productColumns"
          :tabulator-options="tabulatorOptions"
          :on="tabulatorEvent"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-color {
  margin: 10px;
  padding: 20px;
  border-radius: 1rem;
  background-color: #fff;
}
</style>