export interface UploadFormProps {
  courses: Array<{
    id: string;
    course_code: string;
    course_title: string;
    level: number;
    semester: number;
  }>;
}

export type UploadFormValues = {
  file: FileList;
  courseId: string;
  title: string;
  type: string;
  description?: string;
  isPremium: boolean;
};

export interface PDFViewerProps {
  materialId: string;
  fileName: string;
}

export interface PDFViewerWrapperProps {
  materialId: string;
  fileName: string;
}

export interface Material {
  id: string;
  title: string;
  type: string;
  file_name: string;
  file_size_bytes: number | null;
  is_premium: boolean;
  view_count: number;
  download_count: number;
  created_at: string;
  courses: {
    course_code: string;
    course_title: string;
    level: number;
    semester: number;
  } | null;
}

export interface MaterialsContentProps {
  materials: Material[];
  profile: any;
}

export interface MaterialCardProps {
  material: Material;
  hasActiveSubscription: boolean;
}
