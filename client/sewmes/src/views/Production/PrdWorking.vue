<script setup>
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { ref, onMounted } from "vue";
import axios from "axios";

import ArgonButton from "@/components/ArgonButton.vue";
import DefaultInfoCard from "@/examples/Cards/DefaultInfoCard.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";

// --- Data for the '작업지시 선택' (Work Order Selection) table ---
const workOrderData = ref([]); // Empty array
const workOrderColumns = [
  { title: "지시코드", field: "id", width: 100, hozAlign: "center" },
  { title: "제품명", field: "productName", minWidth: 150 },
  { title: "상태", field: "status", width: 100, hozAlign: "center",
    formatter: function(cell) {
      const status = cell.getValue();
      let colorClass = '';
      if (status === '지시완료') {
        colorClass = 'text-success';
      } else if (status === '지시중') {
        colorClass = 'text-warning';
      }
      return `<span class="${colorClass}">${status}</span>`;
    }
  },
];

const workOrderTabulatorOptions = {
  // pagination: 'local', // Paging removed
  // paginationSize: 7, // Paging size removed
  layout: 'fitColumns',
  rowClick: (e, row) => {
    workOrderData.value.forEach(item => item.isSelected = false);
    row.getData().isSelected = true;
    currentWorkOrder.value = { ...row.getData() }; // Update detailed view
  },
  rowFormatter: function(row) {
    if (row.getData().isSelected) {
      row.getElement().classList.add("selected-row");
    } else {
      row.getElement().classList.remove("selected-row");
    }
  }
};


// --- Data for the '공정 흐름도' (Process Flow) table ---
const processFlowData = ref([]); // Empty array
const processFlowColumns = [
  { title: "공정코드", field: "id", width: 100, hozAlign: "center" },
  { title: "공정명", field: "name", minWidth: 150 },
  { title: "상세", field: "details", minWidth: 200, hozAlign: "left" },
];

const processFlowTabulatorOptions = {
  // pagination: 'local', // Paging removed
  // paginationSize: 7, // Paging size removed
  layout: 'fitColumns',
  rowClick: (e, row) => {
    processFlowData.value.forEach(item => item.isSelected = false);
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
              style="height: 250px;"
            />

            <tabulator-card
              card-title="공정 흐름도"
              :table-data="processFlowData"
              :table-columns="processFlowColumns"
              :tabulator-options="processFlowTabulatorOptions"
              class="mt-4"
              style="height: 250px;"
            />

            <tabulator-card
              card-title="설비 선택"
              :table-data="equipmentData"
              :table-columns="equipmentColumns"
              :tabulator-options="equipmentTabulatorOptions"
              class="mt-4"
              style="height: 250px;"
            />
          </div>

          <div class="col-lg-6 col-md-12 mb-4">
            <div class="card h-100">
              <div class="card-header pb-0">
                <h6>작업지시 상세</h6>
              </div>
              <div class="card-body">
                <form>
                  <div class="row mb-3">
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="productName">제품명</label>
                        <input
                          type="text"
                          class="form-control"
                          id="productName"
                          v-model="currentWorkOrder.productName"
                          readonly
                        />
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="orderQuantity">지시수량</label>
                        <input
                          type="number"
                          class="form-control"
                          id="orderQuantity"
                          v-model="currentWorkOrder.orderQuantity"
                          readonly
                        />
                      </div>
                    </div>
                  </div>

                  <div class="row mb-3">
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="dueDate">납기일자</label>
                        <input
                          type="text"
                          class="form-control"
                          id="dueDate"
                          v-model="currentWorkOrder.dueDate"
                          readonly
                        />
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="lot">LOT</label>
                        <input
                          type="text"
                          class="form-control"
                          id="lot"
                          v-model="currentWorkOrder.lot"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="row mb-3">
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="partNumber">품번</label>
                        <input
                          type="text"
                          class="form-control"
                          id="partNumber"
                          v-model="currentWorkOrder.partNumber"
                        />
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="material">소재</label>
                        <input
                          type="text"
                          class="form-control"
                          id="material"
                          v-model="currentWorkOrder.material"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="row mb-3">
                    <div class="col-md-4">
                      <div class="form-group">
                        <label for="width">폭</label>
                        <input
                          type="number"
                          class="form-control"
                          id="width"
                          v-model="currentWorkOrder.width"
                        />
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="form-group">
                        <label for="length">길이</label>
                        <input
                          type="number"
                          class="form-control"
                          id="length"
                          v-model="currentWorkOrder.length"
                        />
                      </div>
                    </div>
                    <div class="col-md-4">
                      <div class="form-group">
                        <label for="color">색상</label>
                        <input
                          type="text"
                          class="form-control"
                          id="color"
                          v-model="currentWorkOrder.color"
                        />
                      </div>
                    </div>
                  </div>

                  <div class="row mb-3">
                    <div class="col-12">
                      <label>옵션</label>
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="optionButton"
                          v-model="currentWorkOrder.options.button"
                        />
                        <label class="form-check-label" for="optionButton"
                          >단추</label
                        >
                      </div>
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="optionEmbroidery"
                          v-model="currentWorkOrder.options.embroidery"
                        />
                        <label class="form-check-label" for="optionEmbroidery"
                          >자수</label
                        >
                      </div>
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="optionZipper"
                          v-model="currentWorkOrder.options.zipper"
                        />
                        <label class="form-check-label" for="optionZipper"
                          >지퍼</label
                        >
                      </div>
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="optionPrinting"
                          v-model="currentWorkOrder.options.printing"
                        />
                        <label class="form-check-label" for="optionPrinting"
                          >프린팅</label
                        >
                      </div>
                    </div>
                  </div>

                  <div class="row mb-3">
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="workStart">작업시작</label>
                        <input
                          type="text"
                          class="form-control"
                          id="workStart"
                          v-model="currentWorkOrder.workStartTime"
                          readonly
                        />
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <label for="workEnd">작업종료</label>
                        <input
                          type="text"
                          class="form-control"
                          id="workEnd"
                          v-model="currentWorkOrder.workEndTime"
                          readonly
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div class="card-footer d-flex justify-content-end pt-0">
                <argon-button color="secondary" variant="gradient" class="me-2" @click="endWork"
                  >작업종료</argon-button
                >
                <argon-button color="success" variant="gradient" @click="startWork"
                  >작업시작</argon-button
                >
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