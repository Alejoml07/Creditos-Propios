import { Component, OnInit } from '@angular/core';
import { UsuariosService } from 'src/app/shared/service/usuarios.service';

@Component({
  selector: 'app-aprobacion-credito',
  templateUrl: './aprobacion-credito.component.html',
  styleUrls: ['./aprobacion-credito.component.scss']
})
export class AprobacionCreditoComponent implements OnInit {
  cupoOtorgado: number | null = null;
  mostrarCupo: boolean = false;
  isLoading: boolean = true;


  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    const datosBasicos = localStorage.getItem('datosBasicos');
    const parsedData = datosBasicos ? JSON.parse(datosBasicos) : null;
    const cedula = parsedData?.document;

    if (cedula) {
      const payload = { Cedula: cedula };

      this.usuariosService.consultarCedula(payload).subscribe({
        next: (response) => {
          console.log('Respuesta del servicio:', response);
      
          if (response?.result?.cupoOtorgado !== undefined) {
            this.cupoOtorgado = response.result.cupoOtorgado;
          }
      
          this.isLoading = false; // ✅ Se oculta el loader y se muestra el contenido
        },
        error: (error) => {
          console.error('Error al consultar el cupo aprobado:', error);
          this.isLoading = false;
        }
      });
    } else {
      console.error('No se encontró la cédula en localStorage');
    }
  }
}