import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";
import { CoreAuthService } from "./auth.service";
import { inject } from "@angular/core";

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const router = inject(Router)
  const authService = inject(CoreAuthService)
  if (!authService.isLoggedIn()) {
    router.navigate(['/login'])
    return false
  } else {
    return true
  }
}
