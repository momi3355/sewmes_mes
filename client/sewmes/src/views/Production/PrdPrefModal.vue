<script setup>
import axios from 'axios';
import {onMounted, ref} from 'vue';
import { useStore } from "vuex";
import { defineProps, defineEmits } from 'vue';
const emit = defineEmits(['closeModal']);
import groupcodelist from "../../assets/js/utils/groupcodelist";
import moment from 'moment';
import Swal from "sweetalert2"; // SweetAlert2 추가
const defecttypeList=ref([]);

const props = defineProps({
    isModalOpen: Boolean,
  prefProps:Array

});

// 사원정보 가져오기
const store = useStore();
const userCode = store.state.user.emp_num;
const userName = store.state.user.emp_name;



const input_qty = ref(0);   // 투입량
const prod_qty = ref(0);    // 생산량
const defect_qty = ref(0);  // 불량수량
const pref_note = ref('');  // 비고
const defect_type = ref('');

const handleCloseModal = () => {
    emit('closeModal');
};

const saveData = async () => {
    // 유효성 검사 (기존과 동일)
    if (prod_qty.value === null || prod_qty.value < 0) {
        Swal.fire({ title: "입력 오류", text: "생산량은 0 이상이어야 합니다.", icon: "warning", confirmButtonText: "확인" });
        return;
    }
    if (defect_qty.value === null || defect_qty.value < 0) {
        Swal.fire({ title: "입력 오류", text: "불량수량은 0 이상이어야 합니다.", icon: "warning", confirmButtonText: "확인" });
        return;
    }
    if (input_qty.value === null || input_qty.value < 0) {
        Swal.fire({ title: "입력 오류", text: "투입량은 0 이상이어야 합니다.", icon: "warning", confirmButtonText: "확인" });
        return;
    }

    try {
        // ⭐ 1. 작업 종료 시간 DB 업데이트 호출 (기존 /api/endWork) ⭐
        const endWorkPayload = {
            work_inst_code: props.prefProps[0],       // 작업지시코드
            work_process_code: props.prefProps[4],    // 작업공정코드
            process_code: props.prefProps[6],         // 공정코드
            equi_code: props.prefProps[5],            // 설비코드
            
        };
        console.log('props.prefProps[5]의 현재 값:', props.prefProps[5]); // ⭐ 이 라인 추가
        console.log('작업 종료 요청 페이로드:', endWorkPayload)
        const endWorkResponse = await axios.post('/api/endWork', endWorkPayload);

        if (!endWorkResponse.data.success) {
            Swal.fire({
                title: "작업 종료 실패",
                text: '작업 종료 시간 업데이트에 실패했습니다: ' + (endWorkResponse.data.message || '알 수 없는 오류'),
                icon: "error",
                confirmButtonText: "확인"
            });
            return; // 작업 종료 실패 시 실적 등록 진행하지 않음
        }
        console.log('작업 종료 시간 업데이트 성공');

        // ⭐ 2. 생산 실적 등록 호출 (기존 /api/prdPref) ⭐
        const perfPayload = {
            work_process_code: props.prefProps[4],    // 작업공정코드
            work_inst_code: props.prefProps[0],       // 작업지시코드
            prod_code: props.prefProps[1],            // 제품코드
            inst_qty: props.prefProps[2],             // 지시량
            input_qty: input_qty.value,
            prod_qty: prod_qty.value,
            defect_qty: defect_qty.value,
            pref_note: pref_note.value,
            defect_type: defect_type.value,
            emp_num: userCode, // 현재 로그인된 사용자 코드 (PrdPrefModal 자체에서 가져옴)
        };
        console.log('생산 실적 등록 요청 페이로드:', perfPayload);
        const perfResult = await axios.post('/api/prdPref', perfPayload);

        if (perfResult.data.success) {
            Swal.fire({
                title: "저장 성공",
                text: "작업 종료 및 생산 실적 정보가 성공적으로 저장되었습니다.",
                icon: "success",
                confirmButtonText: "확인"
            }).then(() => {
                handleCloseModal(); // 성공 시 모달 닫기
                // 부모 컴포넌트에 작업 완료 및 데이터 새로고침을 알리는 emit을 추가할 수 있음
                // emit('workProcessCompleted');
            });
        } else {
            Swal.fire({
                title: "저장 실패",
                text: perfResult.data.message || "생산 실적 저장에 실패했습니다.",
                icon: "error",
                confirmButtonText: "확인"
            });
        }
    } catch (error) {
        console.error('실적 저장 중 오류 발생:', error);
        Swal.fire({
            title: "오류",
            text: "작업 종료 및 생산 실적 저장 중 오류가 발생했습니다.",
            icon: "error",
            confirmButtonText: "확인"
        });
    }
};
onMounted(()=>{
 groupcodelist.groupCodeList('0Q',defecttypeList);

})

</script>

<template>
    <div class="modal-overlay" v-if="props.isModalOpen">
    <div class="modal-content p-4 bg-white shadow rounded" style="width: 500px; max-width: 100%;">
      <h5 class="mb-4">생산실적등록</h5>

      <!-- 자동표시 영역 -->
      <div class="mb-3">
        <label class="form-label">작업지시코드</label>
        <input type="text" class="form-control" placeholder="자동표시 수정 불가" v-model="props.prefProps[0]" disabled>
      </div>
      <div class="mb-3">
        <label class="form-label">제품코드</label>
        <input type="text" class="form-control" placeholder="자동표시"v-model="props.prefProps[1]" disabled>
      </div>
      <div class="mb-3">
        <label class="form-label">지시량</label>
        <input type="text" class="form-control" placeholder="자동표시" v-model="props.prefProps[2]" disabled>
      </div>
      <div class="mb-4">
        <label class="form-label">투입량</label>
        <input type="number" v-model="input_qty" class="form-control" >
      </div>

      <!-- 사용자입력 영역 -->
      <div class="mb-3">
        <label class="form-label">생산량</label>
        <input type="number" v-model="prod_qty" class="form-control" >
      </div>
      <div class="mb-3">
        <label class="form-label">불량수량</label>
        <input type="number" v-model="defect_qty" class="form-control">
      </div>
      <div class="mb-3">
        <label class="form-label">불량유형</label>
        <select class="form-select" v-model="defect_type" >
          <option value="">-- 선택 --</option>
          <option v-for="type in defecttypeList":key="type.detail_code" :value="type.detail_code">
            {{ type.detail_name }}</option>

        </select>
      </div>
      <div class="mb-4">
        <label class="form-label">비고</label>
        <input type="text" class="form-control" v-model="pref_note" placeholder="사용자입력 선택사항">
      </div>

      <!-- 하단 버튼 -->
      <div class="d-flex justify-content-end">
        <button class="btn btn-secondary me-2" @click="handleCloseModal">취소</button>
        <button class="btn btn-primary" @click="saveData">저장</button>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* 기존 스타일 유지 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 80%; /* 모달 너비 조절 */
    max-width: 900px; /* 최대 너비 설정 */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
}

.modal-actions {
    text-align: right;
}
</style>