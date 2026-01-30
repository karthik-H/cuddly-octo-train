const API_BASE = "/api";

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<{ data?: T; error?: string }> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { error: (json as { error?: string }).error || res.statusText };
  }
  return { data: json as T };
}

export const api = {
  getEvents: () => request<EventSummary[]>("GET", "/events"),
  getEvent: (id: number) => request<EventDetail>("GET", `/events/${id}`),
  createEvent: (body: CreateEventBody) => request<{ id: number; message: string }>("POST", "/events", body),
  updateEvent: (id: number, body: UpdateEventBody) =>
    request<{ message: string }>("PUT", `/events/${id}`, body),
  deleteEvent: (id: number) => request<{ message: string }>("DELETE", `/events/${id}`),
  getUsers: () => request<User[]>("GET", "/users"),
};

export interface EventSummary {
  id: number;
  title: string;
  description: string;
  created_at: string;
  assigned_count: number;
}

export interface EventDetail {
  id: number;
  title: string;
  description: string;
  created_at: string;
  assigned_user_ids: number[];
}

export interface CreateEventBody {
  title: string;
  description: string;
  assigned_user_ids: number[];
}

export type UpdateEventBody = CreateEventBody;

export interface User {
  id: number;
  name: string;
  email: string;
}
