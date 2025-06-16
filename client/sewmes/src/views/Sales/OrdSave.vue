<template>
  <div class="card detail-form" id="card">
    <div class="card-body p-4">
      <div class="row g-3 align-items-center">
        <div class="col-md-3 fw-bold">업체명:</div>
<div class="col-md-9 position-relative">
  <div @focusin="listOpen = true" @focusout="onFocusOut">
  <input 
    type="text" 
    class="form-control" 
    v-model="searchTerm"
  />
    <!-- <button class="btn btn-danger" type="button" @click="listOpen = !listOpen">
    </button> -->
  </div>

  <!-- 드롭다운 메뉴 -->
  <ul class="dropdown-menu show" v-if="listOpen" style="position: absolute; top: 100%; left: 0;">
    <li v-for="(company, index) in filteredCompanyList" :key="index">
    <a class="dropdown-item" href="#" @mousedown.prevent @click="selectCompany(company)">
      {{ company.cp_name }}
    </a>
  </li>
</ul>
</div>


  
        <div class="col-md-3 fw-bold">업체 연락처:</div>
        <div class="col-md-9">
          <input type="text" class="form-control" v-model="companyTel" />
        </div>
  
        <div class="col-md-3 fw-bold">주소:</div>
        <div class="col-md-9">
          <input type="text" class="form-control" v-model="address" />
        </div>
  
        <div class="col-md-3 fw-bold">주문일자:</div>
        <div class="col-md-9">
          <input type="date"
        id="orderdate"
        class="form-control"
        max="2039-12-31"
        min="2000-01-01"
        v-model="orderDate">
        </div>
  
        <div class="col-md-3 fw-bold">납기일자:</div>
        <div class="col-md-9">
          <input type="date"
        id="deaddate"
        class="form-control"
        max="2039-12-31"
        min="2000-01-01"
        v-model="deadDate">
        </div>
  
        <div class="col-md-3 fw-bold">영업 담당자 연락처:</div>
        <div class="col-md-9">
          <input type="text" class="form-control" v-model="salesTel" />
        </div>
  
        <div class="col-md-3 fw-bold">영업 담당자:</div>
        <div class="col-md-9">
          <input type="text" class="form-control" v-model="salesManager" />
        </div>
  
        <div class="col-md-3 fw-bold">비고:</div>
        <div class="col-md-9">
          <textarea class="form-control" rows="3" v-model="note"></textarea>
        </div>
      </div>
    </div>
                <div class="card-footer d-flex justify-content-end pt-0">
                  <button class="btn btn-outline-secondary btn-sm me-2" @click="openModal">제품추가 🧾</button>
                <argon-button color="secondary" variant="gradient" class="me-2" id="arbtn">삭제</argon-button>
                <argon-button color="success" variant="gradient" id="arbtn" @click="saveOrder">저장</argon-button>
              </div>
              <tabulator-card
              card-title=""
              :table-data="ordlist"
              :table-columns="OrderColumns"
              :tabulator-options="tabulatorOptions"
              :on="tabulatorEvent"
              style="height: 400px;"
            />
  </div>
        <prodModal
        v-bind:isModalOpen="isModalOpen"
        @selectPlans="getlist"
        @close-modal="closeModal"
        />
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from "vue"; // Import ref and onMounted
  import { useStore } from 'vuex';
  import axios from "axios";
  import ArgonButton from "@/components/ArgonButton.vue";
  import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
  import prodModal from "./prodModal.vue";
  import groupcodelist from "../../assets/js/utils/groupcodelist.js"
  
  const isModalOpen = ref(false); //초기상태
  const ordlist = ref([]);
  const OrderData = ref([]);
  const standardlist = ref([]);
  const values = ref(null);
  const colorlist = ref([]);
  const sizelist = ref([]);
  const colorMap = ref({});
  const sizeMap = ref({});
  const orderDate = ref("");
  const deadDate = ref("");
  const note = ref("");
  const totalPrice = ref("");
  const totalqty = ref("");
  const selprice = ref(0);

    // 로그인 정보 가져오기
    const store = useStore();
    const user = computed(() => store.state.user);
  // 영업 담당자 연락처와 이름 초기값 바인딩
  const salesTel = ref(""); 
