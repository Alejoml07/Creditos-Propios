import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DocumentoTraseraValidacionComponent } from './documento-trasera-validacion.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';

// Servicios mockeados
import { GoogleVisionService } from 'src/app/shared/service/google-vision.service';
import { OpenIaService } from 'src/app/shared/service/open-ia.service';

describe('DocumentoTraseraValidacionComponent', () => {
  let component: DocumentoTraseraValidacionComponent;
  let fixture: ComponentFixture<DocumentoTraseraValidacionComponent>;

  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
  const mockGoogleVisionService = jasmine.createSpyObj('GoogleVisionService', ['extractTextFromImage']);
  const mockOpenIaService = jasmine.createSpyObj('OpenIaService', ['analyzeBacksideDocument']);
  const mockChangeDetectorRef = { detectChanges: jasmine.createSpy('detectChanges') };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [DocumentoTraseraValidacionComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef },
        { provide: GoogleVisionService, useValue: mockGoogleVisionService },
        { provide: OpenIaService, useValue: mockOpenIaService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentoTraseraValidacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate after onSubmit timeout', fakeAsync(() => {
    component.onSubmit();

    tick(3000); // simula los 3 segundos del setTimeout

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/registro/foto-validacion']);
  }));

  it('should validate photo and mark it as valid', () => {
    const responseMock = { esDocumentoValido: true, textoExtraido: 'mock text' };
    mockOpenIaService.analyzeBacksideDocument.and.returnValue(of(responseMock));

    component.validatePhoto('data:image/png;base64,mockbase64');

    expect(mockOpenIaService.analyzeBacksideDocument).toHaveBeenCalled();
    expect(component.IsCorrectPhoto).toBeTrue();
    expect(component.validationComplete).toBeTrue();
  });
});
