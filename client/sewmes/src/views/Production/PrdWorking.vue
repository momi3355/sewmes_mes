<script setup>
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { ref, onMounted, computed, watch } from "vue";
import axios from "axios"; // axios 직접 임포트
// import ArgonButton from "@/components/ArgonButton.vue"; // ArgonButton은 더 이상 사용하지 않으므로 주석 처리 또는 삭제
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import PrdPrefModal from "./PrdPrefModal.vue";

// --- 상태 변수 선언 (ref 사용) ---
const workOrderData = ref([]);
const processFlowData = ref([]);
const equipmentData = ref([]);

const currentWorkOrder = ref({
  work_inst_code: '', prod_name: '', inst_qty: null, inst_date: '', lot: '',
  item_code: '', material: '', thickness: null, width: null, length: null,
  color: '',
  option_dansu: false, dansu_qty: null,
  option_jasu: false, jasu_qty: null,
  option_zipper: false, zipper_qty: null,
  option_printing: false, printing_qty: null,
  work_start_date: '', work_end_date: '',
  inst_state: "0s1s", // 초기 상태 '생산전' 코드
  bom_type: '', material_name: '', material_spec: '',
  width_cm: null,
  length_m: null,
  has_dancho: false, 
  has_jasu: false, 
  has_zipper: false, 
  has_printing: false,
  isSelected: false
});

const selectedProcess = ref({
  process_code: '', process_name: '', detail: '', process_seq: null,
  inst_qty: null, prod_code: '', isSelected: false
});

const selectedEquipment = ref({
  equi_code: '', equi_name: '', status: '', equip_type: '', // ⭐ status 필드명 확인 (equi_status에서 status로 변경) ⭐
  need_time: null, process_type: '', use_yn: '', isSelected: false
});

const isLoadingWorkOrders = ref(false);
const isLoadingProcesses = ref(false);
const isLoadingEquipment = ref(false);
const isProcessingWork = ref(false);

// 사용자 정보 (로그인 여부, 사번 등) - 임시로 하드코딩하거나 로그인 로직에서 받아와야 함
const currentUser = ref({
  emp_num: 'USR001', // 예시 사번
  name: '홍길동'
});
const isLoggedIn = computed(() => !!currentUser.value.emp_num); // 사용자 정보 유무로 로그인 상태 판단

// --- Computed 속성 (버튼/그리드 활성화 로직) ---
const isProcessGridEnabled = computed(() => !!currentWorkOrder.value?.work_inst_code);
const isEquipmentGridEnabled = computed(() => !!selectedProcess.value?.process_code);

const isStartButtonEnabled = computed(() =>
  !!currentWorkOrder.value?.work_inst_code &&
  !!selectedProcess.value?.process_code &&
  !!selectedEquipment.value?.equi_code &&
  currentWorkOrder.value?.inst_state !== '0s2s' && // '생산중'이 아닐 때만 시작 가능
  currentWorkOrder.value?.inst_state !== '0s3s' && // '생산완료'도 시작 불가
  !isProcessingWork.value
);

const isEndButtonEnabled = computed(() =>
  !!currentWorkOrder.value?.work_inst_code &&
  !!selectedProcess.value?.process_code &&
  !!selectedEquipment.value?.equi_code &&
  currentWorkOrder.value?.inst_state === '0s2s' && // '생산중' 상태일 때만 종료 가능
  !isProcessingWork.value
);

// --- Tabulator Columns 및 Options ---
const workOrderColumns = [
  { title: "지시코드", field: "work_inst_code", width: 120, hozAlign: "center" },
  { title: "제품명", field: "prod_name", width: 180 },
  { title: "수량", field: "inst_qty", hozAlign: "right", width: 90 },
  { title: "지시일자", field: "inst_date", hozAlign: "center", width: 200 },
  { title: "작업시작일", field: "work_start_date", hozAlign: "center", width: 200 },
  { title: "작업종료일", field: "work_end_date", hozAlign: "center", width: 200 },
  { title: "진행상태", field: "inst_state", width: 180 },
];

