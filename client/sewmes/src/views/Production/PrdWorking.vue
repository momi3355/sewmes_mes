<script setup>
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { ref, onMounted, computed, watch } from "vue";
import axios from "axios";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import PrdPrefModal from "./PrdPrefModal.vue";
import Swal from 'sweetalert2';

// --- 상태 변수 선언 (ref 사용) ---
const workOrderData = ref([]);
const processFlowData = ref([]);
const equipmentData = ref([]);

// 공통 코드 -> 사용자 친화적 문구 맵핑 객체
const instStateMap = {
    '0s1s': '생산 전',
    '0s2s': '생산 중',
    '0s3s': '생산 완료',
};
const instStateOptions = Object.entries(instStateMap).map(([code, name]) => ({ code, name }));



const currentWorkOrder = ref({
    work_inst_code: '',
    prod_name: '',
    inst_qty: null,
    inst_date: '',
    work_start_date: '',
    work_end_date: '',
    inst_state: "0s1s",
    prod_code: '',
    prod_type: '',
    category: '',
    product_color: '',
    product_size: '',
    
    materials: []
});

const selectedProcess = ref({
    process_code: '', process_name: '', detail: '', process_seq: null,
    inst_qty: null, prod_code: '', 
    process_start_date: '', // ⭐ 여기에 시작 시간 필드 추가 (null 또는 빈 문자열로 초기화) ⭐
    process_end_date: '' // 미리 종료 시간 필드도 추가
});

const selectedEquipment = ref({
    equi_code: '', equi_name: '', status: '', equip_type: '',
    need_time: null, process_type: '', use_yn: '',
});

const isLoadingWorkOrders = ref(false);
const isLoadingProcesses = ref(false);
const isLoadingEquipment = ref(false);
const isProcessingWork = ref(false);

const currentUser = ref({
    emp_num: 'USR001',
    name: '홍길동'
});
const isLoggedIn = computed(() => !!currentUser.value.emp_num);

// --- Computed 속성 (버튼/그리드 활성화 로직) ---
const isProcessGridEnabled = computed(() => !!currentWorkOrder.value?.work_inst_code);
const isEquipmentGridEnabled = computed(() => !!selectedProcess.value?.process_code);

const isStartButtonEnabled = computed(() =>
    !!currentWorkOrder.value?.work_inst_code &&
    !!selectedProcess.value?.process_code &&
    !!selectedEquipment.value?.equi_code &&
    currentWorkOrder.value?.inst_state !== '0s2s' &&
    currentWorkOrder.value?.inst_state !== '0s3s' &&
    !isProcessingWork.value
);

const isEndButtonEnabled = computed(() =>
    !!currentWorkOrder.value?.work_inst_code &&
    !!selectedProcess.value?.process_code &&
    !!selectedEquipment.value?.equi_code &&
    currentWorkOrder.value?.inst_state === '0s2s' &&
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
    { title: "진행상태", field: "inst_state", width: 180 
        , formatter: function(cell) {
                const value = cell.getValue();
                return instStateMap[value] || value;
            }
    },
];


const workOrderOnEvents = [
    {
        eventName: "rowClick",
        eventAction: (e, row) => {
            console.log(row);
            selectWorkOrder(row.getData());
        }
    }
];

const processFlowColumns = [
    { title: "작업공정코드", field: "work_process_code", width: 100, visible: false  },
    { title: "공정코드", field: "process_code", width: 200, visible: false  },
    { title: "공정명", field: "process_name", width: 200 },
    { title: "공정순서", field: "process_seq", hozAlign: "right", width: 200 },
    { title: "지시수량", field: "inst_qty", hozAlign: "right", width: 200 },
    { title: "생산수량", field: "prod_qty", hozAlign: "right", width: 200 },
];



const processFlowOnEvents = [
    {
        eventName: "rowClick",
        eventAction: (e, row) => {
            selectProcess(row.getData());
        }
    }
];

