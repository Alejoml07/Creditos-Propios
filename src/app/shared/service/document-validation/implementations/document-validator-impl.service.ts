import { HttpClient, HttpHeaders } from "@angular/common/http";
import { DocumentoValido, IDocumentValidator, ValidationResult } from "../interfaces/document-validator.interface";
import { PromptFactoryService } from "../prompt-factory.service";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";

@Injectable({ providedIn: 'root' })
export class DocumentValidatorImplementation implements IDocumentValidator {
  private readonly model = 'gpt-4o-mini';
  private apiUrl = 'https://api.openai.com/v1/chat/completions';
  private apiKey = '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'; 


  constructor(private http: HttpClient, private promptFactory: PromptFactoryService) {}

  private callOpenAi(base64: string, prompt: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    });

    const body = {
      model: this.model,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: [{ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}` } }] }
      ],
      max_tokens: 700
    };

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      map(res => {
        const raw = res.choices[0]?.message?.content ?? '';
        return JSON.parse(raw.replace(/```json|```/g, '').trim());
      }),
      catchError(err => {
        console.error('Error con OpenAI:', err);
        return of({ isValid: false, errores: [{ campo: 'general', detalle: 'Error en la validación' }] });
      })
    );
  }

  validateAuthenticity(base64Image: string): Observable<ValidationResult> {
    const prompt = this.promptFactory.createPrompt('authenticity');
    return this.callOpenAi(base64Image, prompt);
  }

  validateFields(base64Image: string): Observable<ValidationResult> {
    const prompt = this.promptFactory.createPrompt('fields');
    return this.callOpenAi(base64Image, prompt);
  }

  validateVisualConditions(base64Image: string): Observable<ValidationResult> {
    const prompt = this.promptFactory.createPrompt('visual');
    return this.callOpenAi(base64Image, prompt);
  }

  extractValidData(base64Image: string): Observable<DocumentoValido> {
    const prompt = this.promptFactory.createPrompt('extract');
    return this.callOpenAi(base64Image, prompt);
  }
}