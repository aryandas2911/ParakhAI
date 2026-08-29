export interface HealthStatusResponse {
  status: string;
  service: string;
  version: string;
}

export interface DbHealthStatusResponse {
  status: string;
  database: string;
  connected: boolean;
  message: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function checkBackendHealth(): Promise<HealthStatusResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = (await response.json()) as HealthStatusResponse;
    return data;
  } catch (error) {
    console.error("Failed to connect to FastAPI backend:", error);
    return null;
  }
}

export async function checkDatabaseHealth(): Promise<DbHealthStatusResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/health/db`, {
      cache: "no-store",
    });
    const data = (await response.json()) as DbHealthStatusResponse;
    return data;
  } catch (error) {
    console.error("Failed to connect to backend DB health endpoint:", error);
    return null;
  }
}

export interface SchemaHealthStatusResponse {
  status: string;
  database: string;
  accessible: boolean;
  verified_tables?: string[];
  count?: number;
  message?: string;
  missing_tables?: Array<{ table: string; error: string }>;
}

export async function checkSchemaHealth(): Promise<SchemaHealthStatusResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/health/schema`, {
      cache: "no-store",
    });
    const data = (await response.json()) as SchemaHealthStatusResponse;
    return data;
  } catch (error) {
    console.error("Failed to connect to backend schema health endpoint:", error);
    return null;
  }
}

export interface AuthMeResponse {
  status: string;
  user: {
    user_id: string;
    email: string;
    name: string;
    role: string;
    created_at: string;
  };
}

export async function fetchAuthMe(token: string): Promise<AuthMeResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = (await response.json()) as AuthMeResponse;
    return data;
  } catch (error) {
    console.error("Failed to fetch /api/auth/me from FastAPI backend:", error);
    return null;
  }
}

// ---- Profile API ----

export interface ProfileData {
  id: string;
  name: string;
  role: string;
  email: string;
  created_at: string;
  updated_at: string | null;
}

export interface ProfileUpdatePayload {
  name?: string;
}

export async function fetchProfile(token: string): Promise<ProfileData | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    return (await response.json()) as ProfileData;
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return null;
  }
}

export async function updateProfile(
  token: string,
  payload: ProfileUpdatePayload,
): Promise<ProfileData | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message =
        errorBody?.detail || `Failed to update profile (HTTP ${response.status})`;
      throw new Error(message);
    }

    return (await response.json()) as ProfileData;
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw error;
  }
}
