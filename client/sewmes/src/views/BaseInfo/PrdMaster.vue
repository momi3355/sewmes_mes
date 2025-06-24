<script setup>
import { onBeforeMount, onMounted, ref } from "vue";
import { useStore } from "vuex";

import axios from "axios";

import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import groupcodelist from "@/assets/js/utils/groupcodelist";
import { typeFormatter } from "@/assets/js/utils/tableFormatter";
import Swal from "sweetalert2";

const prdtype = ref([]);
const usetype = ref([]);
const catetype = ref([]);
const sizetype = ref([]);
const colortype = ref([]);

const table = ref(null);
const productData = ref([]);

// 부서별 권한 관련
const store = useStore(); 
const dept = ref("");
onBeforeMount(() => {
  dept.value = store.state.user.dept;
})
const canShow = (allowedDepts) => {
  return allowedDepts.includes(dept.value);
};

const productColumns = [
  { title: "제품코드", field: "prod_code", width: 100 },
  { title: "제품명", field: "prod_name", width: 170 },
  {
    title: "제품유형",
    field: "prod_type",
    width: 75,
    formatter: typeFormatter,
    formatterParams: {
      typeArray: prdtype,
    },
  },
  {
    title: "카테고리",
    field: "category",
    width: 75,
    formatter: typeFormatter,
    formatterParams: {
      typeArray: catetype,
    },
  },
  { title: "단위", field: "unit", width: 50 },
  {
    title: "사이즈",
    field: "size",
    width: 90,
    formatter: typeFormatter,
    formatterParams: {
      typeArray: sizetype,
    },
  },
  {
    title: "색상",
    field: "color",
    width: 70,
    formatter: typeFormatter,
    formatterParams: {
      typeArray: colortype,
    },
  },
  {
    title: "사용여부",
    field: "use_yn",
    width: 105,
    formatter: typeFormatter,
    formatterParams: {
      typeArray: usetype,
    },
  },
  { title: "비고", field: "note", hozAlign: "right" },
];

const initialDetailFields = {
  prod_code: "",
  prod_name: "",
  prod_type: "0k1k",
  category: "0j1j",
  unit: "",
  size: "0h2h",
  color: "0i8i",
  use_yn: "0b1b",
  note: "",
};

const initialSearchFields = {
  prod_code: "",
  prod_name: "",
  prod_type: "",
  size:"",
  category: "",
  use_yn: "",
  use_yse: false,
  use_no: false,
};

const detailFields = ref({ ...initialDetailFields });
const searchData = ref({ ...initialSearchFields });

// const rowClick = (row) => {
//   let str = "";
//   console.log(row.getData());
//   for (let s in row) {
//     str.concat(s);
//   }
//   alert(str);
// }

const tabulatorOptions = {
  selectableRows: 1,
};

