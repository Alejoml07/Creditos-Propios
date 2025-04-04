import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodigoOtpComponent } from './codigo-otp.component';

describe('CodigoOtpComponent', () => {
  let component: CodigoOtpComponent;
  let fixture: ComponentFixture<CodigoOtpComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CodigoOtpComponent]
    });
    fixture = TestBed.createComponent(CodigoOtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
