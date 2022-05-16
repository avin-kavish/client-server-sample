export async function fetchJson(url, data, method) {
  const res = await fetch(url, {
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

