import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreditDeniedComponent } from './credit-denied.component';

describe('CreditDeniedComponent', () => {
  let component: CreditDeniedComponent;
  let fixture: ComponentFixture<CreditDeniedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditDeniedComponent] // ✅ Standalone components van en imports
    }).compileComponents();

    fixture = TestBed.createComponent(CreditDeniedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set currentYear correctly', () => {
    const currentYear = new Date().getFullYear();
    expect(component.currentYear).toBe(currentYear);
  });

  it('should log when contactSupport is called', () => {
    spyOn(console, 'log');
    component.contactSupport();
    expect(console.log).toHaveBeenCalledWith('Botón "Contactar a Soporte" clickeado.');
  });

  it('should log when goToDashboard is called', () => {
    spyOn(console, 'log');
    component.goToDashboard();
    expect(console.log).toHaveBeenCalledWith('Botón "Volver al Inicio" clickeado.');
  });
});
