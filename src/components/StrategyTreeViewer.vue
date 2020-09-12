<template>
  <q-card flat v-if="strategyTree">
    <q-card-section class="row q-py-sm">
      <div class="q-pt-sm text-subtitle1 text-weight-medium">Strategy Tree</div>
      <q-space />
      <q-toggle
        v-model="selectable"
        label="Selectable"
        class="q-pt-xs"
        left-label
      />
    </q-card-section>
    <q-card-section class="q-pt-none">
      <q-tree
        v-if="strategyTree"
        :nodes="tree"
        node-key="key"
        selected-color="primary"
        :selected.sync="selected"
        :tick-strategy="tickStrategy"
        :ticked.sync="selectedSolutionsIds"
        default-expand-all
      />
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  data: () => ({
    selected: null,
    selectable: false
  }),
  methods: {
    loadSubtree (key) {
      if (key in this.strategyTree) {
        const tempArr = []
        for (const formation in this.strategyTree[key]) {
          const children = this.strategyTree[key][formation].sort((a, b) => (a.label > b.label ? -1 : 1))
          tempArr.push({
            label: formation,
            key: key + ' - ' + formation,
            selectable: false,
            children
          })
        }
        return tempArr.sort((a, b) => (a.label > b.label ? -1 : 1))
      }
      return []
    }
  },
  computed: {
    strategyTree () {
      return this.$store.getters['global/getStrategyTree']
    },
    tree () {
      return [
        {
          label: 'SRP',
          key: 'SRP',
          selectable: false,
          children: [
            {
              label: 'IP',
              key: 'SRP IP',
              selectable: false,
              children: [
                // {
                //   label: 'PFR',
                //   key: 'SRP IP PFR',
                //   selectable: false,
                //   children: this.loadSubtree('SRP IP PFR')
                // },
                {
                  label: 'PFC',
                  key: 'SRP IP PFC',
                  selectable: false,
                  children: this.loadSubtree('SRP IP PFC')
                }
              ]
            },
            {
              label: 'OOP',
              key: 'SRP OOP',
              selectable: false,
              children: [
                // {
                //   label: 'PFR',
                //   key: 'SRP OOP PFR',
                //   selectable: false,
                //   children: this.loadSubtree('SRP OOP PFR')
                // },
                {
                  label: 'PFC',
                  key: 'SRP OOP PFC',
                  selectable: false,
                  children: this.loadSubtree('SRP OOP PFC')
                }
              ]
            }
          ]
        },
        {
          label: '3BP',
          key: '3BP',
          selectable: false,
          children: [
            {
              label: 'IP',
              key: '3BP IP',
              selectable: false,
              children: [
              //     {
              //       label: 'PFR',
              //       key: '3BP IP PFR',
              //       selectable: false,
              //       children: this.loadSubtree('3BP IP PFR')
              //     },
                {
                  label: 'PFC',
                  key: '3BP IP PFC',
                  selectable: false,
                  children: this.loadSubtree('3BP IP PFC')
                }
              ]
            },
            {
              label: 'OOP',
              key: '3BP OOP',
              selectable: false,
              children: [
                {
                  label: 'PFR',
                  key: '3BP OOP PFR',
                  selectable: false,
                  children: this.loadSubtree('3BP OOP PFR')
                }
                // ,
                // {
                //   label: 'PFC',
                //   key: '3BP OOP PFC',
                //   selectable: false,
                //   children: this.loadSubtree('3BP OOP PFC')
                // }
              ]
            }
          ]
        }
      ]
    },
    tickStrategy () {
      this.$store.dispatch('global/setSelectableStrategyTree', this.selectable)
      if (!this.selectable) this.$store.dispatch('global/setSelectedSolutionsIds', [])
      return this.selectable ? 'leaf' : 'none'
    },
    selectedSolutionsIds: {
      get () {
        return this.$store.getters['global/getSelectedSolutionsIds']
      },
      set (arr) {
        this.$store.dispatch('global/setSelectedSolutionsIds', arr)
      }
    }
  },
  watch: {
    selected (val) {
      this.$store.dispatch('global/setSelectedSolutionId', val)
    }
  }
}
</script>
