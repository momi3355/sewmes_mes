<script setup>
import { onMounted, ref } from "vue";
import { useStore } from "vuex";
import axios from "axios";

import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import groupcodelist from "@/assets/js/utils/groupcodelist";
import { typeFormatter } from "@/assets/js/utils/tableFormatter";

const store = useStore();

const bomtype = ref([]);
const mattype = ref([]);
const prdtype = ref([]);
const itemtype = ref([]);
const catetype = ref([]);

const item_table = ref(null);
const bom_table = ref(null);

const itemData = ref([]);
const bomData = ref([]);

const itemColumns = [
  { title: "품목코드", field: "item_code", width: 120 },
  { title: "품목명", field: "item_name", width: 200 },
  {
    title: "품목유형",
    field: "item_type",
    width: 120,
    formatter: typeFormatter,
    formatterParams: {
      typeArray: itemtype,
    },
  },
  { 
    title: "규격",
    field: "item_info",
    formatter: typeFormatter,
    formatterParams: {
      typeArray: catetype,
    }
  },
];

const bomColumns = [
  { title: "품목코드", field: "item_code", width: 120 },
  { title: "품목명", field: "item_name", width: 200 },
  {
    title: "품목유형",
    field: "item_type",
    width: 120,
    formatter: typeFormatter,
    formatterParams: {
      typeArray: itemtype,
    },
  },
  { title: "소요량", field: "need", editor:"input", editorParams:{
    elementAttributes: {
      placeholder: "소수점을 포함하는 숫자",
      onfocus: "this.select()",
    },
  }},
  { title: "단위", field: "unit", width: 80 },
];

const initialSearchFields = {
  item_code: "",
  item_name: "",
  item_type: "",
  use_yn: "",
  use_yse: false,
  use_no: false,
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
      console.log(rowData);
      const tabulator = bom_table.value.getTabulator();
      if (tabulator.getData().find(e => e.item_code === rowData.item_code)) {
        alert("동일한 품목을 넣을 수 없습니다.");
        return;
      }
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
  const search = searchData.value;
  if (!search.use_yse && !search.use_no) {
    search.use_yn = "";
  } else if (search.use_yse && search.use_no) {
    search.use_yn = "0b1b&0b2b";
  } else if (search.use_yse) {
    search.use_yn = "0b1b";
  } else if (search.use_no) {
    search.use_yn = "0b2b";
  }
  
  const tabulator = item_table.value.getTabulator();
  await tabulator.setData("/api/bomItem", {
    item_code: search.item_code,
    item_name: search.item_name,
    item_type: search.item_type,
    use_yn: search.use_yn
  });
  itemData.value = tabulator.getData();
};

const bomClickhandler = async () => {
  const user = store.state.user;

  const tabulator = bom_table.value.getTabulator();
  const prodCode = detailFields.value.prod_code;
  const prodName = detailFields.value.prod_name;

  const bomTable = tabulator.getData();

  if (!prodCode) { //undefined
    alert("제품번호를 입력하지 않았습니다.");
    return;
  } else if (!prodName) {
    alert("제품이 존재하지 않습니다.");
    return;
  } else if (!bomTable.length) {
    alert("BOM정보가 비어있습니다.");
    return;
  } else if (bomTable.find(e => !e.need)) {
    alert("BOM소요량의 정보가 없습니다.");
    return;
  }

  for (const bom of bomDetailInfo) {
    if (!Number(bom.need)) {
      alert("BOM소요량이 숫자가 아닙니다.");
      return;
    }
  } 

  // '[
  //    {"need": 1.500, "item_type": "0w1w", "item_code": "ITEMA001"},
  //    {"need": 2.250, "item_type": "0w2w", "item_code": "ITEMB002"},
	//    {"need": 0.750, "item_type": "0w1w", "item_code": "ITEMC003"}
  // ]';
  //TODO: 단위를 보고 소수점이나 숫자를 유효성검사.
  const bomDetailInfo = bomTable.map(e => {
    return {
      need: e.need,
      item_type: e.item_type.includes("0k") ? bomtype.value[1].detail_code : bomtype.value[0].detail_code,
      item_code: e.item_code,
    };
  });

  const bomInfo = {
    prod_code: prodCode,
    user_code: user.emp_num,
    bom_info: bomDetailInfo,
  };

  const query = await axios.post("/api/bomDetail", bomInfo);
  if (query.data.affectedRows) {
    alert("성공");
  }
}

const bomResethandler = () => {
  detailFields.value.prod_code = "";
  detailFields.value.prod_name = "";
  bomData.value = [];
}

const findProd = async () => {
  const code = detailFields.value.prod_code;
  const product = await axios.get(`/api/baseProduct/${code}`);
  detailFields.value.prod_name = product.data.prod_name;
};

onMounted(async () => {
  //공통코드 조회
  await groupcodelist.groupCodeList("0W", bomtype);
  await groupcodelist.groupCodeList("0L", mattype);
  await groupcodelist.groupCodeList("0K", prdtype);
  await groupcodelist.groupCodeList("0J", catetype);
  mattype.value.pop();
  prdtype.value.pop();
  itemtype.value = mattype.value.concat(prdtype.value);

  const bomItem = await axios.get("/api/bomItem");
  itemData.value = bomItem.data;
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
            v-model="searchData.item_code"
          />
        </div>
        <div class="col-md-2">
          <label class="form-label">품목유형</label>
          <select class="form-select" v-model="searchData.item_type">
            <option selected value="">전체</option>
            <option v-for="type in itemtype" :value="type.detail_code">
              {{ type.detail_name }}
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
            v-model="searchData.item_name"
          />
        </div>
        <div class="col-md-2">
          <label class="form-label">사용여부</label>
          <div class="form-check">
            <input 
              class="form-check-input"
              type="checkbox"
              v-model="searchData.use_yse"
              id="search-use-yse"
            />
            <label class="form-check-label" for="search-use-yse">
              사용
            </label>
          </div>
          <div class="form-check">
            <input 
              class="form-check-input"
              type="checkbox"
              v-model="searchData.use_no"
              id="search-use-no"
            />
            <label class="form-check-label" for="search-use-no">
              비사용
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