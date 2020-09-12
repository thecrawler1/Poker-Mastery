<template>
  <div class="bg-blue-1">
    <q-toolbar class="row q-mb-xl">
      <q-toolbar-title>{{ solution.spot.concat(' - ', solution.description) }}</q-toolbar-title>
      <q-space />
      <q-btn
        flat
        :label="animatedRng"
        icon="casino"
        size="16px"
      />
      <q-btn
        flat
        label="Finish training"
        size="16px"
        @click="finishTraining()"
      />
    </q-toolbar>
    <div class="table">
      <div class="players">
        <div
          v-for="i in 6"
          class="player"
          :class="'player-' + i"
          :key="i"
        >
          <div
            v-if="[solution.heroPosition, solution.villainPosition].includes(playerPosition(i))"
            :key="'PlayerHand-' + i"
          >
            <transition
              enter-active-class="animated fadeInDown"
              leave-active-class="animated fadeOutDown"
              appear
              mode="out-in"
              :duration="200"
            >
              <hand-cards
                :cards="cardsTransform(heroHand)"
                :back="playerPosition(i) === solution.villainPosition"
                :key="key"
              />
            </transition>
          </div>
          <transition
            enter-active-class="animated fadeInDown"
            leave-active-class="animated fadeOutDown"
            appear
            mode="out-in"
            :duration="400"
          >
            <div
              v-if="playerAct(i)"
              class="player-action text-white"
              :class="'player-action-' + i"
              :key="key"
            >
              <span class="text-weight-bold text-subtitle2">
                {{ playerActValue(i) }}
              </span>
              <q-avatar size="22px" class="shadow-1">
                <img src="https://img.icons8.com/office/30/000000/chip.png"/>
              </q-avatar>
            </div>
          </transition>
          <div v-ripple class="box shadow-2" style="cursor: pointer">
            <div class="row">
              <div class="col-4 position">{{ playerPosition(i) }}</div>
              <div class="col-8">
                <span v-if="playerAct(i)" class="name text-amber text-weight-bold">{{ playerAct(i) }}</span>
                <span v-else class="name">{{ playerName(i) }}</span>
                <br />
                <span class="stack">{{ playerStack(i) }} BB</span>
              </div>
            </div>
          </div>
          <transition
            enter-active-class="animated fadeInDown"
            leave-active-class="animated fadeOutDown"
            appear
            mode="out-in"
            :duration="400"
          >
            <q-avatar
              class="button text-weight-bold shadow-1"
              :class="'button-' + i"
              size="sm"
              color="yellow-7"
              text-color="red-7"
              font-size="18px"
              v-if="playerPosition(i) == 'BTN'"
              :key="'button-' + playerPosition(0)"
            >
              D
            </q-avatar>
          </transition>
        </div>
      </div>
      <div class="card-place">
        <q-badge class="pot" color="blue-grey-9" :label="'Pot: '.concat(startingPot, ' BB')" />
        <transition
          enter-active-class="animated flipInX"
          leave-active-class="animated flipOutX"
          appear
          mode="out-in"
          :duration="400"
        >
          <div
            class="row q-col-gutter-sm"
            :key="key"
          >
            <div
              class="col-auto"
              v-for="card in cardsTransform(flop)"
              :key="card.value + card.suit"
            >
              <card :value="card.value" :suit="card.suit" />
            </div>
          </div>
        </transition>
      </div>
    </div>
    <div class="row q-pa-sm q-mt-lg">
      <q-btn
        push
        round
        color="primary"
        icon="keyboard_arrow_left"
        class="q-mr-xs"
        :disable="!previousHandIsPossible"
        @click="$emit('previous-hand')"
      />
      <q-btn
        push
        round
        color="primary"
        icon="keyboard_arrow_right"
        class="q-mr-xs"
        :disable="!nextHandIsPossible"
        @click="$emit('next-hand')"
      />
      <q-space />
      <template v-if="showActions">
        <q-btn
          push
          class="q-ml-sm"
          color="red-6"
          v-for="(item, index) in solution.heroActions"
          :label="actionDescription(item)"
          :key="item.action + (item.value ? item.value : '')"
          @click="$emit('validate-answer', index)"
        />
      </template>
    </div>
  </div>
</template>

<script>
import { gsap } from 'gsap'

import Card from '../components/Card'
import HandCards from '../components/HandCards'

