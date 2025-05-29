import { Component, ElementRef, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FlowService } from 'src/app/shared/service/flow/flow.service';
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

  Swal.fire({ title: 'Validando rostro...', didOpen: () => Swal.showLoading() });

  this.openIaService.analyzeImage(base64Data).subscribe(
    (response) => {
      Swal.close();
      this.isLoading = false;
      this.validationComplete = true;

      if (response.esFotoTomadaEnVivo) {
        this.isCorrectPhoto = true;
        this.validationMessage = "La imagen es válida y muestra una persona real.";
        console.log('✅ Foto válida y tomada en vivo:', response);
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
          color: #2c3e50;
          font-weight: 600;
          font-size: 1.3rem;
        }
        
        .recommendations-container {
          background: linear-gradient(135deg, #fff5f5 0%, #fef2f2 100%);
          border-radius: 12px;
          padding: 18px;
          margin: 15px 0;
          border: 1px solid #fed7d7;
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
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 10px;
          color: white;
          box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
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
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
          border: none !important;
          border-radius: 25px !important;
          padding: 10px 25px !important;
          font-weight: 600 !important;
          box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4) !important;
          transition: all 0.3s ease !important;
        }
        
        .swal2-confirm:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.6) !important;
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
  const datosRaw = localStorage.getItem('datosBasicos');

  if (!datosRaw) {
    console.error('No se encontraron datos en localStorage');
    return;
  }

  // Mostrar alerta de carga antes de continuar
  this.mostrarAlertaCarga(); // ✅ <-- Agregado aquí

  // Enviar la imagen si existe
  if (this.photoBase64) {
    this.enviarImagenAzure();
  }

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

  mostrarAlertaCarga(): void {
    Swal.fire({
      title: '<span style="color: #00d9ff; font-weight: bold; font-size: 24px;">Pay</span>',
      html: `
        <p style="color: #333; font-size: 16px;">Espera un momento, estamos validando tu información</p>
      `,
      didOpen: () => {
        Swal.showLoading();
      },
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      background: '#fff',
      padding: '20px',
      width: '400px',
    });
  }
}
