import { Observable } from "rxjs";

export interface IDocumentValidator {
  validateAuthenticity(base64Image: string): Observable<ValidationResult>;
  validateFields(base64Image: string): Observable<ValidationResult>;
  validateVisualConditions(base64Image: string): Observable<ValidationResult>;
  extractValidData(base64Image: string): Observable<DocumentoValido>;
}

export interface ValidationResult {
  isValid: boolean;
  errores?: { campo: string; detalle: string }[];
  recomendaciones?: string[];
}

export interface DocumentoValido {
  esDocumentoValido: true;
  numeroCedula: string;
  nombres: string;
  apellidos: string;
  textoExtraido: string;
  recomendaciones: string[];
}