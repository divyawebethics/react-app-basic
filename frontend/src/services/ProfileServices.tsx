const API_BASE = 'http://127.0.0.1:8000';

export const profileService = {
  async updateProfile(token: string, formData: FormData) {
    const response = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Profile update failed');
    }

    return response.json();
  },

  async updateAvatar(token: string, file: File, userData: { name: string; email: string }) {
    const form = new FormData();
    form.append('name', userData.name);
    form.append('email', userData.email);
    form.append('avatar', file);

    const response = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Avatar update failed');
    }

    return response.json();
  }
};