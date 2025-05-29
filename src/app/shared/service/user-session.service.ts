import { Injectable } from '@angular/core';
import { DatosBasicosModel } from './data-basic/interfaces/data-basic.interface';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserSessionService  {

 private readonly STORAGE_KEY = 'datosBasicos';
  private datosBasicos$ = new BehaviorSubject<DatosBasicosModel | null>(this.loadFromStorage());

  private loadFromStorage(): DatosBasicosModel | null {
    const stored = sessionStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  setDatosBasicos(datos: DatosBasicosModel): void {
    this.datosBasicos$.next(datos);
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(datos));
  }

  getDatosBasicos(): DatosBasicosModel | null {
    return this.datosBasicos$.value;
  }

  observeDatosBasicos() {
    return this.datosBasicos$.asObservable();
  }

  clear(): void {
    this.datosBasicos$.next(null);
    sessionStorage.removeItem(this.STORAGE_KEY);
  }
}
