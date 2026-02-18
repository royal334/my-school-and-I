# Engineering Department Platform - System Architecture & Foundation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [API Design](#api-design)
5. [Security Architecture](#security-architecture)
6. [File Management Strategy](#file-management-strategy)
7. [Implementation Roadmap](#implementation-roadmap)
8. [Development Guidelines](#development-guidelines)

---

## Project Overview

### Vision
A comprehensive digital platform for engineering students that centralizes academic materials, simplifies GPA tracking, connects students with departmental vendors, and maintains sustainability through ethical monetization.

### Target Users
- **Primary**: Engineering department students (200-2000+ users)
- **Secondary**: Department administrators and approved vendors
- **Tertiary**: Department faculty (future phase)

### Success Metrics
- 70%+ student adoption within first semester
- <2 second page load times
- 99.5% uptime
- Material access rate: 5+ materials per active user per week
- Payment conversion rate: 40%+ of active users

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  Next.js 14+ (App Router) + Tailwind CSS + shadcn/ui       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      API/Server Layer                        │
│            Next.js API Routes + Server Actions               │
│              Middleware (Auth, Rate Limiting)                │
└─────────────────────────────────────────────────────────────┘
                              │
                 ┌────────────┴────────────┐
                 ↓                         ↓
┌─────────────────────────┐   ┌──────────────────────────┐
│    Supabase Backend     │   │   External Services      │
│  - PostgreSQL Database  │   │  - Paystack (Payments)   │
│  - Authentication       │   │  - Cloudflare R2 (Files) │
│  - Row Level Security   │   │  - Email Service         │
│  - Storage (Files)      │   └──────────────────────────┘
│  - Real-time Updates    │
└─────────────────────────┘
```

### Technology Stack Breakdown

#### Frontend
- **Framework**: Next.js 14+ with App Router
- **Styling**: Tailwind CSS v3+
- **Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React Context + Zustand (for complex state)
- **Forms**: React Hook Form + Zod validation
- **PDF Rendering**: react-pdf or PDF.js
- **Icons**: Lucide React
- **Charts**: Recharts (for analytics)

#### Backend
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (with custom claims)
- **Storage**: Supabase Storage → Cloudflare R2 (scaling)
- **API**: Next.js API Routes + Server Actions
- **Caching**: React Server Components + Supabase edge caching

#### DevOps & Infrastructure
- **Hosting**: Vercel (Edge Network)
- **Domain**: Custom domain with SSL
- **Monitoring**: Vercel Analytics + Sentry (errors)
- **CI/CD**: GitHub Actions + Vercel Auto-deploy
- **Version Control**: Git + GitHub

#### Third-Party Services
- **Payments**: Paystack
- **Email**: Resend or SendGrid
- **File Storage**: Cloudflare R2 (after scaling)
- **CDN**: Cloudflare (integrated with Vercel)

---

## Database Schema

### Core Tables

```sql
-- ============================================================
-- USERS & AUTHENTICATION
-- ============================================================

-- Supabase handles auth.users table
-- We extend with custom user profiles

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  matric_number VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(100) DEFAULT 'Engineering',
  level INTEGER CHECK (level IN (100, 200, 300, 400, 500)),
  phone_number VARCHAR(20),
  avatar_url TEXT,
  subscription_status VARCHAR(20) DEFAULT 'free' CHECK (
    subscription_status IN ('free', 'active', 'expired', 'trial')
  ),
  subscription_expires_at TIMESTAMPTZ,
  total_downloads INTEGER DEFAULT 0,
  daily_download_count INTEGER DEFAULT 0,
  daily_download_reset_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_matric ON profiles(matric_number);
CREATE INDEX idx_profiles_subscription ON profiles(subscription_status);
CREATE INDEX idx_profiles_level ON profiles(level);

-- ============================================================
-- ACADEMIC MATERIALS
-- ============================================================

CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code VARCHAR(20) UNIQUE NOT NULL,
  course_title VARCHAR(255) NOT NULL,
  level INTEGER NOT NULL CHECK (level IN (100, 200, 300, 400, 500)),
  semester INTEGER NOT NULL CHECK (semester IN (1, 2)),
  credit_units INTEGER NOT NULL CHECK (credit_units > 0),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courses_level_semester ON courses(level, semester);
CREATE INDEX idx_courses_code ON courses(course_code);

CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (
    type IN ('lecture_note', 'past_question', 'textbook', 'assignment', 'lab_manual', 'other')
  ),
  description TEXT,
  file_path TEXT NOT NULL, -- Supabase storage path
  file_size_bytes BIGINT,
  file_name VARCHAR(255) NOT NULL,
  uploaded_by UUID REFERENCES profiles(id),
  is_premium BOOLEAN DEFAULT true, -- false for free tier materials
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  academic_year VARCHAR(20), -- e.g., "2024/2025"
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_materials_course ON materials(course_id);
CREATE INDEX idx_materials_type ON materials(type);
CREATE INDEX idx_materials_approved ON materials(is_approved);
CREATE INDEX idx_materials_premium ON materials(is_premium);

-- ============================================================
-- CGPA CALCULATOR
-- ============================================================

CREATE TABLE public.semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level IN (100, 200, 300, 400, 500)),
  semester INTEGER NOT NULL CHECK (semester IN (1, 2)),
  session VARCHAR(20) NOT NULL, -- e.g., "2024/2025"
  gpa DECIMAL(3,2),
  total_credit_units INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, level, semester, session)
);

CREATE INDEX idx_semesters_user ON semesters(user_id);

CREATE TABLE public.semester_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE,
  course_code VARCHAR(20) NOT NULL,
  course_title VARCHAR(255) NOT NULL,
  credit_units INTEGER NOT NULL CHECK (credit_units > 0),
  grade VARCHAR(2) NOT NULL CHECK (
    grade IN ('A', 'B', 'C', 'D', 'E', 'F')
  ),
  grade_point DECIMAL(2,1) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_semester_courses_semester ON semester_courses(semester_id);

-- ============================================================
-- VENDOR MARKETPLACE
-- ============================================================

CREATE TABLE public.vendor_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50), -- icon name for UI
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES vendor_categories(id),
  description TEXT NOT NULL,
  services TEXT[], -- Array of services offered
  phone_number VARCHAR(20) NOT NULL,
  whatsapp_number VARCHAR(20),
  location TEXT,
  operating_hours TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  subscription_tier VARCHAR(20) DEFAULT 'basic' CHECK (
    subscription_tier IN ('basic', 'premium', 'featured')
  ),
  subscription_expires_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  contact_count INTEGER DEFAULT 0,
  rating_avg DECIMAL(2,1) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendors_category ON vendors(category_id);
