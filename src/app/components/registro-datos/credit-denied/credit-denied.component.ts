import { Component } from '@angular/core';

@Component({
  selector: 'app-credit-denied',
  imports: [],
  templateUrl: './credit-denied.component.html',
  styleUrl: './credit-denied.component.scss'
})
export class CreditDeniedComponent {
  currentYear: number = new Date().getFullYear();
  // Aquí podrías tener propiedades para el nombre del usuario/cliente
  // y el nombre de la empresa, que se podrían pasar al template.
  // Ejemplo:
  // userName: string = 'Usuario Ejemplo';
  // companyName: string = 'Mi Empresa';

  constructor() { }

  ngOnInit(): void {
    // Aquí puedes realizar cualquier inicialización necesaria
  }

  contactSupport(): void {
    console.log('Botón "Contactar a Soporte" clickeado.');
    // Aquí iría la lógica para contactar al soporte (abrir un modal, redirigir a un formulario, etc.)
  }

  goToDashboard(): void {
    console.log('Botón "Volver al Inicio" clickeado.');
    // Aquí iría la lógica para volver al panel de inicio (navegación, etc.)
  }
}
