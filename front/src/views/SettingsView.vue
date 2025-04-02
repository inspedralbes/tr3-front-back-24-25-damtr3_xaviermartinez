<template>
  <div>
    <h1 class="text-h3 mb-6 text-center">
      <v-icon icon="mdi-cog" class="mr-2" size="x-large"/>
      Configuración de Jugadores
    </h1>
    <PlayerSettings @update-player-settings="handlePlayerSettings" />
  </div>
</template>

<script>
import PlayerSettings from '../components/PlayerSettings.vue'

export default {
  name: 'SettingsView',
  components: {
    PlayerSettings
  },
  methods: {
    handlePlayerSettings(settings) {
      console.log('Configuración actualizada:', settings)
      // Aquí puedes enviar los cambios al backend
    }
  }
}
</script>

<style>
/* Estilos específicos de la vista si son necesarios */
</style>