CREATE INDEX idx_vendors_approved ON vendors(is_approved);
CREATE INDEX idx_vendors_featured ON vendors(is_featured);
CREATE INDEX idx_vendors_user ON vendors(user_id);

CREATE TABLE public.vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_id, user_id)
);

CREATE INDEX idx_vendor_reviews_vendor ON vendor_reviews(vendor_id);

-- ============================================================
-- PAYMENTS & SUBSCRIPTIONS
-- ============================================================

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reference VARCHAR(100) UNIQUE NOT NULL, -- Paystack reference
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  type VARCHAR(50) NOT NULL CHECK (
    type IN ('semester_subscription', 'vendor_listing', 'featured_listing')
  ),
  status VARCHAR(20) DEFAULT 'pending' CHECK (
    status IN ('pending', 'success', 'failed', 'cancelled')
  ),
  payment_channel VARCHAR(50),
  metadata JSONB, -- Additional payment info
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_reference ON transactions(reference);
CREATE INDEX idx_transactions_status ON transactions(status);

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================

CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'general' CHECK (
    type IN ('general', 'urgent', 'academic', 'event', 'maintenance')
  ),
  target_levels INTEGER[], -- null = all levels
  is_pinned BOOLEAN DEFAULT false,
  published_by UUID REFERENCES profiles(id),
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_type ON announcements(type);
CREATE INDEX idx_announcements_published ON announcements(published_at);

