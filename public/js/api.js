const apiBase = "/api/v1";

async function request(path, options = {}) {
  const res = await fetch(apiBase + path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export function register(username, password) {
  return request("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username :username,password: password }),
  });
}

export function login(username, password) {
  return request("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username ,password : password }),
  });
}

export function getTodos(token) {
  return request("/todos", { headers: { Authorization: `Bearer ${token}` } });
}

export function createTodo(token, task) {
  return request("/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ task }),
  });
}

export function markTodoDone(token, id, task) {
  return request(`/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ task, completed: 1 }),
  });
}

export function removeTodo(token, id) {
  return request(`/todos/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}