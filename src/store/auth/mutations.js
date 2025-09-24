import initialState from "./state"

export function reset(state, obj) {
  Object.assign(state, initialState())
}

export function setLoggedIn(state, bool) {
  state.loggedIn = bool
}

export function setUser(state, user) {
  state.user = user
}

export function setBadge(state, badge) {
  state.badge = badge
}

export function setBadges(state, badges) {
  state.badges = badges
}

export function patchUser(state, userData) {
  for (const key in userData) {
    if (Object.hasOwnProperty.call(state.user, key)) {
      state.user[key] = userData[key]
    }
  }
}

export function setCookieReceived(state) {
  state.cookieReceived = true
}

export function setDataCallNotice(state, data) {
  const d = {
    show: false,
    title: "",
    message: ""
  }
  if (data.show !== undefined) {
    d.show = data.show
  }
  if (data.title !== undefined) {
    d.title = data.title
  }
  if (data.message !== undefined) {
    d.message = data.message
  }
  state.dataCallObject = d
}

export function passwordResetEmailSent(state) {
  state.passwordResetEmailSent = true
}
