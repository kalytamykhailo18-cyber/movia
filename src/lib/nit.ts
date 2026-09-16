const WEIGHTS = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71]

export function nitCheckDigit(nit: string): string {
  const digits = nit.replace(/\D/g, '')
  if (!digits) throw new Error('NIT vacio')
  const reversed = digits.split('').reverse()
  const sum = reversed.reduce((acc, char, index) => acc + Number(char) * WEIGHTS[index], 0)
  const remainder = sum % 11
  if (remainder === 0 || remainder === 1) return String(remainder)
  return String(11 - remainder)
}

export function isValidNit(nit: string, checkDigit: string): boolean {
  const digits = nit.replace(/\D/g, '')
  if (digits.length < 8 || digits.length > 15) return false
  try {
    return nitCheckDigit(digits) === checkDigit.trim()
  } catch {
    return false
  }
}

export function formatNit(nit: string, checkDigit: string): string {
  const digits = nit.replace(/\D/g, '')
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${grouped}-${checkDigit}`
}
