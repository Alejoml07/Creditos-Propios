import { Component, ElementRef, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FlowService } from 'src/app/shared/service/flow/flow.service';
import { LoaderService } from 'src/app/shared/service/loader/loader.service';
import { OpenIaService } from 'src/app/shared/service/open-ia.service';
import { RekognitionService } from 'src/app/shared/service/rekognition.service';
import { UserSessionService } from 'src/app/shared/service/user-session.service';
import { UsuariosService } from 'src/app/shared/service/usuarios.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-foto-persona-validacion',
    templateUrl: './foto-persona-validacion.component.html',
    styleUrls: ['./foto-persona-validacion.component.scss'],
    standalone: false
})
export class FotoPersonaValidacionComponent {
  showVideo: boolean = false;
  cameraError: string | null = null;
  videoStream: MediaStream | null = null;
  isLoading = false; 
  validationComplete = false; 
  photoBase64: string | null = null; 
  isCorrectPhoto = false; 
  validationMessage: string = ''; 
  useRearCamera = false; 
  isDesktop: boolean = false;

  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('imageCanvas') imageCanvas!: ElementRef;
  @ViewChild('fileGallery') fileGallery!: ElementRef;

    flowService: FlowService = inject(FlowService);

    private userSessionService: UserSessionService = inject(UserSessionService);

    loaderService: LoaderService = inject(LoaderService);
    

  constructor(
    private cdRef: ChangeDetectorRef,
    private rekognitionService: RekognitionService,
    private openIaService: OpenIaService,
    private router: Router,
    private usuariosService: UsuariosService,
    
  ) {}

  ngOnInit() {
    this.isDesktop = window.innerWidth > 768; // Detecta si es PC o móvil

     this.flowService.markStepCompleted('foto-validacion');

      history.pushState(null, '', location.href);
      window.onpopstate = () => {
        history.go(1); 
      };

  }

  openCamera(): void {
    this.cameraError = null;
    this.showVideo = true;
    this.photoBase64 = null;
    this.validationComplete = false;
    this.cdRef.detectChanges();
  
    const constraints = {
      video: {
        facingMode: this.useRearCamera ? "environment" : "user",
        width: { ideal: 1080 },
        height: { ideal: 1920 }
      }
    };
  
    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        this.videoStream = stream;
        const videoElement = this.videoElement.nativeElement;
        videoElement.srcObject = stream;
        videoElement.play();
      })
      .catch(error => {
        this.cameraError = 'No se pudo acceder a la cámara. Verifica permisos.';
      });
  }
  

  toggleCamera(): void {
    this.useRearCamera = !this.useRearCamera;
    this.stopCamera();
    this.openCamera();
  }

  capturePhoto(): void {
    if (!this.videoElement || !this.imageCanvas) return;
  
    const video = this.videoElement.nativeElement;
    const canvas = this.imageCanvas.nativeElement;
    const context = canvas.getContext('2d');
  
    canvas.width = video.videoWidth || 400;
    canvas.height = video.videoHeight || 250;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    this.stopCamera(); 
  
    this.isLoading = true;
    this.validationComplete = false;
    this.cdRef.detectChanges();
  
    setTimeout(() => {
      this.photoBase64 = canvas.toDataURL('image/png');
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
    this.isCorrectPhoto = false;
    this.photoBase64 = null;
    this.validationMessage = '';
    this.openCamera();
  }

  onPhotoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0]; 

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

  this.isLoading = true;
  this.validationComplete = false;

  this.mostrarAlertaCargaRostro();

  this.openIaService.analyzeImage(base64Data).subscribe(
    (response) => {
      Swal.close();
      this.isLoading = false;
      this.validationComplete = true;

      if (response.esFotoTomadaEnVivo) {
        this.isCorrectPhoto = true;
        this.validationMessage = "La imagen es válida y muestra una persona real.";
        console.log('✅ Foto válida y tomada en vivo:', response);
        this.onSubmit();
      } else {
        this.isCorrectPhoto = false;
        this.validationMessage = response.razon || "La imagen no es válida.";
        console.warn('❌ Foto no válida:', response.razon);
        console.log('Detalles de la validación:', response);
        this.mostrarRecomendacionesFaciales(response);
      }

      this.cdRef.detectChanges();
    },
    (error) => {
      Swal.close();
      this.isLoading = false;
      this.validationComplete = true;
      this.isCorrectPhoto = false;
      this.validationMessage = 'Error al procesar la imagen. Intenta de nuevo.';
      console.error('Error en la validación:', error);
    }
  );
}

