<template>
  <v-navigation-drawer v-if="submenu" app width="180">
    <v-list nav dense>
      <v-list-item
        v-for="child in submenu.children"
        :key="child.name"
        :to="child.route"
        router
      >
        <v-list-item-title>{{ child.name }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
defineProps(["submenu"]);
</script>
