import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuariosService } from 'src/app/shared/service/usuarios.service';

@Component({
  selector: 'app-datos-basicos',
  templateUrl: './datos-basicos.component.html',
  styleUrls: ['./datos-basicos.component.scss']
})
export class DatosBasicosComponent {
  myForm!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private  usuariosService: UsuariosService) {}

  ngOnInit(): void {
    const numericPattern = /^[0-9]*$/;
    const lettersOnlyPattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/; 


    this.myForm = this.fb.group({
      document: [
        '',
        [
          Validators.required,
          Validators.pattern(numericPattern),
          Validators.minLength(6), 
          Validators.maxLength(11)
        ]
      ],
      cellular: [
        '',
        [
          Validators.required,
          Validators.pattern(numericPattern),
          Validators.minLength(10),
          Validators.maxLength(10)
        ]
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.pattern(lettersOnlyPattern),
          Validators.minLength(2),
          Validators.maxLength(50)
        ]
      ],
      documentExpedition: ['', Validators.required],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(100)
        ]
      ],
      dataPolicy: [false, Validators.requiredTrue]

    });
  }

  isInvalid(field: string): boolean {
    const control = this.myForm.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  onSubmit(): void {
    if (this.myForm.valid) {
      const formData = this.myForm.value;
      localStorage.setItem('datosBasicos', JSON.stringify(formData));
      console.log('Datos del formulario:', formData);

      this.registrarEstudioCredito(formData.document);

      this.router.navigate(['/registro/foto-validacion']);
    } else {
      this.myForm.markAllAsTouched();
    }
  }

  registrarEstudioCredito(cedula: string): void {
    const estudioCredito = {
      IdCliente: cedula,
      IdPais: 169,
      FechaEstudio: null,
      Estado: null,
      CupoAsignado: null,
      EntidadValidadora: null
    };

    this.usuariosService.addEstudioCredito(estudioCredito).subscribe({
      next: (response) => {
        console.log('Estudio de crédito registrado:', response);
      },
      error: (error) => {
        console.error('Error al registrar estudio de crédito:', error);
      }
    });
  }
}
