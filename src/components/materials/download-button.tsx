"use client"
import { Button } from '../ui/button'
import { Download } from 'lucide-react'
import { usePostHogAnalytics } from '@/hooks/posthog-events';
import { POSTHOG_EVENTS } from '@/utils/constants/constants';

type Props = {
  material: {
    id?: string;
    title?: string;
    type?: string;
  };
};

export default function MaterialsDownloadButton({ material }: Props) {

     const { track } = usePostHogAnalytics()

     const handleDownloadMaterialEvent = () => {
          track(POSTHOG_EVENTS.materialDownloaded, {
               material_id: material.id,
               material_title: material.title,
               material_type: material.type,
    });
  }

    if (!material.id) {
    return null;
  }
     return<Button asChild variant="outline" size="sm" className="gap-2" onClick={handleDownloadMaterialEvent}>
          <a href={`/api/materials/${material.id}/download`} download>
          <Download className="h-4 w-4" />
          Download
          </a>
     </Button>
}