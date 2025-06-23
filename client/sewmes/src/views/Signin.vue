<template>
  <main class="mt-0 main-content" id="loglog">
    <section>
<div class="page-header min-vh-100 d-flex justify-content-center align-items-center">
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-xl-4 col-lg-5 col-md-7">
              <div class="card card-plain">
                <div class="pb-0 card-header text-start">
                  <h4 class="font-weight-bolder">로그인</h4>
                </div>
                <div class="card-body">
                  <form role="form">
                    <div class="mb-3">
                      <argon-input
                        id="empnum"
                        type="text"
                        placeholder="사원번호"
                        name="empnum"
                        size="lg"
                        v-model="empnum"
                      />
                    </div>
                    <div class="mb-3">
                      <argon-input
                        id="password"
                        type="password"
                        placeholder="비밀번호"
                        name="password"
                        size="lg"
                        v-model="password"
                      />
                    </div>
                    <p>{{error}}</p>
                    <div class="text-center">
                      <argon-button
                        class="mt-4"
                        color="success"
                        fullWidth
                        size="lg"
                        type="button"
                        @click="handleLogin"
                        >Sign in</argon-button
                      >
                    </div>
                  </form>
                </div>
                <!-- <div class="px-1 pt-0 text-center card-footer px-lg-2">
                  <p class="mx-auto mb-4 text-sm">
                    Don't have an account?
                    <a
                      href="javascript:;"
                      class="text-success text-gradient font-weight-bold"
                      >Sign up</a
                    >
                  </p>
                </div> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
<script setup>
import { onBeforeUnmount, onBeforeMount } from "vue";
import { useStore } from "vuex";
import { useRouter } from 'vue-router'
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonSwitch from "@/components/ArgonSwitch.vue";
import ArgonButton from "@/components/ArgonButton.vue";
import { ref, onMounted } from 'vue'
import { createStore } from 'vuex'
import axios from "axios";

const body = document.getElementsByTagName("body")[0];
const router = useRouter();
const store = useStore();

onBeforeMount(() => {
  // store.state.hideConfigButton = true;
  store.state.showSidenav = false;
  store.state.showFooter = false;
  body.classList.remove("bg-gray-100");
});
onBeforeUnmount(() => {
  // store.state.hideConfigButton = false;
  store.state.showSidenav = true;
  store.state.showFooter = true;
  body.classList.add("bg-gray-100");
});

// 로그인 관련
const empnum = ref('')
const password = ref('')
const error = ref('')

async function handleLogin() {
  // 프론트단 유효성 검사
  if (!empnum.value) {
    error.value = '사원번호를 입력하세요.';
    return;
  }

  if (!password.value) {
    error.value = '비밀번호를 입력하세요.';
    return;
  }

  // 서버에 요청
  // 로그인 정보 필요할시 아래 코드 user.value 로 접근가능
  //import { useStore } from 'vuex';
  try {
    const response = await axios.post('/api/login', {
      emp_num: empnum.value,
      login_pw: password.value
    });

    if (response.data.success) {
      const userData = response.data.user; // 지역변수
      store.dispatch('saveUser', response.data.user); // saveUser 액션에 로그인정보 넘겨서 전역 state.user 에 로그인정보 저장
      localStorage.setItem('user', JSON.stringify(userData)); // 로컬스토리지에 user라는 키 이름으로 저장 (새로고침 시 로그인정보 유지)
      router.push('/');
    } else {
      error.value = response.data.message;
    }
  } catch (err) {
    console.error('로그인 오류:', err);
    error.value = '사원번호와 비밀번호를 확인해주세요.';
  }
}

</script>


<style>
#loglog{
  margin: auto;
}
</style>