import { Injectable, inject } from '@angular/core';
import { UsuariosService } from 'src/app/shared/service/usuarios.service';
import { LogService } from '../../logs/logs.service';
import { Router } from '@angular/router';
import { SecurityQuestionService } from 'src/app/shared/service/security-question/security-question.service';
import { ActionMessageService } from 'src/app/shared/service/alerts/sweetalert/action-message.service';
import { LoaderService } from 'src/app/shared/service/loader/loader.service';
import { IdentityValidationsService } from '../identity-validations.service';
import { ERROR_MESSAGE } from 'src/app/components/registro-datos/codigo-otp/constants/codigo-otp.constants';
import { IIdentityValidations } from '../interfaces/identity-validations.interfaces';
import { FlowService } from '../../flow/flow.service';
import { UserSessionService } from '../../user-session.service';

@Injectable({ providedIn: 'root' })
export class IdentityValidationsImplementation implements IIdentityValidations  {

  private usuariosService = inject(UsuariosService);

  private logService = inject(LogService);

  private router = inject(Router);

  private loaderService = inject(LoaderService);

  private actionMessageService = inject(ActionMessageService);

  private securityQuestionService = inject(SecurityQuestionService);

  private flowService: FlowService = inject(FlowService);

  private userSessionService: UserSessionService = inject(UserSessionService);


  private idvRiskMap: Record<string, 'Low' | 'Medium' | 'High' | 'Error'> = {
    'IDV01': 'Error',
    'IDV02': 'Error',
    'IDV03': 'Error',
    'IDV04': 'High',
    'IDV05': 'High',
    'IDV08': 'Medium',
    'IDV11': 'Low'
  };

  enviarCodigoOtp(method: 'sms' | 'email' | 'whatsapp'): void {

    const datosBasicos = this.userSessionService.getDatosBasicos();

    console.log('datosBasicos:', datosBasicos);
    
    if (datosBasicos?.document && datosBasicos?.cellular) {

      const payload = { IdCliente: datosBasicos.document, Celular: datosBasicos.cellular };

      this.usuariosService.enviarCodigoOtp(payload).subscribe({

        next: async () => {
          await this.logService.addLog({
            Id: '', IdUsuario: datosBasicos.document,
            FechaTransaccion: new Date().toISOString(),
            NombreOperacion: `Envío OTP (${method.toUpperCase()})`,
            Payload: JSON.stringify(payload),
            ServiceResponse: JSON.stringify({ status: 'OTP enviado correctamente' })
          });
        },
        error: async (err) => {
          await this.logService.addLog({
            Id: '', IdUsuario: datosBasicos.document,
            FechaTransaccion: new Date().toISOString(),
            NombreOperacion: `Envío OTP (${method.toUpperCase()}) - Error`,
            Payload: JSON.stringify(payload),
            ServiceResponse: JSON.stringify({ error: err?.message || 'Error desconocido' })
          });
        }
      });
    }
  }

  async validarCodigoOtp(code: string): Promise<boolean> {
    const datos = this.userSessionService.getDatosBasicos();
    const payload = { IdCliente: datos.document, Celular: datos.cellular, OTP: code };

    try {
      const response = await this.usuariosService.validarCodigoOtp(payload).toPromise();

      await this.logService.addLog({
        Id: '', IdUsuario: datos.document,
        FechaTransaccion: new Date().toISOString(),
        NombreOperacion: 'Validación OTP',
        Payload: JSON.stringify(payload),
        ServiceResponse: JSON.stringify(response)
      });

      if (response?.isSuccess) {

        const idvPayload = this.construirPayloadIdv();

        this.usuariosService.getRiesgo(idvPayload).subscribe({
          

          next: async (riesgo) => {

            console.log('riesgo:', riesgo);

            await this.logService.addLog({
              Id: '', IdUsuario: datos.document,
              FechaTransaccion: new Date().toISOString(),
              NombreOperacion: 'Evaluación Riesgo IDV',
              Payload: JSON.stringify(idvPayload),
              ServiceResponse: JSON.stringify(riesgo)
            });

            await this.handleIdvRisk(riesgo);

          },
          error: async (err) => {
            this.actionMessageService.onCallMessage(ERROR_MESSAGE);

            console.log('entro al error:', err);
            await this.logService.addLog({
              Id: '', IdUsuario: datos.document,
              FechaTransaccion: new Date().toISOString(),
              NombreOperacion: 'Evaluación Riesgo IDV - Error',
              Payload: JSON.stringify(idvPayload),
              ServiceResponse: JSON.stringify({ error: err?.message || 'Error desconocido' })
            });
          }
        });
        
        return true;
      } else {
        return false;
      }
    } catch (err) {
      await this.logService.addLog({
        Id: '', IdUsuario: datos.document || 'N/A',
        FechaTransaccion: new Date().toISOString(),
        NombreOperacion: 'Error Validación OTP',
        Payload: JSON.stringify(payload),
        ServiceResponse: JSON.stringify({ error: err?.message || 'Error desconocido' })
      });
      return false;
    }
  }

