import { Component, ElementRef, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentValidationService } from 'src/app/shared/service/document-validation/document-validation.service';
import { DocumentoValido, ValidationResult } from 'src/app/shared/service/document-validation/interfaces/document-validator.interface';
import { GoogleVisionService } from 'src/app/shared/service/google-vision.service';
import { OpenIaService } from 'src/app/shared/service/open-ia.service';
import { UserSessionService } from 'src/app/shared/service/user-session.service';
import { UsuariosService } from 'src/app/shared/service/usuarios.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-documento-validacion',
    templateUrl: './documento-validacion.component.html',
    styleUrls: ['./documento-validacion.component.scss'],
    standalone: false
})
export class DocumentoValidacionComponent {
  showVideo: boolean = false;
  cameraError: string | null = null;
  videoStream: MediaStream | null = null;
  IsCorrectPhoto = false;
  isLoading = false; // Estado de carga
  validationComplete = false; // Indica si la validación terminó
  photoBase64: string | null = null; // Solo para validación
  private userSessionService: UserSessionService = inject(UserSessionService);
  private documentValidationService = inject(DocumentValidationService);
  


  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('imageCanvas') imageCanvas!: ElementRef;
  useRearCamera: any;
  isDesktop: boolean = false;


  constructor(
    private cdRef: ChangeDetectorRef,
    private googleVisionService: GoogleVisionService,
    private openIaService: OpenIaService,
    private router: Router,
    private usuariosService: UsuariosService,
    
  ) {}

  ngOnInit() {
    this.isDesktop = window.innerWidth > 768; // Detecta si es PC o móvil
  }

  openCamera(): void {
    this.cameraError = null;
    this.showVideo = true;
    this.photoBase64 = null;
    this.validationComplete = false;
    this.cdRef.detectChanges();
  
    const constraints = {
      video: { facingMode: this.useRearCamera ? "environment" : "user" } // Alterna entre frontal y trasera
    };
  
    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
      this.videoStream = stream;
      this.videoElement.nativeElement.srcObject = stream;
    }).catch(error => {
      this.cameraError = 'No se pudo acceder a la cámara. Verifica permisos.';
    });
  }
  
  // Alternar cámara entre frontal y trasera
  toggleCamera(): void {
    this.useRearCamera = !this.useRearCamera; // Cambia el estado
    this.stopCamera(); // Apaga la cámara actual
    this.openCamera(); // Vuelve a abrir con la nueva configuración
  }
  
  capturePhoto(): void {
    if (!this.videoElement || !this.imageCanvas) return;

    const video = this.videoElement.nativeElement;
    const canvas = this.imageCanvas.nativeElement;
    const context = canvas.getContext('2d');

    canvas.width = 400;
    canvas.height = 250;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    this.stopCamera();

    this.isLoading = true; // Activar loading
    this.validationComplete = false;
    this.cdRef.detectChanges();

    setTimeout(() => {
        this.photoBase64 = canvas.toDataURL('image/png'); // Guardar pero no mostrar
        this.stopCamera();
        this.validatePhoto(this.photoBase64);
    }, 100);
}

  stopCamera(): void {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
    }
    this.showVideo = false;
  }

  retryCapture(): void {
    this.isLoading = false;
    this.validationComplete = false;
    this.IsCorrectPhoto = false;
    this.photoBase64 = null;
    this.openCamera(); // Volver a encender la cámara
}


