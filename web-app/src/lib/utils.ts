import { BASE_URL } from "./constants"

export async function fetchJson(url: string, data: any | undefined, method?: string) {
  const res = await fetch(BASE_URL + url, {
    method,
    body: data ? JSON.stringify(data) : undefined,
    headers: {
      'Content-Type': 'application/json'
    }
  })
  if (!res.ok) throw new Error('Fetch error')
  const body = res.status === 204 ? {} : await res.json()
  return body
}

export const dataFetcher = async (url: string, send: any | undefined, method?: string) => {
  const { data } = await fetchJson(url, send, method)

  return data
}

export const cx = (...args: any[]) => args.filter(Boolean).join(' ')