export type ServiceType = 'online' | 'presencial' | 'online_presencial'
export type ServiceArea = 'local' | 'regional' | 'nacional' | 'internacional'
export type EntrepreneurStatus = 'active' | 'inactive'
export type ApplicationStatus = 'pending' | 'in_review' | 'approved' | 'rejected'

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url: string | null
  active: boolean
  created_at: string
}

export interface Profile {
  id: string
  organization_id: string
  name: string
  email: string
  role: 'admin' | 'owner'
  created_at: string
}

export interface Category {
  id: string
  organization_id: string
  name: string
  slug: string
  description: string | null
  active: boolean
  created_at: string
}

export interface Entrepreneur {
  id: string
  organization_id: string
  owner_name: string
  business_name: string
  slug: string
  category_id: string | null
  category?: Category | null
  description: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  email_public: boolean
  instagram: string | null
  website: string | null
  city: string | null
  state: string | null
  neighborhood: string | null
  address: string | null
  service_type: ServiceType
  service_area: ServiceArea
  business_hours: string | null
  image_url: string | null
  latitude: number | null
  longitude: number | null
  view_count: number
  status: EntrepreneurStatus
  featured: boolean
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  organization_id: string
  owner_name: string
  email: string
  phone: string | null
  whatsapp: string
  business_name: string
  category_id: string | null
  category?: Category | null
  description: string
  instagram: string | null
  website: string | null
  city: string
  state: string
  neighborhood: string | null
  address: string | null
  service_type: ServiceType
  service_area: ServiceArea
  image_url: string | null
  status: ApplicationStatus
  admin_notes: string | null
  consent: boolean
  created_entrepreneur_id: string | null
  created_at: string
  updated_at: string
}

// Placeholder mínimo para tipar o client do Supabase.
// Pode ser substituído pelo tipo gerado via `supabase gen types typescript`.
export interface Database {
  public: {
    Tables: {
      organizations: { Row: Organization; Insert: Partial<Organization>; Update: Partial<Organization> }
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category> }
      entrepreneurs: { Row: Entrepreneur; Insert: Partial<Entrepreneur>; Update: Partial<Entrepreneur> }
      applications: { Row: Application; Insert: Partial<Application>; Update: Partial<Application> }
    }
  }
}
