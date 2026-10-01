import type { LucideIcon } from 'lucide-react';

export type AdminMaterialsTab = 'overview' | 'submissions' | 'library' | 'upload';

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export type SubmissionAction = 'approve' | 'reject';

export interface MaterialSubmitter {
  id: string;
  full_name: string | null;
  matric_number: string | null;
}

export interface ReferenceRow {
  id: string;
  name: string;
}

export interface MaterialSubmission {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  faculty_id: string | null;
  department_id: string | null;
  level: number | null;
  file_path: string | null;
  file_name: string | null;
  file_size: number | null;
  status: SubmissionStatus;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  submitter: MaterialSubmitter | null;
  faculty: ReferenceRow | null;
  department: ReferenceRow | null;
}

export interface AdminMaterialCourse {
  id: string;
  course_code: string;
  course_title: string;
  level: number | null;
  semester: number | null;
}

export interface AdminMaterial {
  id: string;
  course_id: string | null;
  title: string;
  type: string;
  description: string | null;
  file_path: string;
  file_size_bytes: number | null;
  file_name: string;
  uploaded_by: string | null;
  is_premium: boolean;
  view_count: number;
  download_count: number;
  is_approved: boolean;
  approved_at: string | null;
  created_at: string;
  course: AdminMaterialCourse | null;
  uploader: MaterialSubmitter | null;
}

export interface AdminMaterialsStats {
  pending_submissions: number;
  approved_submissions: number;
  rejected_submissions: number;
  published_materials: number;
  unpublished_materials: number;
  total_downloads: number;
}

export interface StatCardConfig extends TabTarget {
  key: keyof AdminMaterialsStats;
  label: string;
  icon: LucideIcon;
  className: string;
}

/** Where a control should send the user: a tab, optionally pre-filtered. */
export interface TabTarget {
  tab: AdminMaterialsTab;
  filter?: string;
}
