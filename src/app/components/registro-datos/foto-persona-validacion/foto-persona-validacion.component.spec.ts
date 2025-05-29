import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FotoPersonaValidacionComponent } from './foto-persona-validacion.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';
import { OpenIaService } from 'src/app/shared/service/open-ia.service';
import { UsuariosService } from 'src/app/shared/service/usuarios.service';
import { RekognitionService } from 'src/app/shared/service/rekognition.service';

// Mocks de servicios con al menos un método espía
const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
const mockRekognitionService = jasmine.createSpyObj('RekognitionService', ['dummy']);
const mockOpenIaService = jasmine.createSpyObj('OpenIaService', ['analyzeImage']);
const mockUsuariosService = jasmine.createSpyObj('UsuariosService', ['validarUsuario']);

describe('FotoPersonaValidacionComponent', () => {
  let component: FotoPersonaValidacionComponent;
  let fixture: ComponentFixture<FotoPersonaValidacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [FotoPersonaValidacionComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ChangeDetectorRef, useValue: { detectChanges: () => {} } },
        { provide: OpenIaService, useValue: mockOpenIaService },
        { provide: RekognitionService, useValue: mockRekognitionService },
        { provide: UsuariosService, useValue: mockUsuariosService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FotoPersonaValidacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to /registro/codigo-otp on submit', () => {
    localStorage.setItem('datosBasicos', JSON.stringify({
      document: '123456789',
      documentExpedition: '2024-01-01'
    }));

    spyOn(component, 'mostrarAlertaCarga'); // evitar SweetAlert en test

    component.onSubmit();

    expect(component.mostrarAlertaCarga).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/registro/codigo-otp']);
  });

  it('should handle image validation correctly (valid)', () => {
    const mockResponse = {
      esFotoTomadaEnVivo: true,
      razon: '',
      textoExtraido: 'foto'
    };

    mockOpenIaService.analyzeImage.and.returnValue(of(mockResponse));

    component.validatePhoto('data:image/png;base64,fake');

    expect(mockOpenIaService.analyzeImage).toHaveBeenCalled();
  });
});
