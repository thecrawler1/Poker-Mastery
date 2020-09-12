<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  async created () {
    var solutions = {}
    var data = {}
    await this
      .$firestore
      .collection('solutions')
      .get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          solutions[doc.id] = doc.data()
        })
      })
      .catch(function (error) {
        console.log('Error getting solutions: ', error)
      })
    await this
      .$firestore
      .collection('state')
      .doc('strategyTree')
      .get()
      .then(function (doc) {
        data = doc.exists ? doc.data() : {}
      })
      .catch(function (error) {
        console.log('Error getting strategy tree: ', error)
      })
    for (var spot in data) {
      for (var formation in data[spot]) {
        data[spot][formation].sort((a, b) => (a.label > b.label))
      }
    }
    this.$store.dispatch('global/setStrategyTree', data)
    this.$store.dispatch('global/setSolutions', solutions)
  }
}
</script>
