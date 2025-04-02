<template>
  <v-container>
    <v-row class="text-center mb-8">
      <v-col cols="12">
        <h1 class="game-title text-h2 mb-6">Welcome to Bomberman Stats</h1>
      </v-col>
    </v-row>

    <v-row>
      <!-- Jugador 1 Stats -->
      <v-col cols="12" md="6">
        <v-card class="player-card h-100">
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-account" size="large" class="mr-2" color="primary"/>
            Jugador 1
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item class="mb-2">
                <template v-slot:prepend>
                  <v-icon icon="mdi-wall" color="warning"/>
                </template>
                <v-list-item-title>Bloques Destruidos</v-list-item-title>
                <template v-slot:append>
                  <span class="text-h6">{{ player1Stats.blocksDestroyed || '0' }}</span>
                </template>
              </v-list-item>

              <v-list-item class="mb-2">
                <template v-slot:prepend>
                  <v-icon icon="mdi-bomb" color="error"/>
                </template>
                <v-list-item-title>Bombas Usadas</v-list-item-title>
                <template v-slot:append>
                  <span class="text-h6">{{ player1Stats.bombsUsed || '0' }}</span>
                </template>
              </v-list-item>

              <v-list-item class="mb-2">
                <template v-slot:prepend>
                  <v-icon icon="mdi-skull" color="warning"/>
                </template>
                <v-list-item-title>Jugadores Eliminados</v-list-item-title>
                <template v-slot:append>
                  <span class="text-h6">{{ player1Stats.playersKilled || '0' }}</span>
                </template>
              </v-list-item>

              <v-list-item class="mb-2">
                <template v-slot:prepend>
                  <v-icon icon="mdi-gamepad-variant" color="success"/>
                </template>
                <v-list-item-title>Partidas Jugadas</v-list-item-title>
                <template v-slot:append>
                  <span class="text-h6">{{ player1Stats.gamesPlayed || '0' }}</span>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Jugador 2 Stats -->
      <v-col cols="12" md="6">
        <v-card class="player-card h-100">
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-account" size="large" class="mr-2" color="secondary"/>
            Jugador 2
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item class="mb-2">
                <template v-slot:prepend>
                  <v-icon icon="mdi-wall" color="warning"/>
                </template>
                <v-list-item-title>Bloques Destruidos</v-list-item-title>
                <template v-slot:append>
                  <span class="text-h6">{{ player2Stats.blocksDestroyed || '0' }}</span>
                </template>
              </v-list-item>

              <v-list-item class="mb-2">
                <template v-slot:prepend>
                  <v-icon icon="mdi-bomb" color="error"/>
                </template>
                <v-list-item-title>Bombas Usadas</v-list-item-title>
                <template v-slot:append>
                  <span class="text-h6">{{ player2Stats.bombsUsed || '0' }}</span>
                </template>
              </v-list-item>

              <v-list-item class="mb-2">
                <template v-slot:prepend>
                  <v-icon icon="mdi-skull" color="warning"/>
                </template>
                <v-list-item-title>Jugadores Eliminados</v-list-item-title>
                <template v-slot:append>
                  <span class="text-h6">{{ player2Stats.playersKilled || '0' }}</span>
                </template>
              </v-list-item>

              <v-list-item class="mb-2">
                <template v-slot:prepend>
                  <v-icon icon="mdi-gamepad-variant" color="success"/>
                </template>
                <v-list-item-title>Partidas Jugadas</v-list-item-title>
                <template v-slot:append>
                  <span class="text-h6">{{ player2Stats.gamesPlayed || '0' }}</span>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import socketService from '../services/socketService'

export default {
  name: 'HomeView',
  setup() {
    const player1Stats = ref({
      blocksDestroyed: 0,
      bombsUsed: 0,
      playersKilled: 0,
      gamesPlayed: 0
    })

    const player2Stats = ref({
      blocksDestroyed: 0,
      bombsUsed: 0,
      playersKilled: 0,
      gamesPlayed: 0
    })

    const fetchStats = async () => {
      try {
        const [player1Res, player2Res] = await Promise.all([
          axios.get('http://localhost:3000/api/stats/player/1'),
          axios.get('http://localhost:3000/api/stats/player/2')
        ])

        player1Stats.value = player1Res.data
        player2Stats.value = player2Res.data
      } catch (error) {
        console.error('Error fetching player stats:', error)
      }
    }

    onMounted(() => {
      fetchStats()
      
      // Conectar al socket
      socketService.connect()

      // Escuchar actualizaciones de estadísticas
      socketService.on('statsUpdated', (data) => {
        if (data.playerId === '1') {
          player1Stats.value = {
            ...player1Stats.value,
            ...data.stats
          }
        } else if (data.playerId === '2') {
          player2Stats.value = {
            ...player2Stats.value,
            ...data.stats
          }
        }
      })

      // Escuchar eventos específicos
      socketService.on('playerKilled', (data) => {
        if (data.playerId === '1') {
          player1Stats.value.playersKilled++
        } else if (data.playerId === '2') {
          player2Stats.value.playersKilled++
        }
      })

      socketService.on('blockDestroyed', (data) => {
        if (data.playerId === '1') {
          player1Stats.value.blocksDestroyed++
        } else if (data.playerId === '2') {
          player2Stats.value.blocksDestroyed++
        }
      })

      socketService.on('bombPlaced', (data) => {
        if (data.playerId === '1') {
          player1Stats.value.bombsUsed++
        } else if (data.playerId === '2') {
          player2Stats.value.bombsUsed++
        }
      })
    })

    onUnmounted(() => {
      socketService.disconnect()
    })

    return {
      player1Stats,
      player2Stats
    }
  }
}
</script>

<style scoped>
.player-card {
  height: 100%;
  transition: transform 0.3s ease;
}

.v-list-item {
  border-radius: 8px;
  margin-bottom: 8px;
  transition: background-color 0.3s ease;
}

.v-list-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
