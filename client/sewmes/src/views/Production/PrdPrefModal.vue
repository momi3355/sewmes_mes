<script setup>
import axios from 'axios';
import {ref} from 'vue';

const emit = defineEmits(['closeModal']);
const props = defineProps({
    isModalOpen: Boolean
});

const handleCloseModal = () => {
    emit('closeModal');
};

</script>
<template>
    <div class="modal-overlay" v-if="props.isModalOpen">
    <div class="modal-content p-4 bg-white shadow rounded" style="width: 500px; max-width: 100%;">
      <h5 class="mb-4">생산실적등록</h5>

      <!-- 자동표시 영역 -->
      <div class="mb-3">
        <label class="form-label">작업지시코드</label>
        <input type="text" class="form-control" value="자동표시 수정 불가" disabled>
      </div>
      <div class="mb-3">
        <label class="form-label">제품코드</label>
        <input type="text" class="form-control" value="자동표시" disabled>
      </div>
      <div class="mb-3">
        <label class="form-label">지시량</label>
        <input type="text" class="form-control" value="자동표시" disabled>
      </div>
      <div class="mb-4">
        <label class="form-label">투입량</label>
        <input type="text" class="form-control" value="자동표시" disabled>
      </div>

      <!-- 사용자입력 영역 -->
      <div class="mb-3">
        <label class="form-label">생산량</label>
        <input type="number" class="form-control" >
      </div>
      <div class="mb-3">
        <label class="form-label">불량수량</label>
        <input type="number" class="form-control">
      </div>
      <div class="mb-3">
        <label class="form-label">불량유형</label>
        <select class="form-select" >
          <option value="">-- 선택 --</option>
          <option>사이즈 오류</option>
          <option>오염 발생</option>
          <option>올 풀림</option>
          <option>인쇄불량</option>
          <option>원단손상</option>
        </select>
      </div>
      <div class="mb-4">
        <label class="form-label">비고</label>
        <input type="text" class="form-control" placeholder="사용자입력 선택사항">
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