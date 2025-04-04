import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-informacion-complementaria',
  templateUrl: './informacion-complementaria.component.html',
  styleUrls: ['./informacion-complementaria.component.scss']
})
export class InformacionComplementariaComponent implements OnInit {
  myForm!: FormGroup;
  resultado: any;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    const lettersOnlyPattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/; // Permite letras, espacios y tildes

    this.myForm = this.fb.group({
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
      ]
    });
  }

  isInvalid(field: string): boolean {
    const control = this.myForm.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  onSubmit(): void {
    if (this.myForm.valid) {
      this.mostrarConsentimiento(); // Llama al modal aparte
    } else {
      this.myForm.markAllAsTouched();
    }
  }

  mostrarConsentimiento(): void {
    Swal.fire({
      title: '<strong style="font-size: 1.8rem; font-weight: bold;">Tratamiento de datos</strong>',
      html: `
        <p style="margin-bottom: 1rem; font-size: 14px;">
          Para continuar, debes aceptar el tratamiento de tus datos personales.
        </p>
        <div style="display: flex; align-items: center; justify-content: center;">
          <input type="checkbox" id="aceptoDatos" style="width: 18px; height: 18px; margin-right: 8px;" />
          <label for="aceptoDatos" style="font-size: 15px;">Acepto el tratamiento de datos</label>
        </div>
      `,
      background: '#fff',
      width: '500px',
      padding: '2rem 2rem 1.5rem',
      showCancelButton: true,
      confirmButtonText: 'Aceptar y continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#6A5AE0', // morado similar al botón "Continuar"
      cancelButtonColor: '#6c757d',
      customClass: {
        popup: 'rounded-xl shadow-md',
        confirmButton: 'rounded-full px-6 py-2 text-white',
        cancelButton: 'rounded-full px-6 py-2',
      },
      preConfirm: () => {
        const checkbox = document.getElementById('aceptoDatos') as HTMLInputElement;
        if (!checkbox || !checkbox.checked) {
          Swal.showValidationMessage('Debes aceptar el tratamiento de datos para continuar');
        }
        return checkbox?.checked;
      }
    }).then(result => {
      if (result.isConfirmed) {
        const datosComplementarios = this.myForm.value;
        const datosBasicosRaw = localStorage.getItem('datosBasicos');
        const datosBasicos = datosBasicosRaw ? JSON.parse(datosBasicosRaw) : {};
        const datosCompletos = {
          ...datosBasicos,
          ...datosComplementarios
        };
        localStorage.setItem('datosBasicos', JSON.stringify(datosCompletos));
        console.log('Datos completos del formulario:', datosCompletos);
        this.router.navigate(['/registro/foto-validacion']);
      }
    });
  }
}
