import { deleteItem, getItem, setItem } from './storage';

const K_TOKEN = 'aurelius.token';
const K_EMAIL = 'aurelius.email';

/** Leer ⇒ kein Backend konfiguriert (Konto-Bereich zeigt nur einen Hinweis). */
export const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

export type ApiErrorKind = 'offline' | 'validation' | 'unauthorized' | 'rate_limited' | 'server';

export class ApiError extends Error {
  constructor(
    public kind: ApiErrorKind,
    public detail = '',
  ) {
    super(kind);
  }
}

export async function getToken(): Promise<string | null> {
  return getItem(K_TOKEN);
}

export async function getSessionEmail(): Promise<string | null> {
  return getItem(K_EMAIL);
}

export async function clearSession(): Promise<void> {
  await deleteItem(K_TOKEN);
  await deleteItem(K_EMAIL);
}

async function fieldErrors(resp: Response): Promise<string> {
  try {
    const data = (await resp.json()) as Record<string, unknown>;
    const parts = Object.values(data).flatMap((v) => (Array.isArray(v) ? v.map(String) : [String(v)]));
    return parts.join(' ') || 'Ungültige Eingabe.';
  } catch {
    return 'Ungültige Eingabe.';
  }
}

async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  let resp: Response;
  try {
    resp = await fetch(`${BACKEND_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Token ${token}` } : {}),
        ...((init.headers as Record<string, string>) ?? {}),
      },
    });
  } catch {
    throw new ApiError('offline');
  }
  if (!resp.ok) {
    if (resp.status === 401) {
      await clearSession();
      throw new ApiError('unauthorized');
    }
    if (resp.status === 429) throw new ApiError('rate_limited');
    if (resp.status === 400) throw new ApiError('validation', await fieldErrors(resp));
    throw new ApiError('server');
  }
  return resp;
}

export async function register(email: string, password: string): Promise<void> {
  await apiFetch('/api/auth/registration/', {
    method: 'POST',
    body: JSON.stringify({ email, password1: password, password2: password }),
  });
}

export async function login(email: string, password: string): Promise<void> {
  const resp = await apiFetch('/api/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const { key } = (await resp.json()) as { key: string };
  await setItem(K_TOKEN, key);
  await setItem(K_EMAIL, email);
}

export async function logout(): Promise<void> {
  try {
    await apiFetch('/api/auth/logout/', { method: 'POST' });
  } catch {
    // Session wird in jedem Fall lokal beendet
  }
  await clearSession();
}

export async function passwordReset(email: string): Promise<void> {
  await apiFetch('/api/auth/password/reset/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/** Server liefert neueste zuerst — für die UI chronologisch drehen (Parität). */
export async function getServerFavorites(): Promise<string[]> {
  const resp = await apiFetch('/api/favorites/');
  const list = (await resp.json()) as { quote_id: string }[];
  return list.map((f) => f.quote_id).reverse();
}

export async function putFavorite(id: string): Promise<void> {
  await apiFetch(`/api/favorites/${id}/`, { method: 'PUT' });
}

export async function deleteFavorite(id: string): Promise<void> {
  await apiFetch(`/api/favorites/${id}/`, { method: 'DELETE' });
}
