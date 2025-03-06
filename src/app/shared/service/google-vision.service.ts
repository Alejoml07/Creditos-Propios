import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoogleVisionService {
  
  private apiKey = 'AIzaSyCUyAtakHlrFvUbN46im4Z3WRodKQ1XChU'; 
  private apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`;

  constructor(private http: HttpClient) {}

  extractTextFromImage(base64Image: string): Observable<any> {
    const requestBody = {
      requests: [
        {
          image: { content: base64Image },
          features: [{ type: 'TEXT_DETECTION' }]
        }
      ]
    };

    return this.http.post(this.apiUrl, requestBody);
  }
}