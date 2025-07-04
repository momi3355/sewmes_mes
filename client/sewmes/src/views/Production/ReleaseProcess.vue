<script setup>
import { onBeforeMount, onMounted, ref } from "vue";
import { useStore } from "vuex";
import axios from "axios";
import moment from 'moment';

import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import ReleaseProcessLotListModal from "./ReleaseProcessLotListModal.vue";
import { dateFormatter } from "@/assets/js/utils/tableFormatter";
import groupcodelist from "../../assets/js/utils/groupcodelist";
import Swal from "sweetalert2";

// 부서별 권한 관련
const dept = ref("");
onBeforeMount(() => {
  dept.value = store.state.user.dept;
})
const canShow = (allowedDepts) => {
  return allowedDepts.includes(dept.value);
};

const store = useStore();

const stantype = ref([]);

const order_table = ref(null);
const release_table = ref(null);
const isModalOpen = ref(false); //모달

const initialSearchFields = {
  prod_code: "",
  prod_name: "",
  dead_date: "",
};

const searchData = ref({ ...initialSearchFields });
const detailFields = ref({});

const orderData = ref([]);
const orderColumns = [
  { title: "제품코드", field: "prod_code", width: 120 },
  { title: "제품명", field: "prod_name", width: 230 },
  { title: "납품처", field: "cp_name", width: 200 },
  { title: "주문수량", field: "qty" },
  {
    title: "납기일",
    field: "dead_date",
    formatter: dateFormatter,
    formatterParams: {
      dateformat: "YYYY-MM-DD",
    },
  },
];

const orderOptions = {
  selectableRows: 1,
}
const orderEvent = [
  {
    eventName: "rowClick",
    eventAction: (e, row) => {
      const rowData = row.getData();
      detailFields.value = { ...rowData };
      detailFields.value.dead_date = moment(rowData.dead_date).format("YYYY-MM-DD");
      stantype.value.forEach(e => { 
        if (e.detail_code === detailFields.value.standard)
          detailFields.value.standard = e.detail_name
      });
    }
  }
];

const releaseData = ref([]);
const releaseColumns = [
  { title: "LOT", field: "lot" },
  { title: "재고수량", field: "stock_qty", width: 150 },
  { title: "출고수량", field: "release_qty", width: 150,
    editor:"input", editorParams:{
      elementAttributes: {
        onfocus: "this.select()",
      },
    },
  }
];

//리셋
const resetHandler = () => {
  searchData.value = { ...initialSearchFields };
  // detailFields.value = { ...initialDetailFields };
};

