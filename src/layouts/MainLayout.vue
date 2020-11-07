<template>
  <q-layout view="hHh lpR fFf">

    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="drawer = !drawer" />
        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo/svg/quasar-logo.svg">
          </q-avatar>
          Poker Mastery
        </q-toolbar-title>
        <q-space />
        <q-btn
          v-if="$route.name === 'new-solution'"
          flat
          label="New solution"
          @click="dialog = true"
        />
        <q-btn dense flat round :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'" @click="$q.fullscreen.toggle()" />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above persistent v-model="drawer" side="left" bordered :width="$route.name === 'trainer' ? 450 : 400">
      <q-scroll-area
        :thumb-style="{
          width: '6px',
          borderRadius: '6px',
          right: '2px',
          opacity: 0.25
        }"
        :style="'height: ' + ($q.screen.height - 50) + 'px'"
      >
        <template v-if="['index', 'new-solution'].includes($route.name)">
          <strategy-tree-viewer />
        </template>
        <template v-if="$route.name === 'trainer'">
          <training-table />
          <q-separator />
        </template>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-dialog
      v-model="dialog"
      persistent
    >
      <q-card style="width: 500px">
        <q-card-section>
          <div class="text-h6">New Solution</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-select
                outlined
                :options="['SRP IP PFR', 'SRP IP PFC', 'SRP OOP PFR', 'SRP OOP PFC', '3BP IP PFR', '3BP IP PFC', '3BP OOP PFR', '3BP OOP PFC']"
                v-model="spot"
                label="Spot"
              />
            </div>
            <div class="col-6">
              <q-select
                outlined
                :options="positions"
                v-model="heroPosition"
                label="Hero position"
              />
            </div>
            <div class="col-6">
              <q-select
                outlined
                :options="positions"
                v-model="villainPosition"
                label="Villain position"
              />
            </div>
            <div class="col-12">
              <q-input
                outlined
                v-model="description"
                label="Description"
                placeholder="Example: Versus check-raise 3x (reg)"
              />
            </div>
            <div class="col-12">
              <q-toggle
                v-model="villainActBeforeHero"
                label="Villain act before hero?"
              />
            </div>
            <template v-if="villainActBeforeHero">
              <div class="col-6">
                <q-select
                  outlined
                  :options="['CHECK', 'BET', 'RAISE']"
                  v-model="villainAct"
                  label="Villain action"
                />
              </div>
              <div class="col-6">
                <q-input
                  :disable="villainAct != 'BET' && villainAct != 'RAISE'"
                  outlined
                  v-model="villainActValue"
                  label="Act value in chips"
                  type="number"
                />
              </div>
            </template>
            <template v-if="villainActBeforeHero && villainAct == 'RAISE'">
              <div class="col-6">
                <q-select
                  outlined
                  :options="['BET', 'RAISE']"
                  v-model="heroAct"
                  label="Hero action"
                />
              </div>
              <div class="col-6">
                <q-input
                  outlined
                  v-model="heroActValue"
                  label="Act value in chips"
                  type="number"
                />
              </div>
            </template>
            <div class="col-4">
              <q-input
                outlined
                v-model="bigBlind"
                label="Big blind"
                type="number"
              />
            </div>
            <div class="col-4">
              <q-input
                outlined
                v-model="startingPot"
                label="Starting pot"
                type="number"
              />
            </div>
            <div class="col-4">
              <q-input
                outlined
                v-model="startingStacks"
                label="Effective stacks"
                type="number"
              />
            </div>
            <div class="col-12">
              <q-file
                outlined
                v-model="file"
                label="Solution file"
                accept=".csv"
                @rejected="onRejected"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Cancel" v-close-popup :disable="loading" />
          <q-btn label="Confirm" color="primary" @click="newSolution" :loading="loading" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-layout>
</template>

<script>
import StrategyTreeViewer from 'components/StrategyTreeViewer'
import TrainingTable from 'components/TrainingTable'

export default {
  components: {
    StrategyTreeViewer,
    TrainingTable
  },
  data () {
    return {
      drawer: true,
      dialog: false,
      spot: null,
      description: null,
      positions: ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB'],
      heroPosition: 'BTN',
      villainPosition: 'BB',
      villainActBeforeHero: false,
      villainAct: null,
      villainActValue: null,
      heroAct: null,
      heroActValue: null,
      startingPot: null,
      startingStacks: null,
      bigBlind: null,
      file: null,
      loading: false
    }
  },
  methods: {
    onRejected (rejectedEntries) {
      this.$q.notify({
        type: 'negative',
        message: 'The solution file must be of the type .csv'
      })
    },
    async newSolution () {
      this.loading = true
      var id
      var tmpObj = {
        spot: this.spot,
        description: this.description,
        heroPosition: this.heroPosition,
        villainPosition: this.villainPosition,
        villainActBeforeHero: this.villainActBeforeHero,
        startingPot: parseInt(this.startingPot),
        startingStacks: parseInt(this.startingStacks),
        bigBlind: parseInt(this.bigBlind)
      }
      if (this.villainActBeforeHero) {
        tmpObj.villainAct = this.villainAct
        tmpObj.villainActValue = parseInt(this.villainActValue)
        if (this.villainAct === 'RAISE') {
          tmpObj.heroAct = this.heroAct
          tmpObj.heroActValue = parseInt(this.heroActValue)
        }
      }
      var strategyTree
      await this
        .$firestore
        .collection('state')
        .doc('strategyTree')
        .get()
        .then(function (doc) {
          strategyTree = doc.exists ? doc.data() : {}
        })
        .catch(function (error) {
          console.log('Error getting strategy tree: ', error)
        })
      await this
        .$firestore
        .collection('solutions')
        .add(tmpObj)
        .then(docRef => {
          id = docRef.id
        })
        .catch(error => {
          console.log('Error: ', error)
        })
      var formation = this.heroPosition + ' x ' + this.villainPosition
      if (!(this.spot in strategyTree)) {
        strategyTree[this.spot] = {}
      }
      if (!(formation in strategyTree[this.spot])) {
        strategyTree[this.spot][formation] = []
      }
      strategyTree[this.spot][formation].push({
        label: this.description,
        key: id
      })
      await this
        .$firestore
        .collection('state')
        .doc('strategyTree')
        .set(strategyTree)
      await this
        .$storageRef
        .child(id + '.csv')
        .put(this.file, { contentType: 'text/csv' })
      this.$q.notify({
        type: 'positive',
        message: 'Success! In a few minutes the solution will be available.'
      })
      this.dialog = false
      this.loading = false
      this.description = null
      this.villainActBeforeHero = false
      this.villainAct = null
      this.villainActValue = null
      this.heroAct = null
      this.heroActValue = null
      this.startingPot = null
      this.startingStacks = null
      this.bigBlind = null
      this.file = null
    }
  }
}
</script>