const workOrderTabulatorOptions = {

  pagination: false,
  selectable: 1, // 단일 행 선택
  rowFormatter: function(row) {
    if (row.getData().isSelected) {
      row.getElement().classList.add("selected-row");
    } else {
      row.getElement().classList.remove("selected-row");
    }
  }
};

const workOrderOnEvents = [
  {
    eventName: "rowClick",
    eventAction: (e, row) => {
      selectWorkOrder(row.getData());
    }
  }
];

const processFlowColumns = [
  { title: "공정코드", field: "process_code", width: 200 },
  { title: "공정명", field: "process_name", width: 380 },
  { title: "공정순서", field: "process_seq", hozAlign: "right", width: 150 },
];

const processFlowTabulatorOptions = {

  selectable: 1,
  rowFormatter: function(row) {
    if (row.getData().isSelected) {
      row.getElement().classList.add("selected-row");
    } else {
      row.getElement().classList.remove("selected-row");
    }
  }
};

const processFlowOnEvents = [
  {
    eventName: "rowClick",
    eventAction: (e, row) => {
      selectProcess(row.getData());
    }
  }
];

const equipmentColumns = [
  { title: "설비코드", field: "equi_code", width: 100, hozAlign: "center" },
  { title: "설비명", field: "equi_name", minWidth: 150 },
  { title: "상태", field: "equi_status", width: 100, hozAlign: "center", // ⭐ field: "status"로 변경됨 ⭐
    formatter: function(cell) {
      const status = cell.getValue();
      let colorClass = '';
      if (status === '가동가능') {
        colorClass = 'text-success';
      } else if (status === '점검필요') {
        colorClass = 'text-danger';
      } else if (status === '가동중') {
        colorClass = 'text-primary';
      }
      return `<span class="${colorClass}">${status}</span>`;
    }
  },

];

const equipmentTabulatorOptions = {
  layout: 'fitColumns',
  selectable: 1,
  rowFormatter: function(row) {
    if (row.getData().isSelected) {
      row.getElement().classList.add("selected-row");
    } else {
      row.getElement().classList.remove("selected-row");
    }
  }
};

const equipmentOnEvents = [
  {
    eventName: "rowClick",
    eventAction: (e, row) => {
      selectEquipment(row.getData());
    }
  }
];

// --- 데이터 로딩 함수 ---
const fetchAllWorkOrders = async () => {
  isLoadingWorkOrders.value = true;
  try {
    const response = await axios.get('/api/allworkInst');
    if (response.data.success && Array.isArray(response.data.data)) {
      workOrderData.value = response.data.data.map(item => ({ ...item, isSelected: false }));
    } else {
      console.error('작업지시 목록 불러오기 실패:', response.data.message);
      workOrderData.value = [];
    }
  } catch (error) {
    console.error('API 호출 중 오류 발생 (fetchAllWorkOrders):', error);
    workOrderData.value = [];
  } finally {
    isLoadingWorkOrders.value = false;
  }
};

const fetchProcessFlow = async (workInstCode) => {
  isLoadingProcesses.value = true;
  try {
    const response = await axios.get(`/api/workInst/${workInstCode}/processes`);
    if (response.data.success && Array.isArray(response.data.data)) {
      processFlowData.value = response.data.data.map(item => ({ ...item, isSelected: false }));
    } else {
      console.error('공정 흐름도 불러오기 실패:', response.data.message);
      processFlowData.value = [];
    }
  } catch (error) {
    console.error('API 호출 중 오류 발생 (fetchProcessFlow):', error);
    processFlowData.value = [];
  } finally {
    isLoadingProcesses.value = false;
  }
};

const fetchEquipmentByProcess = async (processCode) => {
  isLoadingEquipment.value = true;
  try {
    const response = await axios.get(`/api/processes/${processCode}/equipment`);
    if (response.data.success && Array.isArray(response.data.data)) {
      equipmentData.value = response.data.data.map(item => ({ ...item, isSelected: false }));
    } else {
      console.error('설비 목록 불러오기 실패:', response.data.message);
      equipmentData.value = [];
    }
  } catch (error) {
    console.error('API 호출 중 오류 발생 (fetchEquipmentByProcess):', error);
    equipmentData.value = [];
  } finally {
    isLoadingEquipment.value = false;
  }
};

