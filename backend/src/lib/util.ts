
export const pick = (...args: any[]) => args[Math.floor(Math.random() * args.length)]

export const coerceArray = <T>(value: T | T[]) => Array.isArray(value) ? value : [value]