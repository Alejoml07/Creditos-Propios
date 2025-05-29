import { Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleVisionService } from 'src/app/shared/service/google-vision.service';
import { OpenIaService } from 'src/app/shared/service/open-ia.service';
import Swal from 'sweetalert2';
@Component({
    selector: 'app-documento-trasera-validacion',
    templateUrl: './documento-trasera-validacion.component.html',
    styleUrls: ['./documento-trasera-validacion.component.scss'],
    standalone: false
})
export class DocumentoTraseraValidacionComponent {

  showVideo: boolean = false;
    cameraError: string | null = null;
    videoStream: MediaStream | null = null;
    IsCorrectPhoto = false;
    isLoading = false; // Estado de carga
    validationComplete = false; // Indica si la validación terminó
    photoBase64: string | null = null; // Solo para validación
  
    @ViewChild('videoElement') videoElement!: ElementRef;
    @ViewChild('imageCanvas') imageCanvas!: ElementRef;
    useRearCamera: any;
    isDesktop: boolean = false;
  
  
    constructor(
      private cdRef: ChangeDetectorRef,
      private googleVisionService: GoogleVisionService,
      private openIaService: OpenIaService,
      private router: Router
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
  
      // Swal.fire({
      //   title: 'Validando documento...',
      //   html: 'Por favor, espera mientras verificamos tu documento.',
      //   allowOutsideClick: false,
      //   didOpen: () => Swal.showLoading()
      // });
  
      this.openIaService.analyzeBacksideDocument(base64Data).subscribe(
        validationResponse => {
          Swal.close();
          console.log('Validación de documento:', validationResponse);
          if (validationResponse?.esDocumentoValido) {
            this.IsCorrectPhoto = true;
            console.log('Documento válido:', validationResponse.textoExtraido);
          } else {
            this.IsCorrectPhoto = false;
            console.log('Documento no válido:', validationResponse.razon);
          }
  
          this.isLoading = false;
          this.validationComplete = true;
          this.cdRef.detectChanges();
        },
        error => {
          Swal.close();
          this.isLoading = false;
          this.validationComplete = true;
          this.IsCorrectPhoto = false;
          console.error('Error al validar el documento con OpenAI:', error);
        }
      );
  }
  
  
   onSubmit(): void {
    // if (!this.IsCorrectPhoto) return;
  
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
      this.router.navigate(['/registro/foto-validacion']);
  
    }, 3000);
  }

}