// --- 선택 로직 (ref 직접 업데이트) ---
const selectWorkOrder = async (workOrder) => {
  // 다른 작업지시의 선택 상태를 해제하고 현재 작업지시만 선택 상태로 설정
  workOrderData.value.forEach(item => {
    item.isSelected = (item.work_inst_code === workOrder.work_inst_code);
  });

  // currentWorkOrder를 설정하고, 필요한 경우 work_start_date와 work_end_date 초기화
  currentWorkOrder.value = {
    ...workOrder,
    work_start_date: workOrder.work_start_date || '',
    work_end_date: workOrder.work_end_date || ''
  };

  // 공정 및 설비 선택 상태 초기화
  selectedProcess.value = { process_code: '', process_name: '', detail: '', isSelected: false };
  selectedEquipment.value = { equi_code: '', equi_name: '', equi_status: '', isSelected: false };

 

  if (workOrder && workOrder.work_inst_code) {
    await fetchProcessFlow(workOrder.work_inst_code); // 공정 흐름도 불러오기
  }
};

const selectProcess = async (process) => {
  // 다른 공정의 선택 상태를 해제하고 현재 공정만 선택 상태로 설정
  processFlowData.value.forEach(item => {
    item.isSelected = (item.process_code === process.process_code);
  });

  selectedProcess.value = { ...process, isSelected: true };
  selectedEquipment.value = { equi_code: '', equi_name: '', status: '', isSelected: false };
  equipmentData.value = []; // 설비 데이터 초기화

  if (process && process.process_code) {
    await fetchEquipmentByProcess(process.process_code); // 설비 목록 불러오기
  }
};

const selectEquipment = (equipment) => {
  // 다른 설비의 선택 상태를 해제하고 현재 설비만 선택 상태로 설정
  equipmentData.value.forEach(item => {
    item.isSelected = (item.equi_code === equipment.equi_code);
  });
  selectedEquipment.value = { ...equipment, isSelected: true };
};

// --- 작업 시작/종료 핸들러 ---
const startWorkHandler = async () => {
  isProcessingWork.value = true;
  try {
    if (!currentWorkOrder.value.work_inst_code || !selectedProcess.value.process_code || !selectedEquipment.value.equi_code || !isLoggedIn.value) {
      alert("작업 시작을 위해 작업지시, 공정, 설비를 모두 선택하고 로그인 상태를 확인해주세요.");
      return;
    }

    const userEmpNum = currentUser.value.emp_num;
    const now = new Date();
    const currentTime = now.toISOString().slice(0, 19).replace('T', ' ');

    const payload = {
      work_inst_code: currentWorkOrder.value.work_inst_code,
      process_code: selectedProcess.value.process_code,
      equi_code: selectedEquipment.value.equi_code,
      start_date: currentTime,
      user_code: userEmpNum,
    };

    const response = await axios.post('/api/startWork', payload);

    if (response.data.success) {
      currentWorkOrder.value.work_start_date = currentTime;
      currentWorkOrder.value.inst_state = '0s2s'; // '생산중'으로 변경

      // 작업 지시 목록의 해당 작업 지시 상태도 업데이트
      const index = workOrderData.value.findIndex(wo => wo.work_inst_code === currentWorkOrder.value.work_inst_code);
      if (index !== -1) {
        workOrderData.value[index].inst_state = '0s2s';
        workOrderData.value[index].work_start_date = currentTime;
      }
      alert('작업이 시작되었습니다.');
    } else {
      alert('작업 시작에 실패했습니다: ' + (response.data.message || '알 수 없는 오류'));
    }
  } catch (error) {
    console.error('작업 시작 실패:', error);
    alert('작업 시작 중 오류가 발생했습니다.');
  } finally {
    isProcessingWork.value = false;
  }
};
const isModalOpen = ref(false); //초기상태
  
