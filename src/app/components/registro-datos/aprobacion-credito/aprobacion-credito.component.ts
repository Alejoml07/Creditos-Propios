import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoaderService } from 'src/app/shared/service/loader/loader.service';
import { LogService } from 'src/app/shared/service/logs/logs.service';
import { UserSessionService } from 'src/app/shared/service/user-session.service';
import { UsuariosService } from 'src/app/shared/service/usuarios.service';

@Component({
  selector: 'app-aprobacion-credito',
  templateUrl: './aprobacion-credito.component.html',
  styleUrls: ['./aprobacion-credito.component.scss'],
  standalone: false
})
export class AprobacionCreditoComponent implements OnInit {
  cupoOtorgado: number | null = null;
  mostrarCupo: boolean = false;
  isLoading: boolean = true;

  loaderService: LoaderService = inject(LoaderService);
  private logService: LogService = inject(LogService);
  private userSessionService: UserSessionService = inject(UserSessionService);
  

  constructor(private usuariosService: UsuariosService, private router: Router) {}

  ngOnInit(): void {
    this.loaderService.show();

    const datosBasicos = this.userSessionService.getDatosBasicos();

    console.log('datosBasicos:', datosBasicos);

    if (datosBasicos) {
      const payload = { 
        IdCliente: datosBasicos.document,
        tipoIdentificacion: datosBasicos.documentType,  
        OrigenConsulta: "flujo Créditos Propios",
        TipoConsulta:"PromedioConTransunion"
      };

      this.usuariosService.consultarCedula(payload).subscribe({
        next: async (response) => {
          console.log('Respuesta del servicio:', response);

          await this.logService.addLog({
            Id: '',
            IdUsuario: datosBasicos.document,
            FechaTransaccion: new Date().toISOString(),
            NombreOperacion: 'Consulta cupo aprobado',
            Payload: JSON.stringify(payload),
            ServiceResponse: JSON.stringify(response)
          });

          if (this.cupoOtorgado < 100) {
            this.router.navigate(['/registro/credit-denied']);
            this.loaderService.hide();
            return;
          }

          if (response?.result?.cupoAsignado !== undefined) {
            console.log('Cupo asignado:', response.result.cupoAsignado);
            this.cupoOtorgado = response.result.cupoAsignado;
          }
          this.isLoading = false;
          this.loaderService.hide();   
        },
        error: async (error) => {
          console.error('Error al consultar el cupo aprobado:', error);

          await this.logService.addLog({
            Id: '',
            IdUsuario: datosBasicos.document,
            FechaTransaccion: new Date().toISOString(),
            NombreOperacion: 'Consulta cupo aprobado - Error',
            Payload: JSON.stringify(payload),
            ServiceResponse: JSON.stringify({ error: error?.message || 'Error desconocido' })
          });

          this.router.navigate(['/registro/credit-denied']);
          this.loaderService.hide();   
        }
      });
    } else {
      console.error('No se encontró la cédula en localStorage');
    }
  }
}
