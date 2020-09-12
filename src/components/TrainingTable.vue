<template>
  <div>
    <q-table
      flat
      :columns="columns"
      :data="trainingTable"
      row-key="index"
      hide-bottom
      :pagination="{ rowsPerPage: 0 }"
    >
      <!-- virtual-scroll -->
      <template v-slot:body-cell-flop="props">
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
      <template v-slot:body-cell-hand="props">
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
      <template v-slot:body-cell-result="props">
        <q-td :props="props">
          <q-chip
            square
            size="12px"
            text-color="white"
            :color="props.value === 'Correct' ? 'green-5' : props.value === 'EV loss' ? 'red-5' : 'amber-6'"
          >
            {{ props.value }}
          </q-chip>
        </q-td>
      </template>
      <template v-slot:body-cell-strategy="props">
        <q-td :props="props">
          <q-btn
            icon="launch"
            color="grey-8"
            flat
            round
            @click="openStrategyDialog(props.value)"
          />
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="dialog">
      <q-table
        :data="strategyData"
        row-key="FOLD EV"
        grid
        hide-header
        hide-bottom
      >
        <template v-slot:item="props">
          <q-card style="width: 250px">
            <q-card-section>
              <div class="text-h6 text-weight-light text-center">Strategy</div>
            </q-card-section>
            <q-separator />
            <q-list dense separator>
              <q-item v-for="col in Object.values(props.cols).sort((a, b) => (a.label > b.label ? 1 : -1))" :key="col.name">
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ col.label }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-item-label>{{ col.value }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </template>
      </q-table>
    </q-dialog>
  </div>
</template>

<script>
import Card from 'components/Card'

export default {
  components: {
    Card
  },
  data: () => ({
    columns: [
      {
        name: 'flop',
        label: 'FLOP',
        field: 'flop',
        align: 'left',
        sortable: false
      },
      {
        name: 'hand',
        label: 'HAND',
        field: 'hand',
        align: 'left',
        sortable: false,
        style: 'padding-left: 0 !important; padding-right: 0 !important',
        headerStyle: 'padding-left: 0 !important; padding-right: 0 !important'
      },
      {
        name: 'action',
        label: 'ACTION',
        field: 'action',
        align: 'center',
        sortable: false
      },
      {
        name: 'result',
        label: 'RESULT',
        field: 'result',
        align: 'center',
        sortable: false,
        style: 'padding-left: 0 !important; padding-right: 0 !important',
        headerStyle: 'padding-left: 0 !important; padding-right: 0 !important'
      },
      {
        name: 'strategy',
        field: 'strategy'
      }
    ],
    strategyData: [],
    dialog: false
  }),
  computed: {
    trainingTable () {
      return this.$store.getters['global/getTrainingTable']
    }
  },
  methods: {
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
    openStrategyDialog (strategy) {
      const tmp = strategy
      delete tmp['IP EV']
      delete tmp['IP Equity']
      delete tmp['OOP EV']
      delete tmp['OOP Equity']
      this.strategyData = [tmp]
      this.dialog = true
    }
  }
}
</script>

<style>

</style>
