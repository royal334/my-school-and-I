export interface VendorCategory {
  id: string;
  name: string;
  services: string[];
}

export interface VendorServiceOption {
  key: string;
  value: string;
  label: string;
}

export function getVendorServiceOptions(services: unknown): VendorServiceOption[] {
  if (!Array.isArray(services)) return [];

  return services.flatMap((service, index) => {
    if (typeof service === 'string' && service.length > 0) {
      return [{ key: `${service}-${index}`, value: service, label: service }];
    }

    if (typeof service !== 'object' || service === null || !('label' in service)) {
      return [];
    }

    const label = service.label;
    if (typeof label !== 'string' || label.length === 0) return [];

    const id = 'id' in service && typeof service.id === 'string'
      ? service.id
      : label;

    return [{ key: `${id}-${index}`, value: label, label }];
  });
}
