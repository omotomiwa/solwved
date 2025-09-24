import initialState from "./state"

export function reset(state, obj) {
  Object.assign(state, initialState())
}

export function setFeatureEnabled(state, data) {
  state.feature_enabled = data
}
