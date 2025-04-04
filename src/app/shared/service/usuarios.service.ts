import { Injectable } from '@angular/core';
import { CoreService } from '../core.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Usuario } from '../interfaces/usuarios';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UsuariosService extends CoreService  {

  constructor(
    protected override http: HttpClient
) { 
    super(http);
}

consultarCedula(jsonData: any): Observable<any> {
  return this.post<any>('/AsignarCupo',jsonData);
}

validarUsuario(body: any): Observable<any> {
  return this.post('/ValidacionIdentidadExpedicion', body); 
}

addEstudioCredito(body: any): Observable<any> {
  return this.post('/AddEstudioCredito', body); 
}






}