export default {
  name: 'poker-table',
  components: {
    Card,
    HandCards
  },
  props: {
    solution: Object,
    situation: Object,
    showActions: Boolean,
    nextHandIsPossible: Boolean,
    previousHandIsPossible: Boolean
  },
  data: () => ({
    positions: ['SB', 'BB', 'UTG', 'HJ', 'CO', 'BTN'],
    rng: 0
  }),
  computed: {
    heroPositionShift () {
      return this.positions.indexOf(this.solution.heroPosition)
    },
    startingPot () {
      return this.convertToBB(this.solution.startingPot)
    },
    flop () {
      return this.situation.flop
    },
    heroHand () {
      return this.situation.hand
    },
    key () {
      return this.flop.concat(this.heroHand, this.situation.rng)
    },
    animatedRng () {
      return this.rng.toFixed(0)
    }
  },
  methods: {
    convertToBB (value) {
      return Math.round(value / this.solution.bigBlind * 10) / 10
    },
    playerStack (index) {
      const position = this.playerPosition(index)
      if (position === this.solution.heroPosition) {
        return this.convertToBB(this.solution.startingStacks - (this.solution.heroActValue ? this.solution.heroActValue : 0))
      }
      if (position === this.solution.villainPosition) {
        return this.convertToBB(this.solution.startingStacks - (this.solution.villainActValue ? this.solution.villainActValue : 0))
      }
      return 100
    },
    playerPosition (index) {
      return this.positions[(index - 1 + this.heroPositionShift) % 6]
    },
    playerAct (index) {
      const position = this.playerPosition(index)
      if (position === this.solution.heroPosition && this.solution.heroAct) {
        return this.solution.heroAct
      }
      if (position === this.solution.villainPosition && this.solution.villainAct) {
        return this.solution.villainAct
      }
      return false
    },
    playerActValue (index) {
      const position = this.playerPosition(index)
      if (position === this.solution.heroPosition && this.solution.heroActValue) {
        return this.convertToBB(this.solution.heroActValue)
      }
      if (position === this.solution.villainPosition && this.solution.villainActValue) {
        return this.convertToBB(this.solution.villainActValue)
      }
      return 0
    },
    playerName (index) {
      const position = this.playerPosition(index)
      if (position === this.solution.heroPosition) {
        return 'HERO'
      }
      if (position === this.solution.villainPosition) {
        return 'VILLAIN'
      }
      return 'PLAYER '.concat(index)
    },
    cardsTransform (cards) {
      var arr = []
      for (var i = 0; i < cards.length; i += 2) {
        arr.push({
          value: cards.substr(i, 1),
          suit: cards.substr(i + 1, 1)
        })
      }
      return arr
    },
    finishTraining () {
      this.$store.dispatch('global/clearTrainingTable')
      this.$router.push('/')
    },
    actionDescription (item) {
      if (item.value) {
        return this.solution.startingStacks === item.value
          ? 'All-in'
          : item.action + (item.action.toUpperCase() === 'RAISE'
            ? ' TO '
            : ' ') +
          this.convertToBB(item.value)
      }
      return item.action
    }
  },
  watch: {
    situation: {
      immediate: true,
      handler (newValue) {
        gsap.to(this.$data, { duration: 0.5, rng: newValue.rng })
      }
    }
  }
}
</script>

<style>
.table {
  width: 100%;
  max-width: 750px;
  height: 400px;
  background-color: #43a047; /* #1976D2 */
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translateX(-50%);
  border-radius: 250px;
  position: relative;
  border:20px solid #66bb6a; /* #448aff */
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.7) inset !important
}
.pot {
  position: absolute;
  transform: translateY(-25px);
}
.card-place{
  width: 250px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  box-sizing: border-box;
  z-index: 200;
}
.players {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 100;
}
.player {
  position: absolute;
  z-index: 300;
}
.player-1 {
  top: 50%;
  left: 50%;
  transform: translatex(-50%) translateY(-50%) translatey(190px);
}
.player-2 {
  top: 50%;
  left: 5%;
  transform: translatex(-50%) translateY(-50%) translatey(100px);
}
.player-3 {
  top: 50%;
  left: 5%;
  transform: translatex(-50%) translateY(-50%) translatey(-100px);
}
.player-4 {
  top: 50%;
  left: 50%;
  transform: translatex(-50%) translateY(-50%) translatey(-190px);
}
.player-5 {
  top: 50%;
  left: 95%;
  transform: translatex(-50%) translateY(-50%) translatey(-100px);
}
.player-6 {
  top: 50%;
  left: 95%;
  transform: translatex(-50%) translateY(-50%) translatey(100px);
}
.villain-card {
  transform: translateY(33%);
}
.button {
  position: absolute;
}
.button-1 {
  left: 150px;
  top: -35px;
}
.button-2 {
  left: 160px;
}
.button-3 {
  left: 160px;
  top: -25px;
}
.button-4 {
  left: 150px;
  top: 60px;
}
.button-5 {
  left: -34px;
  top: -25px;
}
.button-6 {
  left: -34px;
}
.player-action {
  position: absolute;
}
.player-action-1 {
  top: -90px;
}
.player-action-2 {
  left: 160px;
  top: -25px;
}
.player-action-3 {
  left: 160px;
  top: 54px;
}
.player-action-4 {
  top: 65px;
}
.player-action-5 {
  left: -60px;
  top: 54px;
}
.player-action-6 {
  left: -60px;
  top: -25px;
}
.box {
  position: relative;
  height: 52px;
  width: 150px;
  padding: 1px;
  box-sizing: border-box;
  border: 2px solid #37474f;
  border-radius: 5px;
  background-color: #37474f;
  color: white;
  text-align: center;
}
.position {
  line-height: 42px;
  font-size: 16px;
  box-sizing: border-box;
  border: 2px solid #546e7a;
  border-radius: 3px;
  background-color: #546e7a;
}
.name {
  font-size: 11px;
}
.stack {
  font-size: 14px;
}
</style>