-- ============================================================
-- ADMIN & ANALYTICS
-- ============================================================

CREATE TABLE public.admin_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (
    role IN ('super_admin', 'admin', 'moderator', 'content_manager')
  ),
  permissions JSONB, -- Granular permissions
  assigned_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_roles_user ON admin_roles(user_id);

CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);

-- ============================================================
-- MATERIAL ACCESS CONTROL
-- ============================================================

CREATE TABLE public.material_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL CHECK (action IN ('view', 'download')),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_material_access_material ON material_access_logs(material_id);
CREATE INDEX idx_material_access_user ON material_access_logs(user_id);
CREATE INDEX idx_material_access_created ON material_access_logs(created_at);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate GPA for a semester
CREATE OR REPLACE FUNCTION calculate_semester_gpa(semester_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  total_points DECIMAL(10,2);
  total_units INTEGER;
  calculated_gpa DECIMAL(3,2);
BEGIN
  SELECT 
    SUM(credit_units * grade_point),
    SUM(credit_units)
  INTO total_points, total_units
  FROM semester_courses
  WHERE semester_id = semester_uuid;
  
  IF total_units > 0 THEN
    calculated_gpa := ROUND((total_points / total_units)::NUMERIC, 2);
  ELSE
    calculated_gpa := 0.00;
  END IF;
  
  UPDATE semesters 
  SET gpa = calculated_gpa, total_credit_units = total_units
  WHERE id = semester_uuid;
  
  RETURN calculated_gpa;
END;
$$ LANGUAGE plpgsql;

-- Function to reset daily download counts
CREATE OR REPLACE FUNCTION reset_daily_downloads()
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET 
    daily_download_count = 0,
    daily_download_reset_at = NOW()
  WHERE daily_download_reset_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Function to update vendor rating
CREATE OR REPLACE FUNCTION update_vendor_rating(vendor_uuid UUID)
RETURNS void AS $$
DECLARE
  avg_rating DECIMAL(2,1);
  review_count INTEGER;
BEGIN
  SELECT 
    ROUND(AVG(rating)::NUMERIC, 1),
    COUNT(*)
  INTO avg_rating, review_count
  FROM vendor_reviews
  WHERE vendor_id = vendor_uuid AND is_approved = true;
  
  UPDATE vendors
  SET 
    rating_avg = COALESCE(avg_rating, 0),
    rating_count = review_count
  WHERE id = vendor_uuid;
END;
$$ LANGUAGE plpgsql;
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE semester_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, update only their own
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Materials: Approved materials viewable based on subscription
CREATE POLICY "Approved materials viewable by subscribed users"
  ON materials FOR SELECT
  USING (
    is_approved = true AND (
      is_premium = false OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND subscription_status = 'active'
        AND subscription_expires_at > NOW()
      )
    )
  );

-- Semesters: Users can only access their own semester data
CREATE POLICY "Users can manage own semesters"
  ON semesters FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own semester courses"
  ON semester_courses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM semesters
      WHERE id = semester_courses.semester_id
      AND user_id = auth.uid()
    )
  );

-- Vendors: Approved vendors viewable by all
CREATE POLICY "Approved vendors viewable by everyone"
  ON vendors FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Users can manage own vendor listings"
  ON vendors FOR ALL
  USING (auth.uid() = user_id);

-- Transactions: Users can only view their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Announcements: Published announcements viewable by all
CREATE POLICY "Published announcements viewable by everyone"
  ON announcements FOR SELECT
  USING (published_at IS NOT NULL AND published_at <= NOW());
```

---

## API Design

### API Route Structure

```
/api/
├── auth/
│   ├── signup
│   ├── login
│   ├── logout
│   ├── verify-email
│   └── reset-password
├── materials/
│   ├── [id]
│   ├── search
│   ├── by-course/[courseId]
│   ├── download/[id]
│   └── upload
├── courses/
│   ├── list
│   └── [id]
├── cgpa/
│   ├── semesters
│   ├── semesters/[id]
│   ├── calculate
│   └── export
├── vendors/
│   ├── list
│   ├── [id]
│   ├── categories
│   ├── review
│   └── contact/[id]
├── payments/
│   ├── initialize
│   ├── verify
│   └── webhook
├── announcements/
│   └── list
└── admin/
    ├── materials/approve
    ├── vendors/approve
    ├── analytics
    └── users
