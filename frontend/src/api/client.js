const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getAuthHeaders(isFormData = false) {
  const token = localStorage.getItem("campus_ai_token");
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
}

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(err.detail || "Invalid email or password");
  }
  return response.json();
}

export async function registerUser(name, email, password, role = "user") {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Registration failed" }));
    throw new Error(err.detail || "Registration failed");
  }
  return response.json();
}

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE}/api/auth/me`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error("Unauthorized");
  }
  return response.json();
}

// User Chat API
export async function sendChatMessage(question) {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ question }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Error fetching response" }));
    throw new Error(err.detail || "Failed to communicate with Campus AI");
  }
  return response.json();
}

// Admin Knowledge APIs
export async function addTextKnowledge(data) {
  const response = await fetch(`${API_BASE}/api/knowledge/text`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Failed to add text knowledge" }));
    throw new Error(err.detail || "Error adding text knowledge");
  }
  return response.json();
}

export async function uploadPdfKnowledge(formData) {
  const response = await fetch(`${API_BASE}/api/knowledge/pdf`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: formData,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Failed to upload PDF" }));
    throw new Error(err.detail || "Error uploading PDF");
  }
  return response.json();
}

export async function uploadImageKnowledge(formData) {
  const response = await fetch(`${API_BASE}/api/knowledge/image`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: formData,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Failed to upload image" }));
    throw new Error(err.detail || "Error uploading image OCR");
  }
  return response.json();
}

export async function getKnowledgeList(sourceType = null) {
  let url = `${API_BASE}/api/knowledge`;
  if (sourceType) {
    url += `?source_type=${sourceType}`;
  }
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Failed to fetch knowledge list" }));
    throw new Error(err.detail || "Error fetching knowledge list");
  }
  return response.json();
}

export async function deleteKnowledgeItem(id) {
  const response = await fetch(`${API_BASE}/api/knowledge/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Failed to delete knowledge" }));
    throw new Error(err.detail || "Error deleting knowledge item");
  }
  return response.json();
}
