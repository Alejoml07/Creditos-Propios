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
import Swal from 'sweetalert2';

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

    this.mostrarAlertaValidacionIdentidad();
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

      Swal.close();

      await this.actionMessageService.onCallMessage(ERROR_MESSAGE);

      return;
    }
  
    const riskLevel = this.idvRiskMap[code];

    console.log('Riesgo IDV:', riskLevel);
  
    switch (riskLevel) {

      case 'Low':

        Swal.close();

        this.flowService.navigateToStep('aprobacion');

      break;
  
      case 'Medium':

        Swal.close();

        const passed = await this.securityQuestionService.showSecurityQuestionsModal();

        if (passed) {

            const currentPath = this.router.url;
      
            this.flowService.goToNext(currentPath);

        } else {

          this.flowService.navigateToStep('identity-denied');  

        }
        break;
  
      case 'High':

        Swal.close();

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


  // Función para mostrar la alerta de validación de identidad
private mostrarAlertaValidacionIdentidad(): void {
  Swal.fire({
    title: '',
    html: `
      <style>
        .loading-container {
          text-align: center;
          padding: 20px 0;
        }
        
        .identity-scanner {
          position: relative;
          width: 140px;
          height: 140px;
          margin: 0 auto 25px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 50%;
          border: 3px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        .identity-icon {
          font-size: 45px;
          color: #64748b;
          z-index: 3;
          animation: identityFloat 2s ease-in-out infinite;
        }
        
        .identity-rings {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        
        .ring {
          position: absolute;
          border: 2px solid transparent;
          border-radius: 50%;
          animation: ringPulse 2s ease-in-out infinite;
        }
        
        .ring-1 {
          width: 60px;
          height: 60px;
          border-top: 2px solid #3b82f6;
          animation: ringRotate 3s linear infinite;
        }
        
        .ring-2 {
          width: 90px;
          height: 90px;
          border-right: 2px solid #1d4ed8;
          animation: ringRotate 2s linear infinite reverse;
        }
        
        .ring-3 {
          width: 120px;
          height: 120px;
          border-left: 2px solid #3b82f6;
          opacity: 0.6;
          animation: ringRotate 4s linear infinite;
        }
        
        .shield-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 20px;
          color: #3b82f6;
          z-index: 2;
          animation: shieldPulse 2s ease-in-out infinite;
        }
        
        .loading-title {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
          animation: titlePulse 2s ease-in-out infinite;
        }
        
        .loading-subtitle {
          font-size: 15px;
          color: #64748b;
          margin-bottom: 20px;
          font-weight: 500;
        }
        
        .progress-container {
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 15px;
        }
        
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #1d4ed8, #3b82f6);
          background-size: 200% 100%;
          border-radius: 10px;
          animation: progressFlow 1.5s ease-in-out infinite, progressGrow 4s ease-out infinite;
        }
        
        .loading-steps {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
          padding: 0 5px;
        }
        
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          opacity: 0.3;
          transition: all 0.5s ease;
        }
        
        .step.active {
          opacity: 1;
        }
        
        .step-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 5px;
          font-size: 14px;
          transition: all 0.5s ease;
        }
        
        .step.active .step-icon {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        
        .step-text {
          font-size: 10px;
          color: #64748b;
          font-weight: 500;
          text-align: center;
          max-width: 60px;
        }
        
        .security-badge {
          display: inline-flex;
          align-items: center;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 1px solid #bae6fd;
          border-radius: 20px;
          padding: 6px 12px;
          margin-top: 20px;
          font-size: 12px;
          color: #1e40af;
          font-weight: 600;
        }
        
        .security-icon {
          margin-right: 6px;
          font-size: 14px;
        }
        
        .tip-container {
          margin-top: 25px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 10px;
          border-left: 4px solid #3b82f6;
        }
        
        .tip-text {
          font-size: 13px;
          color: #1e40af;
          margin: 0;
          font-weight: 500;
        }
        
        @keyframes ringRotate {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        @keyframes ringPulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }
        
        @keyframes identityFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-4px) scale(1.05); }
        }
        
        @keyframes shieldPulse {
          0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }
        
        @keyframes titlePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes progressFlow {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        @keyframes progressGrow {
          0% { width: 0%; }
          60% { width: 75%; }
          100% { width: 100%; }
        }
        
        .swal2-popup {
          border-radius: 20px !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12) !important;
        }
      </style>
      
      <div class="loading-container">
        <div class="identity-scanner">
          <div class="identity-icon">🆔</div>
          <div class="identity-rings">
            <div class="ring ring-1"></div>
            <div class="ring ring-2"></div>
            <div class="ring ring-3"></div>
          </div>
          <div class="shield-overlay">🛡️</div>
        </div>
        
        <div class="loading-title">Verificando identidad</div>
        <div class="loading-subtitle">Procesando datos biométricos...</div>
        
        <div class="progress-container">
          <div class="progress-bar"></div>
        </div>
        
        <div class="loading-steps">
          <div class="step active" id="identity-step1">
            <div class="step-icon">🔍</div>
            <div class="step-text">Comparando</div>
          </div>
          <div class="step" id="identity-step2">
            <div class="step-icon">🧬</div>
            <div class="step-text">Analizando biometría</div>
          </div>
          <div class="step" id="identity-step3">
            <div class="step-icon">🔐</div>
            <div class="step-text">Verificando seguridad</div>
          </div>
          <div class="step" id="identity-step4">
            <div class="step-icon">✅</div>
            <div class="step-text">Confirmando</div>
          </div>
        </div>
        
        <div class="security-badge">
          <span class="security-icon">🔒</span>
          Validación segura en proceso
        </div>
        
        <div class="tip-container">
          <p class="tip-text">🔐 Tu información está protegida.</p>
        </div>
      </div>
    `,
    showConfirmButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    background: '#ffffff',
    width: '450px',
    padding: '25px',
    didOpen: () => {
      // Animación de pasos secuencial para identidad
      let currentStep = 1;
      const stepInterval = setInterval(() => {
        // Desactivar paso anterior
        if (currentStep > 1) {
          document.getElementById(`identity-step${currentStep - 1}`)?.classList.remove('active');
        }
        
        // Activar paso actual
        if (currentStep <= 4) {
          document.getElementById(`identity-step${currentStep}`)?.classList.add('active');
          currentStep++;
        } else {
          // Reiniciar ciclo
          document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
          currentStep = 1;
          document.getElementById('identity-step1')?.classList.add('active');
        }
      }, 1500);
      
      // Guardar el intervalo para poder limpiarlo después
      (window as any).loadingIdentityStepInterval = stepInterval;
    },
    willClose: () => {
      // Limpiar intervalo al cerrar
      if ((window as any).loadingIdentityStepInterval) {
        clearInterval((window as any).loadingIdentityStepInterval);
      }
    }
  });
}
}