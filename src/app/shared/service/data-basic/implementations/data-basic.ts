// core/services/data-basic/implementations/data-basic-impl.service.ts
import { Injectable, inject } from '@angular/core';
import { BasicDataPayload, CreditResponse, IDataBasic, StudyRequestPayload } from '../interfaces/data-basic.interface';
import { UsuariosService } from 'src/app/shared/service/usuarios.service';
import { firstValueFrom } from 'rxjs';
import { LogService } from '../../logs/logs.service';
import { LogPayload } from '../../logs/interfaces/ilog-application.interface';
import * as CryptoJS from 'crypto-js';


@Injectable({ providedIn: 'root' })

export class DataBasicImplementation implements IDataBasic{

  private usuariosService = inject(UsuariosService);
  
  private logService = inject(LogService); // Inyección directa


  saveFormDataLocalStorage(payload: BasicDataPayload): void {

    localStorage.setItem('datosBasicos', JSON.stringify(payload));

    console.log('Datos del formulario:', payload);

  }

  async ValidarEstadoEstudioCredito(document: string): Promise<CreditResponse> {
    const estudioCredito = { IdCliente: document };

    try {
      const response = await firstValueFrom(
        this.usuariosService.ValidarEstadoEstudioCredito(estudioCredito)
      );

      await this.logService.addLog({
        Id: '',
        IdUsuario: document,
        FechaTransaccion: new Date().toISOString(),
        NombreOperacion: 'Validación Estado Crédito',
        Payload: JSON.stringify(estudioCredito),
        ServiceResponse: JSON.stringify(response)
      });

      return response;

    } catch (error) {
      const logPayload: LogPayload = {
        Id: '',
        IdUsuario: document,
        FechaTransaccion: new Date().toISOString(),
        NombreOperacion: 'Validación Estado Crédito - Error',
        Payload: JSON.stringify(estudioCredito),
        ServiceResponse: JSON.stringify({ error: error?.message || 'Error desconocido' })
      };

      await this.logService.addLog(logPayload);

      return {
        isSuccess: false,
        message: error?.error?.message ?? 'Error al registrar estudio de crédito'
      };
    }
  }

   async ValidarEstadoCelular(Celular: string): Promise<CreditResponse> {
    const estudioCredito = { Celular: Celular };

    try {
      const response = await firstValueFrom(
        this.usuariosService.ValidarEstadoCelular(estudioCredito)
      );

      await this.logService.addLog({
        Id: '',
        IdUsuario: Celular,
        FechaTransaccion: new Date().toISOString(),
        NombreOperacion: 'Validación Estado Crédito',
        Payload: JSON.stringify(estudioCredito),
        ServiceResponse: JSON.stringify(response)
      });

      return response;

    } catch (error) {
      const logPayload: LogPayload = {
        Id: '',
        IdUsuario: Celular,
        FechaTransaccion: new Date().toISOString(),
        NombreOperacion: 'Validación Estado Crédito - Error',
        Payload: JSON.stringify(estudioCredito),
        ServiceResponse: JSON.stringify({ error: error?.message || 'Error desconocido' })
      };

      await this.logService.addLog(logPayload);

      return {
        isSuccess: false,
        message: error?.error?.message ?? 'Error al registrar estudio de crédito'
      };
    }
  }


  
  async saveEstudioCredito(payload: StudyRequestPayload): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.usuariosService.addEstudioCredito(payload));

      await this.logService.addLog({
        Id: '',
        IdUsuario: payload.Datos.IdCliente,
        FechaTransaccion: new Date().toISOString(),
        NombreOperacion: 'Registro Estudio Crédito',
        Payload: JSON.stringify(payload),
        ServiceResponse: JSON.stringify(response)
      });

      return response?.isSuccess ?? false;

    } catch (error) {
      await this.logService.addLog({
        Id: '',
        IdUsuario: payload.Datos.IdCliente,
        FechaTransaccion: new Date().toISOString(),
        NombreOperacion: 'Registro Estudio Crédito - Error',
        Payload: JSON.stringify(payload),
        ServiceResponse: JSON.stringify({ error: error?.message || 'Error desconocido' })
      });

      return false;
    }
  }

    async checkExistingCreditProcess(document: string): Promise<{ hasActiveProcess: boolean }> {

      return { hasActiveProcess: false };

    }

 encryptIP(ip: string): string {
  const secretKey = 'e7f38513de0a34081ffe32bfc5b7b0e5';
  const key = CryptoJS.enc.Utf8.parse(secretKey.padEnd(32, ' ')); // 32 bytes
  const iv = CryptoJS.enc.Utf8.parse('0000000000000000'); // 16 bytes

  const encrypted = CryptoJS.AES.encrypt(ip, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const base64CipherText = CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
  return base64CipherText;
  
}

}