// Función separada para mostrar la alerta de carga del rostro
private mostrarAlertaCargaRostro(): void {
  Swal.fire({
    title: '',
    html: `
      <style>
        .loading-container {
          text-align: center;
          padding: 20px 0;
        }
        
        .face-scanner {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto 25px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 50%;
          border: 3px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        .face-icon {
          font-size: 40px;
          color: #64748b;
          z-index: 2;
          animation: faceFloat 2s ease-in-out infinite;
        }
        
        .scan-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          border: 2px solid transparent;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: rotateScan 1.5s linear infinite;
        }
        
        .scan-circle::after {
          content: '';
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
          box-shadow: 0 0 8px #3b82f6;
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
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 5px;
          font-size: 14px;
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
        
        @keyframes rotateScan {
          0% { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        @keyframes faceFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-3px) scale(1.05); }
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
        <div class="face-scanner">
          <div class="face-icon">👤</div>
          <div class="scan-circle"></div>
        </div>
        
        <div class="loading-title">Analizando rostro</div>
        <div class="loading-subtitle">Verificando autenticidad...</div>
        
        <div class="progress-container">
          <div class="progress-bar"></div>
        </div>
        
        <div class="loading-steps">
          <div class="step active" id="face-step1">
            <div class="step-icon">👁️</div>
            <div class="step-text">Detectando</div>
          </div>
          <div class="step" id="face-step2">
            <div class="step-icon">🧠</div>
            <div class="step-text">Analizando</div>
          </div>
          <div class="step" id="face-step3">
            <div class="step-icon">✓</div>
            <div class="step-text">Verificando</div>
          </div>
        </div>
        
        <div class="tip-container">
          <p class="tip-text">💡 Asegúrate de estar bien iluminado y mirando a la cámara</p>
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
      // Animación de pasos secuencial para rostro
      let currentStep = 1;
      const stepInterval = setInterval(() => {
        // Desactivar paso anterior
        if (currentStep > 1) {
          document.getElementById(`face-step${currentStep - 1}`)?.classList.remove('active');
        }
        
        // Activar paso actual
        if (currentStep <= 3) {
          document.getElementById(`face-step${currentStep}`)?.classList.add('active');
          currentStep++;
        } else {
          // Reiniciar ciclo
          document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
          currentStep = 1;
          document.getElementById('face-step1')?.classList.add('active');
        }
      }, 1200);
      
      // Guardar el intervalo para poder limpiarlo después
      (window as any).loadingFaceStepInterval = stepInterval;
    },
    willClose: () => {
      // Limpiar intervalo al cerrar
      if ((window as any).loadingFaceStepInterval) {
        clearInterval((window as any).loadingFaceStepInterval);
      }
    }
  });
}

mostrarRecomendacionesFaciales(response: any): void {
  const recomendaciones: string[] = [];

  if (response.razon) recomendaciones.push(response.razon);

  const listaHTML = recomendaciones.map(r => `
    <div class="recommendation-item">
      <div class="rec-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      </div>
      <span class="rec-text">${r}</span>
    </div>
  `).join('');

  Swal.fire({
    icon: 'info',
    title: '<span class="custom-title">Validación facial</span>',
    html: `
      <style>
        .custom-title {
          color: #1e293b;
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
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 10px;
          color: white;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
        }
        
        .rec-text {
          color: #1e293b;
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
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
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
    confirmButtonText: 'Reintentar',
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

onSubmit(): void {
  // Mostrar alerta de carga antes de continuar
  this.loaderService.show();
  // Enviar la imagen si existe
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
    faceImage: base64SinPrefix // Solo se envía la parte del base64
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

}
