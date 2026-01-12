import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = [
    !supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
    !supabaseAnonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : null,
  ].filter(Boolean)
  throw new Error(
    `[Supabase] Missing required environment variable(s): ${missing.join(
      ', '
    )}. Update your .env(.local) file and restart the dev server.`
  )
}

// Safe diagnostics: verifies env presence without leaking secrets
if (typeof window !== 'undefined') {
  // Minimal format check to catch trailing spaces or malformed values without exposing secrets
  const urlLooksOk = /^https:\/\/.+\.(supabase\.co|supabase\.in)/.test(
    supabaseUrl
  )
  const keyLooksJwtLike =
    typeof supabaseAnonKey === 'string' && supabaseAnonKey.split('.').length === 3
  if (!urlLooksOk || !keyLooksJwtLike) {
    console.warn(
      '[Supabase] Env vars detected but may be malformed (URL should be https://*.supabase.co and key should be a JWT-like string).'
    )
  }
}

// Custom fetch function with better error handling
const customFetch = async (url, options = {}) => {
  // Check if we're online before making requests
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    console.warn('[Supabase] Device is offline, request will fail:', url)
    const offlineError = new Error('You are currently offline. Please check your internet connection.')
    offlineError.name = 'OfflineError'
    throw offlineError
  }

  try {
    // Create abort controller for timeout (compatible with older browsers)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      // Check if response indicates a network error
      if (!response.ok && response.status === 0) {
        throw new Error('Network error: Unable to reach server')
      }
      
      return response
    } catch (fetchError) {
      clearTimeout(timeoutId)
      throw fetchError
    }
  } catch (error) {
    // Handle network errors gracefully
    if (error.name === 'AbortError') {
      console.error('[Supabase] Request timeout:', url)
      // Re-throw with a more descriptive message
      const timeoutError = new Error('Request timeout. Please check your internet connection.')
      timeoutError.name = 'TimeoutError'
      throw timeoutError
    }
    if (error.message === 'Failed to fetch' || 
        error.name === 'TypeError' ||
        error.message?.includes('Network error')) {
      console.error('[Supabase] Network error:', error)
      // Re-throw with a more descriptive message
      const networkError = new Error('Network error. Please check your internet connection and try again.')
      networkError.name = 'NetworkError'
      throw networkError
    }
    throw error
  }
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    // Add storage key prefix to avoid conflicts
    storageKey: typeof window !== 'undefined' ? 'sb-auth-token' : undefined,
  },
  global: {
    fetch: typeof window !== 'undefined' ? customFetch : fetch,
  },
})

// Add global error handler for auth errors
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
      // Clear any corrupted auth data on sign out
      const projectId = supabaseUrl.split('//')[1]?.split('.')[0]
      if (projectId) {
        localStorage.removeItem(`sb-${projectId}-auth-token`)
      }
    }
    
    // Handle token refresh errors
    if (event === 'TOKEN_REFRESHED' && !session) {
      console.warn('[Supabase] Token refresh failed, clearing session')
      try {
        await supabase.auth.signOut()
      } catch (error) {
        console.error('[Supabase] Error during sign out:', error)
      }
    }
  })
  
  // Handle unhandled promise rejections from Supabase
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('Failed to fetch') || 
        event.reason?.message?.includes('fetch') ||
        event.reason?.message?.includes('Network error')) {
      console.warn('[Supabase] Unhandled network error (this may be temporary):', event.reason?.message || event.reason)
      // Log the error but don't prevent it - let Supabase handle it
    }
  })
}



