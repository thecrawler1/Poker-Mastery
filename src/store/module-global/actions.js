export function setSolutions ({ commit }, payload) {
  commit('setSolutions', payload)
}

export function setStrategy ({ commit }, payload) {
  commit('setStrategy', payload)
}

export function setStrategyTree ({ commit }, payload) {
  commit('setStrategyTree', payload)
}

export function setSelectedSolutionId ({ commit }, payload) {
  commit('setSelectedSolutionId', payload)
}

export function addTrainingTable ({ commit }, payload) {
  commit('addTrainingTable', payload)
}

export function clearTrainingTable ({ commit }) {
  commit('clearTrainingTable')
}

export function setSelectableStrategyTree ({ commit }, payload) {
  commit('setSelectableStrategyTree', payload)
}

export function setSelectedSolutionsIds ({ commit }, payload) {
  commit('setSelectedSolutionsIds', payload)
}
