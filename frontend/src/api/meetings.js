const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/meetings';

/**
 * Fetch all meetings (newest first).
 * @returns {Promise<Array>}
 */
export async function fetchMeetings() {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error(`Failed to fetch meetings: ${res.status}`);
  return res.json();
}

/**
 * Fetch a single meeting by ID.
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export async function fetchMeeting(id) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (res.status === 404) throw new Error('Meeting not found');
  if (!res.ok) throw new Error(`Failed to fetch meeting: ${res.status}`);
  return res.json();
}

/**
 * Upload an audio file and optional title for processing.
 * @param {File} file
 * @param {string} title
 * @returns {Promise<Object>} The created meeting object.
 */
export async function uploadMeeting(file, title = '') {
  const form = new FormData();
  form.append('file', file);
  if (title.trim()) form.append('title', title.trim());

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: form,
  });

  if (res.status === 413) throw new Error('File is too large. Maximum upload size is 100 MB.');
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Upload failed: ${res.status}`);
  }
  return res.json();
}

/**
 * Delete a meeting by ID.
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export async function deleteMeeting(id) {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  if (res.status === 404) throw new Error('Meeting not found');
  if (!res.ok) throw new Error(`Failed to delete meeting: ${res.status}`);
  return res.json();
}
