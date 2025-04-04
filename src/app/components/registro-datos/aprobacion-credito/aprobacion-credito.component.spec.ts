import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AprobacionCreditoComponent } from './aprobacion-credito.component';

describe('AprobacionCreditoComponent', () => {
  let component: AprobacionCreditoComponent;
  let fixture: ComponentFixture<AprobacionCreditoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AprobacionCreditoComponent]
    });
    fixture = TestBed.createComponent(AprobacionCreditoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
