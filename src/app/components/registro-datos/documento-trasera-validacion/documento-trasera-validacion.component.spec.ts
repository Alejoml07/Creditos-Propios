import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentoTraseraValidacionComponent } from './documento-trasera-validacion.component';

describe('DocumentoTraseraValidacionComponent', () => {
  let component: DocumentoTraseraValidacionComponent;
  let fixture: ComponentFixture<DocumentoTraseraValidacionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DocumentoTraseraValidacionComponent]
    });
    fixture = TestBed.createComponent(DocumentoTraseraValidacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