```

### Key API Endpoints

#### Authentication
```typescript
POST /api/auth/signup
Body: {
  email: string;
  password: string;
  full_name: string;
  matric_number: string;
  level: number;
}

POST /api/auth/login
Body: {
  email: string;
  password: string;
}
```

#### Materials
```typescript
GET /api/materials/search
Query: {
  level?: number;
  semester?: number;
  course_code?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}

GET /api/materials/download/[id]
Returns: Signed URL with watermark applied

POST /api/materials/upload
Body: FormData {
  file: File;
  course_id: string;
  title: string;
  type: string;
  description?: string;
}
```

#### CGPA Calculator
```typescript
POST /api/cgpa/semesters
Body: {
  level: number;
  semester: number;
  session: string;
  courses: Array<{
    course_code: string;
    course_title: string;
    credit_units: number;
    grade: string;
  }>;
}

GET /api/cgpa/calculate
Returns: {
  current_semester_gpa: number;
  cumulative_gpa: number;
  total_credit_units: number;
  semesters: Semester[];
}
```

#### Vendors
```typescript
GET /api/vendors/list
Query: {
  category?: string;
  search?: string;
  featured?: boolean;
  page?: number;
}

POST /api/vendors/review
Body: {
  vendor_id: string;
  rating: number;
  comment: string;
}
```

#### Payments
```typescript
POST /api/payments/initialize
Body: {
  type: 'semester_subscription' | 'vendor_listing';
  amount: number;
}
Returns: {
  authorization_url: string;
  reference: string;
}

GET /api/payments/verify
Query: {
  reference: string;
}

POST /api/payments/webhook
// Paystack webhook endpoint
```

---

## Security Architecture

### Authentication & Authorization

1. **User Authentication**
   - Supabase Auth with email/password
   - Email verification required
   - JWT tokens with short expiry (1 hour)
   - Refresh token rotation
   - Session management

2. **Role-Based Access Control (RBAC)**
   ```typescript
   enum UserRole {
     STUDENT = 'student',
     ADMIN = 'admin',
     SUPER_ADMIN = 'super_admin',
     MODERATOR = 'moderator',
     CONTENT_MANAGER = 'content_manager'
   }
   
   enum Permission {
     VIEW_MATERIALS = 'view_materials',
     UPLOAD_MATERIALS = 'upload_materials',
     APPROVE_MATERIALS = 'approve_materials',
     MANAGE_VENDORS = 'manage_vendors',
     MANAGE_USERS = 'manage_users',
     VIEW_ANALYTICS = 'view_analytics',
     MANAGE_PAYMENTS = 'manage_payments'
   }
   ```

3. **Material Access Control**
   - Subscription status validation
   - Daily download limits
   - IP-based rate limiting
   - Watermarking system

### Data Protection

1. **Material Protection**
   ```typescript
   // Generate signed URL with watermark
   async function generateSecureURL(materialId: string, userId: string) {
     const user = await getUser(userId);
     const material = await getMaterial(materialId);
     
     // Check subscription
     if (!user.hasActiveSubscription && material.is_premium) {
       throw new Error('Subscription required');
     }
     
     // Check daily limit
     if (user.daily_download_count >= DAILY_LIMIT) {
       throw new Error('Daily limit reached');
     }
     
     // Generate watermark
     const watermark = {
       text: `${user.full_name} - ${user.matric_number}`,
       timestamp: new Date().toISOString(),
       ip: request.ip
     };
     
     // Generate signed URL (expires in 5 minutes)
     const signedUrl = await storage.createSignedUrl(
       material.file_path,
       300,
       { watermark }
     );
     
     // Log access
     await logMaterialAccess(materialId, userId, 'download');
     
     return signedUrl;
   }
   ```

2. **Rate Limiting**
   ```typescript
   // Rate limiting configuration
   const RATE_LIMITS = {
     api: {
       anonymous: { requests: 20, window: '15m' },
       authenticated: { requests: 100, window: '15m' }
     },
     download: {
       daily: 10,
       hourly: 3
     },
     upload: {
       daily: 5,
       max_size_mb: 10
     }
   };
   ```

3. **Input Validation**
   - Zod schemas for all inputs
   - File type validation (PDF only)
   - File size limits
   - SQL injection prevention (Supabase handles this)
   - XSS prevention (React escaping + sanitization)

### Payment Security

1. **Paystack Integration**
   ```typescript
   // Initialize payment
   const initializePayment = async (userId: string, amount: number) => {
     const user = await getUser(userId);
     const reference = generateReference();
     
     // Create transaction record
     await db.transactions.create({
       user_id: userId,
       reference,
       amount,
       type: 'semester_subscription',
       status: 'pending'
     });
     
     // Initialize with Paystack
     const response = await paystack.transaction.initialize({
       email: user.email,
       amount: amount * 100, // Convert to kobo
       reference,
       callback_url: `${BASE_URL}/verify-payment?reference=${reference}`,
       metadata: {
         user_id: userId,
         matric_number: user.matric_number
       }
     });
     
     return response.data.authorization_url;
   };
   
   // Verify payment webhook
   const verifyPaymentWebhook = async (payload: any, signature: string) => {
     // Verify signature
     const hash = crypto
       .createHmac('sha512', PAYSTACK_SECRET_KEY)
       .update(JSON.stringify(payload))
       .digest('hex');
     
     if (hash !== signature) {
       throw new Error('Invalid signature');
     }
     
     const { reference, status } = payload.data;
     
     if (status === 'success') {
       await activateSubscription(reference);
     }
   };
   ```

---

## File Management Strategy

### Storage Architecture

```
Storage Tiers:
1. Supabase Storage (Free: 1GB, Paid: scalable)
2. Cloudflare R2 (Scaling phase: unlimited, $0.015/GB)

