<template>
  <v-container>
    <v-row class="text-center mb-8">
      <v-col cols="12">
        <h1 class="text-h2 mb-6">
          <v-icon icon="mdi-trophy" size="x-large" color="warning" class="me-4"/>
          Hall of Fame
        </h1>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card class="ranking-card">
          <v-card-text>
            <v-table v-if="rankings.length > 0">
              <thead>
                <tr>
                  <th class="text-center">RANK</th>
                  <th class="text-left">USER</th>
                  <th class="text-left">PLAYER</th>
                  <th class="text-center">WINS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(player, index) in rankings" :key="index" :class="getRankClass(index)">
                  <td class="text-center">
                    <v-avatar :color="getRankColor(index)" size="32" class="rank-avatar">
                      <v-icon v-if="index < 3" :icon="getRankIcon(index)" />
                      <span v-else>{{ index + 1 }}</span>
                    </v-avatar>
                  </td>
                  <td>
                    <div class="d-flex align-center">
                      <v-icon :icon="getPlayerIcon(player)" class="me-2" :color="getPlayerColor(index)"/>
                      {{ player.Nombre_Usuario }}
                    </div>
                  </td>
                  <td class="text-center">{{ player.Nombre_Jugador }}</td>
                  <td class="text-center">{{ player.wins }}</td>
                </tr>
              </tbody>
            </v-table>
            <div v-else class="text-center pa-8">
              <v-icon icon="mdi-emoticon-sad" size="64" color="warning" class="mb-4"/>
              <h2 class="text-h5 mb-2">No hay rankings disponibles</h2>
              <p class="text-body-1">¡Sé el primero en jugar y aparecer en el ranking!</p>
            </div>
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
  name: 'RankingView',
  setup() {
    const rankings = ref([])

    const fetchRankings = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/rankings')
        console.error('HOLAAA', response.data)
        rankings.value = response.data.players
      } catch (error) {
        console.error('Error fetching rankings:', error)
        rankings.value = [] // Si hay error, mostramos una lista vacía en lugar de datos falsos
      }
    }

    const getRankClass = (index) => {
      const classes = ['rank-1st', 'rank-2nd', 'rank-3rd']
      return index < 3 ? classes[index] : ''
    }

    const getRankColor = (index) => {
      const colors = ['warning', 'grey-lighten-1', 'amber-darken-2']
      return index < 3 ? colors[index] : 'grey'
    }

    const getRankIcon = (index) => {
      const icons = ['mdi-crown', 'mdi-medal', 'mdi-medal']
      return icons[index]
    }

    const getPlayerIcon = (player) => {
      if (player.wins > 35) return 'mdi-robot-excited'
      if (player.wins > 25) return 'mdi-robot-happy'
      return 'mdi-robot'
    }

    const getPlayerColor = (index) => {
      if (index === 0) return 'warning'
      if (index === 1) return 'grey-lighten-1'
      if (index === 2) return 'amber-darken-2'
      return 'grey'
    }

    onMounted(() => {
      console.error('HOLAAA')
      fetchRankings()
      
      // Conectar al socket
      socketService.connect()

      // Escuchar actualizaciones del ranking
      socketService.on('rankingUpdated', (data) => {
        rankings.value = data
      })

      // Escuchar final de partida para actualizar ranking
      socketService.on('gameEnded', () => {
        fetchRankings()
      })
    })

    onUnmounted(() => {
      socketService.disconnect()
    })

    return {
      rankings,
      getRankClass,
      getRankColor,
      getRankIcon,
      getPlayerIcon,
      getPlayerColor
    }
  }
}
</script>

<style scoped>
.ranking-card {
  background: rgba(30, 30, 30, 0.9) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.v-table {
  background: transparent !important;
}

.rank-avatar {
  font-weight: bold;
  border: 2px solid currentColor;
}

.rank-1st {
  background: linear-gradient(to right, rgba(255, 193, 7, 0.1), transparent) !important;
}

.rank-2nd {
  background: linear-gradient(to right, rgba(158, 158, 158, 0.1), transparent) !important;
}

.rank-3rd {
  background: linear-gradient(to right, rgba(255, 160, 0, 0.1), transparent) !important;
}

tr {
  transition: all 0.3s ease;
}

tr:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  transform: scale(1.01);
}

th {
  font-family: 'Press Start 2P', monospace !important;
  font-size: 0.8em !important;
  color: #ffd700 !important;
}
</style>
