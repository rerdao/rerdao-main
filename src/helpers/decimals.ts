import BN from 'bn.js'

export const undecimalize = (n: BN, decimals: number): string => {
  try {
    const _ten = new BN(10)
    const d = new BN(decimals)
    const a = n.div(_ten.pow(d))
    let b = n.mod(_ten.pow(d)).toString()
    if (b === '0') return a.toString()
    while (b.length < decimals) b = '0' + b
    let c = `${a.toString()}.${b}`
    while (c.endsWith('0')) c = c.substring(0, c.length - 1)
    return c
  } catch (er) {
    return '0'
  }
}

export const decimalize = (n: string, decimals: number): BN => {
  try {
    const [emphasis, correctness] = hydrateFloat(n)
    const _ten = new BN(10)
    return emphasis
      .mul(_ten.pow(new BN(decimals)))
      .div(_ten.pow(new BN(correctness)))
  } catch (er) {
    return new BN(0)
  }
}

/**
 * Hydrate a float to a big int & its decimals
 * @param n The float
 * @returns [BN, decimals]
 */
const hydrateFloat = (n: string | number): [BN, number] => {
  const ten = new BN(10)
  const m = n.toString()
  const [int, dec] = m.split('.')
  const correctness = (dec || '').length
  const emphasis = new BN(int)
    .mul(ten.pow(new BN(correctness)))
    .add(new BN(dec || '0'))
  return [emphasis, correctness]
}
