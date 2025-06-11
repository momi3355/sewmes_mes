<template>
<div class="card detail-form" id="card">
  <div class="card-body p-4">
    <div class="row g-3 align-items-center">
      <div class="col-md-3 fw-bold">업체명:</div>
      <div class="col-md-9">
        <input 
  type="text" 
  class="form-control" 
  :value="searchTerm" 
  @input="setSearchTerm" 
  @blur="() => setListOpen(false)" 
  @focus="() => setListOpen(true)" 
/>
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
        <input type="text" class="form-control" v-model="orderdate" />
      </div>

      <div class="col-md-3 fw-bold">납기일자:</div>
      <div class="col-md-9">
        <input type="text" class="form-control" v-model="deaddate" />
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
                <button class="btn btn-outline-secondary btn-sm me-2">제품추가 🧾</button>
              <argon-button color="secondary" variant="gradient" class="me-2" id="arbtn">삭제</argon-button>
              <argon-button color="success" variant="gradient" id="arbtn">저장</argon-button>
            </div>
</div>
<table class="table table-sm product-list-table" id="card">
    <thead>
      <tr>
        <th><input type="checkbox" id="cbox"></th>
        <th>제품명</th>
        <th>색상</th>
        <th>사이즈</th>
        <th>규격</th>
        <th>수량</th>
        <th>총수량</th>
        <th>단가(box)</th>
        <th>합계</th>
        <th>상태</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in products" :key="index">
        <td>
          <input type="checkbox" v-model="item.checked" />
        </td>
        <td>{{ item.name }}</td>
        <td>{{ item.qty }}</td>
        <td>{{ item.price }}</td>
        <td>{{ item.note }}</td>
      </tr>
    </tbody>

  </table>

</template>

<script setup>
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { ref, onMounted } from "vue"; // Import ref and onMounted
import axios from "axios";
import ArgonButton from "@/components/ArgonButton.vue";
import DefaultInfoCard from "@/examples/Cards/DefaultInfoCard.vue";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";

</script>

<style>
/* 주문 상세 카드 내부의 제품 테이블 */
#card{
  width: 1500px;
  margin: auto;
}
.product-table {
  border-top: 1px solid #ddd;
  padding-top: 1rem;
  background-color: white; /* ✅ 흰 배경 적용 */
  border-radius: 8px;
}

/* 테이블 스타일 */
.product-list-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white; /* ✅ 테이블 배경도 흰색으로 */
  font-size: 0.875rem;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
}

.product-list-table th,
.product-list-table td {
  padding: 6px 8px;
  text-align: center;
  border-bottom: 1px solid #eee;
}

#arbtn{
  width: 65px;
  height: 40px;
}
</style>