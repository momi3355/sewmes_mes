<template>
  <v-navigation-drawer app permanent>
    <v-list dense nav>
      <v-list-group
        v-for="item in menuItems"
        :key="item.name"
        prepend-icon="mdi-menu-down"
      >
        <template #activator="{ props }">
          <v-list-item v-bind="props">
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </v-list-item>
        </template>

        <v-list-item
          v-for="child in item.children"
          :key="child.name"
          :to="child.route"
          router
        >
          <v-list-item-content>
            <v-list-item-title>{{ child.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
defineProps(["menuItems"]);
</script>
