<template>
  <div class="container-fluid p-3">
    <!-- 📦 주문 목록 + 상세 -->
<div class="container-fluid py-4" id="odlist">
  <div class="row gx-4">
    <!-- 주문서 목록1 -->
    <div class="col-lg-6 mb-4">
      <tabulator-card
        card-title="외주업체 목록"
        :table-data="companyData"
        :table-columns="companyColumns"
        :tabulator-options="{selectableRows : 1}"
        :on="selectCompany"
        style="height: 700px;"
      />
    </div>

    <!-- 주문서 목록2 -->
    <div class="col-lg-6 mb-4">
      <tabulator-card
       ref="outprodTable"
        card-title="외주 가능 제품"
        :table-data="modalSelectList"
        :table-columns="outpossible"
        :tabulator-options="{selectableRows : 1}"
        style="height: 700px;"
      >
        <!-- actions 슬롯에 버튼을 삽입 -->
        <template #actions>
          <button class="btn btn-outline-secondary btn-sm me-2" id="openModal" @click="openModal">제품추가 🧾</button>
          <ArgonButton class="removebtn" color="danger" variant="gradient" @click="deleteEvent">삭제</ArgonButton>
          <argon-button color="success" variant="gradient" @click="saveEvent">저장</argon-button>
        </template>
      </tabulator-card>
    </div>
  </div>
</div>

  </div>
  
  <!-- 제품 추가 모달 -->
  <OutProdModal
    v-bind:isModalOpen="ModalState"
    @selectPlans="getlist"
    @close-modal="closeModal"
  />
</template>

<script setup>
import { ref, onMounted } from "vue";
// import { useStore } from 'vuex';
import axios from "axios";
import ArgonButton from "@/components/ArgonButton.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import OutProdModal from "./OutProdModal.vue";
import groupcodelist from "../../assets/js/utils/groupcodelist.js"

// 공통코드 변환
const addresscode = ref([]);
const statecode = ref([]);
const categorycode = ref([]);
const colorcode = ref([]);
const sizecode = ref([]);

const companyData = ref([]); // 업체 정보
const modalSelectList = ref([]); // 모달에서 선택한 제품들
const ModalState = ref(false); // 모달 on/off 초기값 설정
const selectCpcode = ref(null); // 선택한 업체코드
const selectOutProd = ref([])
const originalData = ref([]);

// 외주업체 목록
const companyColumns = [
  { title: "순번", field: "num", width: 80 },
  { title: "업체코드", field: "cpcode", width: 170 },
  { title: "업체명", field: "cpname", width: 230 },
  { title: "지역", field: "region", width: 90,
  formatter:(cell)=>{
    const code = cell.getValue();
    const matched = addresscode.value.find(item => item.detail_code == code);
    return matched ? matched.detail_name : code;
  }
   },
  // { title: "상태", field: "useyn", width: 100,
  // formatter:(cell)=>{
  //   const code = cell.getValue();
  //   const matched = statecode.value.find(item => item.detail_code == code);
  //   return matched ? matched.detail_name : code;
  // }
  //  },
  { title: "등록날짜", field: "firstreg", width: 150 },
];

// 외주 가능 제품
const outpossible = [
  {formatter:"rowSelection", titleFormatter:"rowSelection", hozAlign:"center", headerSort:false, width: 20,},
  { title: "순번", field: "nums", width: 80 },
  { title: "제품코드", field: "prodcode", width: 120 },
  { title: "제품명", field: "prodname", width: 170 },
  { title: "카테고리", field: "prodcategory", width: 110,
  formatter:(cell)=>{
    const code = cell.getValue();
    const matched = categorycode.value.find(item => item.detail_code == code);
    return matched ? matched.detail_name : code;
  }
   },
  { title: "색상", field: "prodcolor", width: 100,
  formatter:(cell)=>{
    const code = cell.getValue();
    const matched = colorcode.value.find(item => item.detail_code == code);
    return matched ? matched.detail_name : code;
  }
   },
  { title: "사이즈", field: "prodsize", width: 119,
  formatter:(cell)=>{
    const code = cell.getValue();
    const matched = sizecode.value.find(item => item.detail_code == code);
    return matched ? matched.detail_name : code;
  }
   },
];

