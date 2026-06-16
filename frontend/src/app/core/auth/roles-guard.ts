import { inject } from "@angular/core"
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router"
import { CoreAuthService } from "./auth-session"

export const rolesGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const router = inject(Router)
  const authService = inject(CoreAuthService)
  const perfil = authService.getPerfil()
  if (!authService.isLoggedIn()) {
    router.navigate(['/login'])
    return false
  } else if (!route.data['roles'].includes(perfil)){
    router.navigate(['/home'])
    return false
  }
  return true
}
