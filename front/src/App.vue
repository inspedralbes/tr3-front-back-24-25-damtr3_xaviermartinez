<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-title>
        <v-icon large class="mr-2">mdi-bomb</v-icon>
        Bomberman Manager
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn to="/" text>
        <v-icon>mdi-account-group</v-icon>
        Personajes
      </v-btn>
      <v-btn to="/stats" text>
        <v-icon>mdi-chart-bar</v-icon>
        Estadísticas
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App'
}
</script>
