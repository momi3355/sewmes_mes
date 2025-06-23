<script setup>
import { computed, ref, onMounted } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import Breadcrumbs from "../Breadcrumbs.vue";
import Swal from 'sweetalert2';

const showMenu = ref(false);
// const store = useStore();
// const isRTL = computed(() => store.state.isRTL);

const route = useRoute();
// 이거 원래 있던 isRTL 유지
const isRTL = false; // (혹은 props나 store에서 관리하는 경우 그대로 사용)

const store = useStore();
const router = useRouter();

// 로그인 여부 확인
const isLoggedIn = computed(() => !!store.state.user);

// 로그아웃 핸들러
function handleLogout() {
  store.dispatch('logoutUser');
  localStorage.removeItem('user');
  router.push({ name: 'Signin' });
}
const currentRouteName = computed(() => {
  return route.name;
});
const currentDirectory = computed(() => {
  let dir = route.path.split("/")[1];
  return dir.charAt(0).toUpperCase() + dir.slice(1);
});
const currentRouteTitle = computed(() => {
  return route.meta.title;
});

const minimizeSidebar = () => store.commit("sidebarMinimize");
const toggleConfigurator = () => store.commit("toggleConfigurator");

const closeMenu = () => {
  setTimeout(() => {
    showMenu.value = false;
  }, 100);
};


onMounted(() => {
  if (!isLoggedIn.value) {
    Swal.fire({
      title: "권한 실패",
      text: "로그인이 필요합니다.",
      icon: "error"
    });
    router.push('/signin');
  }
});
</script>
<template>
  <nav
    class="navbar navbar-main navbar-expand-lg px-0 mx-4 shadow-none border-radius-xl"
    :class="isRTL ? 'top-0 position-sticky z-index-sticky' : ''"
    v-bind="$attrs"
    id="navbarBlur"
    data-scroll="true"
  >
    <div class="px-3 py-1 container-fluid">
      <breadcrumbs
        :current-page="currentRouteName"
        :current-directory="currentRouteTitle"
      />

      <div
        class="mt-2 collapse navbar-collapse mt-sm-0 me-md-0 me-sm-4"
        :class="isRTL ? 'px-0' : 'me-sm-4'"
        id="navbar"
      >
        <div
          class="pe-md-3 d-flex align-items-center"
          :class="isRTL ? 'me-md-auto' : 'ms-md-auto'"
        >
          <!-- <div class="input-group">
            <span class="input-group-text text-body">
              <i class="fas fa-search" aria-hidden="true"></i>
            </span>
            <input
              type="text"
              class="form-control"
              :placeholder="isRTL ? 'أكتب هنا...' : 'Type here...'"
            />
          </div> -->
        </div>
        <ul class="navbar-nav justify-content-end">
          <li class="nav-item d-flex align-items-center">
                          <div v-if="isLoggedIn" id="h6">
    <h6>{{ store.state.user.emp_name }} 님</h6>
  </div>
            <router-link
              :to="{ name: 'Signin' }"
              class="px-0 nav-link font-weight-bold text-black"
            >
              <i class="fa fa-user" :class="isRTL ? 'ms-sm-2' : 'me-sm-2'"></i>
              <span v-if="!isLoggedIn" class="d-sm-inline d-none">LOGIN</span>
              <span v-else class="d-sm-inline d-none" @click="handleLogout">LOGOUT</span>
            </router-link>
          </li>
          <li class="nav-item d-xl-none ps-3 d-flex align-items-center">
            <a
              href="#"
              @click="minimizeSidebar"
              class="p-0 nav-link text-black"
              id="iconNavbarSidenav"
            >
              <div class="sidenav-toggler-inner">
                <i class="sidenav-toggler-line bg-black"></i>
                <i class="sidenav-toggler-line bg-black"></i>
                <i class="sidenav-toggler-line bg-black"></i>
              </div>
            </a>
          </li>
          <!-- <li class="px-3 nav-item d-flex align-items-center">
            <a class="p-0 nav-link text-white" @click="toggleConfigurator">
              <i class="cursor-pointer fa fa-cog fixed-plugin-button-nav"></i>
            </a>
          </li> -->
          <li
            class="nav-item dropdown d-flex align-items-center"
            :class="isRTL ? 'ps-2' : 'pe-2'"
          >
            <a
              href="#"
              class="p-0 nav-link text-white"
              :class="[showMenu ? 'show' : '']"
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              @click="showMenu = !showMenu"
              @blur="closeMenu"
            >
              <!-- <i class="cursor-pointer fa fa-bell"></i> -->
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
<style>
body h6{
  margin:0;
  margin-right: 10px;
}
</style>