import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GoogleVisionService } from 'src/app/shared/service/google-vision.service';
import { OpenIaService } from 'src/app/shared/service/open-ia.service';

@Component({
  selector: 'app-tratamiento-datos',
  templateUrl: './tratamiento-datos.component.html',
  styleUrls: ['./tratamiento-datos.component.scss']
})
export class TratamientoDatosComponent {
 infoForm: FormGroup;
   photoPreview: string | null = null;
   photoError: string | null = null;
   showVideo: boolean = false;
   cameraError: string | null = null;
   videoStream: MediaStream | null = null;
   extractedText: string | null = null;
 
   @ViewChild('videoElement') videoElement!: ElementRef;
   @ViewChild('imageCanvas') imageCanvas!: ElementRef;
 
   constructor(
     private googleVisionService: GoogleVisionService,
     private fb: FormBuilder,
     private cdRef: ChangeDetectorRef,
     private openIaService: OpenIaService
   ) {
     this.infoForm = this.fb.group({
       fechaNacimiento: ['', Validators.required],
       fechaExpedicion: ['', Validators.required],
       genero: ['', Validators.required],
       celularAlternativo: ['', [Validators.required, Validators.pattern(/^3\d{9}$/)]],
     });
   }
 
   ngOnInit(): void {}
 
   
   openCamera(): void {
     this.cameraError = null;
     this.showVideo = true;
     this.cdRef.detectChanges();
 
     setTimeout(() => {
       if (!this.videoElement) {
         this.cameraError = "Error interno: No se pudo inicializar la cámara.";
         return;
       }
 
       navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
         this.videoStream = stream;
         this.videoElement.nativeElement.srcObject = stream;
       }).catch(error => {
         this.cameraError = 'No se pudo acceder a la cámara. Verifica permisos.';
         console.error('Error al acceder a la cámara:', error);
       });
     }, 100);
   }
 
   
   capturePhoto(): void {
     if (!this.videoElement || !this.imageCanvas) return;
 
     const video = this.videoElement.nativeElement;
     const canvas = this.imageCanvas.nativeElement;
     const context = canvas.getContext('2d');
 
     canvas.width = video.videoWidth;
     canvas.height = video.videoHeight;
     context.drawImage(video, 0, 0, canvas.width, canvas.height);
     this.photoPreview = canvas.toDataURL('image/png');
 
     this.stopCamera();
 
     this.analyzeImage(this.photoPreview);
   }
 
   
   stopCamera(): void {
     if (this.videoStream) {
       this.videoStream.getTracks().forEach(track => track.stop());
     }
     this.showVideo = false;
   }
 
   
   onPhotoUpload(event: Event): void {
     const input = event.target as HTMLInputElement;
     if (input.files && input.files[0]) {
       const file = input.files[0];
 
       const allowedTypes = ['image/jpeg', 'image/png'];
       if (!allowedTypes.includes(file.type)) {
         this.photoError = 'Solo se permiten archivos .jpg y .png.';
         this.photoPreview = null;
         return;
       }
 
       const reader = new FileReader();
       reader.onload = () => {
         this.photoPreview = reader.result as string;
         this.analyzeImage(this.photoPreview);
       };
       reader.readAsDataURL(file);
     }
   }
 
   
   analyzeImage(imageBase64: string): void {
     const base64Data = imageBase64.split(',')[1];
   
     this.googleVisionService.extractTextFromImage(base64Data).subscribe(
       response => {
         const extractedText = response.responses[0]?.fullTextAnnotation?.text || 'No se detectó texto.';
         console.log('Texto extraído:', extractedText);
   
         this.openIaService.validarTexto(extractedText).subscribe(
           validationResponse => {
             console.log('Validación de cédula:', validationResponse); 
             if (validationResponse?.Result === "true") {
               console.log("El texto corresponde a una cédula colombiana.");
             } else {
               console.log("El texto no corresponde a una cédula colombiana.");
             }
           },
           error => {
             console.error('Error al validar el texto con OpenAI:', error);
           }
         );
       },
       error => {
         console.error('Error al procesar la imagen con OCR:', error);
       }
     );
   }
   
 
   
   onSubmit(): void {
     if (this.infoForm.valid) {
       console.log('Formulario enviado:', this.infoForm.value);
     } else {
       console.log('Formulario inválido.');
     }
   }

}
