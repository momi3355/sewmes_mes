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
                        type="empnum"
                        placeholder="사원번호"
                        name="empnum"
                        size="lg"
                      />
                    </div>
                    <div class="mb-3">
                      <argon-input
                        id="password"
                        type="password"
                        placeholder="비밀번호"
                        name="password"
                        size="lg"
                      />
                    </div>
                    <p>{{error}}</p>
                    <div class="text-center">
                      <argon-button
                        class="mt-4"
                        variant="gradient"
                        color="success"
                        fullWidth
                        size="lg"
                        :onclick="handleLogin"
                        >Sign in</argon-button
                      >
                    </div>
                  </form>
                </div>
                <div class="px-1 pt-0 text-center card-footer px-lg-2">
                  <p class="mx-auto mb-4 text-sm">
                    Don't have an account?
                    <a
                      href="javascript:;"
                      class="text-success text-gradient font-weight-bold"
                      >Sign up</a
                    >
                  </p>
                </div>
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


const handleLogin = async () => {
  const success = await store.dispatch('login', {
    name: empnum.value,
    password: password.value
  })

  if (success) {
    router.push('/api/dashboard')
  } else {
    error.value = '이름 또는 코드가 잘못되었습니다.'
    // alert(error);
  }
}

</script>


<style>
#loglog{
  margin: auto;
}
</style>