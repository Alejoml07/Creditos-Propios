import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentityDeniedComponent } from './identity-denied.component';

describe('IdentityDeniedComponent', () => {
  let component: IdentityDeniedComponent;
  let fixture: ComponentFixture<IdentityDeniedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdentityDeniedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdentityDeniedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
