import { Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { OpenIaService } from 'src/app/shared/service/open-ia.service';
import { RekognitionService } from 'src/app/shared/service/rekognition.service';
import { UsuariosService } from 'src/app/shared/service/usuarios.service';
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


  constructor(
    private cdRef: ChangeDetectorRef,
    private rekognitionService: RekognitionService,
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
    const datosRaw = localStorage.getItem('datosBasicos');
  
    if (!datosRaw) {
      console.error('No se encontraron datos en localStorage');
      return;
    }
  
    const datos = JSON.parse(datosRaw);
    const body = {
      Cedula: datos.document,
      FechaExpedicion: datos.documentExpedition // Debe estar en formato YYYY-MM-DD
    };
  
    this.mostrarAlertaCarga();

    this.router.navigate(['/registro/codigo-otp']);

    // this.usuariosService.validarUsuario(body).subscribe({
    //   next: (response) => {
    //     console.log('Respuesta del servicio UsuariosService:', response);
    //     Swal.close();
    //     this.router.navigate(['/registro/codigo-otp']);
    //   },
    //   error: (error) => {
    //     console.error('Error al validar usuario:', error);
    //     Swal.close();
    //     Swal.fire({
    //       icon: 'error',
    //       title: 'Error de validación',
    //       text: 'Ocurrió un error al validar la información. Intenta nuevamente.',
    //     });
    //   }
    // });
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
