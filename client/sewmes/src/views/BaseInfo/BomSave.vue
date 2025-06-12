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
const bom_table = ref(null);

const itemData = ref([]);
const bomData = ref([]);

const typeFormatter = (cell, formatterParams) => {
  const typeArray = formatterParams.typeArray;
  const code = cell.getValue();

  const foundType = typeArray.find((type) => type.code === code);
  return foundType ? foundType.name : code;
};

const itemColumns = [
  { title: "품목코드", field: "code", width: 120 },
  { title: "품목명", field: "name", width: 200 },
  {
    title: "품목유형",
    field: "type",
    width: 120,
    formatter: typeFormatter,
    formatterParams: {
      typeArray: [],
    },
  },
  { title: "규격", field: "info" },
];

const bomColumns = [
  { title: "품목코드", field: "code", width: 120 },
  { title: "품목명", field: "name", width: 200 },
  {
    title: "품목유형",
    field: "type",
    width: 120,
    formatter: typeFormatter,
    formatterParams: {
      typeArray: [],
    },
  },
  { title: "소요량", field: "need", editor:"input", editorParams:{
    elementAttributes: {
      placeholder: "소수점을 포함하는 숫자",
    },
  }}, //수정할 수 있도록
  { title: "단위", field: "unit", width: 80 },
];

const initialSearchFields = {
  code: "",
  item_type: "0w1w",
  name: "",
  type: "",
  use_yn: "0b1b"
};

const searchData = ref({ ...initialSearchFields });
const detailFields = ref({});

const itemOptions = {
  // selectableRows: 1,
};

const itemEvent = [
  {
    eventName: "rowDblClick",
    eventAction: (e, row) => {
      const rowData = row.getData();
      const tabulator = bom_table.value.getTabulator();
      tabulator.addRow(rowData, false);
      // console.log(rowData);
    },
  },
];

const bomOptions = {
  // selectableRows: 1,
};

const bomEvent = [
  {
    eventName: "rowDblClick",
    eventAction: (e, row) => {
      row.delete();
    },
  },
];

//리셋
const resetHandler = () => {
  searchData.value = { ...initialSearchFields };
  // detailFields.value = { ...initialDetailFields };
};

//검색
const searchHandler = async () => {
  //console.log(tabulator.getColumnDefinitions());
  if (searchData.value.item_type === "0w1w") {
    const material = await axios.get("/api/baseMaterial");
    itemData.value = material.data.map(e => {
      return {
        code: e.material_code,
        name: e.material_name,
        type: mattype.value.find(el => el.code === e.material_type).name,
        info: e.standard,
        unit: e.unit,
      }
    });
  } else if (searchData.value.item_type === "0w2w") {
    const product = await axios.get("/api/baseProduct");
    itemData.value = product.data.map(e => {
      return {
        code: e.prod_code,
        name: e.prod_name,
        type: prdtype.value.find(el => el.code === e.prod_type).name,
        info: catetype.value.find(el => el.code === e.category).name,
        unit: e.unit,
      }
    });
  }
};

const bomClickhandler = () => {
  const tabulator = bom_table.value.getTabulator();
  const prodCode = detailFields.value.prod_code;
  const prodName = detailFields.value.prod_name;

  if (!prodCode) { //undefined
    alert("제품번호를 입력하지 않았습니다.");
    return;
  } else if (!prodName) {
    alert("제품이 존재하지 않습니다.");
    return;
  } else if (!tabulator.getData().length) {
    alert("BOM정보가 비어있습니다.");
    return;
  } else if (tabulator.getData().find(e => e.need == "")) {
    alert("BOM소요량의 정보가 없습니다.");
    return;
  }

  //단위를 보고 소수점이나 숫자를 유효성검사.

  console.log("완성");
}

const bomResethandler = () => {
  detailFields.value.prod_code = "";
  detailFields.value.prod_name = "";
  bomData.value = [];
}

const findProd = async () => {
  const code = detailFields.value.prod_code;
  const product = await axios.get("/api/baseProduct/"+code);
  detailFields.value.prod_name = product.data.prod_name;
};

onMounted(async () => {
  searchHandler();
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
            v-model="searchData.code"
          />
        </div>
        <div class="col-md-2">
          <label class="form-label">제품유형</label>
          <select class="form-select" v-model="searchData.item_type">
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
            v-model="searchData.name"
          />
        </div>
        <div class="col-md-2">
          <label class="form-label">품목유형</label>
          <input
            type="text"
            class="form-control"
            v-model="searchData.type"
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
          :table-data="itemData"
          :table-columns="itemColumns"
          :tabulator-options="itemOptions"
          :on="itemEvent"
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
                    <input
                      type="text"
                      ref="prod_code"
                      class="form-control form-control-sm"
                      @keyup.enter="findProd"
                      v-model="detailFields.prod_code"
                    />
                  </td>
                </tr>
                <tr>
                  <th>제품명</th>
                  <td>
                    <input
                      type="text"
                      ref="prod_name"
                      class="form-control form-control-sm"
                      v-model="detailFields.prod_name"
                      readonly
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <tabulator-card
          ref="bom_table"
          card-title="BOM 상세 정보"
          :table-data="bomData"
          :table-columns="bomColumns"
          :tabulator-options="bomOptions"
          :on="bomEvent"/>
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