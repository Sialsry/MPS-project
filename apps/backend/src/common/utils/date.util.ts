export const isValidYearMonth = (s?: string) => !!s && /^\d{4}-(0[1-9]|1[0-2])$/.test(s)

export const getDefaultYearMonthKST = () => {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 3600 * 1000)
  const y = kst.getUTCFullYear()
  const m = String(kst.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}
