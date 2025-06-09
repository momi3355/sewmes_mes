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

const materialData = ref([
  {
    material_code: "FAB001",
    material_name: "면 30수 싱글 원단",
    material_type: "0l1l",
    standard: "30수 / 싱글 / 화이트 / 150mm",
    unit: "M",
    unit_price: 2800,
    safe_stock: 2500,
    color: "0i8i",
    use_yn: "0b1b"
  },
  {
    material_code: "BTNPL15",
    material_name: "플라스틱 단추 15mm",
    material_type: "0l2l",
    standard: "15mm / 2홀",
    unit: "EA",
    unit_price: 15,
    safe_stock: 5000,
    color: "0i9i",
    use_yn: "0b1b"
  },
]);

const mattypeFormatter = (cell) => {
  const code = cell.getValue();
  const foundType = mattype.value.find(type => type.code === code);
  return foundType ? foundType.name : code;
};

const usetypeFormatter = (cell) => {
  const code = cell.getValue();
  const foundType = usetype.value.find(type => type.code === code);
  return foundType ? foundType.name : code;
};

const colortypeFormatter = (cell) => {
  const code = cell.getValue();
  const foundType = colortype.value.find(type => type.code === code);
  return foundType ? foundType.name : code;
};

const materialColumns = [
  { title: "자재코드", field: "material_code", width: 100 },
  { title: "자재명", field: "material_name", width: 170 },
  {
    title: "자재 유형",
    field: "material_type",
    width: 75,
    formatter: mattypeFormatter // 포매터만 적용
  },
  { title: "규격", field: "standard", width: 160 },
  { title: "단위", field: "unit", width: 50 },
  {
    title: "사용여부",
    field: "use_yn",
    width: 105,
    formatter: usetypeFormatter // 포매터만 적용
  },
  { title: "단가", field: "unit_price", width: 70, hozAlign: "right" },
  { title: "안전 재고 수량", field: "safe_stock", width: 70, hozAlign: "right" },
  {
    title: "색상",
    field: "color",
    width: 70,
    formatter: colortypeFormatter // 포매터만 적용
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

const detailFields = ref({ ...initialDetailFields });

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
      console.log(rowData);
      detailFields.value = rowData;
      //console.log(detailFields.value.material_code);
    }
  }
];

const materialClickhandler = async () => {
  const find = materialData.value.find(e => {
    return e.material_code === detailFields.value.material_code
  });
  if (find !== null) {
    const result = await axios.put("/api/materialUpdate/"+find.material_code);
    console.log(result);
  } else {
    const result = await axios.post("/api/materialInsert");
    console.log(result);
  }
};

onMounted(async () => {
  const material = await axios.get("/api/materialList");
  materialData.value.push({
    initialDetailFields
  });
  console.log(material.data);
});


</script>

<template>
  <div class="container-fluid p-3">
    <div class="row search-color">
      <!-- 상단 검색 영역 -->
      <div class="row mb-3">
        <div class="col-md-2 d-inline-block-custom">
          <label class="form-label">자재코드</label>
          <input name="searchField1" type="text" class="form-control" v-model="searchField1">
        </div>
        <div class="col-md-2">
          <label class="form-label">자재유형</label>
          <select class="form-select">
            <option selected>전체</option>
            <option v-for="type in mattype" :value="type.code">{{ type.name }}</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label">자재명</label>
          <input type="text" class="form-control" v-model="searchField3">
        </div>
        <div class="col-md-2">
          <label class="form-label">사용여부</label>
          <div class="form-check" v-for="type in usetype">
            <input class="form-check-input" type="radio" name="search-useType" :id="'search-'+type.code">
            <label class="form-check-label" :for="'search-'+type.code">
              {{ type.name }}
            </label>
          </div>
        </div>
        <div class="col-md-2 d-flex align-items-end">
          <button class="btn btn-secondary me-2">초기화</button>
          <button class="btn btn-primary">조회</button>
        </div>
      </div>
    </div>

    <div class="row me-3">
      <div class="col-7 md-3">
        <tabulator-card
          card-title="자제 품목 리스트"
          :table-data="materialData"
          :table-columns="materialColumns"
          :tabulator-options="tabulatorOptions"
          :on="tabulatorEvent"
        />
      </div>
      <div class="col">
        <div class="card mb-3">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5>자재 상세</h5>
            <button class="btn btn-sm btn-success" @click="materialClickhandler">저장</button>
          </div>
          <div class="card-body">
            <div class="row mb-2">
              <div class="col-md-6">
                <label class="form-label">자제코드</label>
                <input type="text" class="form-control" v-model="detailFields.material_code">
              </div>
              <div class="col-md-6">
                <label class="form-label">자재 유형</label>
                <select class="form-select">
                  <option v-for="type in mattype" :value="type.code" :selected="type.code == detailFields.material_type">{{ type.name }}</option>
                </select>
                <!-- <input type="text" class="form-control" v-model="detailFields.material_type"> -->
              </div>
              <div class="col-md-12">
                <label class="form-label">자재명</label>
                <input type="text" class="form-control" v-model="detailFields.material_name">
              </div>
              <div class="col-md-12">
                <label class="form-label">규격</label>
                <input type="text" class="form-control" v-model="detailFields.standard">
              </div>
              <div class="col-md-6">
                <label class="form-label">단위</label>
                <input type="text" class="form-control" v-model="detailFields.unit">
              </div>
              <div class="col-md-6">
                <label class="form-label">단가</label>
                <input type="text" class="form-control" v-model="detailFields.unit_price">
              </div>
              <div class="col-md-12">
                <label class="form-label">사용여부</label>
                <!-- <select class="form-select">
                  <option v-for="type in usetype" :value="type.code" :selected="type.code == detailFields.use_yn">{{ type.name }}</option>
                </select> -->
                <div class="form-check" v-for="type in usetype">
                  <input class="form-check-input" type="radio" name="useType" :id="type.code" :checked="type.code == detailFields.use_yn">
                  <label class="form-check-label" :for="type.code">
                  {{ type.name }}
                  </label>
                </div>
                <!-- <input type="text" class="form-control" v-model="detailFields.use_yn"> -->
              </div>
              <div class="col-md-6">
                <label class="form-label">색상</label>
                <!-- <input type="text" class="form-control" v-model="detailFields.color"> -->
                 <select class="form-select">
                  <option v-for="type in colortype" :value="type.code" :selected="type.code == detailFields.color">{{ type.name }}</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">안전 재고 수량</label>
                <input type="text" class="form-control" v-model="detailFields.safe_stock">
              </div>
            </div>
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
</style>
