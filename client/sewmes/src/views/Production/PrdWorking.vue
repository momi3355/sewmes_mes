<script setup>
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { ref, onMounted } from "vue";
import axios from "axios";

import ArgonButton from "@/components/ArgonButton.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";

// --- Data for the '작업지시 선택' (Work Order Selection) table ---
const workOrderData = ref([]); // Empty array
const workOrderColumns = [
  { title: "지시코드", field: "work_inst_code", width: 200, hozAlign: "center" }, // <-- 이 부분이 백엔드 데이터의 키와 일치해야 함
  { title: "제품명", field: "prod_name", width: 200 }, // <-- 이 부분이 백엔드 데이터의 키와 일치해야 함
  { title: "지시수량", field: "inst_qty", width: 200, hozAlign: "right" },
];



const fetchWorkOrders = async () => {
  console.log('fetchWorkOrders 함수 실행');
  try {
    const response = await axios.get('/api/allworkInst'); // 이 URL이 실제 백엔드 URL과 일치하는지 다시 확인!
    console.log('Axios 응답 (response):', response); // 전체 응답 객체 확인
    console.log('Axios 응답 데이터 (response.data):', response.data); // 응답 본문 데이터 확인

    if (response.data.success) {
      // 중요: response.data.data에 배열이 들어있는지 확인!
      if (Array.isArray(response.data.data)) {
        workOrderData.value = response.data.data.map(item => ({
            ...item,
            isSelected: false
        }));
        console.log('workOrderData.value 업데이트됨:', workOrderData.value);
        if (workOrderData.value.length === 0) {
          console.warn('백엔드에서 데이터가 왔으나, workOrderData.value가 비어있습니다. DB에 데이터가 있는지 확인하세요.');
        }
      } else {
        console.error('API 응답의 "data" 필드가 배열이 아닙니다:', response.data.data);
      }
    } else {
      console.error('작업지시 목록 불러오기 실패 (success: false):', response.data.message);
    }
  } catch (error) {
    console.error('API 호출 중 오류 발생:', error);
  }
};

onMounted(() => {
  fetchWorkOrders();

});

// --- Data for the '공정 흐름도' (Process Flow) table ---
const processFlowData = ref([]); // Empty array
const processFlowColumns = [
  { title: "공정코드", field: "id", width: 100, hozAlign: "center" },
  { title: "공정명", field: "name", minWidth: 100 },
  { title: "상세", field: "details", minWidth: 100, hozAlign: "left" },
];

const processFlowTabulatorOptions = {
  layout: 'fitColumns',
  rowClick: (e, row) => {
    processFlowData.value.forEach(item => item.isSelected = false);
    row.getData().isSelected = true;
    console.log('선택된공정:',row.getData());
  },
  rowFormatter: function(row) {
    if (row.getData().isSelected) {
      row.getElement().classList.add("selected-row");
    } else {
      row.getElement().classList.remove("selected-row");
    }
  }
};


// --- Data for the '설비 선택' (Equipment Selection) table ---
const equipmentData = ref([]); // Empty array
const equipmentColumns = [
  { title: "설비코드", field: "id", width: 100, hozAlign: "center" },
  { title: "설비명", field: "name", minWidth: 150 },
  { title: "상태", field: "status", width: 100, hozAlign: "center",
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
  // pagination: 'local', // Paging removed
  // paginationSize: 7, // Paging size removed
  layout: 'fitColumns',
  rowClick: (e, row) => {
    equipmentData.value.forEach(item => item.isSelected = false);
    row.getData().isSelected = true;
  },
  rowFormatter: function(row) {
    if (row.getData().isSelected) {
      row.getElement().classList.add("selected-row");
    } else {
      row.getElement().classList.remove("selected-row");
    }
  }
};

// --- Data for '작업지시 상세' (Work Order Details) form ---
const currentWorkOrder = ref({
  id: '',
  productName: '',
  orderQuantity: null,
  dueDate: '',
  lot: '',
  partNumber: '',
  material: '',
  width: null,
  length: null,
  color: '',
  options: {
    button: false,
    embroidery: false,
    zipper: false,
    printing: false,
  },
  workStartTime: '',
  workEndTime: '',
});


// --- Actions ---
const startWork = () => {
  if (!currentWorkOrder.value.id) {
    alert("작업을 시작할 작업지시를 선택해주세요.");
    return;
  }
  currentWorkOrder.value.workStartTime = new Date().toLocaleString();
  alert('작업이 시작되었습니다!');
};

const endWork = () => {
  if (!currentWorkOrder.value.id) {
    alert("작업을 종료할 작업지시를 선택해주세요.");
    return;
  }
  currentWorkOrder.value.workEndTime = new Date().toLocaleString();
  alert('작업이 종료되었습니다!');
};

onMounted(() => {
  // Data fetching logic here (e.g., from API)
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
              style="height: 450px;"
            />

            <tabulator-card
              card-title="공정 흐름도"
              :table-data="processFlowData"
              :table-columns="processFlowColumns"
              :tabulator-options="processFlowTabulatorOptions"
              class="mt-4"
              :disabled="!isProcessGridEnabled" style="height: 250px;"
            />

            <tabulator-card
              card-title="설비 선택"
              :table-data="equipmentData"
              :table-columns="equipmentColumns"
              :tabulator-options="equipmentTabulatorOptions"
              class="mt-4"
              :disabled="!isEquipmentGridEnabled" style="height: 250px;"
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
                    <input type="text" class="form-control" id="productName" v-model="currentWorkOrder.productName" :disabled="!currentWorkOrder.id">
                </div>
                <div class="d-flex justify-content-end mt-4">
                  <material-button class="me-2" variant="outline">작업종료</material-button>
                  <material-button @click="startWork" :disabled="!isStartButtonEnabled">작업시작</material-button> </div>
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