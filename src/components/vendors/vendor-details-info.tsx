import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";

interface VendorDetailsInfoProps {
  vendor: any;
}

export default function VendorDetailsInfo({ vendor }: VendorDetailsInfoProps) {
  return (
    <div className="space-y-4">
      {/* Description */}
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
        {vendor.description}
      </p>

      {/* Services */}
      <div>
        <h6 className="mb-3">Services Offered</h6>
        <div className="flex flex-wrap gap-2">
          {vendor.services.map((service: string, index: number) => (
            <Badge key={index} variant="secondary" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {service}
            </Badge>
          ))}
        </div>
      </div>

      {/* Location & Hours */}
      <div className="space-y-2 text-sm border-t pt-4 dark:border-slate-800">
        {vendor.location && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{vendor.location}</span>
          </div>
        )}
        {vendor.operating_hours && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{vendor.operating_hours}</span>
          </div>
        )}
      </div>
    </div>
  );
}
