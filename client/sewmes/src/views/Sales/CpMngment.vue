<template>
  <div class="container-fluid p-3">
    <!-- 📦 주문 목록 + 상세 -->
    <div class="container-fluid py-4" id="odlist">
      <!-- 높이 통일을 위해 row에 height 지정 -->
      <div class="row gx-4" style="height: 800px;">
        
        <!-- 주문서 목록 -->
        <div class="col-lg-6 mb-4">
              <tabulator-card
                card-title="업체 목록"
                :table-data="companyListData"
                :table-columns="companyColumns"
                :tabulator-options="tabulatorEvent"
                height="700px"
                style="height: 100%;"
              />
        </div>

        <!-- 주문 상세 + 등록 -->
        <div class="col-lg-6 mb-4">
          <div class="card">
            <div class="card-header header-fixed">
              <h5 class="mt-0 text-start">업체 상세정보</h5>
            </div>
            <div class="card-body" id="cardbody">
              <table class="table table-bordered table-sm align-middle mb-8">
                <tbody id="orderDetail">
                  <tr>
                    <th style="width: 30%;">대표자</th>
                    <td><input type="text" class="form-control" v-model="companyData.cp_ceo" readonly/></td>
                  </tr>
                  <tr>
                    <th>사업자번호</th>
                    <td><input type="text" class="form-control" v-model="companyData.cp_num" readonly/></td>
                  </tr>
                  <tr>
                    <th>업체명</th>
                    <td><input type="text" class="form-control" v-model="companyData.cp_name" readonly/></td>
                  </tr>
                  <tr>
                    <th>업체담당자</th>
                    <td><input type="text" class="form-control" v-model="companyData.cp_manager" readonly/></td>
                  </tr>
                  <tr>
                    <th>주소</th>
                    <td><textarea class="form-control" rows="2" v-model="companyData.address" readonly></textarea></td>
                  </tr>
                  <tr>
                    <th>지역</th>
                    <td>
                      <select class="form-select" v-model="companyData.region" disabled>
                        <option value="">지역 선택</option>
                        <option 
                          v-for="region in regionCode" 
                          :key="region.detail_code" 
                          :value="region.detail_code"
                        >
                          {{ region.detail_name }}
                        </option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <th>최초등록일</th>
                    <td><input type="date" class="form-control" v-model="companyData.first_reg" readonly/></td>
                  </tr>
                  <tr>
                    <th>거래종료일</th>
                    <td><input type="date" class="form-control" v-model="companyData.end_tran" readonly/></td>
                  </tr>
                  <tr>
                    <th>비고</th>
                    <td><textarea class="form-control" rows="2" v-model="companyData.note" readonly></textarea></td>
                  </tr>
                  <tr>
                    <th>분류</th>
                    <td>
                      <select class="form-select" v-model="companyData.cls" disabled>
                        <option value="">분류 선택</option>
                        <option 
                          v-for="cls in clsCode" 
                          :key="cls.detail_code" 
                          :value="cls.detail_code"
                        >
                          {{ cls.detail_name }}
                        </option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <th>상태</th>
                    <td>
                      <select class="form-select" v-model="companyData.use_yn" disabled>
                        <option value="">상태</option>
                        <option 
                          v-for="useyn in useynCode" 
                          :key="useyn.detail_code" 
                          :value="useyn.detail_code"
                        >
                          {{ useyn.detail_name }}
                        </option>
                      </select>
                    </td>
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

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import TabulatorCard from "@/examples/Cards/TabulatorCard.vue";
import groupcodelist from "../../assets/js/utils/groupcodelist.js"
// import ArgonButton from "@/components/ArgonButton.vue";

// 업체데이터 담는그릇
const companyListData = ref([]);
// 공통코드 그릇
const regionCode = ref([]);
const useynCode = ref([]);
const clsCode = ref([]);

// 업체리스트 & 업체상세 출력
const companyColumns = [
  { title: "순번", formatter: "rownum", width: 80 },
  { title: "업체명", field: "cp_name"},
  { title: "지역", field: "region", width: 90,
    formatter:(cell)=>{
      const code = cell.getValue();
      const matched = regionCode.value.find(item => item.detail_code == code);
      return matched ? matched.detail_name : code;
    }
   },
  { title: "상태", field: "use_yn", width: 100,
    formatter:(cell)=>{
      const code = cell.getValue();
      const matched = useynCode.value.find(item => item.detail_code == code);
      return matched ? matched.detail_name : code;
    }
   },
  { title: "분류", field: "cls", width: 100,
    formatter:(cell)=>{
      const code = cell.getValue();
      const matched = clsCode.value.find(item => item.detail_code == code);
      return matched ? matched.detail_name : code;
    }
   },
  { title: "등록날짜", field: "first_reg", width: 130, }
];

// 상세보기용 객체
const companyData = ref({
  cp_ceo: '',
  cp_num: '',
  cp_name: '',
  cp_manager: '',
  address: '',
  region: '',
  first_reg: '',
  end_tran: '',
  note: '',
  cls: '',
  use_yn: ''
});

// 공통코드명을 표시하는 computed 속성들 (필요시 사용)
// 행 클릭시 상세보기
const tabulatorEvent = {
  rowFormatter: function(row) {
    const el = row.getElement();
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      const rowData = row.getData();
      companyData.value = { ...rowData };
      console.log("✅ Row Clicked via rowFormatter:", rowData);
    });
  }
};

// axios API 호출
async function companyList() {
  const res = await axios.get('/api/companyList');
  companyListData.value = res.data;
}

onMounted(async () => {
  groupcodelist.groupCodeList('0F', regionCode);
  groupcodelist.groupCodeList('0B', useynCode);
  groupcodelist.groupCodeList('0G', clsCode);
  await companyList();
  console.log("✅ useynCode:", useynCode.value);
  await Promise.all([
  companyList(),
  ]);
});
</script>

<style scoped>
/* 기존 조회페이지 스타일 유지 */
.search-color { margin: 10px; padding: 20px; border-radius: 1rem; background-color: #fff; }

#cardbody{
  padding: 10px;
}
.header-fixed {
  height: 50px;
  padding: 10px 16px;
  margin-bottom: 0px;
  margin-top: 10px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* border-bottom: 1px solid #dee2e6; */
}
</style>