import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosBasicosComponent } from './datos-basicos.component';

describe('DatosBasicosComponent', () => {
  let component: DatosBasicosComponent;
  let fixture: ComponentFixture<DatosBasicosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DatosBasicosComponent]
    });
    fixture = TestBed.createComponent(DatosBasicosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