Directory Structure:
/materials/
  /{level}/
    /{semester}/
      /{course_code}/
        /{type}/
          /{file_id}.pdf

/avatars/
  /{user_id}.jpg

/vendor-images/
  /{vendor_id}/
    /logo.jpg
    /cover.jpg
```

### File Upload Process

```typescript
async function uploadMaterial(file: File, metadata: MaterialMetadata) {
  // 1. Validate
  if (!file.type.includes('pdf')) {
    throw new Error('Only PDF files allowed');
  }
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large');
  }
  
  // 2. Compress (if needed)
  const compressed = await compressPDF(file);
  
  // 3. Generate path
  const path = generateFilePath(metadata);
  
  // 4. Upload to storage
  const { data, error } = await supabase.storage
    .from('materials')
    .upload(path, compressed, {
      contentType: 'application/pdf',
      upsert: false
    });
  
  if (error) throw error;
  
  // 5. Create database record
  const material = await db.materials.create({
    ...metadata,
    file_path: data.path,
    file_size_bytes: compressed.size,
    file_name: file.name,
    uploaded_by: userId,
    is_approved: false
  });
  
  // 6. Trigger approval workflow
  await notifyAdmins('new_material', material.id);
  
  return material;
}
```

### PDF Watermarking

```typescript
import { PDFDocument, rgb } from 'pdf-lib';

async function applyWatermark(pdfBuffer: Buffer, watermarkText: string) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();
  
  for (const page of pages) {
    const { width, height } = page.getSize();
    
    // Add diagonal watermark
    page.drawText(watermarkText, {
      x: width / 4,
      y: height / 2,
      size: 40,
      color: rgb(0.7, 0.7, 0.7),
      opacity: 0.3,
      rotate: { angle: -45, origin: { x: width / 2, y: height / 2 } }
    });
    
    // Add footer watermark
    page.drawText(watermarkText, {
      x: 50,
      y: 30,
      size: 8,
      color: rgb(0.5, 0.5, 0.5),
      opacity: 0.5
    });
  }
  
  return await pdfDoc.save();
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Days 1-2)

