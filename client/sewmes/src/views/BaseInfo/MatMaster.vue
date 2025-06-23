<script setup>
import { onMounted, ref } from "vue";
import axios from "axios";

import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import groupcodelist from "@/assets/js/utils/groupcodelist";
import { typeFormatter } from "@/assets/js/utils/tableFormatter";
import Swal from "sweetalert2";

const mattype = ref([]);
const usetype = ref([]);
const colortype = ref([]);

const table = ref(null);
const materialData = ref([]);

const materialColumns = [
  { title: "자재코드", field: "material_code", width: 100 },
  { title: "자재명", field: "material_name" },
  {
    title: "자재유형",
    field: "material_type",
    width: 75,
    formatter: typeFormatter,
    formatterParams: {
      typeArray: mattype,
    },
  },
  { title: "규격", field: "standard", width: 160 },
  { title: "단위", field: "unit", width: 50 },
  {
    title: "사용여부",
    field: "use_yn",
    width: 105,
    formatter: typeFormatter,
    formatterParams: {
      typeArray: usetype,
    },
  },
  { title: "단가", field: "unit_price", width: 70, hozAlign: "right" },
  { title: "안전 재고 수량", field: "safe_stock", width: 70, hozAlign: "right" },
  {
    title: "색상",
    field: "color",
    width: 70,
    formatter: typeFormatter,
    formatterParams: {
      typeArray: colortype,
    },
  }
];

const initialDetailFields = {
  material_code: "",
  material_name: "",
  material_type: "0l1l",
  standard: "",
  unit: "",
  unit_price: 0,
  safe_stock: 0,
  color: "0i8i",
  use_yn: "0b1b"
};

const initialSearchFields = {
  material_code: "",
  material_name: "",
  material_type: "",
  use_yn: "",
  use_yse: false,
  use_no: false,
};

const detailFields = ref({ ...initialDetailFields });
const searchData = ref({  ...initialSearchFields });

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
}

const tabulatorEvent = [
  {
    eventName: "rowClick",
    eventAction: (e, row) => {
      const rowData = row.getData();
      // console.log(rowData);
      detailFields.value = { ...rowData };
      //console.log(detailFields.value.material_code);
    }
  }
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
  await tabulator.setData("/api/baseMaterial", {
    material_code: search.material_code,
    material_name: search.material_name,
    material_type: search.material_type,
    use_yn: search.use_yn
  });
  materialData.value = tabulator.getData();
};

const materialClickhandler = async () => {
  const currentDetailFields = detailFields.value;

  const isAnyRequiredFieldEmpty =
      currentDetailFields.material_code === "" ||
      currentDetailFields.material_name === "" ||
      currentDetailFields.standard === "" ||
      currentDetailFields.unit === "";

  if (isAnyRequiredFieldEmpty) {
    Swal.fire({
      title: "필수 입력 항목",
      text: "자재 코드, 자재명, 규격, 단위을 모두 채워주세요.",
      icon: "error"
    });
    return;
  }

  if (currentDetailFields.unit_price === 0 || currentDetailFields.safe_stock === 0) {
    Swal.fire({
      title: "잘못된 숫자",
      text: "단가 또는 안전 재고가 0으로 설정되어 있습니다.",
      icon: "error"
    });
    return;
  }

  const find = materialData.value.find(e => {
    return e.material_name === detailFields.value.material_name
  });

  if (find != null) {
    console.log(detailFields.value);
    try {
      const result = await axios.put("/api/baseMaterial", {
        //body
        data: detailFields.value,
      }, {
        //params
        params: {
          code: find.material_code,
        }
      });
      // console.log(result);
      if (result?.data) {
        Swal.fire({
          title: "성공",
          text: "자재 정보가 수정되었습니다.",
          icon: "success"
        });
      }
    } catch(error) {
      console.log(error);
      Swal.fire({
        title: "수정 실패",
        text: "제품을 수정하는 도중에 문제가 발생했습니다.",
        icon: "error"
      });
    }
  } else {
    try {
      detailFields.value.material_code = ""; //새로운 코드 부여
      const result = await axios.post("/api/baseMaterial", {
        data: detailFields.value,
      });
      // console.log(result);
      if (result?.data) {
        Swal.fire({
          title: "성공",
          text: "자재 정보가 추가되었습니다.",
          icon: "success"
        });
      }
    } catch(error) {
      console.error(error.response.data?.message);
      Swal.fire({
        title: "등록 실패",
        text: "제품을 등록하는 도중에 문제가 발생했습니다.",
        icon: "error"
      });
    }
  }
  const tabulator = table.value.getTabulator();
  await tabulator.setData("/api/baseMaterial" , searchData.value);
  materialData.value = tabulator.getData();
};

