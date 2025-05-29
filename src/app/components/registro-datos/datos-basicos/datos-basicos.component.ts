import { Component, inject, OnInit, Signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { DataBasicService } from 'src/app/shared/service/data-basic/data-basic.service';
import { BasicDataPayload, DatosBasicosModel, StudyRequestPayload } from 'src/app/shared/service/data-basic/interfaces/data-basic.interface';
import { LoaderService } from 'src/app/shared/service/loader/loader.service';
import { SecurityService } from 'src/app/shared/service/security.service';
import { UsuariosService } from 'src/app/shared/service/usuarios.service';
import * as CryptoJS from 'crypto-js';
import { FlowService } from 'src/app/shared/service/flow/flow.service';
import { UserSessionService } from 'src/app/shared/service/user-session.service';


@Component({
  selector: 'app-datos-basicos',
  templateUrl: './datos-basicos.component.html',
  styleUrls: ['./datos-basicos.component.scss'],
  standalone: false
})
export class DatosBasicosComponent implements OnInit {
  
  ipUsuario: string = '';

  FormDataBasicUser!: FormGroup;
  // isLoading: boolean = true;
  documentWarning: string | null = null;
  celularWarning: string | null = null;
  documentWarningButton: boolean = true;
  celularWarningButton: boolean = true;
  isValidatingDocument: boolean = false;
  isValidatingCelular: boolean = false;
  documentosLegales: any[] = [];

  loaderService: LoaderService = inject(LoaderService);
  securityService: SecurityService = inject(SecurityService);
  flowService: FlowService = inject(FlowService);
  private userSessionService: UserSessionService = inject(UserSessionService);

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private usuariosService: UsuariosService,
    private dataBasicService: DataBasicService
  ) {}

  ngOnInit(): void {

    const numericPattern = /^[0-9]*$/;

    const lettersOnlyPattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

    this.FormDataBasicUser = this.formBuilder.group({

      documentType: ['1', Validators.required], 

      document: ['', [Validators.required, Validators.pattern(numericPattern), Validators.minLength(6), Validators.maxLength(11)]],

      cellular: ['', [Validators.required, Validators.pattern(numericPattern), Validators.minLength(10), Validators.maxLength(10)]],

      lastName: ['', [Validators.required, Validators.pattern(lettersOnlyPattern), Validators.minLength(2), Validators.maxLength(50)]],

      documentExpedition: ['', Validators.required],

      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],

      dataPolicy: [false, Validators.requiredTrue]

    });

    this.watchDocumentInput();

    this.watchDocumentType();

    this.watchCelularInput();

    this.securityService.getFlujoById(1)

    .pipe(map(response => response.result))

    .subscribe(result => {

      console.log('Flujo obtenido:', result);

      this.flowService.setBackendFlow(result);

      this.flowService.markStepCompleted('datos-basicos');


    });

    this.securityService.getIp().subscribe((data) => {

      this.ipUsuario = data.ip;

      const encryptedIP = this.dataBasicService.encryptIP(this.ipUsuario);

      localStorage.setItem('ip', encryptedIP);

      console.log('IP original:', this.ipUsuario);

      console.log('IP encriptada:', encryptedIP);
      

    });



  }

  private watchDocumentType(): void {

    this.loaderService.show();

    this.usuariosService.getDocumentos().subscribe({

      next: (response) => {
        
        if (response.isSuccess) {

          this.documentosLegales = response.result;

          this.loaderService.hide();

          console.log('Documentos legales:', this.documentosLegales);

        }
      },
      error: (error) => {

        console.error('Error al obtener documentos legales:', error);

      }
    });
  }

  private watchDocumentInput(): void {

    this.FormDataBasicUser.get('document')?.valueChanges.pipe(

      debounceTime(800),

      distinctUntilChanged(),

      filter(() => this.FormDataBasicUser.get('document')?.valid)

    ).subscribe(documentValue => {

      this.documentWarningButton = false;

      this.ValidarEstadoEstudioCredito(documentValue);

    });
  }


  private async ValidarEstadoEstudioCredito(document: string): Promise<void> {

    this.isValidatingDocument = true;

    try {
      const response = await this.dataBasicService.ValidarEstadoEstudioCredito(document);

      console.log('response', response);
  
      if (response.result) {

        this.documentWarning = 'Ya existe un cupo de crédito aprobado para este número de documento.';

        this.documentWarningButton = true;

        console.warn('[Validación crédito] ❌ Ya hay proceso activo');

      } else {

        this.documentWarning = null;

        this.documentWarningButton = false;

        console.log('[Validación crédito] ✅ Sin proceso activo');

      }
    } catch (error) {

      console.error('[Validación crédito] Error al consultar proceso:', error);

      this.documentWarning = null;

    } finally {

      this.isValidatingDocument = false;

    }
  }

  private watchCelularInput(): void {

    this.FormDataBasicUser.get('cellular')?.valueChanges.pipe(

      debounceTime(800),

      distinctUntilChanged(),

      filter(() => this.FormDataBasicUser.get('cellular')?.valid)

    ).subscribe(cellularValue => {

      this.celularWarningButton = false;

      this.ValidarEstadoCelular(cellularValue);

    });
  }


  private async ValidarEstadoCelular(cellular: string): Promise<void> {

    this.isValidatingCelular = true;

    try {
      const response = await this.dataBasicService.ValidarEstadoCelular(cellular);

      console.log('response', response);

      const validacionCelular = response.result;
  
      if (!validacionCelular) {

        this.celularWarning = 'Ya existe un cupo de crédito aprobado para este número de celular.';

        this.celularWarningButton = true;

        console.warn('[Validación crédito] ❌ Ya hay proceso activo');

      } else {

        this.celularWarning = null;

        this.celularWarningButton = false;

        console.log('[Validación crédito] ✅ Sin proceso activo');

      }
    } catch (error) {

      console.error('[Validación crédito] Error al consultar proceso:', error);

      this.celularWarning = null;

    } finally {

      this.isValidatingCelular = false;

    }
  }



  isInvalid(field: string): boolean {

    const control = this.FormDataBasicUser.get(field);

    return !!(control && control.invalid && (control.touched || control.dirty));

  }

  async onSubmit(): Promise<void> {

    this.loaderService.show();

  
    if (this.FormDataBasicUser.valid) {
      
      const formData: DatosBasicosModel = this.FormDataBasicUser.value;
  
      this.userSessionService.setDatosBasicos(formData);
  
      const payload = {
        IdCliente: formData.document,
        IdPais: '169',
        IdEstudio: '1',
        NumItem: '1'
      };
  
      try {

        const datosCliente = await this.enviarDatosCliente()

        if (!datosCliente) {

          console.error('Error al enviar datos del cliente');
          
          return;

        }
  
        const response = await this.usuariosService.solicitudDocumentosLegales(payload).toPromise();

        console.log('[SolicitudDocumentosLegales] ✅ Respuesta:', response);
  
      } catch (error) {

        console.error('[Error] ❌', error);

      }
  
      const currentPath = this.router.url;
      
      this.flowService.goToNext(currentPath);
  
    } else {

      this.FormDataBasicUser.markAllAsTouched();

    }
  
    this.loaderService.hide();
  }

  private async enviarDatosCliente(): Promise<boolean> {

    const formData = this.FormDataBasicUser.value;
  
    const payload: StudyRequestPayload = {
      Estudio: {
        IdCliente: formData.document,
        IdPais: '169',
        FechaEstudio: null,
        Estado: null,
        CupoAsignado: null,
        EntidadValidadora: null
      },
      Datos: {
        IdCliente: formData.document,
        Email: formData.email,
        Celular: formData.cellular,
        Nombres: '',
        Apellidos: formData.lastName,
        Direccion: '',
        TipoIdentificacion: formData.documentType,
        IdPais: '169'
      }
    };
  
    try {
      const response = await this.dataBasicService.addEstudioCredito(payload);
  
      return response;

    } catch (error) {

      console.error('[EnviarDatosCliente] ❌ Error:', error);

      return false;
      
    }

  }

}