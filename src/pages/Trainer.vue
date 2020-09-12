<template>
  <q-page padding class="bg-grey-1">
    <q-card style="max-width: 100%; min-width: 850px; margin: 0 auto">
      <poker-table
        v-if="activeHandIndex != null"
        :solution="activeSolution"
        :situation="activeHand"
        :showActions="showActions"
        v-on:validate-answer="validateAnswer"
        v-on:next-hand="nextHand"
        v-on:previous-hand="previousHand"
        :nextHandIsPossible="nextHandIsPossible"
        :previousHandIsPossible="previousHandIsPossible"
      />
    </q-card>
  </q-page>
</template>

<script>
import PokerTable from 'components/PokerTable'

export default {
  components: {
    PokerTable
  },
  data: () => ({
    hands: [],
    activeHandIndex: null,
    lastHandIndex: null
  }),
  methods: {
    async LoadStrategy (id, flop) {
      let strategy
      await this
        .$firestore
        .collection('solutions')
        .doc(id)
        .collection('flops')
        .doc(flop)
        .get()
        .then(function (doc) {
          strategy = doc.exists ? doc.data() : undefined
        })
        .catch(function (error) {
          console.log('Error getting strategy: ', error)
        })
      if (strategy) {
        await this.$store.dispatch('global/setStrategy', { solutionId: id, flop, strategy })
      }
    },
    getHandStrategy (id, flop, hand) {
      try {
        return this.strategies[id][flop][hand] ? {
          ...this.strategies[id][flop][hand],
          'FOLD EV': 0
        } : null
      } catch (error) {
        console.log('Error in getHandStrategy: ', error)
        return null
      }
    },
    randomFlop (id) {
      const flops = this.solutions[id].flops
      return flops[Math.round(Math.random() * (flops.length - 1))]
    },
    randomHand (id, flop) {
      const solution = this.solutions[id]
      var count = 0, rng, index, hand
      do {
        if (count++ > 100) {
          console.log('Erro! Count > 100!')
          hand = null
          break
        }
        rng = Math.random()
        index = Math.round(Math.random() * (solution.range.length - 1))
        hand = solution.range[index]
      } while (!this.getHandStrategy(id, flop, hand) || rng > solution.weights[index])
      return hand
    },
    async newHand () {
      const solutionId = this.selectedSolutionsIds.length > 0
        ? this.selectedSolutionsIds[Math.round(Math.random() * (this.selectedSolutionsIds.length - 1))]
        : this.selectedSolutionId

      const flop = this.randomFlop(solutionId)
      if (!(solutionId in this.strategies && flop in this.strategies[solutionId])) {
        await this.LoadStrategy(solutionId, flop)
      }
      const hand = this.randomHand(solutionId, flop)
      if (hand) {
        this.hands.push({
          solutionId,
          flop,
          hand,
          rng: Math.ceil(Math.random() * 100)
        })
        if (this.hands.length === 1) {
          this.activeHandIndex = 0
          this.lastHandIndex = 0
        }
      }
    },
    validateAnswer (index) {
      const answer = this.activeSolution.heroActions[index].action + (this.activeSolution.heroActions[index].value ? ' ' + this.activeSolution.heroActions[index].value : '')
      const answerInBB = this.actionDescription(this.activeSolution.heroActions[index])
      const situation = this.activeHand
      const strategy = this.getHandStrategy(this.activeSolutionId, situation.flop, situation.hand)
      const answerEV = answer === 'FOLD' ? 0 : strategy[answer + ' EV']
      const answerFreq = strategy[answer + ' Freq']
      let freqAcumulate = 0
      let maxEvPossible = 0
      let result

      for (let i = 0; i < this.activeSolution.heroActions.length; i++) {
        const tmp = this.activeSolution.heroActions[i]
        const act = tmp.action + (tmp.value ? ' ' + tmp.value : '')
        maxEvPossible = Math.max(maxEvPossible, act === 'FOLD' ? 0 : strategy[act + ' EV'])
        if (i < index) {
          freqAcumulate += strategy[act + ' Freq']
        }
      }

      const evLoss = Math.round((maxEvPossible - answerEV) * 100) / 100

      if (situation.rng <= Math.round(answerFreq + freqAcumulate) && situation.rng >= Math.round(freqAcumulate)) {
        result = 'Correct'
        this.$q.notify({
          message: 'Correct Answer!',
          position: 'top-right',
          type: 'positive',
          timeout: 400
        })
      } else if (answerFreq >= 1) {
        result = 'Mixing error'
        this.$q.notify({
          message: 'Mixing Error!',
          position: 'top-right',
          type: 'warning',
          timeout: 400
        })
      } else {
        result = 'EV loss'
        this.$q.notify({
          message: 'EV Loss!',
          position: 'top-right',
          type: 'negative',
          timeout: 400
        })
      }

      this.$store.dispatch('global/addTrainingTable', {
        index: this.activeHandIndex,
        flop: situation.flop,
        hand: situation.hand,
        action: answerInBB,
        strategy: {
          ...strategy,
          rng: situation.rng,
          'EV LOSS': evLoss
        },
        result
      })

      this.nextHand()
    },
    actionDescription (item) {
      if (item.value) {
        return this.activeSolution.startingStacks === item.value
          ? 'All-in'
          : item.action + (item.action.toUpperCase() === 'RAISE'
            ? ' TO '
            : ' ') +
          this.convertToBB(item.value)
      }
      return item.action
    },
    nextHand () {
      this.activeHandIndex++
      this.lastHandIndex = Math.max(this.lastHandIndex, this.activeHandIndex)
    },
    previousHand () {
      this.activeHandIndex--
    },
    convertToBB (value) {
      return Math.round(value / this.activeSolution.bigBlind * 10) / 10
    }
  },
  computed: {
    solutions () {
      return this.$store.getters['global/getSolutions']
    },
    strategies () {
      return this.$store.getters['global/getStrategies']
    },
    selectedSolutionId: {
      get () {
        return this.$store.getters['global/getSelectedSolutionId']
      },
      set (id) {
        this.$store.dispatch('global/setSelectedSolutionId', id)
      }
    },
    activeSolutionId () {
      return this.activeHand
        ? this.activeHand.solutionId
        : null
    },
    activeSolution () {
      return this.activeSolutionId
        ? this.solutions[this.activeSolutionId]
        : null
    },
    activeHand () {
      if (this.activeHandIndex < this.hands.length) {
        return this.hands[this.activeHandIndex]
      }
      return null
    },
    nextHandIsPossible () {
      return this.activeHandIndex < this.lastHandIndex
    },
    previousHandIsPossible () {
      return this.activeHandIndex > 0
    },
    selectedSolutionsIds () {
      return this.$store.getters['global/getSelectedSolutionsIds']
    },
    showActions () {
      return this.activeHandIndex === this.lastHandIndex && this.lastHandIndex < this.hands.length
    }
  },
  watch: {
    async activeHandIndex (val) {
      if (this.hands.length - this.lastHandIndex < 9) {
        await this.newHand()
      }
    },
    async hands () {
      if (this.hands.length - this.lastHandIndex < 9) {
        await this.newHand()
      }
    }
  },
  created () {
    try {
      if (!this.selectedSolutionId && this.selectedSolutionsIds.length < 1) {
        this.$router.push('/')
      } else {
        this.newHand()
      }
    } catch {
      console.log('Error in training. Redirecting...')
      this.$router.push('/')
    }
  }
}
</script>

<style>

</style>