//검색
const searchHandler = async () => {
  const tabulator = order_table.value.getTabulator();
  await tabulator.setData("/api/prdReceive", searchData.value);
  orderData.value = tabulator.getData();
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleAfterModalSaved = (lotData) => {
  lotData.forEach(e => e.release_qty = e.stock_qty);
  releaseData.value = lotData;
  const standard = detailFields.value.standard;

  const box = Number(standard.substring(0, standard.indexOf("ea")));
  const release_qty = lotData.reduce((acc, item) => {
    return {
      release_qty: acc.release_qty + item.release_qty
    }
  }).release_qty;

  const release_box = Math.ceil(release_qty / box); //출고박스 계산
  detailFields.value.release_box = release_box;
  // console.log(detailFields.value.release_box);
}

const releaseAddhandler = async () => {
  const tabulator = order_table.value.getTabulator();
  if (!tabulator.getSelectedRows().length) {
    Swal.fire({
      title: "필수 입력 항목",
      text: "제품을 먼저 선택해 주세요.",
      icon: "error"
    });
    return;
  }
  isModalOpen.value = true;
};

const releaseClickhandler = async () => {
  const user = store.state.user;

  const orderTable = order_table.value.getTabulator();
  if (!orderTable.getSelectedRows().length) {
    Swal.fire({
      title: "필수 입력 항목",
      text: "제품을 먼저 선택해 주세요.",
      icon: "error"
    });
    return;
  }
  const releaseTable = release_table.value.getTabulator();
  if (!releaseTable.getData().length) {
    Swal.fire({
      title: "필수 입력 항목",
      text: "출고 정보가 없습니다.",
      icon: "error"
    });
    return;
  }

  const notFound = releaseData.value.find(e => {
    if (e.release_qty == "" || e.release_qty == "0" || e.release_qty == 0)
      return true;
    const qty = Number(e.release_qty);
    if (!qty) return true; //숫자가 아닐경우
    else if (qty > e.stock_qty) return true; //재고 수량보다 많을 경우
    else if (qty < 0) return true; //0보다 적을 경우
  });

  if (notFound) {
    Swal.fire({
      title: "비정상 값",
      text: "출고 수량이 없거나 비정상 값입니다.",
      icon: "error"
    });
    return;
  }

  // console.log("완료");
  const releaseDetailInfo = releaseData.value.map(e => {
    return {
      lot: e.lot,
      qty: e.release_qty,
    };
  });

  const orderCode = orderTable.getSelectedRows();  
  const releaseInfo = {
    order_detail_code: orderCode[0].getData().order_detail_code,
    user_code: user.emp_num,
    lot_info: releaseDetailInfo,
  }

  const query = await axios.post("/api/prdReceive", releaseInfo);
  if (query?.data?.affectedRows) {
    Swal.fire({
      title: "성공",
      text: "제품이 출고처리 되었습니다.",
      icon: "success"
    });
  }
};

onMounted(async () => {
  await groupcodelist.groupCodeList("0z", stantype);
  const productReceive = await axios.get("/api/prdReceive");
  orderData.value = productReceive.data;
});
</script>

<template>
  <div class="container-fluid p-3 full-height">
    <div class="search-area bg-white rounded p-3 mb-3 shadow-sm">
      <div class="row">
        <!-- 상단 검색 영역 -->
        <div class="col-md-2">
          <label class="form-label search-label">제품명</label>
          <input
            type="text"
            class="form-control"
            v-model="searchData.prod_name"
            onfocus="this.select()"
          />
        </div>
        <div class="col-md-2">
          <label for="date" class="form-label search-label">납기일자</label>
          <div class="date-input-wrapper">
            <input type="date"
              id="date"
              class="form-control"
              v-model="searchData.dead_date"
              max="2039-12-31"
              min="2000-01-01">
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
      <div class="col-7">
        <tabulator-card
          ref="order_table"
          card-title="주문 리스트"
          height="640px"
          :table-data="orderData"
          :table-columns="orderColumns"
          :tabulator-options="orderOptions"
          :on="orderEvent"
        />
      </div>
      <div class="col-md-5">
        <div class="card mb-2">
          <div class="card-header header-fixed mt-3">
            <h5 class="mt-0 text-start">주문 상세</h5>
            <div class="btn-container">
              <button class="btn btn-sm btn-success" @click="releaseClickhandler" v-if="canShow(['0c2c', '0c5c'])">저장</button>
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
                      v-model="detailFields.prod_code"
                      readonly
                    />
                  </td>
                </tr>
                <tr>
                  <th>품명</th>
                  <td>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      v-model="detailFields.prod_name"
                      readonly
                    />
                  </td>
                </tr>
                <tr>
                  <th>규격</th>
                  <td>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      v-model="detailFields.standard"
                      readonly
                    />
                  </td>
                </tr>
                <tr>
                  <th>주문수량</th>
                  <td>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      v-model="detailFields.qty"
                      readonly
                    />
                  </td>
                </tr>
                <tr>
                  <th>납기일</th>
                  <td>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      v-model="detailFields.dead_date"
                      readonly
                    />
                  </td>
                </tr>
                <tr>
                  <th>납품처</th>
                  <td>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      v-model="detailFields.cp_name"
                      readonly
                    />
                  </td>
                </tr>
                <tr>
                  <th>출고 박스 수량</th>
                  <td>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      v-model="detailFields.release_box"
                      readonly
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <tabulator-card
          ref="release_table"
          height="235px"
          card-title="출고리스트"
          :table-data="releaseData"
          :table-columns="releaseColumns"
          :tabulator-options="releaseOptions"
          :on="releaseEvent">
          <template #actions>
            <button class="btn btn-sm btn-success" @click="releaseAddhandler" v-if="canShow(['0c2c', '0c5c'])">추가</button>
          </template>
        </tabulator-card>
        <release-process-lot-list-modal
          :isModalOpen="isModalOpen"
          :prodCode="detailFields.prod_code"
          v-on:close-modal="closeModal"
          @saved="handleAfterModalSaved"
        />
      </div>
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
.search-color {
  margin: 10px;
  padding: 20px;
  border-radius: 1rem;
  background-color: #fff;
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