const equipmentColumns = [
    { title: "설비코드", field: "equi_code", width: 200, hozAlign: "center" },
    { title: "설비명", field: "equi_name", minWidth: 200 },
    { title: "상태", field: "equi_status", width: 200, hozAlign: "center",
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

const tabulatorOptions = {
    selectableRows: 1,
    selectableRowsPersistence: false,
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
            workOrderData.value = response.data.data.map(item => ({ ...item, }));
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

const fetchWorkOrderDetails = async (workInstCode) => {
    try {
        const response = await axios.get(`/api/getWorkInstDetails?work_inst_code=${workInstCode}`);

        if (response.data.success && response.data.data) {
            const data = response.data.data;
            currentWorkOrder.value = {
                work_inst_code: data.work_inst_code,
                prod_name: data.prod_name,
                inst_qty: data.inst_qty,
                inst_date: data.inst_date,
                prod_code: data.prod_code,
                prod_type: data.prod_type,
                category: data.category,
                product_color: data.product_color,
                product_size: data.product_size,
                work_start_date: data.work_start_date || '',
                work_end_date: data.work_end_date || '',
                inst_state: data.inst_state,
               
                materials: data.materials || []
            };
            console.log("작업지시 상세 정보 및 자재 정보 로드 완료:", currentWorkOrder.value);
        } else {
            console.error('작업지시 상세 정보 불러오기 실패:', response.data.message);
            currentWorkOrder.value = {
                work_inst_code: '', prod_name: '', inst_qty: null, inst_date: '',
                work_start_date: '', work_end_date: '', inst_state: "0s1s", materials: []
            };
        }
    } catch (error) {
        console.error('API 호출 중 오류 발생 (fetchWorkOrderDetails):', error);
        currentWorkOrder.value = {
            work_inst_code: '', prod_name: '', inst_qty: null, inst_date: '',
            work_start_date: '', work_end_date: '', inst_state: "0s1s", materials: []
        };
    }
};


const fetchProcessFlow = async (workInstCode) => {
    isLoadingProcesses.value = true;
    try {
        const response = await axios.get(`/api/workInst/${workInstCode}/processes`);
        if (response.data.success && Array.isArray(response.data.data)) {
            // ⭐ 각 공정 데이터에 process_start_date와 process_end_date를 초기화 또는 백엔드 값으로 할당 ⭐
            // 백엔드에서 process_start_date와 process_end_date를 직접 주는 것이 가장 좋지만,
            // 없다면 여기서 추가합니다.
            processFlowData.value = response.data.data.map(item => ({
                ...item,
               

            }));
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
            equipmentData.value = response.data.data.map(item => ({ ...item, }));
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
    //    workOrderData.value = workOrderData.value.map(item => ({
    //     ...item,
       
    // }));
    if (workOrder && workOrder.work_inst_code) {
        await fetchWorkOrderDetails(workOrder.work_inst_code);
        await fetchProcessFlow(workOrder.work_inst_code);
    } else {
        currentWorkOrder.value = {
            work_inst_code: '', prod_name: '', inst_qty: null, inst_date: '',
            work_start_date: '', work_end_date: '', inst_state: "0s1s", materials: []
        };
        // 작업지시 선택 해제 시 공정 데이터도 비웁니다.
        processFlowData.value = [];
    }

    selectedProcess.value = { process_code: '', process_name: '', detail: ''};
    selectedEquipment.value = { equi_code: '', equi_name: '', status: ''};
    equipmentData.value = [];
};


const selectProcess = async (process) => {
    // ⭐️ 이 부분을 수정합니다: forEach 대신 map을 사용하여 새 배열을 만들고 할당합니다.
    // processFlowData.value = processFlowData.value.map(item => ({
    //     ...item, // 기존 item의 모든 속성을 복사
       
    // }));

    // 나머지 로직은 그대로 둡니다.
    selectedProcess.value = { ...process};

    selectedEquipment.value = { equi_code: '', equi_name: '', status: ''};
    equipmentData.value = [];

    if (process && process.process_code) {
        await fetchEquipmentByProcess(process.process_code);
    }
};

const selectEquipment = (equipment) => {
    // ⭐️ 이 부분을 수정합니다: forEach 대신 map을 사용하여 새 배열을 만들고 할당합니다.
    // equipmentData.value = equipmentData.value.map(item => ({
    //     ...item, // 기존 item의 모든 속성을 복사
      
    // }));
    selectedEquipment.value = { ...equipment};
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
            // 1. 현재 작업지시의 시작 시간 및 상태 업데이트
            currentWorkOrder.value.work_start_date = currentTime;
            currentWorkOrder.value.inst_state = '0s2s'; // '생산중'으로 변경

            // 2. 전체 작업지시 목록 (상단 그리드) 업데이트
            const workOrderIndex = workOrderData.value.findIndex(wo => wo.work_inst_code === currentWorkOrder.value.work_inst_code);
            if (workOrderIndex !== -1) {
                workOrderData.value[workOrderIndex].inst_state = '0s2s';
                workOrderData.value[workOrderIndex].work_start_date = currentTime;
                // Tabulator가 업데이트를 감지하도록 배열 복사
                workOrderData.value = [...workOrderData.value];
            }

            // ⭐ 3. 공정 흐름도 테이블의 해당 공정 시작 시간 업데이트 ⭐
            const processIndex = processFlowData.value.findIndex(p => p.process_code === selectedProcess.value.process_code);
            if (processIndex !== -1) {
                // 해당 공정 객체의 process_start_date 필드 업데이트
                processFlowData.value[processIndex].process_start_date = currentTime;
                // Tabulator에 변경 사항을 알리기 위해 배열을 새로 할당
                processFlowData.value = [...processFlowData.value];
            }

            // 4. 선택된 공정 ref의 시작 시간 업데이트 (상세 정보 UI에 반영될 수 있음)
            selectedProcess.value.process_start_date = currentTime;


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


const isModalOpen = ref(false);

const openModal = () => {
    isModalOpen.value = true;

};


const endWorkHandler = async () => {
    // isProcessingWork.value = true; // 이제 이 플래그는 모달 내에서 관리하거나 더 이상 필요 없을 수 있음.

    // ⭐ 작업 종료를 위해 필요한 정보가 있는지 기본적인 체크 ⭐
    if (!currentWorkOrder.value.work_inst_code || !selectedProcess.value.process_code || !selectedEquipment.value.equi_code || !currentUser.value.emp_num) {
        Swal.fire({
            title: "작업 종료 불가",
            text: "작업 종료를 위해 작업지시, 공정, 설비를 모두 선택하고 로그인 상태를 확인해주세요.",
            icon: "warning"
        });
        // isProcessingWork.value = false;
        return;
    }

    // // ⭐ 기존의 axios.post('/api/endWork', payload); 제거 ⭐
    // // ⭐ Swal.fire를 통해 사용자에게 정보만 제공하고 모달을 띄움 ⭐
    // Swal.fire({
    //     title: "실적 등록 필요",
    //     text: "공정 작업 종료를 위해 실적을 등록해주세요.",
    //     icon: "info",
    //     confirmButtonText: "확인"
    // }).then(() => {
        openModal(); // 실적 등록 모달 열기
    // });
    // finally {
    // isProcessingWork.value = false;
    // }
};



const closeModal = () => {
    isModalOpen.value = false;

};





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
                            :tabulatorOptions="tabulatorOptions"
                            :on="workOrderOnEvents"
                            height="450px"
                        />

                        <tabulator-card
                            card-title="공정 흐름도"
                            :table-data="processFlowData"
                            :table-columns="processFlowColumns"
                            :tabulatorOptions="tabulatorOptions"
                            :on="processFlowOnEvents"                            
                            height="420px"
                        />

                        <tabulator-card
                            card-title="설비 선택"
                            :table-data="equipmentData"
                            :table-columns="equipmentColumns"
                            :tabulatorOptions="tabulatorOptions"
                            :on="equipmentOnEvents"
                            height="250px"
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

                                <h6 class="mt-4">투입 자재 정보</h6>
                                <div v-if="!currentWorkOrder.materials || currentWorkOrder.materials.length === 0" class="alert alert-info">
                                    투입 자재 정보가 없습니다.
                                </div>

                                <div v-for="(material, index) in currentWorkOrder.materials" :key="index" class="mb-4 p-3 border rounded bg-light">
                                    <h6>자재 {{ index + 1 }}</h6>
                                    <div class="row">
                                        <div class="col-md-3">
                                            <div class="form-group">
                                                <label :for="'lot-' + index">LOT</label>
                                                <input type="text" class="form-control" :id="'lot-' + index" v-model="material.lot_number" :disabled="!currentWorkOrder.work_inst_code">
                                            </div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="form-group">
                                                <label :for="'partNumber-' + index">품번</label>
                                                <input type="text" class="form-control" :id="'partNumber-' + index" v-model="material.item_code" :disabled="!currentWorkOrder.work_inst_code">
                                            </div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="form-group">
                                                <label :for="'materialName-' + index">분류</label>
                                                <input type="text" class="form-control" :id="'materialName-' + index" v-model="material.material_name" :disabled="!currentWorkOrder.work_inst_code">
                                            </div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="form-group">
                                                <label :for="'materialUnit-' + index">단위</label>
                                                <input type="text" class="form-control" :id="'materialUnit-' + index" v-model="material.material_unit" :disabled="true">
                                            </div>
                                        </div>
                                    </div>

                                    <div class="row">
                                        <div class="col-md-2">
                                            <div class="form-group">
                                                <label :for="'materialStandard-' + index">규격</label>
                                                <input type="text" class="form-control" :id="'materialStandard-' + index" v-model="material.material_standard" :disabled="true">
                                            </div>
                                        </div>
                                        <div class="col-md-2">
                                            <div class="form-group">
                                                <label :for="'productColor-' + index">색상</label>
                                                <input type="text" class="form-control" :id="'productColor-' + index" v-model="currentWorkOrder.product_color" :disabled="true">
                                            </div>
                                        </div>
                                        <div class="col-md-2" v-if="material.item_code === 'GEN-BUTTON-001'">
                                            <div class="form-group">
                                                <label :for="'butt-' + index">단추</label>
                                                <input type="text" class="form-control" :id="'butt-' + index" value="적용됨" :disabled="true">
                                            </div>
                                        </div>
                                        <div class="col-md-2" v-if="material.item_code === 'GEN-ZIPPER-001'">
                                            <div class="form-group">
                                                <label :for="'zipper-' + index">지퍼</label>
                                                <input type="text" class="form-control" :id="'zipper-' + index" value="적용됨" :disabled="true">
                                            </div>
                                        </div>
                                        <div class="col-md-2" v-if="material.material_type === '자수'">
                                            <div class="form-group">
                                                <label :for="'zasuimg-' + index">자수</label>
                                                <input type="text" class="form-control" :id="'zasuimg-' + index" value="적용됨" :disabled="true">
                                            </div>
                                        </div>
                                        <div class="col-md-2" v-if="material.material_type === '프린팅'">
                                            <div class="form-group">
                                                <label :for="'printimg-' + index">프린팅</label>
                                                <input type="text" class="form-control" :id="'printimg-' + index" value="적용됨" :disabled="true">
                                            </div>
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
                                        :disabled="!isEndButtonEnabled"
                                        @click="endWorkHandler"
                                        
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
                                    :prefProps="[
                                    
                                  currentWorkOrder.work_inst_code,
                                  currentWorkOrder.prod_code,
                                  currentWorkOrder.inst_qty,
                                  selectedProcess.inst_qty ,
                                  selectedProcess.work_process_code,
                                  selectedProcess.equi_code,
                                  selectedProcess.process_code,
            
                                  ]"
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