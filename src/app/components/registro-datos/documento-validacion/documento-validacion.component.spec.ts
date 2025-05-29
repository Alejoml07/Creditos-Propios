import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DocumentoValidacionComponent } from './documento-validacion.component';
import { GoogleVisionService } from 'src/app/shared/service/google-vision.service';
import { OpenIaService } from 'src/app/shared/service/open-ia.service';
import { UsuariosService } from 'src/app/shared/service/usuarios.service';
import { DocumentValidationService } from 'src/app/shared/service/document-validation/document-validation.service';
import { UserSessionService } from 'src/app/shared/service/user-session.service';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // ✅ Importado aquí
import { of } from 'rxjs';

describe('DocumentoValidacionComponent', () => {
  let component: DocumentoValidacionComponent;
  let fixture: ComponentFixture<DocumentoValidacionComponent>;

  const mockVisionService = jasmine.createSpyObj('GoogleVisionService', ['extractTextFromImage']);
  const mockOpenIaService = jasmine.createSpyObj('OpenIaService', ['analyzeDocument']);
  const mockDocumentValidationService = jasmine.createSpyObj('DocumentValidationService', ['validarDocumento']);
  const mockUsuariosService = jasmine.createSpyObj('UsuariosService', ['guardarImagenUsuario']);
  const mockUserSessionService = jasmine.createSpyObj('UserSessionService', ['getDatosBasicos']);
  const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // ✅ Agregado aquí
      declarations: [DocumentoValidacionComponent],
      providers: [
        { provide: GoogleVisionService, useValue: mockVisionService },
        { provide: OpenIaService, useValue: mockOpenIaService },
        { provide: DocumentValidationService, useValue: mockDocumentValidationService },
        { provide: UsuariosService, useValue: mockUsuariosService },
        { provide: UserSessionService, useValue: mockUserSessionService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentoValidacionComponent);
    component = fixture.componentInstance;

    // Simular datos de sesión básicos
    mockUserSessionService.getDatosBasicos.and.returnValue({
      document: '123456789'
    });

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should validate a valid document', () => {
    const mockResponse = {
      esDocumentoValido: true,
      textoExtraido: 'CC 123456789',
      numeroCedula: '123456789'
    };

    mockDocumentValidationService.validarDocumento.and.returnValue(of(mockResponse));

    const base64 = 'data:image/png;base64,fakeimage';
    component.validatePhoto(base64);

    expect(mockDocumentValidationService.validarDocumento).toHaveBeenCalled();
  });

  it('should handle invalid document', () => {
    const mockResponse = {
      esDocumentoValido: false,
      errores: ['Error de formato']
    };

    mockDocumentValidationService.validarDocumento.and.returnValue(of(mockResponse));

    const base64 = 'data:image/png;base64,fakeimage';
    component.validatePhoto(base64);

    expect(component.IsCorrectPhoto).toBeFalse();
    expect(component.validationComplete).toBeTrue();
  });

  it('should navigate after submission', fakeAsync(() => {
    component.IsCorrectPhoto = true;
    component.photoBase64 = 'data:image/png;base64,fake';

    mockUsuariosService.guardarImagenUsuario.and.returnValue(of({}));

    component.onSubmit();
    tick(3000); // espera simulada

    expect(mockUsuariosService.guardarImagenUsuario).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/registro/aprobacion-credito']);
  }));
});