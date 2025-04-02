<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="6" v-for="(player, index) in players" :key="index">
        <v-card :color="player.color" class="pa-4 player-card" :class="{ 'inactive': !player.active }">
          <v-card-title class="text-h5 d-flex align-center mb-2">
            <v-icon :color="player.color === 'primary' ? 'success' : 'info'" class="mr-2">mdi-account</v-icon>
            {{ player.name }}
            <v-switch
              v-model="player.active"
              :color="player.color === 'primary' ? 'success' : 'info'"
              :label="player.active ? 'Activo' : 'Inactivo'"
              class="ml-4"
            ></v-switch>
          </v-card-title>

          <v-card-text>
            <v-row>
              <v-col cols="12">
                <v-divider></v-divider>
                <div class="text-subtitle-1 my-2">
                  <v-icon small class="mr-1">mdi-shield-account</v-icon>
                  Estadísticas Base
                </div>
                
                <v-slider
                  v-model="player.speed"
                  :disabled="!player.active"
                  :color="player.color === 'primary' ? 'success' : 'info'"
                  label="Velocidad"
                  min="1"
                  max="10"
                  thumb-label
                  step="1"
                  ticks
                  prepend-icon="mdi-run"
                ></v-slider>

                <v-slider
                  v-model="player.health"
                  :disabled="!player.active"
                  :color="player.color === 'primary' ? 'success' : 'info'"
                  label="Vida"
                  min="1"
                  max="10"
                  thumb-label
                  step="1"
                  ticks
                  prepend-icon="mdi-heart"
                ></v-slider>
              </v-col>

              <v-col cols="12">
                <v-divider></v-divider>
                <div class="text-subtitle-1 my-2">
                  <v-icon small class="mr-1">mdi-bomb</v-icon>
                  Configuración de Bombas
                </div>

                <v-slider
                  v-model="player.bombCount"
                  :disabled="!player.active"
                  :color="player.color === 'primary' ? 'success' : 'info'"
                  label="Cantidad de Bombas"
                  min="1"
                  max="5"
                  thumb-label
                  step="1"
                  ticks
                  prepend-icon="mdi-numeric"
                ></v-slider>

                <v-slider
                  v-model="player.masBombas"
                  :disabled="!player.active"
                  :color="player.color === 'primary' ? 'success' : 'info'"
                  label="Más Bombas"
                  min="1"
                  max="5"
                  thumb-label
                  step="1"
                  ticks
                  prepend-icon="mdi-plus-circle"
                ></v-slider>
              </v-col>

              <v-col cols="12">
                <v-divider></v-divider>
                <div class="text-subtitle-1 my-2">
                  <v-icon small class="mr-1">mdi-chart-line</v-icon>
                  Estadísticas del Jugador
                </div>

                <v-list density="compact">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon>mdi-block-helper</v-icon>
                    </template>
                    <v-list-item-title>Bloques Destruidos: {{ player.stats.blocksDestroyed }}</v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon>mdi-bomb</v-icon>
                    </template>
                    <v-list-item-title>Bombas Usadas: {{ player.stats.bombsPlaced }}</v-list-item-title>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon>mdi-gamepad-variant</v-icon>
                    </template>
                    <v-list-item-title>Partidas Jugadas: {{ player.stats.gamesPlayed }}</v-list-item-title>
                  </v-list-item>
                </v-list>

                <v-btn
                  color="primary"
                  class="mt-3"
                  @click="testUpdateStats(player.name)"
                >
                  Actualizar Estadísticas (Prueba)
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              :color="player.color === 'primary' ? 'success' : 'info'"
              :disabled="!player.active"
              @click="savePlayerSettings(index)"
              prepend-icon="mdi-content-save"
            >
              Guardar Cambios
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'PlayerSettings',
  data() {
    return {
      players: [
        {
          name: 'Jugador1',
          color: 'primary',
          active: true,
          speed: 5,
          health: 5,
          bombCount: 2,
          masBombas: 1,
          powerups: {
            speedBoost: false
          },
          stats: {
            blocksDestroyed: 0,
            bombsPlaced: 0,
            gamesPlayed: 0
          }
        },
        {
          name: 'Jugador2',
          color: 'error',
          active: true,
          speed: 5,
          health: 5,
          bombCount: 2,
          masBombas: 1,
          powerups: {
            speedBoost: false
          },
          stats: {
            blocksDestroyed: 0,
            bombsPlaced: 0,
            gamesPlayed: 0
          }
        }
      ]
    }
  },
  methods: {
    async fetchPlayerStats(playerName) {
      try {
        const response = await fetch(`http://localhost:3000/api/stats/${playerName}`);
        const data = await response.json();
        
        const playerIndex = this.players.findIndex(p => p.name === playerName);
        if (playerIndex !== -1 && data) {
          this.players[playerIndex].stats = {
            blocksDestroyed: data.blocksDestroyed || 0,
            bombsPlaced: data.bombsPlaced || 0,
            gamesPlayed: data.gamesPlayed || 0
          };
        }
      } catch (error) {
        console.error(`Error al obtener estadísticas de ${playerName}:`, error);
      }
    },
    async updateAllStats() {
      for (const player of this.players) {
        await this.fetchPlayerStats(player.name);
      }
    },
    async testUpdateStats(playerName) {
      try {
        const response = await fetch('http://localhost:3000/api/stats/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            player: playerName,
            blocksDestroyed: 10,
            bombsPlaced: 5,
            gamesPlayed: 1
          })
        });
        
        if (response.ok) {
          console.log('Estadísticas actualizadas correctamente');
          this.fetchPlayerStats(playerName); // Actualizar la vista
        } else {
          console.error('Error al actualizar estadísticas:', await response.text());
        }
      } catch (error) {
        console.error('Error:', error);
      }
    },
    savePlayerSettings(playerIndex) {
      const player = this.players[playerIndex]
      this.$emit('update-player-settings', {
        playerIndex,
        settings: {
          active: player.active,
          speed: player.speed,
          health: player.health,
          bombCount: player.bombCount,
          masBombas: player.masBombas,
          powerups: { ...player.powerups }
        }
      })
    }
  },
  mounted() {
    this.updateAllStats();
    // Actualizar estadísticas cada 30 segundos
    setInterval(this.updateAllStats, 30000);
  }
}
</script>

<style scoped>
.player-card {
  transition: all 0.3s ease;
  border-radius: 12px;
}

.player-card:not(:hover) {
  opacity: 0.9;
}

.player-card.inactive {
  opacity: 0.6;
}

.v-slider {
  margin-top: 20px;
}

.v-divider {
  margin: 16px 0;
}

.text-subtitle-1 {
  font-weight: 500;
}
</style>
