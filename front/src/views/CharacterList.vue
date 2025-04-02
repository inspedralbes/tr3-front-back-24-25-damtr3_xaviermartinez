<template>
  <div>
    <v-row>
      <v-col cols="12" md="4">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon left>mdi-plus-circle</v-icon>
            Nuevo Personaje
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="createCharacter">
              <v-text-field
                v-model="newCharacter.name"
                label="Nombre"
                required
              ></v-text-field>
              
              <v-slider
                v-model="newCharacter.health"
                label="Salud"
                min="1"
                max="10"
                thumb-label
              ></v-slider>

              <v-slider
                v-model="newCharacter.speed"
                label="Velocidad"
                min="1"
                max="10"
                thumb-label
              ></v-slider>

              <v-slider
                v-model="newCharacter.damage"
                label="Daño"
                min="10"
                max="50"
                thumb-label
              ></v-slider>

              <v-switch
                v-model="newCharacter.powerups.moreBombs"
                label="Más Bombas"
                color="primary"
              ></v-switch>

              <v-switch
                v-model="newCharacter.powerups.speedBoost"
                label="Aumento de Velocidad"
                color="primary"
              ></v-switch>

              <v-btn
                type="submit"
                color="primary"
                block
                class="mt-4"
              >
                Crear Personaje
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-row>
          <v-col
            v-for="character in characters"
            :key="character._id"
            cols="12"
            md="6"
          >
            <v-card>
              <v-card-title class="text-h5">
                {{ character.name }}
                <v-spacer></v-spacer>
                <v-btn
                  icon
                  color="error"
                  @click="deleteCharacter(character._id)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-card-title>

              <v-card-text>
                <v-list>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="error">mdi-heart</v-icon>
                    </template>
                    <v-list-item-title>Salud</v-list-item-title>
                    <template v-slot:append>
                      <v-progress-linear
                        :model-value="character.health * 10"
                        color="error"
                        height="20"
                      >
                        <template v-slot:default="{ value }">
                          <strong>{{ value }}%</strong>
                        </template>
                      </v-progress-linear>
                    </template>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="info">mdi-run</v-icon>
                    </template>
                    <v-list-item-title>Velocidad</v-list-item-title>
                    <template v-slot:append>
                      <v-progress-linear
                        :model-value="character.speed * 10"
                        color="info"
                        height="20"
                      >
                        <template v-slot:default="{ value }">
                          <strong>{{ value }}%</strong>
                        </template>
                      </v-progress-linear>
                    </template>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="warning">mdi-sword</v-icon>
                    </template>
                    <v-list-item-title>Daño</v-list-item-title>
                    <template v-slot:append>
                      <v-progress-linear
                        :model-value="(character.damage / 50) * 100"
                        color="warning"
                        height="20"
                      >
                        <template v-slot:default="{ value }">
                          <strong>{{ value }}%</strong>
                        </template>
                      </v-progress-linear>
                    </template>
                  </v-list-item>
                </v-list>

                <v-chip-group>
                  <v-chip
                    :color="character.powerups.moreBombs ? 'success' : 'grey'"
                    :text-color="character.powerups.moreBombs ? 'white' : ''"
                  >
                    <v-icon left>mdi-bomb</v-icon>
                    Más Bombas
                  </v-chip>
                  <v-chip
                    :color="character.powerups.speedBoost ? 'success' : 'grey'"
                    :text-color="character.powerups.speedBoost ? 'white' : ''"
                  >
                    <v-icon left>mdi-run-fast</v-icon>
                    Aumento de Velocidad
                  </v-chip>
                </v-chip-group>

                <v-divider class="my-4"></v-divider>

                <div class="text-subtitle-1 mb-2">Estadísticas</div>
                <v-row>
                  <v-col cols="4">
                    <div class="text-center">
                      <div class="text-h6">{{ character.stats.gamesPlayed }}</div>
                      <div class="text-caption">Partidas</div>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-center">
                      <div class="text-h6">{{ character.stats.wins }}</div>
                      <div class="text-caption">Victorias</div>
                    </div>
                  </v-col>
                  <v-col cols="4">
                    <div class="text-center">
                      <div class="text-h6">{{ character.stats.enemiesDefeated }}</div>
                      <div class="text-caption">Enemigos</div>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'CharacterList',
  
  data() {
    return {
      characters: [],
      newCharacter: {
        name: '',
        health: 5,
        speed: 5,
        damage: 30,
        powerups: {
          moreBombs: false,
          speedBoost: false
        }
      }
    }
  },

  mounted() {
    this.loadCharacters()
  },

  methods: {
    async loadCharacters() {
      try {
        const response = await axios.get('/api/characters')
        this.characters = response.data
      } catch (error) {
        console.error('Error loading characters:', error)
      }
    },

    async createCharacter() {
      try {
        await axios.post('/api/characters', this.newCharacter)
        this.newCharacter = {
          name: '',
          health: 5,
          speed: 5,
          damage: 30,
          powerups: {
            moreBombs: false,
            speedBoost: false
          }
        }
        this.loadCharacters()
      } catch (error) {
        console.error('Error creating character:', error)
      }
    },

    async deleteCharacter(id) {
      try {
        await axios.delete(`/api/characters/${id}`)
        this.loadCharacters()
      } catch (error) {
        console.error('Error deleting character:', error)
      }
    }
  }
}
</script>