const tabulatorEvent = [
  {
    eventName: "rowClick",
    eventAction: (e, row) => {
      const rowData = row.getData();
      // console.log(rowData);
      detailFields.value = { ...rowData };
      //console.log(detailFields.value.product_code);
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

  const tabulator = table.value.getTabulator();
  await tabulator.setData("/api/baseProduct", {
    prod_code: search.prod_code,
    prod_name: search.prod_name,
    prod_type: search.prod_type,
    size: search.size,
    category: search.category,
    use_yn: search.use_yn
  });
  productData.value = tabulator.getData();
};

const productClickhandler = async () => {
  const currentDetailFields = detailFields.value;

  const isAnyRequiredFieldEmpty =
    currentDetailFields.prod_name === "" ||
    currentDetailFields.standard === "" ||
    currentDetailFields.unit === "";

  if (isAnyRequiredFieldEmpty) {
    Swal.fire({
      title: "필수 입력 항목",
      text: "제품명, 규격, 단위을 모두 채워주세요.",
      icon: "error"
    });
    return;
  }

  if (currentDetailFields.unit_price === 0) {
    Swal.fire({
      title: "잘못된 숫자",
      text: "단가가 0으로 설정되어 있습니다.",
      icon: "error"
    });
    return;
  }

  const find = productData.value.find((e) => {
    return e.prod_name === detailFields.value.prod_name;
  });

  if (find != null) {
    console.log(detailFields.value);
    const result = await axios.put("/api/baseProduct", {
      //body
      data: detailFields.value,
    }, {
      //params
      params: {
        code: find.prod_code,
      }
    });
    // console.log(result);
    if (result?.data) {
      Swal.fire({
        title: "성공",
        text: "제품 정보가 수정되었습니다.",
        icon: "success"
      });
    }
  } else {
    const result = await axios.post("/api/baseProduct", {
      data: detailFields.value,
    });
    // console.log(result);
    if (result?.data) {
      Swal.fire({
        title: "성공",
        text: "제품 정보가 추가되었습니다.",
        icon: "success"
      });
    }
  }
  const tabulator = table.value.getTabulator();
  await tabulator.setData("/api/baseProduct", searchData.value);
  productData.value = tabulator.getData();
};

const getBaseProduct = async () => {
  //params 전달
  const product = await axios.get("/api/baseProduct", {
    params: {
      ...searchData.value,
    },
  });
  productData.value = product.data;
  // console.log(productData.value);
};

onMounted(async() => {
  Promise.all([
    groupcodelist.groupCodeList("0k", prdtype),
    groupcodelist.groupCodeList("0j", catetype),
    groupcodelist.groupCodeList("0h", sizetype),
    groupcodelist.groupCodeList("0i", colortype),
    groupcodelist.groupCodeList("0b", usetype),
  ]).then(() => {
    getBaseProduct();
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
          <label class="form-label search-label">제품유형</label>
          <select class="form-select" v-model="searchData.prod_type">
            <option selected value="">전체</option>
            <option v-for="type in prdtype" :value="type.detail_code">
              {{ type.detail_name }}
            </option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label search-label">제품명</label>
          <input
            type="text"
            class="form-control"
            v-model="searchData.prod_name"
            onfocus="this.select()"
          />
        </div>
        <div class="col-md-1">
          <label class="form-label search-label">카테고리</label>
          <select class="form-select" v-model="searchData.category">
            <option selected value="">전체</option>
            <option v-for="type in catetype" :value="type.detail_code">
              {{ type.detail_name }}
            </option>
          </select>
        </div>
        <div class="col-md-1">
          <label class="form-label search-label">사이즈</label>
          <select class="form-select" v-model="searchData.size">
            <option selected value="">전체</option>
            <option v-for="type in sizetype" :value="type.detail_code">
              {{ type.detail_name }}
            </option>
          </select>
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
      <div class="col-7 md-3">
        <tabulator-card
          ref="table"
          card-title="제품 리스트"
          height="610px"
          :table-data="productData"
          :table-columns="productColumns"
          :tabulator-options="tabulatorOptions"
          :on="tabulatorEvent"
        />
      </div>
      <div class="col-md-5 d-flex flex-column">
        <div class="card flex-grow-1" style="min-height: 350px">
          <div class="card-header header-fixed mt-3">
            <h5 class="mt-0 text-start">제품항목 상세</h5>
            <button class="btn btn-sm btn-success" @click="productClickhandler" v-if="canShow(['0c2c', '0c5c'])">저장</button>
          </div>
          <div class="card-body p-2">
            <table class="table table-bordered table-sm align-middle mb-2">
              <tbody style="border-width: 1px">
                <tr>
                  <th style="width: 30%">제품명</th>
                  <td>
                    <input type="text" class="form-control form-control-sm" v-model="detailFields.prod_name" onfocus="this.select()"/>
                  </td>
                </tr>
                <tr>
                  <th>제품유형</th>
                  <td>
                    <select class="form-select form-select-sm" v-model="detailFields.prod_type">
                      <option v-for="type in prdtype" :value="type.detail_code" :selected="type.detail_code == detailFields.prod_type">{{ type.detail_name }}</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <th>카테고리</th>
                  <td>
                    <select class="form-select form-select-sm" v-model="detailFields.category">
                      <option v-for="type in catetype" :value="type.detail_code" :selected="type.detail_code == detailFields.category">{{ type.detail_name }}</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <th>단위</th>
                  <td>
                    <input type="text" class="form-control form-control-sm" v-model="detailFields.unit" onfocus="this.select()"/>
                  </td>
                </tr>
                <tr>
                  <th>사이즈</th>
                  <td>
                    <select class="form-select form-select-sm" v-model="detailFields.size">
                      <option v-for="type in sizetype" :value="type.detail_code" :selected="type.detail_code == detailFields.size">{{ type.detail_name }}</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <th>색상</th>
                  <td>
                    <select class="form-select form-select-sm" v-model="detailFields.color">
                      <option v-for="type in colortype" :value="type.detail_code" :selected="type.detail_code == detailFields.color">{{ type.detail_name }}</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <th>사용여부</th>
                  <td>
                    <div class="form-check use-radio" v-for="type in usetype">
                      <input class="form-check-input" type="radio" :id="'form-'+type.detail_code" 
                        v-model=detailFields.use_yn :value="type.detail_code" :checked="type.detail_code == detailFields.use_yn">
                      <label class="form-check-label" :for="'form-'+type.detail_code">
                      {{ type.detail_name }}
                      </label>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>비고</th>
                  <td><textarea rows="5" class="form-control" v-model="detailFields.node"></textarea></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
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
.search-label {
  font-size: medium;
}
.full-height {
  height: 840px;
  display: flex;
  flex-direction: column;
}
.use-radio {
  display: inline-block;
  padding-right: 15px;
}
.header-fixed {
  height: 50px;
  padding: 10px 15px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #dee2e6;
}
</style>
