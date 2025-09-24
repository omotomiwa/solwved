export function useClearAllCookies() {
  const cookies = [
    "XSRF-TOKEN",
    process.env.VUE_APP_COOKIE_NAME ?? "sowlved_session",
    "synthesis_advisory_dms_session",
    "sowlved_session"
  ]

  // Loop through each cookie and delete it
  cookies.forEach(cookie => {
    document.cookie = `${cookie}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  })
}
