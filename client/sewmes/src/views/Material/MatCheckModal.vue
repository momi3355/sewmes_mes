<!-- 자재 품질 검사 모달 -->

<script setup>
import { ref } from 'vue';

// 모달창의 보이기/숨기기 상태를 관리하는 변수
const isModalVisible = ref(false);

// 모달을 여는 함수 (부모 컴포넌트에서 호출할 수 있도록 export)
const openModal = () => {
  isModalVisible.value = true;
};

// 모달을 닫는 함수
const closeModal = () => {
  isModalVisible.value = false;
};

// '검사 완료' 버튼 클릭 시 동작할 함수
const completeInspection = () => {
  alert('검사가 완료되었습니다.');
  closeModal(); // 검사 완료 후 모달 닫기
};

// defineExpose를 통해 부모 컴포넌트에서 openModal 함수를 직접 호출할 수 있게 합니다.
defineExpose({
  openModal,
});
</script>

<template>
  <!-- isModalVisible 값이 true일 때만 모달을 화면에 표시합니다 -->
  <div v-if="isModalVisible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      
      <!-- 1. 모달 헤더 -->
      <div class="modal-header">
        <h1>수입 검사</h1>
      </div>

      <!-- 2. 모달 바디 -->
      <div class="modal-body">
        <div class="info-section">
          <p>자재명: (자동생성)</p>
          <p>입고번호: (자동생성)</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>항목</th>
              <th>기준값</th>
              <th>수입량</th>
              <th>합격개수</th>
              <th>불합격개수</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>폭</td>
              <td>140~152cm</td>
              <td>(자동생성)</td>
              <td>(자동생성)</td>
              <td><input type="text" class="input-cell" placeholder="사용자가 입력"></td>
            </tr>
            <tr>
              <td>색상 일치</td>
              <td>일치해야 함</td>
              <td>(자동생성)</td>
              <td>(자동생성)</td>
              <td><input type="text" class="input-cell" placeholder="사용자가 입력"></td>
            </tr>
            <tr>
              <td>오염여부</td>
              <td>없음</td>
              <td>(자동생성)</td>
              <td>(자동생성)</td>
              <td><input type="text" class="input-cell" placeholder="사용자가 입력"></td>
            </tr>
            <tr>
              <td>인장 강도</td>
              <td>>=40kgf</td>
              <td>(자동생성)</td>
              <td>(자동생성)</td>
              <td><input type="text" class="input-cell" placeholder="사용자가 입력"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 3. 모달 푸터 (버튼) -->
      <div class="modal-footer">
        <button class="btn btn-primary" @click="completeInspection">검사완료</button>
        <button class="btn btn-secondary" @click="closeModal">취소</button>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* 뒷 배경 오버레이 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* 모달창 컨테이너 */
.modal-container {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 700px;
}

/* 헤더 */
.modal-header h1 {
  text-align: center;
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 20px;
}

/* 정보 섹션 */
.info-section {
  margin-bottom: 20px;
  text-align: left;
}
.info-section p {
  margin: 5px 0;
  font-size: 1rem;
}

/* 테이블 스타일 */
table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
}
th, td {
  border: 1px solid #ccc;
  padding: 12px;
  text-align: center;
  vertical-align: middle;
}
th {
  background-color: #f8f9fa;
  font-weight: 600;
}
.input-cell {
  width: 100%;
  border: none;
  text-align: center;
  padding: 5px;
  box-sizing: border-box;
}
.input-cell:focus {
  outline: 1px solid #8ab4f8;
  background-color: #f8f9fa;
}


/* 푸터 (버튼 영역) */
.modal-footer {
  text-align: center;
}
.btn {
  padding: 10px 25px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin: 0 10px;
}
.btn-primary {
  background-color: #82C0C9; /* 이미지의 청록색 */
  color: white;
}
.btn-secondary {
  background-color: #BDBDBD; /* 이미지의 회색 */
  color: white;
}
</style>