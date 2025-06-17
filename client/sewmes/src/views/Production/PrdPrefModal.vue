<script setup>
import axios from 'axios';
import {onMounted, ref} from 'vue';
import { useStore } from "vuex";
import { defineProps, defineEmits } from 'vue';
const emit = defineEmits(['closeModal']);
import groupcodelist from "../../assets/js/utils/groupcodelist";

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

const saveData=async()=>{
  try{
       const payload = {
        work_process_code:props.prefProps[4],
        work_inst_code:props.prefProps[0],
        // props.prefProps[1],
        // props.prefProps[2],
            
            prod_code:props.prefProps[1],
            inst_qty:props.prefProps[2],
            input_qty:input_qty.value,
            prod_qty:prod_qty.value,
            defect_qty:defect_qty.value,
            pref_note:pref_note.value,
            defect_type:defect_type.value,   
            emp_num: userCode,
        };
        console.log('넘겨주는 값',payload);
       const result = await axios.post('/api/prdPref', payload); 
       console.log('결과',result);
  }catch(error){
    console.error(error);
  }

} 
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