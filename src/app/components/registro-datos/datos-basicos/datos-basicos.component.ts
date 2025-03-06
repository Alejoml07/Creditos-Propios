import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertaService } from 'src/app/shared/service/alerta.service';
import { RekognitionService } from 'src/app/shared/service/rekognition.service';


@Component({
  selector: 'app-datos-basicos',
  templateUrl: './datos-basicos.component.html',
  styleUrls: ['./datos-basicos.component.scss']
})
export class DatosBasicosComponent {
  myForm!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    const noSpecialChars = /^[A-Za-z0-9 ]*$/;

    this.myForm = this.fb.group({
      documentType: ['', Validators.required],
      document: ['',[Validators.required, Validators.pattern(noSpecialChars)]],
      cellular: ['',[Validators.required, Validators.pattern(noSpecialChars)]
      ]
    });
  }

  isInvalid(field: string): boolean {
    return this.myForm.get(field)?.invalid && (this.myForm.get(field)?.touched || this.myForm.get(field)?.dirty);
  }

  onSubmit(): void {
    if (this.myForm.valid) {
      console.log('Datos del formulario:', this.myForm.value);
      this.router.navigate(['/registro/informacion-complementaria']);

    }
  }

  

}
