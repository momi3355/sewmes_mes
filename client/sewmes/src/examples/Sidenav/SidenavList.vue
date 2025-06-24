<script setup>
import { useRoute } from "vue-router";

import SidenavItem from "./SidenavItem.vue";
//import SidenavCard from "./SidenavCard.vue";

const getRoute = () => {
  const route = useRoute();
  const routeArr = route.path.split("/");
  return routeArr[1];
};
</script>
<template>
  <div
    class="collapse navbar-collapse w-auto h-auto h-100"
    id="sidenav-collapse-main"
  >
    <ul class="navbar-nav">
      <!-- <li class="nav-item">
       <sidenav-item
        to="/dashboard-default"
        navText="Dashboard"
        icon="ni ni-tv-2 text-primary text-sm opacity-10"
        :subItems="[
          { name: 'Analytics', to: '/dashboard-analytics' },
          { name: 'Reports', to: '/dashboard-reports' }
        ]"
      />
      </li> -->

      <!--<li class="nav-item">
        <sidenav-item
          to="/table"
          :class="getRoute() === 'tables' ? 'active' : ''"
          navText="임시"
        >
        </sidenav-item>
      </li>-->

      <!--<li class="nav-item">
        <sidenav-item
          to="/signin"
          :class="getRoute() === 'signin' ? 'active' : ''"
          :navText="isRTL ? 'تسجيل الدخول' : 'Sign In'"
        >
          <template v-slot:icon>
            <i class="ni ni-single-copy-04 text-danger text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>-->

      <li class="nav-item">
        <sidenav-item
          navText="기준정보 관리"
          :subItems="[
            // { name: '사원 관리', to: '/empMaster' },
            // { name: '사원 정보 변경', to: '/empChange' },
            { name: '자재 품목 관리', to: '/matMaster' },
            { name: '제품 품목 관리', to: '/prdMaster' },
            { name: '품질기준 관리', to: '/qualityMaster' },
            { name: '공정 관리', to: '/processMaster' },
            { name: '공정흐름도 관리', to: '/flowMaster' },
            { name: 'BOM등록', to: '/bomSave' },
            { name: '설비 관리', to: '/equiMaster' },
          ]" 
        >
          <template v-slot:icon>
              <i class="ni ni-single-copy-04 text-info text-sm opacity-10"></i>
            </template>
        </sidenav-item>
      </li>

      <li class="nav-item">
        <sidenav-item
          navText="영업"
          :subItems="[
            { name: '주문서 조회', to: '/ordMngment' },
            { name: '주문서 등록', to: '/ordSave' },
            { name: '업체 조회', to: '/cpMngment' },
            // { name: '업체 거래내역 조회', to: '/tranHistory' },
            { name: '업체별 외주제품', to: '/outPossible' },
          ]"
        >
          <template v-slot:icon>
            <i class="ni ni-single-02 text-primary text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>

      <li class="nav-item">
        <sidenav-item
          navText="자재"
          :subItems="[
            { name: '예약 자재 재고 조회', to: '/matHold' },
            { name: '자재 발주서 관리', to: '/matOrder' },
            // { name: '자재 발주서 조회', to: '/matOrderView' },
            { name: '자재 입출고 조회', to: '/matInoutView' },
            { name: '자재 수입검사 관리', to: '/matCheck' },
            { name: '자재 수입검사 조회', to: '/matCheckView' },
          ]"
        >
          <template v-slot:icon>
            <i class="ni ni-app text-success text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>

      <li class="nav-item">
        <sidenav-item
          navText="생산"
          :subItems="[
            { name: '생산계획 관리', to: '/prdPlanMngment' },
            { name: '작업지시 관리', to: '/workInstMngment' },
            { name: '생산 작업 실행', to: '/prdWorking' },
            { name: 'LOT 이력 조회', to: '/lotHistory' },
            { name: '생산 실적 조회', to: '/prdPrefView' },
            { name: '외주 발주서 관리', to: '/outsouMngment' },
            { name: '외주 출고 처리', to: '/outsouRelease' },
            { name: '외주 입고 관리', to: '/outsouInbound' },
            { name: '외주 입고 불량 관리', to: '/outsouErrMngment' },
            { name: '외주출고 자재 조회', to: '/outsouReleaseList' },
            { name: '완제품 입고 관리', to: '/prdInboundMngment' },
            { name: '출고 내역 조회', to: '/releaseHistory' },
            { name: '출고 처리', to: '/releaseProcess' },
          ]"
        >
          <template v-slot:icon>
            <i class="ni ni-tag text-danger text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>

      <!-- <li class="nav-item">
        <sidenav-item
          navText="설비"
          :subItems="[
            { name: '설비 점검/수리', to: '/equiMaint' },
          ]"
        >
          <template v-slot:icon>
            <i class="ni ni-atom text-warning text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li> -->
    </ul>
  </div>
</template>
