// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface FetchOptions extends RequestInit {
  handleError?: boolean;
}

export async function fetchApi<T = any>(url: string, options: FetchOptions = {}): Promise<T> {
  const {
    headers = {},
    handleError = true,
    ...rest
  } = options;

  // If URL starts with /api, replace with backend URL
  const fullUrl = url.startsWith('/api') 
    ? `${API_URL}${url}`
    : url.startsWith('http')
    ? url
    : `${API_URL}/api${url.startsWith('/') ? url : `/${url}`}`;

  // Check if body is FormData - if so, don't set Content-Type header
  const isFormData = rest.body instanceof FormData;
  const requestHeaders: HeadersInit = isFormData
    ? { ...headers } // FormData sets its own Content-Type with boundary
    : {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers,
      };

  try {
    const response = await fetch(fullUrl, {
      headers: requestHeaders,
      ...rest,
    });

    const data = await response.json();

    if (!response.ok) {
      // If the response has an error message, use it
      const error = new Error(data.error || 'API request failed');
      error.name = 'ApiError';
      (error as any).status = response.status;
      (error as any).data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (handleError) {
      console.error(`API Error (${fullUrl}):`, error);
      // Re-throw the error to be handled by the component
      throw error;
    }
    throw error;
  }
}

export function handleApiError(error: any): string {
  if (error.name === 'ApiError') {
    return error.data?.error || error.message || 'API request failed';
  }
  return error.message || 'An unexpected error occurred';
}

