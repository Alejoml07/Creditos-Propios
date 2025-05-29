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

// consultarCedula(jsonData: any): Observable<any> {

//   return this.post<any>('/AsignarCupo',jsonData);

// }

consultarCedula(jsonData: any): Observable<any> {

  return this.post<any>('/Consulta360',jsonData);

}


validarUsuario(body: any): Observable<any> {

  return this.post('/ValidacionIdentidadExpedicion', body); 

}

addEstudioCredito(body: any): Observable<any> {

  return this.post('/AddEstudioCredito', body); 

}

ValidarEstadoEstudioCredito(body: any): Observable<any> {

  return this.post('/ValidarEstadoEstudioCredito', body); 
  
}


ValidarEstadoCelular(body: any): Observable<any> {

  return this.post('/ValidarCelularCliente', body); 
  
}


enviarCodigoOtp(data: { IdCliente: string; Celular: string }) {

  return this.post('/AddOTP', data);

}

validarCodigoOtp(data: { IdCliente: string; Celular: string; OTP: string }): Observable<any> {

  return this.post('/ValidarOTPYDevolverRiesgo', data);

}

getRiesgo(payload: any): Observable<any> {

  return this.post('/GetRiesgo', payload);

}


solicitudDocumentosLegales(payload: any): Observable<any> {

  return this.post('/SolicitudDocumentosLegales', payload);

}


getDocumentos(): Observable<any> {

  return this.get('/GetDocumentos');
  
}

guardarImagenUsuario(payload: { idCliente: string; faceImage?: string; documentImage?: string }): Observable<any> {
  return this.http.post('http://localhost:7298/api/CreditosPropios/SubirYGuardarImagenesUsuario', payload);
}



}