const salesManager = ref("");
  // 드롭다운
  const companyTel = ref("");
const address = ref("");
  const companyList = ref([]);
  const listOpen = ref(false);
  const searchTerm = ref("");
  // input 누르고 다른곳 클릭시 에러안나게함
  const onFocusOut = () => {
  setTimeout(() => {
    listOpen.value = false;
  }, 100);
};
  // 선택시에 동작할것들
  const selectCompany = (company) => {
  searchTerm.value = company.cp_code;  // 선택한 회사명 input에 바인딩
    companyTel.value = company.cp_tel;     // 업체 연락처
  address.value = company.address;       // 주소
  listOpen.value = false;  // 드롭다운 닫기
};
// 필터검색
const filteredCompanyList = computed(() => {
  if (!searchTerm.value) return companyList.value;
  return companyList.value.filter(company =>
    company.cp_name.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});
  // 규격에서 수량 추출하는 함수
  const extractUnitCount = (standardValue) => {
    if (!standardValue) return 0;
    const match = standardValue.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };
  
  // 총수량 계산
  const calculateTotalQty = (row) => {
    const standardLabel = values.value[row.standard] || ""; 
    const unitCount = extractUnitCount(standardLabel);
    return unitCount * (parseInt(row.qty) || 0);
  };
  
  // 총금액 계산
  const calculateTotalPrice = (row) => {
    const totalQty = calculateTotalQty(row);
    return totalQty * (parseInt(row.unitprice) || 0);
  };
  
  const handleCellEdit = (cell) => {
    const row = cell.getRow().getData();
    row.totalqty = calculateTotalQty(row);
    row.totalprice = calculateTotalPrice(row);
    cell.getRow().update(row);
  };
  console.log("로그인 유저 정보:", user.value);
  // 선택한 제품 리스트 출력
  const OrderColumns = [
    {formatter:"rowSelection", titleFormatter:"rowSelection", hozAlign:"center", headerSort:false, width: 20,},
    { title: "제품명", field: "prodname", width: 350},
    { title: "색상", field: "color", width: 80,
        formatter: function(cell) {
        const code = cell.getValue();
        return colorMap.value[code] || code;
      }
    },
    { title: "사이즈", field: "size", width: 150,
              formatter: function(cell) {
        const code = cell.getValue();
        return sizeMap.value[code] || code;
      }
     },
    { title: "규격", field: "standard", width: 200, editor: "list",
  editorParams: function() {
    return {
      values: values.value
    }
  },
  formatter: function(cell) {
    const code = cell.getValue();
    return values.value[code] || code;
  },
  cellEdited: handleCellEdit
    },
      { 
      title: "box수량", field: "qty", width: 120, editor: "input",
  cellEdited: function(cell) {
    const row = cell.getRow().getData();
    row.totalqty = calculateTotalQty(row);
    row.totalprice = calculateTotalPrice(row);
    cell.getRow().update(row);
  }
    }, 
    { title: "총수량", field: "totalqty", width: 100,},
    { 
      title: "제품단가", field: "unitprice", width: 200, editor:"input",
      cellEdited: function(cell) {
        const row = cell.getRow().getData();
        row.totalprice = calculateTotalPrice(row);
        cell.getRow().update(row);
      }
    },
    { title: "총금액", field: "selprice", width: 230}
  ];
  
  // 데이터 가지고오기
  onMounted(async () => {
    if (user.value) {
    salesManager.value = user.value.emp_name;
    salesTel.value = user.value.emp_tel;
  }
  try {
    // 1. groupcodelist 먼저 호출
    await groupcodelist.groupCodeList('0Z', standardlist);
    await groupcodelist.groupCodeList('0H', sizelist);
    await groupcodelist.groupCodeList('0I', colorlist);
    
    values.value = Object.fromEntries(
      standardlist.value.map(item => [item.detail_code, item.detail_name])
    );
    colorMap.value = Object.fromEntries(colorlist.value.map(item => [item.detail_code, item.detail_name]));
    sizeMap.value = Object.fromEntries(sizelist.value.map(item => [item.detail_code, item.detail_name]));

    // 2. productList와 companyList를 병렬로 호출
    const [resProduct, resCompany] = await Promise.all([
      axios.get('/api/productList'),
      axios.get('/api/companyDropDown')
    ]);

    // 3. 받아온 데이터 각각 처리
    OrderData.value = resProduct.data.map((item) => {
      console.log('item 데이터', item);
      return {
        prodname: item.prod_name,
        color: item.color,
        size: item.size,
        standard: item.standard,
        qty: 0,
        totalqty: 0,
        totalprice: 0,
        unitprice: 0,
        selprice: 0
      }
    });

    console.log('📦 DB에서 받아온 제품 데이터:', OrderData.value);
companyList.value = resCompany.data;
console.log('🏢 DB에서 받아온 업체 데이터:', companyList.value);

  } catch (error) {
    console.error('❌ 데이터 로딩 실패:', error.message);
  }
});

  // 모달에서 선택한 제품 데이터
  const getlist = (modaldata) =>{
    console.log('자식한테 받아온 데이터', JSON.stringify(modaldata, null, 2));
    console.log('자식한테 받아온 데이터', modaldata);
    ordlist.value = modaldata;
  };
  
  // 모달창
  const openModal = () => {
      isModalOpen.value = true; //isModalOpen 값 true 변경해 모달 열기
  };
  const closeModal = () => {
      isModalOpen.value = false;
  
  };
  // 총 주문금액 계산
  const calculateTotalOrderPrice = () => {
  let total = 0;
  ordlist.value.forEach(item => {
    total += parseInt(item.selprice || 0);  // 혹은 item.selprice 로 바꿔야 할 수도 있음
  });
  return total;
};
  // 주문 등록
  // 주문 등록
const saveOrder = async () => {
  try {
    // 💡 먼저 selprice 계산부터 한다
    ordlist.value = ordlist.value.map(item => {
      const qty = parseInt(item.qty || 0);
      const unitprice = parseInt(item.unitprice || 0);
      const standardQty = parseInt(item.totalqty || 0);  // 총수량 기준
      
      const selprice = standardQty * unitprice;
      return { ...item, selprice };  // selprice를 새로 계산해서 덮어씌움
    });

    // 그리고 나서 데이터 전송 준비
    const orderData = {
      cp_code: searchTerm.value,
      emp_num: user.value.emp_num,
      orderDate: orderDate.value,
      deadDate: deadDate.value,
      note: note.value || '',
      totalprice: calculateTotalOrderPrice(), // 이때는 selprice가 다 들어가있음
      orderDetails: ordlist.value
    };

    console.log('보낼 주문 데이터:', orderData);

    const res = await axios.post('/api/orderAdd', orderData);

    if (res.data.success) {
      alert('주문서가 성공적으로 저장되었습니다.');
    } else {
      alert('저장에 실패했습니다.');
    }
  } catch (err) {
    console.error('저장 중 오류:', err);
    alert('저장 중 오류가 발생했습니다.');
  }
}
// const saveOrder = async () => {
//   try {
//     const orderData = {
//       cp_code: searchTerm.value,  // 업체코드 (업체명 선택시 cp_code를 받아야 함)
//       emp_num: user.value.emp_num,       // 로그인 유저 사번
//       orderDate: orderDate.value,
//       deadDate: deadDate.value,
//       note: note.value || '',
//       totalprice: calculateTotalOrderPrice(),
//       orderDetails: ordlist.value  // 제품 상세 리스트 (배열)

//     };

//     console.log('보낼 주문 데이터:', orderData);

//     const res = await axios.post('/api/orderAdd', orderData);

//     if (res.data.success) {
//       alert('주문서가 성공적으로 저장되었습니다.');
//     } else {
//       alert('저장에 실패했습니다.');
//     }
//   } catch (err) {
//     console.error('저장 중 오류:', err);
//     alert('저장 중 오류가 발생했습니다.');  // 👈 이렇게 수정
//   }
// }
  </script>
  
  <style>
  /* 주문 상세 카드 내부의 제품 테이블 */
  #card{
    width: 1500px;
    margin: auto;
  }
  #tabulator-card{
      width: 1500px;
    margin: auto;
  }
  
  /* 테이블 스타일 */
  
  
  #arbtn{
    width: 65px;
    height: 40px;
  }
  </style>