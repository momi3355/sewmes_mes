<script setup>
import { onMounted, ref } from "vue";
import axios from "axios";

import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";

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
const usetype = ref([
  {
    code: "0b1b",
    name: "사용",
  },
  {
    code: "0b2b",
    name: "비사용",
  }
]);
const colortype = ref([
  {
    code: "0i1i",
    name: "빨",
  },
  {
    code: "0i2i",
    name: "주",
  },
  {
    code: "0i3i",
    name: "노",
  },
    {
    code: "0i4i",
    name: "초",
  },
  {
    code: "0i5i",
    name: "파",
  },
  {
    code: "0i6i",
    name: "남",
  },
  {
    code: "0i7i",
    name: "보",
  },
  {
    code: "0i8i",
    name: "흰",
  },
  {
    code: "0i9i",
    name: "검",
  }
]);

const table = ref(null);
const materialData = ref([]);

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
  { title: "단위", field: "unit", width: 50 },
  {
    title: "사용여부",
    field: "use_yn",
    width: 105,
    formatter: typeFormatter,
    formatterParams: {
      typeArray: usetype.value,
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
      typeArray: colortype.value,
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
  use_yn: "0b1b"
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
  const tabulator = table.value.getTabulator();
  await tabulator.setData("/api/baseMaterial" , searchData.value);
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
      alert("필수 입력 항목(자재 코드, 자재명, 규격, 단위)을 모두 채워주세요.");
      return;
  }

  if (currentDetailFields.unit_price === 0 || currentDetailFields.safe_stock === 0) {
      alert("단가 또는 안전 재고가 0으로 설정되어 있습니다. 확인해 주세요.");
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
    console.log(result);
  } else {
    const result = await axios.post("/api/baseMaterial", {
      data: detailFields.value,
    });
    console.log(result);
  }
  const tabulator = table.value.getTabulator();
  await tabulator.setData("/api/baseMaterial" , searchData.value);
  materialData.value = tabulator.getData();
};

const getBaseMaterial = async() => {
  //params 전달
  const material = await axios.get("/api/baseMaterial", {
    params: {
      ...searchData.value
    }
  });
  materialData.value = material.data;
}

onMounted(() => {
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
            <option v-for="type in mattype" :value="type.code">{{ type.name }}</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label">사용여부</label>
          <div class="form-check" v-for="type in usetype">
            <input 
              class="form-check-input"
              type="checkbox"
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
                      <option v-for="type in mattype" :value="type.code" :selected="type.code == detailFields.material_type">{{ type.name }}</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <th>색상</th>
                  <td>
                    <select class="form-select form-select-sm" v-model="detailFields.color">
                      <option v-for="type in colortype" :value="type.code" :selected="type.code == detailFields.color">{{ type.name }}</option>
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
                      <input class="form-check-input" type="radio" :id="'form-'+type.code" 
                        v-model=detailFields.use_yn :value="type.code" :checked="type.code == detailFields.use_yn">
                      <label class="form-check-label" :for="'form-'+type.code">
                      {{ type.name }}
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
