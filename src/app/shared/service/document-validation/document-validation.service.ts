import { Injectable } from '@angular/core';
import { DocumentValidatorImplementation } from './implementations/document-validator-impl.service';
import { Observable, of, switchMap, tap } from 'rxjs';
import { DocumentoValido, ValidationResult } from './interfaces/document-validator.interface';

@Injectable({
  providedIn: 'root'
})
export class DocumentValidationService {

constructor(private validator: DocumentValidatorImplementation) {}



validarDocumento(base64: string): Observable<ValidationResult | DocumentoValido> {
  return this.validator.validateAuthenticity(base64).pipe(
    tap(auth => console.log('🔍 Validación de autenticidad:', auth)),
    switchMap(auth =>
      !auth.isValid ? of(auth) :
      this.validator.validateFields(base64).pipe(
        tap(fields => console.log('📄 Validación de campos:', fields)),
        switchMap(fields =>
          !fields.isValid ? of(fields) :
          this.validator.extractValidData(base64).pipe(
            tap(data => console.log('✅ Extracción de datos válida:', data))
          )
        )
      )
    )
  );
}




}
