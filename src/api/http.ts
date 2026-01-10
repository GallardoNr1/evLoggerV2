// apps/mobile/src/api/http.ts

const API_BASE_URL =
  import.meta.env.REACT_APP_API_BASE_URL ?? 'http://localhost:3000';

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  // Si la respuesta no tiene body (204, etc.), devolvemos undefined
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export { API_BASE_URL };