const openModal = () => {
    isModalOpen.value = true; //isModalOpen 값 true 변경해 모달 열기
};
const closeModal = () => {
    isModalOpen.value = false;
};
const endWorkHandler = async () => {


  // isProcessingWork.value = true;
  // try {
  //   if (!currentWorkOrder.value.work_inst_code || !selectedProcess.value.process_code || !selectedEquipment.value.equi_code || !isLoggedIn.value) {
  //     alert("작업 종료를 위해 작업지시, 공정, 설비를 모두 선택하고 로그인 상태를 확인해주세요.");
  //     return;
  //   }
  //   if (currentWorkOrder.value.inst_state !== '0s2s') {
  //     alert("현재 작업이 '생산중' 상태가 아니므로 종료할 수 없습니다.");
  //     return;
  //   }

  //   const userEmpNum = currentUser.value.emp_num;
  //   const now = new Date();
  //   const currentTime = now.toISOString().slice(0, 19).replace('T', ' ');

  //   const payload = {
  //     work_inst_code: currentWorkOrder.value.work_inst_code,
  //     process_code: selectedProcess.value.process_code,
  //     equi_code: selectedEquipment.value.equi_code,
  //     end_date: currentTime,
  //     user_code: userEmpNum,
  //   };

  //   const response = await axios.post('/api/production/endWork', payload);

  //   if (response.data.success) {
  //     currentWorkOrder.value.work_end_date = currentTime;
  //     currentWorkOrder.value.inst_state = '0s3s'; // '생산완료'로 변경

  //     // 작업 지시 목록의 해당 작업 지시 상태도 업데이트
  //     const index = workOrderData.value.findIndex(wo => wo.work_inst_code === currentWorkOrder.value.work_inst_code);
  //     if (index !== -1) {
  //       workOrderData.value[index].inst_state = '0s3s';
  //       workOrderData.value[index].work_end_date = currentTime;
  //     }
  //     alert('작업이 종료되었습니다.');
  //   } else {
  //     alert('작업 종료에 실패했습니다: ' + (response.data.message || '알 수 없는 오류'));
  //   }
  // } catch (error) {
  //   console.error('작업 종료 실패:', error);
  //   alert('작업 종료 중 오류가 발생했습니다.');
  // } finally {
  //   isProcessingWork.value = false;
  // }
};


// 컴포넌트 마운트 시 초기 작업 지시 데이터 불러오기
onMounted(() => {
  fetchAllWorkOrders();
});
</script>

