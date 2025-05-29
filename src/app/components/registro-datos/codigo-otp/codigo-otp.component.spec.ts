import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CodigoOtpComponent } from './codigo-otp.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

// Servicios mockeados
import { LoaderService } from 'src/app/shared/service/loader/loader.service';
import { LogService } from 'src/app/shared/service/logs/logs.service';
import { IdentityValidationsService } from 'src/app/shared/service/Identity-validations/identity-validations.service';
import { SecurityService } from 'src/app/shared/service/security.service';
import { FlowService } from 'src/app/shared/service/flow/flow.service';

describe('CodigoOtpComponent', () => {
  let component: CodigoOtpComponent;
  let fixture: ComponentFixture<CodigoOtpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CodigoOtpComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: LoaderService, useValue: jasmine.createSpyObj('LoaderService', ['show', 'hide']) },
        { provide: LogService, useValue: {} },
        { 
          provide: IdentityValidationsService, 
          useValue: jasmine.createSpyObj('IdentityValidationsService', ['enviarCodigoOtp', 'validarCodigoOtp']) 
        },
        { 
          provide: SecurityService, 
          useValue: jasmine.createSpyObj('SecurityService', ['getFlujoById']) 
        },
        { 
          provide: FlowService, 
          useValue: jasmine.createSpyObj('FlowService', ['setBackendFlow', 'markStepCompleted']) 
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CodigoOtpComponent);
    component = fixture.componentInstance;
    // NOTA: NO ejecutamos fixture.detectChanges aquí para controlar ngOnInit manualmente en algunos tests
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería invalidar el formulario si OTP está vacío', () => {
    component.otpForm.setValue({ otp: '' });
    expect(component.otpForm.valid).toBeFalse();
  });

  it('debería validar el formulario si OTP tiene 6 dígitos numéricos', () => {
    component.otpForm.setValue({ otp: '123456' });
    expect(component.otpForm.valid).toBeTrue();
  });

  it('debería seleccionar método correctamente', () => {
    component.selectedMethod = null; // aseguramos que no haya método ya seleccionado
    const startCountdownSpy = spyOn(component, 'startCountdown');
    component.selectMethod('sms');
    expect(component.selectedMethod).toBe('sms');
    expect(startCountdownSpy).toHaveBeenCalled();
  });

  it('debería iniciar el contador al seleccionar método', fakeAsync(() => {
    component.countdown = 2;
    component.startCountdown();
    tick(1000);
    expect(component.countdown).toBe(1);
    tick(1000);
    expect(component.countdown).toBe(0);
    tick(1000);
    expect(component.selectedMethod).toBeNull();
  }));

  it('debería validar un OTP correcto', fakeAsync(async () => {
    component.otpForm.setValue({ otp: '123456' });
    const identityService = TestBed.inject(IdentityValidationsService) as jasmine.SpyObj<IdentityValidationsService>;
    identityService.validarCodigoOtp.and.returnValue(Promise.resolve(true));

    await component.validateOtp();
    tick();

    expect(component.isOtpValid).toBeTrue();
  }));

  it('debería marcar OTP como inválido si el valor es incorrecto', fakeAsync(async () => {
    component.otpForm.setValue({ otp: '999999' });
    const identityService = TestBed.inject(IdentityValidationsService) as jasmine.SpyObj<IdentityValidationsService>;
    identityService.validarCodigoOtp.and.returnValue(Promise.resolve(false));

    await component.validateOtp();
    tick();

    expect(component.isOtpValid).toBeFalse();
  }));
});
