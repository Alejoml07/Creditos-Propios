import { Component, ElementRef, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-informacion-complementaria',
  templateUrl: './informacion-complementaria.component.html',
  styleUrls: ['./informacion-complementaria.component.scss']
})
export class InformacionComplementariaComponent implements OnInit {
  myForm!: FormGroup;
    resultado: any;


  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.myForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthDate: ['', Validators.required],
      documentExpedition: ['', Validators.required],
      gender: ['', Validators.required],
      email: ['', Validators.required]
    });
  }

  isInvalid(field: string): boolean {
    return this.myForm.get(field)?.invalid && (this.myForm.get(field)?.touched || this.myForm.get(field)?.dirty);
  }

  onSubmit(): void {
    if (this.myForm.valid) {
      console.log('Datos del formulario:', this.myForm.value);
      this.router.navigate(['/registro/documento-validacion']);
    }
  }
  
}
