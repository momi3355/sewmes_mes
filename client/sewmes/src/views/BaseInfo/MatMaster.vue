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
  { title: "자재명", field: "material_name", width: 170 },
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
    return e.material_code === detailFields.value.material_code
  });

  if (find != null) {
    console.log(detailFields.value);
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
  } else {
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
  await groupcodelist.groupCodeList("0l", mattype);
  await groupcodelist.groupCodeList("0b", usetype);
  await groupcodelist.groupCodeList("0i", colortype);
  getBaseMaterial();
});
</script>

<template>
  <div class="container-fluid p-3">
    <div class="row search-color">
      <!-- 상단 검색 영역 -->
      <div class="row mb-3">
        <div class="col-md-2 d-inline-block-custom">
          <label class="form-label">자재코드</label>
          <input type="text" class="form-control" v-model="searchData.material_code">
        </div>
        <div class="col-md-2">
          <label class="form-label">자재명</label>
          <input type="text" class="form-control" v-model="searchData.material_name">
        </div>
        <div class="col-md-2">
          <label class="form-label">자재유형</label>
          <select class="form-select" v-model="searchData.material_type">
            <option selected value="">전체</option>
            <option v-for="type in mattype" :value="type.detail_code">{{ type.detail_name }}</option>
          </select>
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
          <button class="btn btn-secondary me-2" @click="resetHandler">초기화</button>
          <button class="btn btn-primary" @click="searchHandler">조회</button>
        </div>
      </div>
    </div>

    <div class="row me-3">
      <div class="col-7 md-3">
        <tabulator-card
          ref="table"
          card-title="자재 품목 리스트"
          height="500px"
          :table-data="materialData"
          :table-columns="materialColumns"
          :tabulator-options="tabulatorOptions"
          :on="tabulatorEvent"
        />
      </div>
      <div class="col-md-5 d-flex flex-column">
        <div class="card mb-2 flex-grow-1" style="min-height: 350px;">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span>자재항목 상세</span>
            <button class="btn btn-sm btn-success" @click="materialClickhandler">저장</button>
          </div>
          <div class="card-body p-2">
            <table class="table table-bordered table-sm align-middle mb-2">
              <tbody style="border-width: 1px">
                <tr>
                  <th style="width: 30%;">자재코드</th>
                  <td><input type="text" class="form-control form-control-sm" v-model="detailFields.material_code"></td>
                </tr>
                <tr>
                  <th>자재명</th>
                  <td><input type="text" class="form-control form-control-sm" v-model="detailFields.material_name"></td>
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
.search-color {
  margin: 10px;
  padding: 20px;
  border-radius: 1rem;
  background-color: #fff;
}
.use-radio {
  display: inline-block;
  padding-right: 15px;
}
</style>
