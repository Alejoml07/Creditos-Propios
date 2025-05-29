import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AprobacionCreditoComponent } from './aprobacion-credito.component';
import { HttpClientTestingModule } from '@angular/common/http/testing'; // ✅ Simula HttpClient
import { RouterTestingModule } from '@angular/router/testing';          // ✅ Simula Router
import { LoaderService } from 'src/app/shared/service/loader/loader.service';
import { UsuariosService } from 'src/app/shared/service/usuarios.service';

describe('AprobacionCreditoComponent', () => {
  let component: AprobacionCreditoComponent;
  let fixture: ComponentFixture<AprobacionCreditoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AprobacionCreditoComponent],
      imports: [
        HttpClientTestingModule, // ✅ Requerido para servicios con HttpClient
        RouterTestingModule      // ✅ Requerido si el componente usa Router
      ],
      providers: [
        LoaderService,
        UsuariosService
      ]
    });

    fixture = TestBed.createComponent(AprobacionCreditoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});