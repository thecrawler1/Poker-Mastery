<template>
  <q-table
    :columns="columns"
    :data="data"
    :pagination="{ rowsPerPage: 10 }"
    row-key="Flop"
    rows-per-page-label="Flops per page:"
    v-if="selectedSolutionId"
  >
    <template v-slot:top>
      <div class="q-table__title">Report</div>
      <q-space />
      <q-btn
        v-if="!selectable"
        outline
        label="Trainer"
        color="primary"
        @click="openTrainer()"
      />
    </template>
    <template v-slot:body-cell-Flop="props">
      <q-td :props="props">
        <div class="row q-col-gutter-xs">
          <template v-for="card in cardsTransform(props.value)">
            <div :key="props.value + '-' + card.value + card.suit" class="col-auto">
              <card
                :value="card.value"
                :suit="card.suit"
                small
              />
            </div>
          </template>
        </div>
      </q-td>
    </template>
  </q-table>
</template>

<script>
import Card from 'components/Card'

export default {
  components: {
    Card
  },
  data: () => ({
    data: [],
    columns: []
  }),
  methods: {
    setReport (id) {
      if (this.solutions && id) {
        var report = this.solutions[id].report
        this.data = report.data
        this.columns = report.columns
      }
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
    openTrainer () {
      this.$store.dispatch('global/setSelectedSolutionsIds', [])
      this.$router.push('/trainer')
    }
  },
  computed: {
    solutions () {
      return this.$store.getters['global/getSolutions']
    },
    selectedSolutionId () {
      return this.$store.getters['global/getSelectedSolutionId']
    },
    selectable () {
      return this.$store.getters['global/getSelectableStrategyTree']
    }
  },
  watch: {
    selectedSolutionId: {
      immediate: true,
      handler (val) {
        this.setReport(val)
      }
    }
  }
}
</script>
