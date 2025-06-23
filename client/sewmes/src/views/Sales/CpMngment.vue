<template>
  <div class="container-fluid p-3">
    <!-- 📦 주문 목록 + 상세 -->
    <div class="container-fluid py-4" id="odlist">
      <!-- 높이 통일을 위해 row에 height 지정 -->
      <div class="row gx-4" style="height: 800px;">
        
        <!-- 주문서 목록 -->
        <div class="col-lg-6 mb-4">
              <tabulator-card
                card-title="주문서 목록"
                :table-data="companyData"
                :table-columns="companyColumns"
                :tabulator-options="tabulatorEvent"
                :on="tabulatorEvent"
                 height="750px"
                style="height: 100%;"
              />
        </div>

        <!-- 주문 상세 + 등록 -->
<div class="col-lg-6 mb-4">
          <div class="card">
            <div class="card-body" id="cardbody">
              <table class="table table-bordered table-sm align-middle mb-2">
                <tbody id="orderDetail">
                  <tr>
                    <th style="width: 30%;">업체명</th>
                    <td>
                      <!-- <div class="position-relative" @focusin="listOpen = true" @focusout="onFocusOut">
                        <input type="text" class="form-control" v-model="ordercurrentOrder.cp_name" />
                        <ul class="dropdown-menu show" v-if="listOpen" style="position:absolute; top:100%; left:0; z-index: 1000;">
                          <li v-for="(company, index) in filteredCompanyList" :key="index">
                            <a class="dropdown-item" href="#" @mousedown.prevent @click="selectCompany(company)">
                              {{ company.cp_name }}
                            </a>
                          </li>
                        </ul>
                      </div> -->
                    </td>
                  </tr>
                  <tr>
                    <th>업체연락처</th>
                    <td><input type="tel" class="form-control" /></td>
                  </tr>
                  <tr>
                    <th>주소</th>
                    <td><input type="text" class="form-control" /></td>
                  </tr>
                  <tr>
                    <th>주문일자</th>
                    <td><input type="date" class="form-control" /></td>
                  </tr>
                  <tr>
                    <th>납기일자</th>
                    <td><input type="date" class="form-control" /></td>
                  </tr>
                  <tr>
                    <th>영업담당자</th>
                    <td><input type="text" class="form-control" /></td>
                  </tr>
                  <tr>
                    <th>영업담당자 연락처</th>
                    <td><input type="tel" class="form-control"  /></td>
                  </tr>
                  <tr>
                    <th>비고</th>
                    <td><textarea class="form-control" rows="2" ></textarea></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- <script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// 업체명 출력 컬럼
const companyColumns = [
  { title: "순번", formatter: "rownum", width: 80 },
  { title: "주문코드", field: "order_code", width: 108 },
  { title: "업체명", field: "cp_name"},
  { title: "총수량", field: "total_qty", width: 94 },
  { title: "주문일자", field: "order_date", width: 110 },
  { title: "납기일자", field: "dead_date", width: 110 },
  { title: "상태", field: "order_state", width: 90, 
    formatter:(cell)=>{
    const code = cell.getValue();
    const matched = statecode.value.find(item => item.detail_code == code);
    return matched ? matched.detail_name : code;
  } }
];

async function fetchOrders() {
  const res = await axios.get('/api/companyList');
  orders.value = res.data;
}

onMounted(async () => {
  await Promise.all([
    fetchOrders(),
  ]);
});

</script> -->

<style scoped>
/* 기존 조회페이지 스타일 유지 */
.search-color { margin: 10px; padding: 20px; border-radius: 1rem; background-color: #fff; }

#cardbody{
  padding: 10px;
}

</style>
