<script setup>
import { onBeforeMount, onMounted, ref } from "vue";
import { useStore } from "vuex";
import axios from "axios";

import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import BomSaveModal from "./BomSaveModal.vue";
import groupcodelist from "@/assets/js/utils/groupcodelist";
import { typeFormatter } from "@/assets/js/utils/tableFormatter";
import Swal from "sweetalert2";

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

const isModalOpen = ref(false);

// 부서별 권한 관련

const dept = ref("");
onBeforeMount(() => {
  dept.value = store.state.user.dept;
})
const canShow = (allowedDepts) => {
  return allowedDepts.includes(dept.value);
};

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
      //console.log(rowData);
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
    Swal.fire({
      title: "필수 입력 항목",
      text: "제품번호를 입력하지 않았습니다.",
      icon: "error"
    });
    return;
  } else if (!prodName) {
    Swal.fire({
      title: "필수 입력 항목",
      text: "제품이 존재하지 않습니다.",
      icon: "error"
    });
    return;
  } else if (!bomTable.length) {
    Swal.fire({
      title: "필수 입력 항목",
      text: "BOM정보가 비어있습니다.",
      icon: "error"
    });
    return;
  } else if (bomTable.find(e => !e.need)) {
    Swal.fire({
      title: "필수 입력 항목",
      text: "BOM소요량의 정보가 없습니다.",
      icon: "error"
    });
    return;
  }
  
  for (const bom of bomTable) {
    if (!Number(bom.need)) {
      Swal.fire({
        title: "잘못된 숫자",
        text: "BOM소요량이 숫자가 아닙니다.",
        icon: "error"
      });
      return;
    } else if (bom.unit === "EA") {
      if (!Number.isInteger(Number(bom.need))) {
        Swal.fire({
          title: "잘못된 숫자",
          text: "EA는 소수점이 들어갈 수 없습니다.",
          icon: "error"
        });
        return;
      }
    }
  } 
  
  // '[
  //    {"need": 1.500, "item_type": "0w1w", "item_code": "ITEMA001"},
  //    {"need": 2.250, "item_type": "0w2w", "item_code": "ITEMB002"},
	//    {"need": 0.750, "item_type": "0w1w", "item_code": "ITEMC003"}
  // ]';
  let bomDetailInfo = bomTable.map(e => {
    let detailInfo = {
      need: e.need,
      item_type: e.item_type.includes("0k") ? bomtype.value[1].detail_code : bomtype.value[0].detail_code,
      item_code: e.item_code,
    };
    if (e?.bom_detail_code) {
      detailInfo.bom_detail_code = e.bom_detail_code
    }
    return detailInfo;
  });

  const bomInfo = {
    prod_code: prodCode,
    user_code: user.emp_num,
    bom_info: bomDetailInfo,
  };
  console.log(detailFields.value);
  console.log(bomInfo);
  
  if (detailFields.value.bom_code) {
    //put
    // console.log({
    //   bomCode: detailFields.value.bom_code,
    //   bomInfo: bomDetailInfo,
    // });
    bomDetailInfo = bomDetailInfo.map(e => {
      return {
        bom_detail_code: e.bom_detail_code ? e.bom_detail_code : null,
        need: e.need,
        item_type: e.item_type,
        item_code: e.item_code
      };
    });

    const bomUpdate = {
      bomCode: detailFields.value.bom_code,
      bomInfo: bomDetailInfo,
    }
    console.log(bomUpdate);
    const query = await axios.put("/api/bomDetail", bomUpdate);
    if (query?.status === 200) {
      Swal.fire({
        title: "성공",
        text: "BOM정보가 수정되었습니다.",
        icon: "success"
      });
    }
  } else {
    // post
    const query = await axios.post("/api/bomDetail", bomInfo);
    if (query?.data?.affectedRows) {
      Swal.fire({
        title: "성공",
        text: "BOM정보가 추가되었습니다.",
        icon: "success"
      });
    }
  }
}

const bomResethandler = () => {
  detailFields.value.prod_code = "";
  detailFields.value.prod_name = "";
  bomData.value = [];
}