const getBaseMaterial = async() => {
  const search = searchData.value;
  const material = await axios.get("/api/baseMaterial", {
    params: {
      material_code: search.material_code,
      material_name: search.material_name,
      material_type: search.material_type,
      use_yn: search.use_yn
    }
  });
  materialData.value = material.data;
}

onMounted(async () => {
  Promise.all([
      groupcodelist.groupCodeList("0l", mattype),
      groupcodelist.groupCodeList("0b", usetype),
      groupcodelist.groupCodeList("0i", colortype)
  ]).then(() => {
    getBaseMaterial();
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
          <label class="form-label search-label">자재유형</label>
          <select class="form-select" v-model="searchData.material_type">
            <option selected value="">전체</option>
            <option v-for="type in mattype" :value="type.detail_code">{{ type.detail_name }}</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label search-label">자재명</label>
          <input type="text" class="form-control" v-model="searchData.material_name" onfocus="this.select()">
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
          <button class="btn btn-outline-secondary w-50" @click="resetHandler">초기화</button>
          <button class="btn btn-primary w-50" @click="searchHandler">조회</button>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-7">
        <tabulator-card
          ref="table"
          card-title="자재 품목 리스트"
          height="610px"
          :table-data="materialData"
          :table-columns="materialColumns"
          :tabulator-options="tabulatorOptions"
          :on="tabulatorEvent"
        />
      </div>
      <div class="col-md-5 d-flex flex-column">
        <div class="card flex-grow-1" style="min-height: 350px;">
          <div class="card-header header-fixed mt-3">
            <h5 class="mt-0 text-start">자재항목 상세</h5>
            <button class="btn btn-sm btn-success" @click="materialClickhandler">저장</button>
          </div>
          <div class="card-body p-2">
            <table class="table table-bordered table-sm align-middle mb-2">
              <tbody style="border-width: 1px">
                <tr>
                  <th style="width: 30%;">자재명</th>
                  <td><input type="text" class="form-control form-control-sm" v-model="detailFields.material_name" onfocus="this.select()"></td>
                </tr>
                <tr>
                  <th>자재유형</th>
                  <td>
                    <select class="form-select form-select-sm" v-model="detailFields.material_type">
                      <option v-for="type in mattype" :value="type.detail_code" :selected="type.detail_code == detailFields.material_type">{{ type.detail_name }}</option>
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
                  <th>규격</th>
                  <td><textarea rows="3" class="form-control" v-model="detailFields.standard"></textarea></td>
                </tr>
                <tr>
                  <th>단위</th>
                  <td><input type="text" class="form-control form-control-sm" v-model="detailFields.unit" onfocus="this.select()"></td>
                </tr>
                <tr>
                  <th>단가</th>
                  <td><input type="text" class="form-control form-control-sm" v-model="detailFields.unit_price" onfocus="this.select()"></td>
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
                  <th>안전 재고 수량</th>
                  <td><input type="text" class="form-control form-control-sm" v-model="detailFields.safe_stock" onfocus="this.select()"></td>
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
.full-height {
  height: 840px;
  display: flex;
  flex-direction: column;
}
.search-label {
  font-size: medium;
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
