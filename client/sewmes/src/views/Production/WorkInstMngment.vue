<script setup>
import { ref, nextTick, watch, onMounted} from "vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue"; // 이 경로가 맞는지 다시 확인하세요.
import ProductionPlanModal from "./ProductionPlanModal.vue";
import axios from 'axios';
import moment from 'moment';
import Swal from 'sweetalert2';
// 실제 작업지시 데이터
const workInstData = ref([]); //초기에는 빈값

// 공통 코드 -> 사용자 친화적 문구 맵핑 객체
const instStateMap = {
    '0s1s': '생산 전',
    '0s2s': '생산 중',
    '0s3s': '생산 완료',
};
const instStateOptions = Object.entries(instStateMap).map(([code, name]) => ({ code, name }));

// 작업지시컬럼
const workInstColumns = [
    {
        formatter: "rowSelection", // Tabulator.js의 행 선택 포맷터 사용
        titleFormatter: "rowSelection", // 헤더에도 전체 선택/해제 체크박스 표시
        hozAlign: "left", // 가운데 정렬
        headerSort: false, // 헤더 클릭 시 정렬 방지
        width: 80, // 컬럼 너비
        cssClass: 'tabulator-checkbox-column' // 필요에 따라 CSS 클래스 추가
    },
    { title: "NO", field: "NO", width: 180 },
    { title: "작업지시코드", field: "work_inst_code", width: 180 , visible: false },
    { title: "생산계획코드", field: "prod_plan_code", width: 180, visible: false },
    {title:"제품코드", field: "prod_code", width: 180  },
    { title: "제품명", field: "prod_name", width: 250, editor: "input" },
    { title: "지시수량", field: "inst_qty", width: 200, editor: "input",hozAlign: "right" },
    {
        title: "납기일자",
        field: "dead_date",
        width: 200 ,
        hozAlign: "right",
        // 납기일자 포맷터 추가
        formatter: function(cell){
            const value = cell.getValue();
            return value ? moment(value).format('YYYY-MM-DD') : ''; // 값이 있을 때만 포맷, 없으면 빈 문자열
        }
    },
    {
        title: "지시상태",
        field: "inst_state",
        hozAlign: "center",
        width: 180,
        formatter:function(cell){
            const value = cell.getValue();
            return instStateMap[value] || value;
        }
    },
    { title: "담당자", field: "emp_num", width: 180, editor: "input" },
    {
        title: "지시서등록일자",
        field: "inst_reg_date",
        width: 350,
        // 날짜는 editor: "input" 보다는 editor: "date" 또는 사용자 정의 에디터가 더 적합할 수 있습니다.
        hozAlign: "right",
        // 지시서등록일자 포맷터 추가
        formatter: function(cell){
            const value = cell.getValue();
            return value ? moment(value).format('YYYY-MM-DD') : ''; // 값이 있을 때만 포맷, 없으면 빈 문자열
        }
    },
];

const tabulatorOptions = {
    selectableRows: true, //행선택가능
    selectableRowsPersistence: false, //페이지변경시 선택상태 유지 안함
};
// --- 작업지시 데이터를 백엔드에서 불러오는 함수 정의 ---
const fetchWorkInstructions = async () => {
    try {
        // 백엔드에서 전체 작업지시 목록을 조회하는 API 엔드포인트
        const response = await axios.get('/api/allworkInst'); // 실제 API 경로로 변경하세요.
        if (response.data.success) {
            // 받아온 데이터를 workInstData.value에 할당하여 그리드 갱신
            workInstData.value = response.data.data.map((item, index) => ({
                NO: index + 1, // NO 값은 클라이언트에서 다시 부여
                work_inst_code: item.work_inst_code,
                prod_plan_code: item.prod_plan_code,
                prod_code: item.prod_code,
                prod_name: item.prod_name, // 백엔드에서 가져온 제품명
                inst_qty: item.inst_qty,
                dead_date: item.dead_date,
                inst_state: item.inst_state,
                emp_num: item.emp_num,
                inst_reg_date: item.inst_reg_date,
            }));
            console.log("작업지시 목록이 성공적으로 로드되었습니다:", workInstData.value);
        } else {
            alert(`작업지시 목록 로드 실패: ${response.data.message}`);
            console.error("작업지시 목록 로드 실패:", response.data.message);
        }
    } catch (error) {
        console.error("작업지시 목록 로드 중 오류 발생:", error);
        alert("작업지시 목록 로드 중 예상치 못한 오류가 발생했습니다.");
    }
};

// 컴포넌트가 마운트될 때 (초기 로딩 시) 작업지시 목록을 불러옵니다.
onMounted(() => {
    fetchWorkInstructions();
});


