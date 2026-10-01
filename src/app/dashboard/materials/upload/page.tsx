import { redirect } from 'next/navigation';

// Material uploads moved into the admin area alongside review and the library.
export default function UploadMaterialPage() {
  redirect('/admin/materials?tab=upload');
}