  construirPayloadIdv(): any {
    const datosBasicos = this.userSessionService.getDatosBasicos();
    console.log('docuemto antes:', datosBasicos.documentExpedition);
  
    if (!datosBasicos) {
      console.error('No hay datos válidos en localStorage');
      return null;
    }
  
    const payload = {
      RequestInfo: {
        SolutionSetId: '539',
        ExecuteLatestVersion: true
      },
      Fields: {
        Applicants_IO: {
          Applicant: {
            ApplicantLastName1: datosBasicos.lastName,
            Identifiers: {
              Identifier: [
                {
                  IdExpeditionDate: this.formatearFecha(datosBasicos.documentExpedition),
                  IdNumber: datosBasicos.document,
                  IdType: "1"  
                }
              ]
            },
            Telephones: {
              Telephone: [
                {
                  TelephoneNumber: datosBasicos.cellular
                }
              ]
            },
            IDVMatchingLogic: {
              MatchLogic: [
                {
                  Name: "LowRisk",
                  MatchFields: "IdType, IdNumber, IdExpeditionDate, TelephoneNumber,ApplicantLastName1",
                  RiskLevel: "Low"
                },
                {
                  Name: "MediumRisk",
                  MatchFields: "IdType, IdNumber, IdExpeditionDate,ApplicantLastName1",
                  RiskLevel: "Medium"
                },
                {
                  Name: "HighRiskLastName",
                  MatchFields: "ApplicantLastName1",
                  RiskLevel: "High"
                },
                {
                  Name: "HighRiskExpeditionDate",
                  MatchFields: "IdExpeditionDate",
                  RiskLevel: "High"
                },
                {
                  Name: "HighRiskIdNumber",
                  MatchFields: "IdNumber",
                  RiskLevel: "High"
                },
                {
                  Name: "HighRiskIdType",
                  MatchFields: "IdType",
                  RiskLevel: "High"
                }
              ]
            }
          }
        },
        ApplicationData_IO: {
          RequestMode: "Flex",
          Attributes: {
            SkipDSUbicaOnlyFlag: "False"
          },
          Services: {
            Service: [
              {
                Seq: 1,
                Name: "VelocityCheck",
                Consent: "Y",
                Active: "Y",
                EndOnApiFailure: "Y",
                EndOnPolicyFailure: "Y"
              },
              {
                Seq: 2,
                Name: "IDV",
                Consent: "Y",
                Active: "Y",
                EndOnApiFailure: "Y",
                EndOnPolicyFailure: "Y"
              }
            ]
          }
        }
      }
    };
  
    return payload;
  }

 async handleIdvRisk(response: any): Promise<void> {

    console.log('Respuesta IDV:', JSON.stringify(response));
  
    const code = response.result;

    console.log('Código IDV:', code);
  
    if (!code) {

      this.loaderService.hide();

      await this.actionMessageService.onCallMessage(ERROR_MESSAGE);

      return;
    }
  
    const riskLevel = this.idvRiskMap[code];

    console.log('Riesgo IDV:', riskLevel);
  
    switch (riskLevel) {

      case 'Low':

        this.flowService.navigateToStep('aprobacion');

      break;
  
      case 'Medium':

        this.loaderService.hide();

        const passed = await this.securityQuestionService.showSecurityQuestionsModal();

        if (passed) {

            const currentPath = this.router.url;
      
            this.flowService.goToNext(currentPath);

        } else {

          this.flowService.navigateToStep('identity-denied');  

        }
        break;
  
      case 'High':

        this.loaderService.hide();

        this.flowService.navigateToStep('identity-denied'); 

        break;
  
      case 'Error':

        console.error('Error en verificación IDV.');

        break;
  
      default:

        console.warn('Riesgo desconocido.');
        
        break;
    }
  }


formatearFecha(fechaISO: string): string {
    console.log('fechaISO antes:', fechaISO);
    const parts = fechaISO.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10); // Mes 1-12
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month - 1, day);
      const formattedDay = String(date.getDate()).padStart(2, '0');
      const formattedMonth = String(date.getMonth() + 1).padStart(2, '0'); // Sumar 1 para mostrar
      const formattedYear = date.getFullYear();
      const fechaFormateada = `${formattedDay}/${formattedMonth}/${formattedYear}`;
      console.log('fechaISO despues (local):', fechaFormateada);
      return fechaFormateada;
    } else {
      console.error('Formato de fechaISO inválido:', fechaISO);
      return fechaISO; 
    }
  }
}