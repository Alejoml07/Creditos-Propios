import { Component, ElementRef, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentValidationService } from 'src/app/shared/service/document-validation/document-validation.service';
import { DocumentoValido, ValidationResult } from 'src/app/shared/service/document-validation/interfaces/document-validator.interface';
import { GoogleVisionService } from 'src/app/shared/service/google-vision.service';
import { LoaderService } from 'src/app/shared/service/loader/loader.service';
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
  loaderService: LoaderService = inject(LoaderService);
  
  


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
  this.mostrarAlertaCarga();

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
          Swal.fire({
            icon: 'error',
            title: 'Error al validar el documento',
            text: 'La cédula no coincide con la registrada.',
          });
          console.warn('⚠️ La cédula no coincide con la registrada.');
        } else {
          this.IsCorrectPhoto = true;
          console.log('✔️ La cédula coincide correctamente.');
          this.onSubmit();
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

// Función separada para mostrar la alerta de carga
private mostrarAlertaCarga(): void {
  Swal.fire({
    title: '',
    html: `
      <style>
        .loading-container {
          text-align: center;
          padding: 20px 0;
        }
        
        .document-scanner {
          position: relative;
          width: 120px;
          height: 80px;
          margin: 0 auto 25px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 12px;
          border: 2px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        .document-icon {
          font-size: 32px;
          color: #64748b;
          z-index: 2;
          animation: documentFloat 2s ease-in-out infinite;
        }
        
        .scan-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #3b82f6, transparent);
          animation: scanMove 2s linear infinite;
          box-shadow: 0 0 10px #3b82f6;
        }
        
        .loading-title {
          font-size: 22px;
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
          animation: progressFlow 1.5s ease-in-out infinite, progressGrow 3s ease-out infinite;
        }
        
        .loading-steps {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
          padding: 0 10px;
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
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 5px;
          font-size: 12px;
          transition: all 0.5s ease;
        }
        
        .step.active .step-icon {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        
        .step-text {
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
          text-align: center;
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
        
        @keyframes scanMove {
          0% { transform: translateY(-5px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(85px); opacity: 0; }
        }
        
        @keyframes documentFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
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
          70% { width: 85%; }
          100% { width: 100%; }
        }
        
        .swal2-popup {
          border-radius: 20px !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12) !important;
        }
      </style>
      
      <div class="loading-container">
        <div class="document-scanner">
          <div class="document-icon">📄</div>
          <div class="scan-line"></div>
        </div>
        
        <div class="loading-title">Analizando documento</div>
        <div class="loading-subtitle">Procesando información...</div>
        
        <div class="progress-container">
          <div class="progress-bar"></div>
        </div>
        
        <div class="loading-steps">
          <div class="step active" id="step1">
            <div class="step-icon">🔍</div>
            <div class="step-text">Detectando</div>
          </div>
          <div class="step" id="step2">
            <div class="step-icon">📋</div>
            <div class="step-text">Extrayendo</div>
          </div>
          <div class="step" id="step3">
            <div class="step-icon">✓</div>
            <div class="step-text">Validando</div>
          </div>
        </div>
        
        <div class="tip-container">
          <p class="tip-text">💡 Mantén el documento bien iluminado para mejores resultados</p>
        </div>
      </div>
    `,
    showConfirmButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    background: '#ffffff',
    width: '420px',
    padding: '25px',
    didOpen: () => {
      // Animación de pasos secuencial
      let currentStep = 1;
      const stepInterval = setInterval(() => {
        // Desactivar paso anterior
        if (currentStep > 1) {
          document.getElementById(`step${currentStep - 1}`)?.classList.remove('active');
        }
        
        // Activar paso actual
        if (currentStep <= 3) {
          document.getElementById(`step${currentStep}`)?.classList.add('active');
          currentStep++;
        } else {
          // Reiniciar ciclo
          document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
          currentStep = 1;
          document.getElementById('step1')?.classList.add('active');
        }
      }, 1000);
      
      // Guardar el intervalo para poder limpiarlo después
      (window as any).loadingStepInterval = stepInterval;
    },
    willClose: () => {
      // Limpiar intervalo al cerrar
      if ((window as any).loadingStepInterval) {
        clearInterval((window as any).loadingStepInterval);
      }
    }
  });
}


 onSubmit(): void {
  if (!this.IsCorrectPhoto) return;

  this.loaderService.show();

  if (this.photoBase64) {

    this.enviarImagenAzure();

  }

  this.loaderService.hide();

  this.router.navigate(['/registro/codigo-otp']);

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
