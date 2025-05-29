import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DatosBasicosComponent } from './datos-basicos.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { UsuariosService } from 'src/app/shared/service/usuarios.service';
import { DataBasicService } from 'src/app/shared/service/data-basic/data-basic.service';
import { LoaderService } from 'src/app/shared/service/loader/loader.service';
import { SecurityService } from 'src/app/shared/service/security.service';
import { FlowService } from 'src/app/shared/service/flow/flow.service';
import { UserSessionService } from 'src/app/shared/service/user-session.service';

describe('DatosBasicosComponent', () => {
  let component: DatosBasicosComponent;
  let fixture: ComponentFixture<DatosBasicosComponent>;

  let mockUsuariosService: jasmine.SpyObj<UsuariosService>;
  let mockDataBasicService: jasmine.SpyObj<DataBasicService>;
  let mockLoaderService: jasmine.SpyObj<LoaderService>;
  let mockSecurityService: jasmine.SpyObj<SecurityService>;
  let mockFlowService: jasmine.SpyObj<FlowService>;
  let mockUserSessionService: jasmine.SpyObj<UserSessionService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockUsuariosService = jasmine.createSpyObj('UsuariosService', [
      'getDocumentos',
      'addEstudioCredito',
      'solicitudDocumentosLegales'
    ]);

    mockUsuariosService.getDocumentos.and.returnValue(of({ isSuccess: true, result: [] }));
    mockUsuariosService.solicitudDocumentosLegales.and.returnValue(of({ isSuccess: true }));

    mockDataBasicService = jasmine.createSpyObj('DataBasicService', [
      'ValidarEstadoEstudioCredito',
      'ValidarEstadoCelular',
      'addEstudioCredito',
      'encryptIP'
    ]);

    mockLoaderService = jasmine.createSpyObj('LoaderService', ['show', 'hide']);
    mockSecurityService = jasmine.createSpyObj('SecurityService', ['getFlujoById', 'getIp']);
    mockFlowService = jasmine.createSpyObj('FlowService', ['setBackendFlow', 'markStepCompleted', 'goToNext']);
    mockUserSessionService = jasmine.createSpyObj('UserSessionService', ['setDatosBasicos']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    
    mockSecurityService.getFlujoById.and.returnValue(of({ isSuccess: true, message: '', result: [] }));
    mockSecurityService.getIp.and.returnValue(of({ ip: '192.168.0.1' }));
    mockDataBasicService.encryptIP.and.returnValue('encrypted_ip');

    await TestBed.configureTestingModule({
      declarations: [DatosBasicosComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: UsuariosService, useValue: mockUsuariosService },
        { provide: DataBasicService, useValue: mockDataBasicService },
        { provide: LoaderService, useValue: mockLoaderService },
        { provide: SecurityService, useValue: mockSecurityService },
        { provide: FlowService, useValue: mockFlowService },
        { provide: UserSessionService, useValue: mockUserSessionService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DatosBasicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call addEstudioCredito and navigate when form is valid', fakeAsync(async () => {
    component.FormDataBasicUser.setValue({
      documentType: '1',
      document: '123456789',
      cellular: '3001234567',
      lastName: 'Pérez',
      documentExpedition: '2023-01-01',
      email: 'test@example.com',
      dataPolicy: true
    });

    mockDataBasicService.addEstudioCredito.and.returnValue(Promise.resolve(true));

    await component.onSubmit();
    tick();

    expect(mockUserSessionService.setDatosBasicos).toHaveBeenCalled();
    expect(mockUsuariosService.solicitudDocumentosLegales).toHaveBeenCalled();
    expect(mockFlowService.goToNext).toHaveBeenCalledWith(component['router'].url);
  }));

  it('should mark all fields as touched if form is invalid', async () => {
    component.FormDataBasicUser.markAllAsTouched = jasmine.createSpy();
    component.FormDataBasicUser.get('document')?.setValue('');
    await component.onSubmit();
    expect(component.FormDataBasicUser.markAllAsTouched).toHaveBeenCalled();
  });

  it('should show warning if document already has approved credit', fakeAsync(() => {
 mockDataBasicService.ValidarEstadoEstudioCredito.and.returnValue(Promise.resolve({
  isSuccess: true,
  message: 'Proceso activo',
  result: true
}));
    component['ValidarEstadoEstudioCredito']('123456789').then(() => {
      expect(component.documentWarning).toBeTruthy();
      expect(component.documentWarningButton).toBeTrue();
    });
  }));

  it('should clear warning if no active credit found', fakeAsync(() => {
   mockDataBasicService.ValidarEstadoEstudioCredito.and.returnValue(Promise.resolve({
  isSuccess: true,
  message: 'Proceso activo',
  result: false
}));
    component['ValidarEstadoEstudioCredito']('987654321').then(() => {
      expect(component.documentWarning).toBeNull();
      expect(component.documentWarningButton).toBeFalse();
    });
  }));
});
