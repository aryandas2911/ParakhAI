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

// ---- Products API ----

export interface ProductData {
  product_id: string;
  product_name: string;
  category: string;
  manufacturer: string;
  created_at: string;
  updated_at: string;
}

export interface ProductCreatePayload {
  product_name: string;
  category: string;
  manufacturer: string;
}

export interface ProductUpdatePayload {
  product_name?: string;
  category?: string;
  manufacturer?: string;
}

export async function createProduct(
  token: string,
  payload: ProductCreatePayload,
): Promise<ProductData | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message =
        errorBody?.detail || `Failed to create product (HTTP ${response.status})`;
      throw new Error(message);
    }

    return (await response.json()) as ProductData;
  } catch (error) {
    console.error("Failed to create product:", error);
    throw error;
  }
}

export async function fetchProducts(
  token: string,
  search?: string,
): Promise<ProductData[]> {
  try {
    const url = new URL(`${API_BASE_URL}/api/products`);
    if (search) url.searchParams.set("search", search);

    const response = await fetch(url.toString(), {
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

    return (await response.json()) as ProductData[];
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export async function fetchProductById(
  token: string,
  productId: string,
): Promise<ProductData | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
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

    return (await response.json()) as ProductData;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

export async function updateProduct(
  token: string,
  productId: string,
  payload: ProductUpdatePayload,
): Promise<ProductData | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
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
        errorBody?.detail || `Failed to update product (HTTP ${response.status})`;
      throw new Error(message);
    }

    return (await response.json()) as ProductData;
  } catch (error) {
    console.error("Failed to update product:", error);
    throw error;
  }
}

// ---- Inspections API ----

export interface InspectionData {
  inspection_id: string;
  product_id: string;
  inspector_id: string;
  inspection_date: string;
  compliance_status: string;
  compliance_score: number | null;
  created_at: string;
  updated_at: string;
  product_name: string | null;
  category: string | null;
}

export interface InspectionCreatePayload {
  product_id: string;
}

export async function createInspection(
  token: string,
  payload: InspectionCreatePayload,
): Promise<InspectionData | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inspections`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message =
        errorBody?.detail || `Failed to create inspection (HTTP ${response.status})`;
      throw new Error(message);
    }

    return (await response.json()) as InspectionData;
  } catch (error) {
    console.error("Failed to create inspection:", error);
    throw error;
  }
}

export async function fetchInspections(
  token: string,
): Promise<InspectionData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inspections`, {
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

    return (await response.json()) as InspectionData[];
  } catch (error) {
    console.error("Failed to fetch inspections:", error);
    return [];
  }
}

export async function fetchInspectionById(
  token: string,
  inspectionId: string,
): Promise<InspectionData | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inspections/${inspectionId}`, {
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

    return (await response.json()) as InspectionData;
  } catch (error) {
    console.error("Failed to fetch inspection:", error);
    return null;
  }
}

// ---- Inspection Images API ----

export interface InspectionImageData {
  image_id: string;
  inspection_id: string;
  storage_path: string;
  image_type: string;
  signed_url: string;
  created_at: string;
}

export async function uploadInspectionImage(
  token: string,
  inspectionId: string,
  file: File,
  imageType: string = "product",
): Promise<InspectionImageData | null> {
  try {
    // Ensure the file has a proper MIME type - create a new File with correct type if needed
    let uploadFile = file;
    if (!file.type || file.type === "application/octet-stream" || file.type.startsWith("text/")) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const mimeMap: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
      };
      const correctType = mimeMap[ext] || "image/jpeg";
      uploadFile = new File([file], file.name, { type: correctType });
    }

    const formData = new FormData();
    formData.append("file", uploadFile, uploadFile.name);
    formData.append("image_type", imageType);

    const response = await fetch(
      `${API_BASE_URL}/api/inspections/${inspectionId}/images`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message =
        errorBody?.detail || `Failed to upload image (HTTP ${response.status})`;
      throw new Error(message);
    }

    return (await response.json()) as InspectionImageData;
  } catch (error) {
    console.error("Failed to upload inspection image:", error);
    throw error;
  }
}

export async function fetchInspectionImages(
  token: string,
  inspectionId: string,
): Promise<InspectionImageData[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/inspections/${inspectionId}/images`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    return (await response.json()) as InspectionImageData[];
  } catch (error) {
    console.error("Failed to fetch inspection images:", error);
    return [];
  }
}

export async function deleteInspectionImage(
  token: string,
  inspectionId: string,
  imageId: string,
): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/inspections/${inspectionId}/images/${imageId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Failed to delete inspection image:", error);
    return false;
  }
}

// ---- Processing API ----

export interface ImageProcessingDetail {
  image_id: string;
  original_path: string;
  status: string;
  width: number;
  height: number;
  format: string;
  mode: string;
  orientation_corrected: boolean;
  resized: boolean;
  original_size_bytes: number;
  processed_size_bytes: number;
  error: string | null;
  metadata: Record<string, unknown>;
}

export interface OcrBlock {
  text: string;
  confidence: number;
  bounding_box: number[][];
}

export interface OcrImageResult {
  image_id: string;
  status: string;
  blocks: OcrBlock[];
  error: string | null;
}

export interface ProcessingResult {
  inspection_id: string;
  status: string;
  total_images: number;
  processed_images: number;
  failed_images: number;
  images: ImageProcessingDetail[];
  ocr_images: OcrImageResult[];
  errors: string[];
}

export interface OcrResult {
  inspection_id: string;
  total_blocks: number;
  images: OcrImageResult[];
}

export async function processInspection(
  token: string,
  inspectionId: string,
): Promise<ProcessingResult> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/inspections/${inspectionId}/process`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message =
        errorBody?.detail || `Failed to process inspection (HTTP ${response.status})`;
      throw new Error(message);
    }

    return (await response.json()) as ProcessingResult;
  } catch (error) {
    console.error("Failed to process inspection:", error);
    throw error;
  }
}

export async function fetchInspectionOcr(
  token: string,
  inspectionId: string,
): Promise<OcrResult | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/inspections/${inspectionId}/ocr`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    return (await response.json()) as OcrResult;
  } catch (error) {
    console.error("Failed to fetch OCR results:", error);
    return null;
  }
}

// ---- Declaration Extraction API ----

export interface DeclarationData {
  declaration_id: string;
  declaration_type: string;
  extracted_value: string;
  confidence: number;
  created_at: string;
}

export interface ExtractionResult {
  inspection_id: string;
  declarations: DeclarationData[];
  total_extracted: number;
  method: string;
}

export async function extractDeclarations(
  token: string,
  inspectionId: string,
): Promise<ExtractionResult> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/inspections/${inspectionId}/extract`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const message =
        errorBody?.detail || `Failed to extract declarations (HTTP ${response.status})`;
      throw new Error(message);
    }

    return (await response.json()) as ExtractionResult;
  } catch (error) {
    console.error("Failed to extract declarations:", error);
    throw error;
  }
}

export async function fetchDeclarations(
  token: string,
  inspectionId: string,
): Promise<DeclarationData[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/inspections/${inspectionId}/declarations`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    return (await response.json()) as DeclarationData[];
  } catch (error) {
    console.error("Failed to fetch declarations:", error);
    return [];
  }
}
