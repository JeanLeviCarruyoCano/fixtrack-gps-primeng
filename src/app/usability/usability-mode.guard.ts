import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UsabilityTrackingService } from './usability-tracking.service';

export const usabilityModeGuard: CanActivateFn = () => {
  const service = inject(UsabilityTrackingService);
  return service.enabled() ? true : inject(Router).createUrlTree(['/home']);
};
