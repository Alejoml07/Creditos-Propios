import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TratamientoDatosComponent } from './tratamiento-datos.component';
import { GoogleVisionService } from 'src/app/shared/service/google-vision.service';
import { OpenIaService } from 'src/app/shared/service/open-ia.service';
import { of } from 'rxjs';

describe('TratamientoDatosComponent', () => {
  let component: TratamientoDatosComponent;
  let fixture: ComponentFixture<TratamientoDatosComponent>;

  // Servicios mockeados
  let mockGoogleVisionService: jasmine.SpyObj<GoogleVisionService>;
  let mockOpenIaService: jasmine.SpyObj<OpenIaService>;

  beforeEach(async () => {
    mockGoogleVisionService = jasmine.createSpyObj('GoogleVisionService', ['extractTextFromImage']);
    mockOpenIaService = jasmine.createSpyObj('OpenIaService', ['validarTexto']);

    await TestBed.configureTestingModule({
      declarations: [TratamientoDatosComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: GoogleVisionService, useValue: mockGoogleVisionService },
        { provide: OpenIaService, useValue: mockOpenIaService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TratamientoDatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with required controls', () => {
    const form = component.infoForm;
    expect(form.contains('fechaNacimiento')).toBeTrue();
    expect(form.contains('fechaExpedicion')).toBeTrue();
    expect(form.contains('genero')).toBeTrue();
    expect(form.contains('celularAlternativo')).toBeTrue();
  });

  it('should detect and extract text from image and validate it', () => {
    const mockText = 'Cédula de ciudadanía de Colombia';
    const mockExtractResponse = {
      responses: [
        {
          fullTextAnnotation: {
            text: mockText
          }
        }
      ]
    };

    const mockValidationResponse = {
      Result: "true"
    };

    mockGoogleVisionService.extractTextFromImage.and.returnValue(of(mockExtractResponse));
    mockOpenIaService.validarTexto.and.returnValue(of(mockValidationResponse));

    const fakeBase64Image = 'data:image/png;base64,fakebase64data';
    component.analyzeImage(fakeBase64Image);

    expect(mockGoogleVisionService.extractTextFromImage).toHaveBeenCalled();
    expect(mockOpenIaService.validarTexto).toHaveBeenCalledWith(mockText);
  });
});
