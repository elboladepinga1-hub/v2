import { PackageType } from '../data/sessionsData';
import { EventPackageType } from '../data/eventsData';

export type ServiceType = 'portrait' | 'maternity' | 'events';

export interface ServiceOption {
  id: ServiceType;
  name: string;
  packages: (PackageType | EventPackageType)[];
}