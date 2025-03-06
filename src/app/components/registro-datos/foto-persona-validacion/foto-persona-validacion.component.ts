import { Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { OpenIaService } from 'src/app/shared/service/open-ia.service';
import { RekognitionService } from 'src/app/shared/service/rekognition.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-foto-persona-validacion',
  templateUrl: './foto-persona-validacion.component.html',
  styleUrls: ['./foto-persona-validacion.component.scss']
})
export class FotoPersonaValidacionComponent {
  showVideo: boolean = false;
  cameraError: string | null = null;
  videoStream: MediaStream | null = null;
  isLoading = false; // Estado de carga
  validationComplete = false; // Indica si la validación terminó
  photoBase64: string | null = null; // Base64 de la imagen
  isCorrectPhoto = false; // Indica si la foto es válida
  validationMessage: string = ''; // Mensaje de validación
  useRearCamera = false; // Alterna entre cámara frontal y trasera

  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChild('imageCanvas') imageCanvas!: ElementRef;

  constructor(
    private cdRef: ChangeDetectorRef,
    private rekognitionService: RekognitionService,
    private openIaService: OpenIaService
    
  ) {}

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
  
    // Ajustar el tamaño del canvas para capturar la imagen correctamente
    canvas.width = video.videoWidth || 400;
    canvas.height = video.videoHeight || 250;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    this.stopCamera(); // Detiene la cámara tras capturar la imagen
  
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
      const file = input.files[0]; // Solo procesamos la primera imagen
  
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

    Swal.fire({
      title: 'Validando imagen...',
      html: 'Por favor, espera mientras verificamos tu foto.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.openIaService.analyzeImage(base64Data).subscribe(response => {
      Swal.close();
      console.log("response", response);
      if (response.esFotoTomadaEnVivo) {
        this.isCorrectPhoto = true;
        this.validationMessage = "La imagen es válida y muestra una persona real.";
      } else {
        this.isCorrectPhoto = false;
        this.validationMessage = response.razon || "La imagen no es válida.";
      }

      this.isLoading = false;
      this.validationComplete = true;
      this.cdRef.detectChanges();
    }, error => {
      Swal.close();
      this.isLoading = false;
      this.validationComplete = true;
      this.isCorrectPhoto = false;
      this.validationMessage = 'Error al procesar la imagen. Intenta de nuevo.';
      console.error('Error en la validación:', error);
    });
  }

  onSubmit(): void {
    if (!this.isCorrectPhoto) {
      Swal.fire({
        icon: 'error',
        title: 'Foto no válida',
        text: this.validationMessage,
      });
      return;
    }

    Swal.fire({
      title: 'Procesando...',
      html: 'Por favor, espera un momento.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    setTimeout(() => {
      Swal.close();
      Swal.fire({
        icon: 'success',
        title: 'Foto validada correctamente',
        text: 'Tu foto ha sido aceptada.',
      });
    }, 3000);
  }
}
