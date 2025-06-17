import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import Signin from "../views/Signin.vue";

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/signin",
    name: "Signin",
    component: Signin,
  },
    {
    path: "/logout",
    name: "Logout",
    component: Dashboard,
  },
  {
    path: "/table",
    name: "Table",
    component: () => import("@/views/Table.vue"),
  },
  // --- 기준정보 관리 (Base Information Management) ---
  {
    path: '/empMaster',
    name: 'EmpMaster',
    component: () => import('@/views/BaseInfo/EmpMaster.vue'),
    meta: {
      title: '사원 관리',
      group: '기준정보 관리'
    }
  },
  {
    path: '/empChange',
    name: 'EmpChange',
    component: () => import('@/views/BaseInfo/EmpChange.vue'),
    meta: {
      title: '사원 정보 변경',
      group: '기준정보 관리'
    }
  },
  {
    path: '/matMaster',
    name: 'MatMaster',
    component: () => import('@/views/BaseInfo/MatMaster.vue'),
    meta: {
      title: '자재 품목 관리',
      group: '기준정보 관리'
    }
  },
  {
    path: '/prdMaster',
    name: 'PrdMaster',
    component: () => import('@/views/BaseInfo/PrdMaster.vue'),
    meta: {
      title: '제품 품목 관리',
      group: '기준정보 관리'
    }
  },
  {
    path: '/qualityMaster',
    name: 'QualityMaster',
    component: () => import('@/views/BaseInfo/QualityMaster.vue'),
    meta: {
      title: '품질기준 관리',
      group: '기준정보 관리'
    }
  },
  {
    path: '/processMaster',
    name: 'ProcessMaster',
    component: () => import('@/views/BaseInfo/ProcessMaster.vue'),
    meta: {
      title: '공정 관리',
      group: '기준정보 관리'
    }
  },
  {
    path: '/flowMaster',
    name: 'FlowMaster',
    component: () => import('@/views/BaseInfo/FlowMaster.vue'),
    meta: {
      title: '공정흐름도 관리',
      group: '기준정보 관리'
    }
  },
  {
    path: '/bomView',
    name: 'BomView',
    component: () => import('@/views/BaseInfo/BomView.vue'),
    meta: {
      title: 'BOM 조회',
      group: '기준정보 관리'
    }
  },
  {
    path: '/bomSave',
    name: 'BomSave',
    component: () => import('@/views/BaseInfo/BomSave.vue'),
    meta: {
      title: 'BOM 등록',
      group: '기준정보 관리'
    }
  },
  {
    path: '/equiMaster',
    name: 'EquiMaster',
    component: () => import('@/views/BaseInfo/EquiMaster.vue'),
    meta: {
      title: '설비 관리',
      group: '기준정보 관리'
    }
  },

  // --- 영업 (Sales) ---
  {
    path: '/ordMngment',
    name: 'OrdMngment',
    component: () => import('@/views/Sales/OrdMngment.vue'),
    meta: {
      title: '주문서 관리',
      group: '영업'
    }
  },
  {
    path: '/ordSave',
    name: 'OrdSave',
    component: () => import('@/views/Sales/OrdSave.vue'),
    meta: {
      title: '주문서 등록',
      group: '영업'
    }
  },
  {
    path: '/cpMngment',
    name: 'CpMngment',
    component: () => import('@/views/Sales/CpMngment.vue'),
    meta: {
      title: '업체 관리',
      group: '영업'
    }
  },
  {
    path: '/tranHistory',
    name: 'TranHistory',
    component: () => import('@/views/Sales/TranHistory.vue'),
    meta: {
      title: '업체 거래내역 조회',
      group: '영업'
    }
  },
  {
    path: '/outPossible',
    name: 'OutPossible',
    component: () => import('@/views/Sales/OutPossible.vue'),
    meta: {
      title: '업체별 외주제품',
      group: '영업'
    }
  },

  // --- 자재 (Material) ---
  {
    path: '/matHold',
    name: 'MatHold',
    component: () => import('@/views/Material/MatHold.vue'),
    meta: {
      title: '예약 자재 재고 조회',
      group: '자재'
    }
  },
  {
    path: '/matOrder',
    name: 'MatOrder',
    component: () => import('@/views/Material/MatOrder.vue'),
    meta: {
      title: '자재 발주서 관리',
      group: '자재'
    }
  },
  {
    path: '/matOrderView',
    name: 'MatOrderView',
    component: () => import('@/views/Material/MatOrderView.vue'),
    meta: {
      title: '자재 발주서 조회',
      group: '자재'
    }
  },
  {
    path: '/matInoutView',
    name: 'MatInoutView',
    component: () => import('@/views/Material/MatInoutView.vue'),
    meta: {
      title: '자재 입출고 조회',
      group: '자재'
    }
  },
  {
    path: '/matCheck',
    name: 'MatCheck',
    component: () => import('@/views/Material/MatCheck.vue'),
    meta: {
      title: '자재 수입검사 관리',
      group: '자재'
    }
  },
  {
    path: '/matCheckView',
    name: 'MatCheckView',
    component: () => import('@/views/Material/MatCheckView.vue'),
    meta: {
      title: '자재 수입검사 조회',
      group: '자재'
    }
  },

  // --- 생산 (Production) ---
  {
    path: '/prdPlanMngment',
    name: 'PrdPlanMngment',
    component: () => import('@/views/Production/PrdPlanMngment.vue'),
    meta: {
      title: '생산계획 관리',
      group: '생산'
    }
  },
  {
    path: '/workInstMngment',
    name: 'WorkInstMngment',
    component: () => import('@/views/Production/WorkInstMngment.vue'),
    meta: {
      title: '작업지시 관리',
      group: '생산'
    }
  },
  {
    path: '/prdWorking',
    name: 'PrdWorking',
    component: () => import('@/views/Production/PrdWorking.vue'),
    meta: {
      title: '생산 작업 실행',
      group: '생산'
    }
  },
  {
    path: '/lotHistory',
    name: 'LotHistory',
    component: () => import('@/views/Production/LotHistory.vue'),
    meta: {
      title: 'LOT 이력 조회',
      group: '생산'
    }
  },
  {
    path: '/prdPrefView',
    name: 'PrdPrefView',
    component: () => import('@/views/Production/PrdPrefView.vue'),
    meta: {
      title: '생산 실적 조회',
      group: '생산'
    }
  },
  {
    path: '/prdErrMngment',
    name: 'PrdErrMngment',
    component: () => import('@/views/Production/PrdErrMngment.vue'),
    meta: {
      title: '생산 불량 이력 관리',
      group: '생산'
    }
  },
  {
    path: '/outsouMngment',
    name: 'OutsouMngment',
    component: () => import('@/views/Production/OutsouMngment.vue'),
    meta: {
      title: '외주 발주서 관리',
      group: '생산'
    }
  },
  {
    path: '/outsouRelease',
    name: 'OutsouRelease',
    component: () => import('@/views/Production/OutsouRelease.vue'),
    meta: {
      title: '외주 출고 처리',
      group: '생산'
    }
  },
  {
    path: '/outsouInbound',
    name: 'OutsouInbound',
    component: () => import('@/views/Production/OutsouInbound.vue'),
    meta: {
      title: '외주 입고 관리',
      group: '생산'
    }
  },
  {
    path: '/outsouErrMngment',
    name: 'OutsouErrMngment',
    component: () => import('@/views/Production/OutsouErrMngment.vue'),
    meta: {
      title: '외주 입고 불량 관리',
      group: '생산'
    }
  },
  {
    path: '/outsouReleaseList',
    name: 'OutsouReleaseList',
    component: () => import('@/views/Production/OutsouReleaseList.vue'),
    meta: {
      title: '외주출고 자재 조회',
      group: '생산'
    }
  },
  {
    path: '/prdInboundMngment',
    name: 'PrdInboundMngment',
    component: () => import('@/views/Production/PrdInboundMngment.vue'),
    meta: {
      title: '완제품 입고 관리',
      group: '생산'
    }
  },
  {
    path: '/releaseHistory',
    name: 'ReleaseHistory',
    component: () => import('@/views/Production/ReleaseHistory.vue'),
    meta: {
      title: '출고 내역 조회',
      group: '생산'
    }
  },
  {
    path: '/releaseProcess',
    name: 'ReleaseProcess',
    component: () => import('@/views/Production/ReleaseProcess.vue'),
    meta: {
      title: '출고 처리',
      group: '생산'
    }
  },

  // --- 설비 (Equipment) ---
  {
    path: '/equiMaint',
    name: 'EquiMaint',
    component: () => import('@/views/Equipment/EquiMaint.vue'),
    meta: {
      title: '설비 점검/수리',
      group: '설비'
    }
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkActiveClass: "active",
});

export default router;
