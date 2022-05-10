
export async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Fetch error')
  const body  = await res.json()
  return body
}

