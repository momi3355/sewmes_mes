<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>My App</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <v-container fluid class="d-flex pa-0">
        <Sidebar :menu-items="menuItems" />
        <v-container fluid>
          <router-view />
        </v-container>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import Sidebar from "./Sidebar.vue";

const menuItems = [
  {
    name: "대시보드",
    children: [
      { name: "홈", route: "/home" },
      { name: "분석", route: "/analytics" },
    ],
  },
  {
    name: "설정",
    children: [
      { name: "계정", route: "/settings/account" },
      { name: "보안", route: "/settings/security" },
    ],
  },
];
</script>
