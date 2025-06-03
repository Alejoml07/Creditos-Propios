import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoaderService } from 'src/app/shared/service/loader/loader.service';
import { UsuariosService } from 'src/app/shared/service/usuarios.service';
import { LogService } from 'src/app/shared/service/logs/logs.service';
import { IdentityValidationsService } from 'src/app/shared/service/Identity-validations/identity-validations.service';
import { SecurityService } from 'src/app/shared/service/security.service';
import { FlowService } from 'src/app/shared/service/flow/flow.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-codigo-otp',
  templateUrl: './codigo-otp.component.html',
  styleUrls: ['./codigo-otp.component.scss'],
  standalone: false
})
export class CodigoOtpComponent {

  otpForm: FormGroup;
  isOtpValid: boolean = true;
  isLoading: boolean = false;
  selectedMethod: 'sms' | 'email' | 'whatsapp' | null = null;
  countdown: number = 30;
  interval: any;

  loaderService: LoaderService = inject(LoaderService);

  logService: LogService = inject(LogService);

  private identityService: IdentityValidationsService = inject(IdentityValidationsService);
    securityService: SecurityService = inject(SecurityService);
      flowService: FlowService = inject(FlowService);
    
  


  constructor(

    private formBuilder: FormBuilder,


  ) {

    this.otpForm = this.formBuilder.group({

      otp: ['', [Validators.required, Validators.pattern(/^[0-9]{4,6}$/)]]

    });

  }

  ngOnInit(): void {

    console.log('Iniciando el componente de OTP');

    this.securityService.getFlujoById(1)
    
        .pipe(map(response => response.result))
    
        .subscribe(result => {
    
          console.log('Flujo obtenido:', result);
    
          this.flowService.setBackendFlow(result);
    
      });

    this.flowService.markStepCompleted('codigo-otp');

      history.pushState(null, '', location.href);
      window.onpopstate = () => {
        history.go(1); // Evita retroceso
      };
        

    this.selectMethod('whatsapp');

  }

  selectMethod(method: 'sms' | 'email' | 'whatsapp'): void {

    if (!this.selectedMethod) {

      this.selectedMethod = method;

      this.startCountdown();

      this.identityService.enviarCodigoOtp(method);
    }

  }

  startCountdown(): void {

    this.interval = setInterval(() => {

      if (this.countdown > 0) {

        this.countdown--;

      } else {

        clearInterval(this.interval);

        this.selectedMethod = null;

      }
    }, 1000);
  }

  async validateOtp(): Promise<void> {

    console.log('Validando código OTP...');

    if (!this.otpForm.valid) {

      this.isOtpValid = false;

      return;
    }

    const otp = this.otpForm.get('otp')?.value;

    const isValid = await this.identityService.validarCodigoOtp(otp);

    this.isOtpValid = isValid;


    if (!isValid) {

      console.warn('OTP inválido');

    }
  }

}
