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


