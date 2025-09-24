export function getLoggedIn(state) {
  return state.loggedIn
}

export function getUser(state) {
  return state.user
}

export function getBadge(state) {
  return state.badge
}

export function getBadges(state) {
  return state.badges ?? []
}

export function getCookie(state) {
  return state.cookieReceived
}

export function getPasswordResetStatus(state) {
  return state.passwordResetEmailSent
}

export function getDataCallObject(state) {
  return state.dataCallObject
}