onPhotoUpload(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0]; // Solo tomamos la primera imagen

    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      this.photoBase64 = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.isLoading = true;
      this.validationComplete = false;
      this.cdRef.detectChanges();

      setTimeout(() => {
        this.photoBase64 = reader.result as string;
        this.validatePhoto(this.photoBase64);
      }, 1000);
    };
    reader.readAsDataURL(file);
  }
}


 validatePhoto(imageBase64: string): void {
  const base64Data = imageBase64.split(',')[1];
  const datosBasicos = this.userSessionService.getDatosBasicos();

  if (!datosBasicos) {
    console.error('❌ No se encontraron datos básicos en el almacenamiento local.');
    return;
  }

  const documentoActual = datosBasicos.document;
  this.isLoading = true;
  this.validationComplete = false;
  Swal.fire({ title: 'Validando documento...', didOpen: () => Swal.showLoading() });

  this.documentValidationService.validarDocumento(base64Data).subscribe(
    (response) => {
      Swal.close();
      this.isLoading = false;
      this.validationComplete = true;

      if ((response as any).esDocumentoValido) {
        const resultado = response as DocumentoValido;
        console.log('✅ Documento válido:', resultado);

        if (resultado.numeroCedula !== documentoActual) {
          this.IsCorrectPhoto = false;
          console.warn('⚠️ La cédula no coincide con la registrada.');
        } else {
          this.IsCorrectPhoto = true;
          console.log('✔️ La cédula coincide correctamente.');
        }

        console.log('Texto extraído:', resultado.textoExtraido);
      } else {
        const error = response as ValidationResult;
        this.IsCorrectPhoto = false;

        console.error('❌ Documento no válido:');
        console.table(error.errores);
        if (error.recomendaciones?.length) {
          console.info('👉 Recomendaciones:', error.recomendaciones);
          this.mostrarRecomendaciones(error);

        }
      }

      this.cdRef.detectChanges();
    },
    (error) => {
      Swal.close();
      this.isLoading = false;
      this.validationComplete = true;
      this.IsCorrectPhoto = false;

      console.error('🔥 Error inesperado al validar el documento:', error);
    }
  );
}


 onSubmit(): void {
  if (!this.IsCorrectPhoto) return;

  // Mostrar alerta con un GIF de carga
  Swal.fire({
    title: '<span style="color: #00d9ff; font-weight: bold; font-size: 24px;">Pay</span>',
    html: `
      <p style="color: #333; font-size: 16px;">Espera un momento, estamos validando tu información</p>
    `,
    didOpen: () => {
      Swal.showLoading(); // Activar el loading nativo de SweetAlert2
    },
    showConfirmButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    background: '#fff',
    padding: '20px',
    width: '400px',
  });

  // Simular proceso de validación (ejemplo: cerrar el modal después de 3 segundos)
  setTimeout(() => {
    Swal.close(); // Cerrar modal de carga 
    this.enviarImagenAzure()
    this.router.navigate(['/registro/aprobacion-credito'])

  }, 3000);
}

enviarImagenAzure(): void {

  const datosRaw = this.userSessionService.getDatosBasicos();


  if (!datosRaw || !this.photoBase64) {
    console.error('Faltan datos para enviar la imagen.');
    return;
  }

  // const datos = JSON.parse(datosRaw);
  const base64SinPrefix = this.photoBase64.split(',')[1]; // Quitar 'data:image/png;base64,'

  const payload = {
    idCliente: datosRaw.document,
    DocumentImage : base64SinPrefix // Solo se envía la parte del base64
  };

  this.usuariosService.guardarImagenUsuario(payload).subscribe({
    next: () => {
      console.log("Imagen enviada correctamente a Azure y guardada en base de datos.");
    },
    error: (error) => {
      console.error("Error al enviar imagen al backend:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar imagen',
        text: 'Ocurrió un error al subir tu foto. Intenta nuevamente.',
      });
    }
  });
}

mostrarRecomendaciones(error: ValidationResult): void {
  if (!error?.recomendaciones?.length) return;

  const listaHTML = error.recomendaciones.map(rec => `
    <div class="recommendation-item">
      <div class="rec-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 12l2 2 4-4"/>
        </svg>
      </div>
      <span class="rec-text">${rec}</span>
    </div>
  `).join('');

  Swal.fire({
    icon: 'info',
    title: '<span class="custom-title"> Mejora tu documento</span>',
    html: `
      <style>
        .custom-title {
          color: #2c3e50;
          font-weight: 600;
          font-size: 1.3rem;
        }
        
        .recommendations-container {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 12px;
          padding: 18px;
          margin: 15px 0;
          border: 1px solid #bae6fd;
        }
        
        .recommendation-item {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          animation: slideIn 0.3s ease-out;
        }
        
        .recommendation-item:last-child {
          margin-bottom: 0;
        }
        
        .rec-icon {
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 10px;
          color: white;
          box-shadow: 0 2px 6px rgba(14, 165, 233, 0.3);
        }
        
        .rec-text {
          color: #2c3e50;
          font-size: 14px;
          line-height: 1.3;
          font-weight: 500;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .swal2-confirm {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
          border: none !important;
          border-radius: 25px !important;
          padding: 10px 25px !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4) !important;
          transition: all 0.3s ease !important;
        }
        
        .swal2-confirm:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6) !important;
        }
      </style>
      
      <div class="recommendations-container">
        ${listaHTML}
      </div>
    `,
    confirmButtonText: 'Entendido',
    showClass: {
      popup: 'animate__animated animate__fadeInDown animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUp animate__faster'
    },
    background: '#ffffff',
    width: '420px',
    padding: '20px',
    customClass: {
      popup: 'custom-popup',
      title: 'custom-title-class'
    },
    backdrop: `
      rgba(0,0,0,0.4)
      left top
      no-repeat
    `
  });
}
  
}