<template>
  <div class="py-4 container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="row">
          <div class="col-lg-6 col-md-12 mb-4">
            <tabulator-card
              card-title="작업지시 선택"
              :table-data="workOrderData"
              :table-columns="workOrderColumns"
              :tabulator-options="workOrderTabulatorOptions"
              :on="workOrderOnEvents"
              :is-loading="isLoadingWorkOrders"
              empty-message="조회된 작업 지시가 없습니다."
              style="height: 450px;"
            />

            <tabulator-card
              card-title="공정 흐름도"
              :table-data="processFlowData"
              :table-columns="processFlowColumns"
              :tabulator-options="processFlowTabulatorOptions"
              :on="processFlowOnEvents"
              class="mt-4"
              :disabled="!isProcessGridEnabled"
              :is-loading="isLoadingProcesses"
              empty-message="조회된 공정이 없습니다."
              style="height: 420px;"
            />

            <tabulator-card
               card-title="설비 선택"
              :table-data="equipmentData"
              :table-columns="equipmentColumns"
              :tabulator-options="equipmentTabulatorOptions"
              :on="equipmentOnEvents"
              class="mt-4"
              :disabled="!isEquipmentGridEnabled"
              :is-loading="isLoadingEquipment"
              empty-message="조회된 설비가 없습니다."
              style="height: 250px;"
            />
          </div>

          <div class="col-lg-6 col-md-12 mb-4">
            <div class="card h-100">
              <div class="card-header pb-0">
                <h6>작업지시 상세</h6>
              </div>
              <div class="card-body">
                <div class="form-group">
                  <label for="productName">제품명</label>
                  <input type="text" class="form-control" id="productName" v-model="currentWorkOrder.prod_name" :disabled="!currentWorkOrder.work_inst_code">
                </div>
                <div class="form-group">
                  <label for="orderQuantity">지시수량</label>
                  <input type="text" class="form-control" id="orderQuantity" v-model="currentWorkOrder.inst_qty" :disabled="!currentWorkOrder.work_inst_code">
                </div>

                <div class="form-group">
                   <h6>투입 자재 정보</h6>
                  <label for="lot">LOT</label>
                  <input type="text" class="form-control" id="lot" v-model="currentWorkOrder.lot" :disabled="!currentWorkOrder.work_inst_code">
                </div>
                <div class="form-group">
                  <label for="partNumber">품번</label>
                  <input type="text" class="form-control" id="partNumber" v-model="currentWorkOrder.item_code" :disabled="!currentWorkOrder.work_inst_code">
                </div>
                <div class="form-group">
                  <label for="categoryr">분류</label>
                  <input type="text" class="form-control" id="categoryr" v-model="currentWorkOrder.categoryr" :disabled="!currentWorkOrder.work_inst_code">
                </div>
             
                <div class="row">
                  <div class="col-md-2">
                    <div class="form-group">
                      <label for="width">폭</label>
                      <input type="number" class="form-control" id="width" v-model="currentWorkOrder.width" :disabled="true">
                    </div>
                  </div>
                  <div class="col-md-2">
                    <div class="form-group">
                      <label for="length">길이</label>
                      <input type="number" class="form-control" id="length" v-model="currentWorkOrder.length" :disabled="true">
                    </div>
                  </div>
                  <div class="col-md-2">
                    <div class="form-group">
                      <label for="color">색상</label>
                      <input type="text" class="form-control" id="color" v-model="currentWorkOrder.color" :disabled="true">
                    </div>
                  </div>
                   <div class="col-md-2">
                    <div class="form-group">
                      <label for="butt">단추</label>
                      <input type="text" class="form-control" id="butt" v-model="currentWorkOrder.butt" :disabled="true">
                    </div>
                  </div>
                   <div class="col-md-2">
                    <div class="form-group">
                      <label for="zipper">지퍼</label>
                      <input type="text" class="form-control" id="zipper" v-model="currentWorkOrder.zipper" :disabled="true">
                    </div>
                  </div>
                   <div class="col-md-2">
                    <div class="form-group">
                      <label for="zasuimg">자수</label>
                      <input type="text" class="form-control" id="zasuimg" v-model="currentWorkOrder.zasuimg" :disabled="true">
                    </div>
                  </div>
                  <div class="col-md-2">
                    <div class="form-group">
                      <label for="printimg">프린팅</label>
                      <input type="text" class="form-control" id="printimg" v-model="currentWorkOrder.printimg" :disabled="true">
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label for="workStartTime">작업시작일시</label>
                  <input type="text" class="form-control" id="workStartTime" v-model="currentWorkOrder.work_start_date" :disabled="true">
                </div>
                <div class="form-group">
                  <label for="workEndTime">작업종료일시</label>
                  <input type="text" class="form-control" id="workEndTime" v-model="currentWorkOrder.work_end_date" :disabled="true">
                </div>

                <div class="d-flex justify-content-end">
                  <button
                    type="button"
                    class="btn btn-danger me-2"
                    @click="openModal"
                  >
                    작업 종료
                  </button>
                  <button
                    type="button"
                    class="btn btn-danger me-2"
                    :disabled="!isEndButtonEnabled"
                  >
                    작업 종료
                  </button>
                  <button
                    type="button"
                    class="btn btn-info"
                    :disabled="!isStartButtonEnabled"
                    @click="startWorkHandler"
                  >
                    작업 시작
                  </button>
                </div>
                <PrdPrefModal
                  v-bind:isModalOpen="isModalOpen"

                  v-on:close-modal="closeModal"
                />

                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.selected-row {
  background-color: #e0f2f1 !important; /* Light teal, similar to the image */
  font-weight: bold;
}

.card-body {
  padding-bottom: 0.5rem;
}

.card-footer {
  padding-top: 0.5rem;
  padding-bottom: 1rem;
}

.form-group label {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.form-check {
  padding-left: 1.5em;
  margin-bottom: 0.5rem;
}

.form-check-input {
  margin-top: 0.25em;
}

/* Status specific colors for table cells */
.text-success { color: #28a745 !important; }
.text-warning { color: #ffc107 !important; }
.text-danger { color: #dc3545 !important; }
.text-primary { color: #007bff !important; }
</style>