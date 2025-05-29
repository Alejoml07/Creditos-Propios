
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { COMPONENT_MAP, FlowStep } from '../../config/flow.config';

@Injectable({ providedIn: 'root' })
export class FlowService {
  private flow: FlowStep[] = [];

  constructor(private router: Router) {}

  /**
   * Carga el flujo proveniente del backend, asignando el componente correspondiente a cada key.
   */
  setBackendFlow(backendFlow: { key: string; path: string }[]): void {
    this.flow = backendFlow.map(step => ({
      ...step,
      component: COMPONENT_MAP[step.key]
    }));
  }

  /**
   * Busca el índice actual del paso según la URL.
   */
  getCurrentIndexByPath(path: string): number {

    console.log('flow:', this.flow);

    return this.flow.findIndex(step => path.includes(step.path));
  }

  /**
   * Navega al siguiente paso en el flujo.
   */
  goToNext(currentPath: string): void {

    console.log('currentPath:', currentPath);

    const currentIndex = this.getCurrentIndexByPath(currentPath);

    const nextStep = this.flow[currentIndex + 1];

    console.log('nextStep:', nextStep);

    if (nextStep) {

      this.router.navigate(['/registro', nextStep.path]);

    } else {
      console.warn('[FlowService] No hay siguiente paso definido');
    }
  }

  /**
   * Navega al paso anterior.
   */
  goToPrevious(currentPath: string): void {
    const currentIndex = this.getCurrentIndexByPath(currentPath);
    const prevStep = this.flow[currentIndex - 1];
    if (prevStep) {
      this.router.navigate(['/registro', prevStep.path]);
    } else {
      console.warn('[FlowService] No hay paso anterior definido');
    }
  }

  /**
   * Reinicia el flujo desde el primer paso.
   */
  restart(): void {
    if (this.flow.length > 0) {
      this.router.navigate(['/registro', this.flow[0].path]);
    } else {
      console.warn('[FlowService] No hay flujo inicial cargado');
    }
  }

  /**
   * Permite saltar a un paso específico por su key, útil para condicionales.
   */
  navigateToStep(key: string): void {

    const step = this.flow.find(s => s.key === key);
    console.log('key:', key);
    console.log('flow:', this.flow);
    console.log('step:', step);

    if (step) {
      this.router.navigate(['/registro', step.path]);
    } else {
      console.warn(`[FlowService] No se encontró el paso con key '${key}'`);
    }
  }

  /**
   * Devuelve el flujo actual para inspección o debug.
   */
  getFlow(): FlowStep[] {
    return this.flow;
  }

  /**
 * Marca que se ha completado el paso actual.
 */
markStepCompleted(path: string): void {
  const index = this.getCurrentIndexByPath(path);
  if (index !== -1) {
    sessionStorage.setItem('lastStepIndex', index.toString());
    console.log(`✅ Paso "${path}" marcado como completado (índice: ${index})`);
  } else {
    console.warn(`⚠️ No se pudo marcar el paso "${path}" porque no se encontró en el flujo.`);
  }
}

/**
 * Devuelve el índice del último paso completado.
 */
getLastCompletedStepIndex(): number {
  const stored = sessionStorage.getItem('lastStepIndex');
  return stored ? parseInt(stored, 10) : -1;
}
}
