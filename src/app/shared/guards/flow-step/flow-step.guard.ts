import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router';
import { FlowService } from '../../service/flow/flow.service';

@Injectable({ providedIn: 'root' })
export class FlowStepGuard implements CanActivate {

  constructor(
    private flowService: FlowService,
    private router: Router
  ) {}

 canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
  const requestedUrl = state.url;
  const flow = this.flowService.getFlow();

  console.log('requestedUrl:', requestedUrl);
  console.log('flow guard:', flow);

  if (!flow || flow.length === 0) {
    console.warn('❌ El flujo no está cargado. Redirigiendo al inicio...');
    this.router.navigate(['/registro/datos-basicos']);
    return false;
  }

  const requestedIndex = flow.findIndex(step => requestedUrl.includes(step.path));
  const lastCompletedIndex = this.flowService.getLastCompletedStepIndex();

  if (requestedIndex === -1) {
    console.warn('❌ Ruta no encontrada en el flujo. Redirigiendo...');
    this.router.navigate(['/registro/datos-basicos']);
    return false;
  }

  if (requestedIndex > lastCompletedIndex + 1) {
    console.warn('❌ Intentando adelantar pasos no completados');
    const nextAllowedPath = flow[lastCompletedIndex + 1]?.path ?? 'datos-basicos';
    this.router.navigate(['/registro', nextAllowedPath]);
    return false;
  }

  if (requestedIndex < lastCompletedIndex) {
    console.warn('❌ No puedes retroceder pasos ya completados');
    const currentPath = flow[lastCompletedIndex].path;
    this.router.navigate(['/registro', currentPath]);
    return false;
  }

  return true;
}
}
