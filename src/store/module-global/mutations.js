export function setSolutions (state, payload) {
  state.solutions = payload
}

export function setStrategy (state, { solutionId, flop, strategy }) {
  if (!(solutionId in state.strategies)) {
    state.strategies[solutionId] = {}
  }
  state.strategies[solutionId][flop] = strategy
}

export function setStrategyTree (state, payload) {
  state.strategyTree = payload
}

export function setSelectedSolutionId (state, payload) {
  state.selectedSolutionId = payload
}

export function addTrainingTable (state, payload) {
  state.trainingTable.unshift(payload)
}

export function clearTrainingTable (state) {
  state.trainingTable = []
}

export function setSelectableStrategyTree (state, payload) {
  state.selectableStrategyTree = payload
}

export function setSelectedSolutionsIds (state, payload) {
  state.selectedSolutionsIds = payload
}
