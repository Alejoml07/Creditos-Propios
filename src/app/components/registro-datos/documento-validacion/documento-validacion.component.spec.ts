import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentoValidacionComponent } from './documento-validacion.component';

describe('DocumentoValidacionComponent', () => {
  let component: DocumentoValidacionComponent;
  let fixture: ComponentFixture<DocumentoValidacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentoValidacionComponent]
    });
    fixture = TestBed.createComponent(DocumentoValidacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