//생산계획 모달에서 데이터받아, 작업지시서 화면의 그리드에 표시될 데이터 추가하는 함수
const handleSelectedPlans = (plans) => {
      console.log("Plans received from modal:", plans);
    const newWorkInsts = plans.map((plan, index) => ({

        NO: workInstData.value.length + index + 1,
        work_inst_code: null, //지시코드 자동생성 저장전에는 빈값
        prod_plan_code: plan.prod_plan_code,
        prod_code: plan.prod_code,
        prod_name:plan.prod_name,
        inst_qty: plan.prod_qty,
        dead_date: plan.dead_date, //주문상세테이블과 조인해서 가져올 납기일자
        inst_state: '0s1s', //초기상태
        emp_num: '', // 담당자번호 초기화
        //inst_date: inst_reg_date 저장버튼 누르면 등록일 나오고 지시버튼 누르면 들어가는 내용
    }));
    workInstData.value = [...workInstData.value, ...newWorkInsts];

};

// 모달 표시 상태
const isModalOpen = ref(false); //초기상태
const openModal = () => {
    isModalOpen.value = true; //isModalOpen 값 true 변경해 모달 열기
};
const closeModal = () => {
    isModalOpen.value = false;
};

//검색필드용 반응형 변수들 선언/ 입력값 컨테이너, 실제 검색 동작은 별도 함수 호출 선언
const searchField1 = ref(''); //작업일시
const searchField2 = ref(''); //제품명
const searchField3 = ref(''); //지시상태
const searchField4 = ref(''); //담당자

//행추가 함수(생산계획 목록 없이 작업지시 생성)
const addRow = () => {
    //새로운 행을 위한 NO값 생성
    const newNo = workInstData.value.length > 0 ? Math.max(...workInstData.value.map(item => item.NO || 0)) + 1 : 1;

    //새로운 빈 행 데이터 객체 생성
    const newRow = {
        NO: newNo,
        work_inst_code: '',
        prod_plan_code: '',
        prod_code: '',
        prod_name: '',
        inst_qty: 0, //지시수량 사용자입력
        dead_date: '',
        inst_state: '0s1s', //초기상태
        emp_num: '',
    }
    workInstData.value.push(newRow);

}

// tabulatorCardRef 컴포넌트의 ref 선언
const tabulatorCardRef = ref(null);




// 저장 함수 cell edited된 worInstaData.value를 그대로 백엔드에 보내기
// saveWorkInstructions 함수 정의 (인자를 받음)
const saveWorkInstructions = async (workInstructionsToSave) => { // 인자 이름을 명확히 변경
    try {
        if (!workInstructionsToSave || !Array.isArray(workInstructionsToSave) || workInstructionsToSave.length === 0) {
            alert("저장할 작업지시 데이터가 유효하지 않습니다.");
            return;
        }

        console.log("백엔드로 보낼 데이터:", workInstructionsToSave);

        // 백엔드 API 호출
        const response = await axios.post('/api/workInstMngment/save', workInstructionsToSave);

        if (response.data.success) {
            Swal.fire({ // 성공 알림
                title: "저장 성공",
                text: "작업지시가 성공적으로 저장되었습니다!",
                icon: "success"
            });
            await fetchWorkInstructions();

        } else {
            Swal.fire({ // 실패 알림
                title: "저장 실패",
                text: `작업지시 저장 실패: ${response.data.message}`,
                icon: "error"
            });
            console.error("작업지시 저장 실패:", response.data.message);
        }

    } catch (error) {
        console.error("작업지시 저장 중 오류 발생:", error);
        alert("작업지시 저장 중 예상치 못한 오류가 발생했습니다.");
    }
};