const productSelectHandler = async () => {
  // const tabulator = order_table.value.getTabulator();
  // if (!tabulator.getSelectedRows().length) {
  //   Swal.fire({
  //     title: "필수 입력 항목",
  //     text: "제품을 먼저 선택해 주세요.",
  //     icon: "error"
  //   });
  //   return;
  // }
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleAfterModalSaved = async (prdData) => {
  const selectRow = prdData[0];

  detailFields.value.prod_name = selectRow.prod_name;
  detailFields.value.prod_code = selectRow.prod_code;

  const tabulator = bom_table.value.getTabulator();
  await tabulator.setData("/api/bomDetail", {
      item_code: selectRow.prod_code,
  });
  bomData.value = tabulator.getData();
  //console.log(bomData.value);

  if (bomData.value[0]?.bom_code) {
    detailFields.value.bom_code = bomData.value[0].bom_code;
    //상세 BOM 없는 경우 NULL 데이터가 있음.
    if (!bomData.value[0]?.bom_detail_code)
      bomData.value.pop(); //빈 데이터 제거
  } else detailFields.value.bom_code = ""; //bom_code 초기화
  //console.log(detailFields.value);
};

const findProd = async () => {
  const code = detailFields.value.prod_code;
  const product = await axios.get(`/api/baseProduct/${code}`);
  detailFields.value.prod_name = product.data.prod_name;
};

const getBomItemList = async () => {
  mattype.value.pop();
  prdtype.value.pop();
  itemtype.value = mattype.value.concat(prdtype.value);

  const bomItem = await axios.get("/api/bomItem");
  itemData.value = bomItem.data;
}

onMounted(async () => {
  //공통코드 조회
  Promise.all([
    groupcodelist.groupCodeList("0W", bomtype),
    groupcodelist.groupCodeList("0L", mattype),
    groupcodelist.groupCodeList("0K", prdtype),
    groupcodelist.groupCodeList("0J", catetype),
  ]).then(() => {
    getBomItemList();
  }).catch(() => {
    Swal.fire({
      title: "접속실패",
      text: "네트워크 접속에 실패했습니다.",
      icon: "error"
    });
  });
  
});
</script>

<template>
  <div class="container-fluid p-3 full-height">
    <div class="search-area bg-white rounded p-3 mb-3 shadow-sm">
      <div class="row">
        <!-- 상단 검색 영역 -->
        <div class="col-md-1">
          <label class="form-label search-label">품목유형</label>
          <select class="form-select" v-model="searchData.item_type">
            <option selected value="">전체</option>
            <option v-for="type in itemtype" :value="type.detail_code">
              {{ type.detail_name }}
            </option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label search-label">품명</label>
          <input
            type="text"
            class="form-control"
            v-model="searchData.item_name"
            onfocus="this.select()"
          />
        </div>
        <div class="col-md-2">
          <label class="form-label search-label">사용여부</label>
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
        <div class="col-md-2 d-flex align-items-end gap-2">
          <button class="btn btn-outline-secondary w-50" @click="resetHandler">
            초기화
          </button>
          <button class="btn btn-primary w-50" @click="searchHandler">조회</button>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6">
        <div class="card mb-2">
          <div class="card-header pb-0 d-flex justify-content-between align-items-center">
            <h5 class="mt-0 text-start">BOM 정보</h5>
            <div class="btn-container">
              <button class="btn btn-sm btn-success me-2" @click="bomClickhandler" v-show="canShow(['0c2c', '0c5c'])">저장</button>
              <button class="btn btn-sm btn-secondary" @click="bomResethandler" v-if="canShow(['0c2c', '0c5c'])">초기화</button>
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
                      readonly
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
                <tr><td colspan="2"><button class="btn btn-primary" style="width: 100%;" @click="productSelectHandler">제품 검색</button></td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <tabulator-card
          ref="bom_table"
          card-title="BOM 상세 정보"
          height="350px"
          :table-data="bomData"
          :table-columns="bomColumns"
          :tabulator-options="bomOptions"
          :on="bomEvent"/>
      </div>
      <div class="col-6 md-3">
        <tabulator-card
          ref="item_table"
          card-title="품목 리스트"
          height="600px"
          :table-data="itemData"
          :table-columns="itemColumns"
          :tabulator-options="itemOptions"
          :on="itemEvent"
        />
      </div>
      <bom-save-modal
        :isModalOpen="isModalOpen"
        :prodCode="detailFields.prod_code"
        v-on:close-modal="closeModal"
        @saved="handleAfterModalSaved"
      />
    </div>
  </div>
</template>

<style scoped>
.search-label {
  font-size: medium;
}
.full-height {
  height: 840px;
  display: flex;
  flex-direction: column;
}
.search-area {
  flex-shrink: 0;
}
</style>