import { Config } from "src/modules/StaticData.js"

export const CurrencyMethods = {
  toNumber: val => {
    return parseFloat(val.replace(/[^0-9.-]+/g, ""))
  },
  toCurrencyString: (val, options) => {
    let decimalPrecision = 2
    if (options !== undefined) {
      if (options.decimalPrecision !== undefined) {
        decimalPrecision = options.decimalPrecision
      }
    }
    return parseFloat(val).toLocaleString(Config.LOCALE, {
      style: "currency",
      currency: Config.CURRENCY_CODE,
      minimumFractionDigits: decimalPrecision,
      maximumFractionDigits: decimalPrecision
    })
  },
  toCurrencyFormat: (currency, value, locale = null, decimalPrecision = 2) => {
    return parseFloat(value).toLocaleString(locale ?? Config.LOCALE, {
      style: "currency",
      currency: currency ?? Config.CURRENCY_CODE,
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: decimalPrecision,
      maximumFractionDigits: decimalPrecision
    })
  }
}

export const DateMethods = {
  existsInRange: (startDate, endDate, rangeStartDate, rangeEndDate) => {
    if (startDate <= rangeStartDate && endDate >= rangeStartDate) {
      return true
    }
    return startDate <= rangeEndDate && endDate >= rangeEndDate
  },
  reportApprovalDateWithinRange: (reportApprovalDate, rangeStartDate, rangeEndDate) => {
    return reportApprovalDate >= rangeStartDate && reportApprovalDate <= rangeEndDate
  },
  reportEndDateWithinRange: (reportEndDate, rangeStartDate, rangeEndDate) => {
    return reportEndDate >= rangeStartDate && reportEndDate <= rangeEndDate
  },
  dateWithinRange: (date, rangeStartDate, rangeEndDate) => {
    return date >= rangeStartDate && date <= rangeEndDate
  },
  getNextMonday: date => {
    return date.weekday === 1 ? date : date.plus({ weeks: 1 }).startOf("week")
  },
  convertDateFormat: (date, separator = "/", separator_replacement = "/") => {
    return date ? date.split(separator).reverse().join(separator_replacement) : date
  },
  convertDateTimeFormat: (date, separator = "/", separator_replacement = "/") => {
    if (date) {
      let [d, t] = date.split(" ")
      d = DateMethods.convertDateFormat(d, separator, separator_replacement)
      return [d, t].join(" ")
    }
    return date
  }
}

export const ObjectMethods = {
  decouple: obj => {
    return JSON.parse(JSON.stringify(obj))
  },
  deepSort: obj => {
    if (typeof obj !== "object" || obj === null) return obj // Base case

    return Object.keys(obj)
      .sort()
      .reduce((sortedObj, key) => {
        sortedObj[key] = ObjectMethods.deepSort(obj[key]) // Recursively sort nested objects
        return sortedObj
      }, {})
  },
  deepEqual: (obj1, obj2) => {
    if (obj1 === obj2) return true // Same reference

    if (typeof obj1 !== "object" || typeof obj2 !== "object" || obj1 === null || obj2 === null) {
      return false // If not objects or null, compare directly
    }

    const keys1 = Object.keys(obj1)
    const keys2 = Object.keys(obj2)

    if (keys1.length !== keys2.length) return false // Different number of properties

    return keys1.every(key => ObjectMethods.deepEqual(obj1[key], obj2[key])) // Recursively compare
  }
}

export const StringMethods = {
  ucfirst: s => {
    return s.length > 1 ? s.charAt(0).toUpperCase() + s.slice(1) : (s ? s.charAt(0).toUpperCase() : s)
  },
  upper: s => {
    return s.toUpperCase()
  }
}

export const FileMethods = {
  shortName: (file_name, len = 20) => {
    let fileNameArr = (file_name ?? "").split(".")

    return [fileNameArr[0].substr(0, len) ?? "", fileNameArr[1] ?? ""]
      .filter(val => val)
      .join((fileNameArr[0] ?? "").length > len ? "..." : ".")
  }
}

export const NumberMethods = {
  toFixedPlaces: (val, places = 2) => {
    return val.toLocaleString(undefined, { "minimumFractionDigits": places, "maximumFractionDigits": places })
  }
}
