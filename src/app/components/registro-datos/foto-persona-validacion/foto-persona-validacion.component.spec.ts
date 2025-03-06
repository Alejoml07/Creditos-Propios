import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FotoPersonaValidacionComponent } from './foto-persona-validacion.component';

describe('FotoPersonaValidacionComponent', () => {
  let component: FotoPersonaValidacionComponent;
  let fixture: ComponentFixture<FotoPersonaValidacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FotoPersonaValidacionComponent]
    });
    fixture = TestBed.createComponent(FotoPersonaValidacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