**Day 1: Project Setup & Database**
- [ ] Initialize Next.js project with TypeScript
- [ ] Setup Tailwind CSS and shadcn/ui
- [ ] Configure Supabase project
- [ ] Create database schema
- [ ] Setup RLS policies
- [ ] Configure environment variables
- [ ] Setup Git repository

**Day 2: Authentication & Core Layout**
- [ ] Implement Supabase Auth
- [ ] Create signup/login pages
- [ ] Build main layout with sidebar navigation
- [ ] Create protected route wrapper
- [ ] Implement user profile management
- [ ] Setup middleware for authentication

### Phase 2: Core Features (Days 3-5)

**Day 3: Materials Library**
- [ ] Build materials upload interface (admin)
- [ ] Create materials browsing page
- [ ] Implement search and filters
- [ ] Setup file storage in Supabase
- [ ] Create material detail page
- [ ] Implement view-only PDF renderer

**Day 4: CGPA Calculator**
- [ ] Build semester input form
- [ ] Implement GPA calculation logic
- [ ] Create results display
- [ ] Add semester management (add/edit/delete)
- [ ] Implement cumulative GPA calculation
- [ ] Add export functionality (PDF/Excel)

**Day 5: Vendor Marketplace**
- [ ] Create vendor registration form
- [ ] Build vendor listing page
- [ ] Implement vendor categories
- [ ] Create vendor detail page
- [ ] Add vendor search and filters
- [ ] Implement contact tracking

### Phase 3: Monetization & Admin (Days 6-7)

**Day 6: Payment Integration**
- [ ] Setup Paystack integration
- [ ] Implement payment initialization
- [ ] Create payment verification endpoint
- [ ] Setup webhook handling
- [ ] Build subscription management
- [ ] Create payment history page

**Day 7: Admin Dashboard & Polish**
- [ ] Build admin dashboard
- [ ] Implement material approval workflow
- [ ] Create vendor approval system
- [ ] Add basic analytics
- [ ] Implement announcements system
- [ ] Final testing and bug fixes
- [ ] Deploy to Vercel

### Post-Launch Improvements

**Week 2-4:**
- Email notifications
- Advanced analytics
- Mobile app (React Native)
- Vendor ratings and reviews
- Advanced search with filters
- Material recommendations

**Month 2-3:**
- Discussion forums
- Study groups
- Live chat support
- API for third-party integrations
- Advanced admin tools
- Performance optimizations

---

## Development Guidelines

### Code Organization

```
project-root/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── materials/
│   │   ├── cgpa/
│   │   ├── vendors/
│   │   └── profile/
│   ├── (admin)/
│   │   ├── dashboard/
│   │   ├── materials/
│   │   └── vendors/
│   ├── api/
│   │   ├── auth/
│   │   ├── materials/
│   │   ├── cgpa/
│   │   ├── vendors/
│   │   └── payments/
│   └── layout.tsx
├── components/
│   ├── ui/ (shadcn components)
│   ├── materials/
│   ├── cgpa/
│   ├── vendors/
│   ├── layout/
│   └── common/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── database.types.ts
│   ├── paystack/
│   ├── utils/
│   └── constants/
├── hooks/
├── types/
├── styles/
└── public/
```

### Naming Conventions

```typescript
// Files: kebab-case
material-card.tsx
user-profile-form.tsx

// Components: PascalCase
MaterialCard
UserProfileForm

// Functions: camelCase
getMaterials()
calculateGPA()

// Constants: UPPER_SNAKE_CASE
MAX_FILE_SIZE
DAILY_DOWNLOAD_LIMIT

// Types/Interfaces: PascalCase
interface Material { }
type UserRole = 'admin' | 'student';
```

### Best Practices

1. **Type Safety**
   ```typescript
   // Generate types from Supabase
   npm run generate-types
   
   // Use strict TypeScript config
   {
     "strict": true,
     "noUncheckedIndexedAccess": true,
     "noImplicitAny": true
   }
   ```