// 작업지시서삭제함수 , 지시상태가  생산전인 경우만 삭제가능
const deleteSelectedRows = async () => {
    //  Tabulator 인스턴스를 가져옴
    const tabulatorInstance = tabulatorCardRef.value?.getTabulator();

    if (!tabulatorCardRef.value || !tabulatorInstance) { // 이제 isTabulatorInitialized 대신 tabulatorInstance 존재 여부 확인
        alert("테이블이 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
        return;
    }

    const selectedRows = tabulatorInstance.getSelectedRows(); // 인스턴스를 통해 메서드 호출
    if (selectedRows.length === 0) {
        alert("삭제할 작업지시를 선택해주세요.");
        return;
    }

    const confirmDelete = confirm("선택된 작업지시를 정말 삭제하시겠습니까? (생산 전 상태의 작업지시만 삭제 가능합니다.)");
    if (!confirmDelete) {
        return;
    }

    const deletableWorkInstCodes = [];
    const undeletableItems = [];

    selectedRows.forEach(row => {
        const rowData = row.getData();
        if (rowData.inst_state === '0s1s') {
            deletableWorkInstCodes.push(rowData.work_inst_code);
        } else {
            undeletableItems.push(`NO: ${rowData.NO} (제품명: ${rowData.prod_name}, 지시상태: ${instStateMap[rowData.inst_state] || rowData.inst_state})`);
        }
    });

    if (deletableWorkInstCodes.length === 0) {
        let message = "삭제할 수 있는 '생산 전' 상태의 작업지시가 없습니다.";
        if (undeletableItems.length > 0) {
            message += "\n\n삭제할 수 없는 항목:\n" + undeletableItems.join("\n");
        }
        alert(message);
        return;
    }

    try {
        console.log("백엔드로 보낼 삭제 요청 데이터 (작업지시 코드):", deletableWorkInstCodes);
        const response = await axios.post('/api/workInstMngment/delete', { workInstCodes: deletableWorkInstCodes });

        if (response.data.success) {
            alert("선택된 작업지시가 성공적으로 삭제되었습니다!");
            await fetchWorkInstructions(); // 데이터 갱신
            // 삭제 후 버튼 상태 갱신은 다음 단계에서 추가할 것입니다.
        } else {
            alert(`작업지시 삭제 실패: ${response.data.message}`);
            console.error("작업지시 삭제 실패:", response.data.message);
        }
    } catch (error) {
        console.error("작업지시 삭제 중 오류 발생:", error);
        alert("작업지시 삭제 중 예상치 못한 오류가 발생했습니다. 서버 상태를 확인해주세요.");
    }
};

// 검색 관련 함수 (필요에 따라 추가)
const resetbtn = () => {
    // 검색 필드 초기화 로직
    searchField1.value = '';
    searchField2.value = '';
    searchField3.value = '';
    searchField4.value = '';
    fetchWorkInstructions(); // 전체 목록 다시 불러오기
};


const searchAllField = async () => { 
    //검색버튼
    console.log("검색 버튼 클릭됨:", searchField2.value, searchField3.value, searchField4.value);

    try {
        const params = {
          
            prodName: searchField2.value, // 제품명
            instState: searchField3.value, // 지시상태 (예: '0s1s', '0s2s')
            empNum: searchField4.value, // 담당자
        };

        // 빈 값은 백엔드로 보내지 않도록 필터링
        const validParams = Object.fromEntries(
            Object.entries(params).filter(([key, value]) => value !== '' && value !== undefined && value !== null)
        );

        console.log("백엔드로 보낼 검색 조건:", validParams);

        
        const response = await axios.get('/api/allworkInst', { params: validParams });

        if (response.data.success) {
            // 받아온 필터링된 데이터를 workInstData.value에 할당하여 그리드 갱신
            workInstData.value = response.data.data.map((item, index) => ({
                NO: index + 1, // 클라이언트에서 NO 값 다시 부여
                work_inst_code: item.work_inst_code,
                prod_plan_code: item.prod_plan_code,
                prod_code: item.prod_code,
                prod_name: item.prod_name,
                inst_qty: item.inst_qty,
                dead_date: item.dead_date,
                inst_state: item.inst_state,
                emp_num: item.emp_num,
                inst_reg_date: item.inst_reg_date,
            }));
            console.log("검색된 작업지시 목록이 성공적으로 로드되었습니다:", workInstData.value);
        } else {
            alert(`검색 결과 로드 실패: ${response.data.message}`);
            console.error("검색 결과 로드 실패:", response.data.message);
        }
    } catch (error) {
        console.error("검색 중 오류 발생:", error);
        alert("검색 중 예상치 못한 오류가 발생했습니다.");
    }
};

</script>
<template>
    <div class="container-fluid p-3">
        <div class="row search-color">
            <div class="row mb-3">
                
                <div class="col-md-2">
                    <label class="form-label">제품명</label>
                    <input type="text" class="form-control" v-model="searchField2">
                </div>
                <div class="col-md-2">
                    <label class="form-label">지시상태</label>
                    <select class="form-select" v-model="searchField3">
                        <option value="">-- 전체 --</option>
                        <option v-for="(name, code) in instStateMap" :key="code" :value="code">{{ name }}</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label">담당자</label>
                    <input type="text" class="form-control" v-model="searchField4">
                </div>
                <div class="col-md-2 d-flex align-items-end">
                    <button class="btn btn-secondary me-2" @click="resetbtn">초기화</button>
                    <button class="btn btn-primary" @click="searchAllField">조회</button>
                </div>
            </div>
        </div>

        <div class="row mt-3">
            <div class="col-12">
                <button class="btn btn-info" @click="openModal">생산계획서 불러오기</button>
                </div>
        </div>

  <div class="col-12 mt-4">
                <div style=" margin: 0 auto; overflow-x: auto;">
                    <tabulator-card
                        ref="tabulatorCardRef"
                        card-title="작업지시서"
                        :table-data="workInstData"
                        :table-columns="workInstColumns"
                        :tabulatorOptions="tabulatorOptions"
                        :body-padding="'5px'"
                        > <template #actions>
                            <button class="btn btn-success me-2" @click="saveWorkInstructions(workInstData)">저장</button>
                            <button class="btn btn-secondary me-2" @click="addRow">행추가</button>
                            <button class="btn btn-warning me-2" @click="deleteSelectedRows">삭제</button>
                        </template>
                    </tabulator-card>
                </div>
        </div>


        <ProductionPlanModal
            v-bind:isModalOpen="isModalOpen"
            v-on:select-plans="handleSelectedPlans"
            v-on:close-modal="closeModal"
        />
    </div>
</template>

<style scoped>
.search-color {
    margin: 10px;
    padding: 20px;
    border-radius: 15px;
    background-color: #FFF;
}
</style>