# Travloger Frontend - Knowledge Transfer Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Key Features](#key-features)
5. [Component Architecture](#component-architecture)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Routing](#routing)
9. [Authentication Flow](#authentication-flow)
10. [CMS Modules](#cms-modules)
11. [Common Tasks](#common-tasks)
12. [Deployment](#deployment)

---

## Architecture Overview

The Travloger frontend is a **React-based CMS and admin dashboard** built with **TypeScript** and modern React patterns. It provides a comprehensive interface for managing tour packages, leads, bookings, and master data.

### Key Architectural Decisions
- **Component-Based**: Modular, reusable UI components
- **Type Safety**: Full TypeScript coverage
- **API-First**: All data fetched from backend REST APIs
- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: Dynamic data fetching on modal open

---

## Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | React | ^18.x |
| **Language** | TypeScript | ^5.0.0 |
| **Build Tool** | Vite / Next.js | Latest |
| **Routing** | React Router | ^6.x |
| **UI Components** | Custom + Shadcn/ui | - |
| **Icons** | Lucide React | Latest |
| **HTTP Client** | Fetch API | Native |
| **Styling** | Tailwind CSS | ^3.x |

---

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── pages/
│   │   │   └── cms/
│   │   │       ├── Itineraries.tsx          # Package/Itinerary Builder
│   │   │       ├── States.tsx               # States Master
│   │   │       ├── VehicleTypes.tsx         # Vehicle Types Master
│   │   │       ├── Transfers.tsx            # Transfers Master
│   │   │       ├── ItineraryNotesInclusions.tsx # Notes Library
│   │   │       ├── Destinations.tsx         # Destinations Master
│   │   │       ├── PackageThemes.tsx        # Themes Master
│   │   │       ├── DayItineraryMaster.tsx   # Day Itineraries
│   │   │       ├── Leads.tsx                # Lead Management
│   │   │       ├── Bookings.tsx             # Booking Management
│   │   │       └── WebsiteEdit.tsx          # CMS Editor
│   │   └── ui/
│   │       ├── button.tsx                   # Reusable Button
│   │       ├── input.tsx                    # Reusable Input
│   │       ├── card.tsx                     # Card Component
│   │       └── badge.tsx                    # Badge Component
│   ├── lib/
│   │   └── api.ts                           # API utility functions
│   ├── App.tsx                              # Main app component
│   └── main.tsx                             # Entry point
├── .env                                     # Environment variables
├── package.json                             # Dependencies
└── tsconfig.json                            # TypeScript config
```

---

## Key Features

### 1. **Itinerary Builder** (`Itineraries.tsx`)
- Create and manage tour packages
- Multi-tab interface: General, Itineraries, Vehicles, Includes, Excludes
- Dynamic pricing from Transfers Master
- Auto-populate capacity from Vehicle Types
- Quick-add inclusions/exclusions from library
- State-aware vehicle type filtering

### 2. **Master Data Management**
- **States**: Manage Indian states
- **Destinations**: City/destination management with state filtering
- **Vehicle Types**: Vehicle catalog with capacity and state association
- **Transfers**: Vehicle pricing by destination
- **Notes & Inclusions Library**: Reusable text blocks for packages
- **Package Themes**: Categorization (Adventure, Honeymoon, etc.)
- **Day Itineraries**: Pre-built day plans

### 3. **Lead Management**
- Capture customer inquiries
- Assign leads to employees
- Track lead status and follow-ups

### 4. **Booking Management**
- Convert leads to bookings
- Payment tracking
- Booking status management

### 5. **CMS Editor** (`WebsiteEdit.tsx`)
- Edit website content
- Manage city pages
- Upload images with recommended ratios

---

## Component Architecture

### Component Hierarchy

```
App
├── Router
│   ├── Dashboard
│   ├── CMS Pages
│   │   ├── Itineraries (Package Builder)
│   │   ├── States
│   │   ├── VehicleTypes
│   │   ├── Transfers
│   │   ├── ItineraryNotesInclusions
│   │   ├── Destinations
│   │   ├── PackageThemes
│   │   └── DayItineraryMaster
│   ├── Leads
│   ├── Bookings
│   └── Settings
└── UI Components (Shared)
    ├── Button
    ├── Input
    ├── Card
    ├── Badge
    └── Modal
```

### Key Component Patterns

#### 1. **Master CRUD Pattern**
All master components follow this pattern:
```typescript
const MasterComponent = () => {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({...});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => { /* API call */ };
  const handleSave = async () => { /* Create/Update */ };
  const handleDelete = async (id) => { /* Delete */ };
  const handleEdit = (item) => { /* Populate form */ };

  return (
    <div>
      {/* Table View */}
      {/* Modal Form */}
    </div>
  );
};
```

#### 2. **Itinerary Builder Pattern**
Multi-tab form with complex state management:
```typescript
const Itineraries = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm] = useState({
    name: '',
    state: '',
    primaryDestination: '',
    otherDestinations: [],
    numDays: 1,
    numNights: 0,
    packageVehicles: [],
    packageIncludes: [],
    packageExcludes: [],
    dayItineraries: []
  });

  // Master data for dropdowns
  const [states, setStates] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [allInclusions, setAllInclusions] = useState([]);
  const [allExclusions, setAllExclusions] = useState([]);

  // Fetch masters on modal open
  useEffect(() => {
    if (showModal) {
      fetchMasters();
    }
  }, [showModal]);

  // Auto-fetch pricing when vehicle selected
  const handleVehicleChange = (vehicle) => {
    const matchingTransfer = transfers.find(t => 
      t.vehicle_type === vehicle && 
      t.destination === form.primaryDestination
    );
    // Auto-populate price
  };
};
```

---

## State Management

### Local State (useState)
- Component-level state for forms, modals, loading states
- No global state management library (Redux/Context) currently used

### Data Fetching Pattern
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetchApi('/api/endpoint');
      setData(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

### Form State Management
```typescript
const [formData, setFormData] = useState({
  field1: '',
  field2: ''
});

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};
```

---

## API Integration

### API Utility (`lib/api.ts`)

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchApi<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const fullUrl = url.startsWith('/api') ? `${API_URL}${url}` : url;
  
  const response = await fetch(fullUrl, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}
```

### Usage Example
```typescript
// GET request
const data = await fetchApi('/api/states');

// POST request
const newState = await fetchApi('/api/states', {
  method: 'POST',
  body: JSON.stringify({ name: 'New State', code: 'NS' })
});

// PUT request
const updated = await fetchApi('/api/states', {
  method: 'PUT',
  body: JSON.stringify({ id: 1, name: 'Updated' })
});

// DELETE request
await fetchApi('/api/states?id=1', { method: 'DELETE' });
```

---

## Routing

### Route Structure
```typescript
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/packages" element={<Itineraries />} />
  <Route path="/leads" element={<Leads />} />
  <Route path="/bookings" element={<Bookings />} />
  <Route path="/settings/admin" element={<AdminSettings />}>
    <Route path="states" element={<States />} />
    <Route path="vehicle-types" element={<VehicleTypes />} />
    <Route path="transfers" element={<Transfers />} />
    <Route path="notes-inclusions" element={<ItineraryNotesInclusions />} />
  </Route>
</Routes>
```

---

## Authentication Flow

### Login Process
1. User enters credentials
2. Frontend calls `/api/auth/login`
3. Backend validates via Supabase Auth
4. JWT token returned
5. Token stored in `localStorage`
6. Token sent in `Authorization` header for subsequent requests

### Protected Routes
```typescript
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  return children;
};
```

---

## CMS Modules

### 1. **Itineraries (Package Builder)**
**File**: `src/components/pages/cms/Itineraries.tsx`

**Features**:
- Multi-tab interface (General, Itineraries, Vehicles, Includes, Excludes)
- State-aware destination filtering
- Dynamic vehicle type filtering by state
- Auto-pricing from Transfers Master
- Auto-capacity from Vehicle Types Master
- Quick-add inclusions/exclusions from library
- Real-time master data refresh on modal open

**Key State**:
```typescript
const [form, setForm] = useState({
  name: string,
  state: string,
  primaryDestination: string,
  otherDestinations: string[],
  numDays: number,
  numNights: number,
  packageVehicles: Array<{
    id: string,
    vehicleType: string,
    capacity: number,
    price: number,
    acType: string
  }>,
  packageIncludes: string[],
  packageExcludes: string[],
  dayItineraries: Array<{
    day: number,
    title: string,
    description: string
  }>
});
```

**Master Data Dependencies**:
- States (for state dropdown)
- Destinations (filtered by state)
- Vehicle Types (filtered by state)
- Transfers (for auto-pricing)
- Itinerary Notes & Inclusions (for quick-add)

### 2. **States Master**
**File**: `src/components/pages/cms/States.tsx`

**Features**:
- CRUD operations for Indian states
- Status management (Active/Inactive)
- State code validation

**Fields**:
- Name (e.g., "Kashmir")
- Code (e.g., "JK")
- Status (Active/Inactive)

### 3. **Vehicle Types Master**
**File**: `src/components/pages/cms/VehicleTypes.tsx`

**Features**:
- Manage vehicle catalog
- Capacity tracking
- State association for filtering

**Fields**:
- Vehicle Type (e.g., "Toyota Etios")
- Capacity (e.g., 4 seats)
- State (e.g., "Kashmir")
- Status (Active/Inactive)

### 4. **Transfers Master**
**File**: `src/components/pages/cms/Transfers.tsx`

**Features**:
- Vehicle pricing by destination
- State-aware vehicle type suggestions
- Searchable vehicle type dropdown

**Fields**:
- Destination (e.g., "Srinagar")
- Vehicle Type (searchable dropdown)
- Price (numeric)
- State (e.g., "Kashmir")
- Status (Active/Inactive)

**Integration**:
- Used by Itinerary Builder for auto-pricing
- Filters vehicle types by selected state

### 5. **Itinerary Notes & Inclusions Library**
**File**: `src/components/pages/cms/ItineraryNotesInclusions.tsx`

**Features**:
- Reusable text blocks for packages
- Categorization (Inclusion, Exclusion, Note, Tip)
- Quick-add integration with Itinerary Builder

**Fields**:
- Title (e.g., "Complimentary Water")
- Description (full text)
- Category (Inclusion/Exclusion/Note/Tip)
- Status (Active/Inactive)

**Integration**:
- Itinerary Builder fetches active items
- Displays in "Quick Add" buttons
- Filters by category (Inclusions vs Exclusions)

### 6. **Destinations Master**
**File**: `src/components/pages/cms/Destinations.tsx`

**Features**:
- City/destination management
- State-based filtering
- Hierarchical organization

**Fields**:
- Name (e.g., "Srinagar")
- State (e.g., "Kashmir")
- Status (Active/Inactive)

### 7. **Package Themes Master**
**File**: `src/components/pages/cms/PackageThemes.tsx`

**Features**:
- Package categorization
- Theme-based filtering

**Examples**:
- Adventure
- Honeymoon
- Family
- Pilgrimage

### 8. **Day Itineraries Master**
**File**: `src/components/pages/cms/DayItineraryMaster.tsx`

**Features**:
- Pre-built day plans
- Reusable itinerary templates

---

## Common Tasks

### 1. Adding a New Master Module

**Step 1**: Create component file
```typescript
// src/components/pages/cms/NewMaster.tsx
import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../../lib/api';

const NewMaster = () => {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', status: 'Active' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const response = await fetchApi('/api/new-master');
    setData(response.data);
  };

  const handleSave = async () => {
    await fetchApi('/api/new-master', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    fetchData();
    setShowModal(false);
  };

  return (
    <div>
      {/* Table + Modal UI */}
    </div>
  );
};

export default NewMaster;
```

**Step 2**: Add route
```typescript
<Route path="/settings/admin/new-master" element={<NewMaster />} />
```

**Step 3**: Add navigation link
```typescript
<Link to="/settings/admin/new-master">New Master</Link>
```

### 2. Debugging API Calls

**Enable Console Logs**:
```typescript
console.log('🔍 [API] Request:', url, options);
const response = await fetchApi(url, options);
console.log('✅ [API] Response:', response);
```

**Check Network Tab**:
- Open DevTools (F12)
- Go to Network tab
- Filter by "Fetch/XHR"
- Inspect request/response

### 3. Adding a New Field to Itinerary Builder

**Step 1**: Update form state
```typescript
const [form, setForm] = useState({
  ...existingFields,
  newField: ''
});
```

**Step 2**: Add input field
```typescript
<input
  value={form.newField}
  onChange={(e) => setForm({ ...form, newField: e.target.value })}
/>
```

**Step 3**: Update save handler
```typescript
const handleSave = async () => {
  await fetchApi('/api/packages', {
    method: 'POST',
    body: JSON.stringify(form) // newField included
  });
};
```

### 4. Implementing State-Aware Filtering

**Example**: Filter destinations by state
```typescript
const [selectedState, setSelectedState] = useState('');
const [allDestinations, setAllDestinations] = useState([]);

const filteredDestinations = allDestinations.filter(d => 
  !selectedState || d.state === selectedState
);

<select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
  <option value="">All States</option>
  {states.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
</select>

<select>
  {filteredDestinations.map(d => <option key={d.id}>{d.name}</option>)}
</select>
```

---

## Deployment

### Environment Variables

```env
# Backend API URL
NEXT_PUBLIC_API_URL=https://travelogerapi.travloger.in

# Supabase (if using directly from frontend)
NEXT_PUBLIC_SUPABASE_URL=https://tltuoosynajzlbvofzed.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Build Commands

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Production Deployment
- **Platform**: Vercel / Netlify / Custom VPS
- **Build Output**: `dist/` or `.next/`
- **Environment**: Set `NEXT_PUBLIC_API_URL` to production backend

---

## Troubleshooting

### Common Issues

**Issue**: "Network error" when calling APIs
- **Solution**: Check `NEXT_PUBLIC_API_URL` in `.env`
- Verify backend is running
- Check CORS configuration on backend

**Issue**: Master data not refreshing in Itinerary Builder
- **Solution**: Ensure `useEffect` dependency includes `showModal`
```typescript
useEffect(() => {
  fetchMasters();
}, [showModal]); // ✅ Correct
```

**Issue**: Vehicle pricing not auto-populating
- **Solution**: 
  - Check console logs for matching transfer
  - Verify `primaryDestination` is set
  - Ensure vehicle type name matches exactly (case-insensitive)

**Issue**: Inclusions/Exclusions not showing
- **Solution**:
  - Check category in database (must contain "include" or "exclude")
  - Verify status is "Active"
  - Check console logs for API response

---

## Best Practices

### 1. **Always Use TypeScript Types**
```typescript
interface Package {
  id: number;
  name: string;
  state: string;
  primaryDestination: string;
}

const [packages, setPackages] = useState<Package[]>([]);
```

### 2. **Error Handling**
```typescript
try {
  const data = await fetchApi('/api/endpoint');
  setData(data);
} catch (error) {
  console.error('Error:', error);
  alert(`Error: ${error.message}`);
}
```

### 3. **Loading States**
```typescript
const [loading, setLoading] = useState(true);

if (loading) {
  return <div>Loading...</div>;
}
```

### 4. **Debounce Search Inputs**
```typescript
const [searchTerm, setSearchTerm] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    // Perform search
  }, 300);
  return () => clearTimeout(timer);
}, [searchTerm]);
```

---

## Contact & Support

- **Project Lead**: [Your Name]
- **Repository**: [Git URL]
- **Documentation**: This file
- **Backend API Docs**: `backend/BACKEND_KT_DOCUMENTATION.md`

---

**Last Updated**: February 4, 2026
