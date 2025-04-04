import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuariosService } from 'src/app/shared/service/usuarios.service';

@Component({
  selector: 'app-codigo-otp',
  templateUrl: './codigo-otp.component.html',
  styleUrls: ['./codigo-otp.component.scss']
})
export class CodigoOtpComponent {

  otpForm: FormGroup;
  isOtpValid: boolean = true;
  isLoading: boolean = false;
  selectedMethod: 'sms' | 'email' | 'whatsapp' | null = null;
  countdown: number = 30;
  interval: any;


  // private usuariosService: UsuariosService = inject(UsuariosService);

  constructor(private fb: FormBuilder, private router: Router, private usuariosService: UsuariosService) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^[0-9]{4,6}$/)]]
    });
  }

  ngOnInit(): void {}

  selectMethod(method: 'sms' | 'email' | 'whatsapp'): void {
    if (!this.selectedMethod) {
      this.selectedMethod = method;
      this.startCountdown();
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

  validateOtp(): void {
    console.log('Validando código OTP...');
    if (this.otpForm.valid) {
      console.log('Código OTP válido');
      this.isLoading = true;

      // Obtener la cédula desde localStorage
      const datosBasicos = localStorage.getItem('datosBasicos');
      const parsedData = datosBasicos ? JSON.parse(datosBasicos) : null;
      const cedula = parsedData?.document;

      if (cedula) {
        const payload = { Cedula: cedula };

        //  // Cambiar 
        // this.usuariosService.consultarCedula(payload).subscribe({
        //   next: (response) => {
        //     console.log('Respuesta del servicio:', response);
        //     this.router.navigate(['/registro/aprobacion-credito']);
        //     this.isLoading = false;
        //   },
        //   error: (error) => {
        //     console.error('Error al validar la cédula:', error);
        //     this.isLoading = false;
        //   }
        // });
        
      } else {
        console.error('No se encontró la cédula en localStorage');
        this.isLoading = false;
      }

    } else {
      this.isOtpValid = false;
    }
  }


  resendOtp(): void {
    console.log('Reenviando código OTP...');
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 1500);
  }
}
