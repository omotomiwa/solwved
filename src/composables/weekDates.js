import { DateTime } from "luxon"
import { Config } from "src/modules/StaticData.js"

export function useCurrentWeekDates() {
  const startDate = DateTime.now().startOf("week").toFormat(Config.DATE_FORMAT_DLY)
  const endDate = DateTime.now().endOf("week").toFormat(Config.DATE_FORMAT_DLY)
  return { startDate, endDate }
}
