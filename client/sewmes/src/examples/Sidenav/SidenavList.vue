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

      <li class="nav-item">
        <sidenav-item
          to="/table"
          :class="getRoute() === 'tables' ? 'active' : ''"
          navText="임시"
        >
        </sidenav-item>
      </li>

      <li class="nav-item">
        <sidenav-item
          to="/signin"
          :class="getRoute() === 'signin' ? 'active' : ''"
          :navText="isRTL ? 'تسجيل الدخول' : 'Sign In'"
        >
          <template v-slot:icon>
            <i class="ni ni-single-copy-04 text-danger text-sm opacity-10"></i>
          </template>
        </sidenav-item>
      </li>

      <li class="nav-item">
        <sidenav-item
          navText="기준정보 관리"
          :subItems="[
            { name: '사원 관리', to: '/temp' },
            { name: '사원 정보 변경', to: '/temp' },
            { name: '자재 품목 관리', to: '/temp' },
            { name: '제품 품목 관리', to: '/temp' },
            { name: '품질기준 관리', to: '/temp' },
            { name: '공정 관리', to: '/temp' },
            { name: '공정흐름도 관리', to: '/temp' },
            { name: 'BOM조회', to: '/temp' },
            { name: 'BOM등록', to: '/temp' },
            { name: '설비 관리', to: '/temp' },
          ]"
        >
        </sidenav-item>
      </li>

      <li class="nav-item">
        <sidenav-item
          navText="영업"
          :subItems="[
            { name: '주문서 관리', to: '/temp' },
            { name: '주문서 등록', to: '/temp' },
            { name: '업체 관리', to: '/temp' },
            { name: '업체 거래내역 조회', to: '/temp' },
          ]"
        >
        </sidenav-item>
      </li>

      <li class="nav-item">
        <sidenav-item
          navText="자재"
          :subItems="[
            { name: '자재 재고 조회', to: '/temp' },
            { name: '제품 재고 조회', to: '/temp' },
            { name: '예약 자재 재고 조회', to: '/temp' },
            { name: '자재 발주서 관리', to: '/temp' },
            { name: '자재 발주서 조회', to: '/temp' },
            { name: '자재 입출고 조회', to: '/temp' },
            { name: '자재 수입검사 관리', to: '/temp' },
          ]"
        >
        </sidenav-item>
      </li>

      <li class="nav-item">
        <sidenav-item
          navText="생산"
          :subItems="[
            { name: '생산계획 관리', to: '/temp' },
            { name: '작업지시 관리', to: '/temp' },
            { name: '생산 작업 실행', to: '/temp' },
            { name: 'LOT 이력 조회', to: '/temp' },
            { name: '생산 실적 조회', to: '/temp' },
            { name: '생산 불량 이력 관리', to: '/temp' },
            { name: '외주 발주서 관리', to: '/temp' },
            { name: '외주 출고 처리', to: '/temp' },
            { name: '외주 입고 관리', to: '/temp' },
            { name: '외주 입고 불량 관리', to: '/temp' },
            { name: '출고 내역 조회', to: '/temp' },
            { name: '출고 처리', to: '/temp' },
          ]"
        >
        </sidenav-item>
      </li>

      <li class="nav-item">
        <sidenav-item
          navText="설비"
          :subItems="[
            { name: '설비 점검/수리', to: '/temp' },
          ]"
        >
        </sidenav-item>
      </li>
    </ul>
  </div>
</template>
