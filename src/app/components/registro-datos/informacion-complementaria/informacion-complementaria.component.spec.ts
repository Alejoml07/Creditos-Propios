import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InformacionComplementariaComponent } from './informacion-complementaria.component';

describe('InformacionComplementariaComponent', () => {
  let component: InformacionComplementariaComponent;
  let fixture: ComponentFixture<InformacionComplementariaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InformacionComplementariaComponent]
    });
    fixture = TestBed.createComponent(InformacionComplementariaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