2. **Error Handling**
   ```typescript
   // Create custom error classes
   class MaterialNotFoundError extends Error {
     constructor(materialId: string) {
       super(`Material ${materialId} not found`);
       this.name = 'MaterialNotFoundError';
     }
   }
   
   // Use try-catch with proper logging
   try {
     const material = await getMaterial(id);
   } catch (error) {
     logger.error('Failed to fetch material', { materialId: id, error });
     throw new MaterialNotFoundError(id);
   }
   ```

3. **Performance**
   - Use React Server Components by default
   - Implement pagination for lists
   - Use Supabase edge functions for heavy operations
   - Optimize images with Next.js Image component
   - Implement skeleton loading states

4. **Testing**
   ```bash
   # Unit tests: Vitest
   # E2E tests: Playwright
   # API tests: Supertest
   
   npm run test
   npm run test:e2e
   ```

5. **Environment Variables**
   ```bash
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   PAYSTACK_SECRET_KEY=
   PAYSTACK_PUBLIC_KEY=
   NEXT_PUBLIC_APP_URL=
   ```

---

## Monitoring & Analytics

### Key Metrics to Track

```typescript
interface PlatformMetrics {
  // User Engagement
  dau: number; // Daily Active Users
  mau: number; // Monthly Active Users
  retention: {
    day1: number;
    day7: number;
    day30: number;
  };
  
  // Content Metrics
  materials: {
    total: number;
    uploaded_this_week: number;
    most_downloaded: Material[];
    avg_downloads_per_material: number;
  };
  
  // Financial Metrics
  revenue: {
    total: number;
    this_month: number;
    conversion_rate: number;
    churn_rate: number;
  };
  
  // Performance
  page_load_times: {
    p50: number;
    p95: number;
    p99: number;
  };
  error_rate: number;
  uptime: number;
}
```

### Analytics Implementation

```typescript
// lib/analytics.ts
import mixpanel from 'mixpanel-browser';

export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    mixpanel.track(event, properties);
  },
  
  identify: (userId: string, traits?: Record<string, any>) => {
    mixpanel.identify(userId);
    if (traits) mixpanel.people.set(traits);
  },
  
  page: (pageName: string) => {
    mixpanel.track('Page View', { page: pageName });
  }
};

// Usage
analytics.track('Material Downloaded', {
  material_id: 'xxx',
  course_code: 'ENG101',
  level: 200
});
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies tested
- [ ] Payment integration tested
- [ ] Error tracking setup (Sentry)
- [ ] Analytics configured
- [ ] Domain configured
- [ ] SSL certificate setup

### Post-Deployment
- [ ] Smoke tests on production
- [ ] Monitor error rates
- [ ] Check payment flow
- [ ] Verify email delivery
- [ ] Test file uploads
- [ ] Monitor performance metrics
- [ ] Setup backup strategy
- [ ] Document API endpoints
- [ ] Create user documentation

---

## Cost Projection

### Initial Phase (Month 1-3)
```
Supabase Free Tier: $0
Vercel Free Tier: $0
Domain: ~$10/year
Email Service: $0 (free tier)
Paystack: 1.5% + ₦100 per transaction

Total: ~$0-10/month
```

### Growth Phase (100+ active users)
```
Supabase Pro: $25/month
Vercel Pro: $20/month
Cloudflare R2: ~$5/month
Email Service: ~$10/month
Monitoring: $10/month

Total: ~$70/month
```

### Revenue Projection
```
Assuming 200 students x ₦400/semester x 2 semesters
= ₦160,000/year (~$100/month at current rates)
- Platform costs: $70/month
- Net: $30/month profit
```

**Note**: Revenue increases significantly with departmental sponsorship or higher adoption rates.

---

## Conclusion

This architecture provides a solid, scalable foundation for the Engineering Department Platform. The tech stack is modern, well-supported, and optimized for rapid development while maintaining security and performance standards.

Key success factors:
1. **Simplicity**: Start with core features, iterate based on feedback
2. **Security**: Protect student data and materials from day one
3. **Performance**: Fast load times and smooth UX
4. **Sustainability**: Ethical monetization that covers costs
5. **Scalability**: Architecture that can grow with adoption

Next steps: Begin Phase 1 implementation following the 7-day roadmap.
