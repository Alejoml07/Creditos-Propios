import { inject, Injectable } from '@angular/core';
import { IdentityValidationsImplementation } from './implementations/identity-validations';
import { IdvPayload, IdvRiskResponse, IIdentityValidations } from './interfaces/identity-validations.interfaces';

@Injectable({
  providedIn: 'root'
})
export class IdentityValidationsService {

private identityImpl: IdentityValidationsImplementation = inject(IdentityValidationsImplementation);

  private identityValidations: IIdentityValidations;

  constructor() {

    this.identityValidations = this.identityImpl;

  }

  public enviarCodigoOtp(method: 'sms' | 'email' | 'whatsapp'): void {

    this.identityValidations.enviarCodigoOtp(method);

  }

  public validarCodigoOtp(code: string): Promise<boolean> {

    return this.identityValidations.validarCodigoOtp(code);

  }

  public construirPayloadIdv(): IdvPayload | null {

    return this.identityValidations.construirPayloadIdv();

  }

  public handleIdvRisk(response: IdvRiskResponse): Promise<void> {

    return this.identityValidations.handleIdvRisk(response);

  }

  public formatearFecha(fechaISO: string): string {

    return this.identityValidations.formatearFecha(fechaISO);

  }

}