// 백엔드 API 가지고 와서 필드에 업체목록 데이터 뿌려주기
const outcompanyList = async() => {
  try{
    const result = await axios.get('/api/outcompanyList');

    companyData.value = result.data.map((item,idx) => ({
    num : idx+ 1,
    cpcode : item.cp_code,
    cpname : item.cp_name,
    region : item.region,
    // useyn : item.use_yn,
    firstreg : item.first_reg
    }));
    console.log(result.data);
    console.log("외주업체 목록 데이터", companyData);
  } catch(error){
    console.error("외주업체 목록 데이터 오류", error);
  }
};
  // 행 클릭시 작동될 이벤트 (선택한 업체)
  const selectCompany = [
  {
    eventName: "rowSelectionChanged",
    eventAction: async (data, rows) => {
      if (rows.length === 0) {
        selectCpcode.value = null;
        selectOutProd.value = [];
        modalSelectList.value = [];
        console.log("선택 해제됨");
        return;
      }

      const row = rows[0];
      selectCpcode.value = row.getData().cpcode;

      const result = await axios.get(`/api/yesOutProdList?cpcode=${selectCpcode.value}`);
      const items = result.data || [];

      selectOutProd.value = items.map((item, idx) => ({
        nums: idx + 1,
        prodcode: item.prod_code,
        prodname: item.prod_name,
        prodcategory: item.category,
        prodcolor: item.color,
        prodsize: item.size
      }));

      // 이 부분 수정 (덮어쓰기 대신 병합)
      const combined = [...modalSelectList.value, ...selectOutProd.value];

      const unique = combined.filter(
        (item, index, self) =>
          index === self.findIndex(t => t.prodcode === item.prodcode),
      );

      unique.forEach((item, idx) => {
        item.nums = idx + 1;
      });

      modalSelectList.value = unique;
      originalData.value = [...selectOutProd.value];
    }
  }
];

  // 모달창
const openModal = () => {
  if (!selectCpcode.value) {
    alert("업체를 선택하세요.");
    return;
  }
  ModalState.value = true;
};

const closeModal = () => {
  ModalState.value = false;
};
// 모달 창에서 선택한 데이터 삭제
const outprodTable = ref(null); // tabulator-card에 ref로 바인딩

const deleteEvent = async () => {
  const table = outprodTable.value?.table; // Tabulator 인스턴스 접근
  if (!table) {
    alert("테이블 로딩 오류");
    return;
  }

  const selectedRows = table.getSelectedData();

  if (selectedRows.length === 0) {
    alert("삭제할 제품을 선택하세요.");
    return;
  }

  try {
    // 프론트 목록에서 제거
    modalSelectList.value = modalSelectList.value.filter(item =>
      !selectedRows.some(row => row.prodcode === item.prodcode)
    );

    // 백엔드 삭제
    for (const row of selectedRows) {
      const res = await axios.delete('/api/outProdDelete', {
        data: {
          cp_code: selectCpcode.value,
          prod_code: row.prodcode,
        },
      });

      if (res.data.success) {
        console.log(`제품 ${row.prodcode} 삭제 성공`);
      } else {
        console.warn(`제품 ${row.prodcode} 삭제 실패`);
      }
    }

    alert("삭제되었습니다.");
  } catch (err) {
    console.error("삭제 중 오류:", err);
    alert("삭제 실패");
  }
};

  // 모달에서 선택한 제품 데이터
const getlist = (modaldata) => {
  console.log('자식한테 받아온 데이터', JSON.stringify(modaldata, null, 2));

  // 모달에서 넘어온 데이터 변환
  const converted = modaldata.map((item) => ({
    nums: 0,  // 일단 0으로 두고 아래서 다시 순번 부여
    prodcode: item.prodcode || item.prod_code,
    prodname: item.prodname || item.prod_name,
    prodcategory: item.category,
    prodcolor: item.color,
    prodsize: item.size
  }));
  // 기존 + 신규 병합
  const combined = [...modalSelectList.value, ...converted];

  // 중복 제거 (prodcode 기준)
  const unique = combined.filter(
    (item, index, self) =>
      index === self.findIndex(t => t.prodcode === item.prodcode),
  );

  // 순번 다시 부여
  unique.forEach((item, idx) => {
    item.nums = idx + 1;
  });

  modalSelectList.value.splice(0, modalSelectList.value.length, ...unique);
};

  // 저장버튼 이벤트
  const saveEvent = async () => {
  try {
    const originalCodes = originalData.value.map(item => item.prodcode);
    const newItems = modalSelectList.value.filter(item => !originalCodes.includes(item.prodcode));

    if (newItems.length === 0) {
      alert("추가된 제품이 없습니다. 제품을 추가하세요.");
      return;
    }

    for (const item of newItems) {
      const selectData = {
        cp_code: selectCpcode.value,
        prod_code: item.prodcode
      };

      const res = await axios.post('/api/outProdCpInsert', selectData);

      if (res.data.success) {
        console.log(`제품 ${item.prodcode} 저장 성공`);
      } else {
        console.error(`제품 ${item.prodcode} 저장 실패`);
      }
    }

    alert('저장되었습니다.');
    location.reload();
  } catch (err) {
    console.error('저장 중 오류 발생:', err);
    alert('저장에 실패했습니다.');
  }
};

onMounted(() => {
  outcompanyList();
  groupcodelist.groupCodeList('0F', addresscode);
  groupcodelist.groupCodeList('0B', statecode);
  groupcodelist.groupCodeList('0J', categorycode);
  groupcodelist.groupCodeList('0I', colorcode);
  groupcodelist.groupCodeList('0H', sizecode);
});

</script>

<style scoped>
.search-color { margin: 10px; padding: 20px; border-radius: 1rem; background-color: #fff; }
#openModal{
  margin: 0px;
}
</style>
