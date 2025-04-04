import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OpenIaService {

  private apiUrl = 'https://api.openai.com/v1/chat/completions';
  private apiKey = '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'; 

  constructor(private http: HttpClient) {}

  validarTexto(prompt: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      "Authorization": `Bearer ${this.apiKey}`
    });

    const payload = {
      model: 'gpt-3.5-turbo', 
      messages: [
        {
          role: 'system',
          content: `Eres un experto en validación de documentos oficiales de identidad. 
          Tu tarea es analizar el texto recibido y determinar si corresponde a una cédula de ciudadanía de Colombia.
          
          Para que el texto sea considerado como una cédula de ciudadanía colombiana, debe cumplir con los siguientes criterios:
          1. Debe contener las palabras clave 'REPÚBLICA DE COLOMBIA' y 'CÉDULA DE CIUDADANÍA'.
          2. Debe incluir una sección con un número de identificación compuesto solo por dígitos (puede contener puntos o espacios como separadores).
          3. Debe tener al menos un nombre y un apellido claramente indicados.
          4. Puede contener palabras clave adicionales como 'IDENTIFICACIÓN PERSONAL', 'NOMBRES', 'APELLIDOS', 'FECHA DE NACIMIENTO', etc.
          5. No debe incluir referencias a otros documentos de identidad como pasaportes, licencias de conducción, cédulas extranjeras, etc.
    
          Responde estrictamente en formato JSON con:
          - {\"Result\": \"true\"} si el texto tiene los elementos clave de una cédula de ciudadanía colombiana.
          - {\"Result\": \"false\"} si no cumple con los requisitos.
    
          Tu única respuesta debe ser estrictamente en formato JSON sin ningún otro texto adicional.`
        },
        {
          role: 'user',
          content: prompt // Aquí se envía el texto extraído de la cédula
        }
      ],
      temperature: 0.2
    };
    

    return this.http.post<any>(this.apiUrl, payload, { headers }).pipe(
      map(response => {
        const mensaje = response.choices[0].message.content;
        console.log('Saliendo del llamado:', mensaje);
        return JSON.parse(mensaje);
      }),
      catchError(error => {
        console.error('Error al llamar a OpenAI:', error);
        return throwError(() => new Error('No se pudo validar el texto con OpenAI.'));
      })
    );
  }

   // Analiza la imagen y valida si es una persona real
   analyzeImage(base64Image: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    });

    const promptText = `
      Eres un experto en validación de imágenes de personas en tiempo real.
      Tu tarea es analizar la imagen y determinar si:
      - Contiene un rostro humano claramente visible y definido.
      - La imagen tiene buena calidad, con un rostro bien nítido y sin desenfoques.
      - No es una imagen tomada previamente de una galería o de la pantalla de otro dispositivo.
      - No ha sido manipulada (captura de pantalla, foto de otra pantalla, etc.).
      
      Para evaluar la nitidez y calidad:
      - El rostro debe estar bien iluminado y con buena resolución.
      - No debe haber distorsiones o desenfoques significativos.
      - La imagen debe tener una proporción adecuada de rostro visible.

      Responde en formato JSON:
      {
        "esFotoTomadaEnVivo": true, 
        "rostroDetectado": true,
        "rostroNitido": true
      } si la imagen es válida.

      Si hay problemas, responde:
      {
        "esFotoTomadaEnVivo": false,
        "razon": "Explicación breve del problema."
      }`;

    const body = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: promptText
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500
    };

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      map(response => {
        try {
          let mensaje = response.choices[0]?.message?.content ?? "";
          mensaje = mensaje.replace(/```json|```/g, "").trim();
          return JSON.parse(mensaje);
        } catch (error) {
          console.error('Error al parsear la respuesta de OpenAI:', error);
          return { esFotoTomadaEnVivo: false, rostroDetectado: false, rostroNitido: false, razon: "Error al interpretar la respuesta de OpenAI." };
        }
      }),
      catchError(error => {
        console.error('Error en la solicitud a OpenAI:', error);
        return of({ esFotoTomadaEnVivo: false, rostroDetectado: false, rostroNitido: false, razon: "Error en la validación de la imagen." });
      })
    );
}


analyzeDocument(base64Image: string): Observable<any> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.apiKey}`
  });

  const promptText = `
    Eres un experto en OCR y validación de cédulas de ciudadanía colombianas. 
    Extrae el texto de la imagen y determina si es una cédula válida.

    **Criterios de validación obligatorios:**
    1. **Documento impreso**: No manuscrito. No más de un documento en la imagen.
    2. **Sin obstrucciones**: Nada debe tapar la cédula (objetos, papeles, dedos, reflejos, etc.).
    3. **Encabezado obligatorio**: Debe contener 'REPÚBLICA DE COLOMBIA' y 'CÉDULA DE CIUDADANÍA'.
    4. **Número de cédula (OBLIGATORIO y COMPLETAMENTE VISIBLE)**: 
       - Debe detectarse claramente en la imagen y contener solo dígitos (puede incluir puntos o espacios).  
       - **Si el número de cédula no se puede leer, es parcial, ilegible o "no visible", el documento ES INVÁLIDO.**  
    5. **Nombre completo**: Debe incluir al menos un nombre y un apellido.
    6. **Información relevante**: Puede incluir 'NOMBRES', 'APELLIDOS', 'FECHA DE NACIMIENTO'.
    7. **Sin referencias a otros documentos**: No debe mencionar pasaportes, licencias de conducción, etc.
    8. **Formato estructurado**: Debe seguir el diseño oficial de una cédula colombiana.
    9. **No es una imagen tomada previamente de una galería o de la pantalla de otro dispositivo, No ha sido manipulada (captura de pantalla, foto de otra pantalla, etc.). **


    **Formato de respuesta JSON (estricto):**
    - Si el documento es válido:
    {
      "esDocumentoValido": true,
      "numeroCedula": "Número extraído",
      "nombres": "Nombre detectado",
      "apellidos": "Apellido detectado",
      "textoExtraido": "Texto detectado"
    }

    - **Si el número de cédula NO es visible o no se puede leer, la respuesta debe ser:**  
    {
      "esDocumentoValido": false,
      "razon": "Número de cédula no visible o ilegible. Documento inválido."
    }
`;



  const body = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: promptText
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ]
      }
    ],
    max_tokens: 700
  };

  return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
    map(response => {
      try {
        let mensaje = response.choices[0]?.message?.content ?? "";
        mensaje = mensaje.replace(/```json|```/g, "").trim();
        return JSON.parse(mensaje);
      } catch (error) {
        console.error('Error al parsear la respuesta de OpenAI:', error);
        return { esDocumentoValido: false, razon: "Error al interpretar la respuesta de OpenAI." };
      }
    }),
    catchError(error => {
      console.error('Error en la solicitud a OpenAI:', error);
      return of({ esDocumentoValido: false, razon: "Error en la validación del documento." });
    })
  );
}

analyzeBacksideDocument(base64Image: string): Observable<any> {
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${this.apiKey}`
  });

  const promptText = `
  Eres un experto en OCR y validación de documentos. Analiza la imagen y verifica si es la cara posterior de una cédula de ciudadanía colombiana.

  ### **Validaciones de Seguridad**
  1. **No debe ser un pantallazo, edición digital ni documento falsificado.**
  2. **Debe contener elementos de seguridad intactos (huella, código de barras, firma y fondo de seguridad).**
  3. **La imagen debe ser nítida y sin reflejos, cortes, distorsión o elementos que obstruyan la información.**

  ### **Información Obligatoria (Debe ser 100% legible)**
  - **Fecha de Nacimiento**.
  - **Lugar de Nacimiento**.
  - **Estatura**.
  - **Grupo Sanguíneo (G.S RH)**.
  - **Sexo**.
  - **Fecha de Expedición**.
  - **Lugar de Expedición**.
  - **Código de Barras intacto**.
  - **Huella Dactilar clara y sin alteraciones**.

  **Si algún dato está ilegible o falta, el documento NO es válido.**

  ### **Formato de Respuesta JSON (STRICT)**
   **Si el documento es válido:**  
  {
    "esDocumentoValido": true,
    "fechaNacimiento": "Fecha de nacimiento detectada",
    "lugarNacimiento": "Lugar de nacimiento detectado",
    "estatura": "Estatura detectada",
    "grupoSanguineo": "Grupo sanguíneo detectado",
    "sexo": "Sexo detectado",
    "fechaExpedicion": "Fecha de expedición detectada",
    "lugarExpedicion": "Lugar de expedición detectado",
    "textoExtraido": "Texto detectado en la imagen"
  }

   **Si la imagen NO cumple con los criterios de seguridad:**  
  {
    "esDocumentoValido": false,
    "razon": "El documento es ilegible, está alterado o faltan elementos de seguridad."
  }

   **Solo responde en formato JSON sin texto adicional.**
`;


  const body = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: promptText
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }
        ]
      }
    ],
    max_tokens: 700
  };

  return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
    map(response => {
      try {
        let mensaje = response.choices[0]?.message?.content ?? "";
        mensaje = mensaje.replace(/```json|```/g, "").trim();
        return JSON.parse(mensaje);
      } catch (error) {
        console.error('Error al parsear la respuesta de OpenAI:', error);
        return { esDocumentoValido: false, razon: "Error al interpretar la respuesta de OpenAI." };
      }
    }),
    catchError(error => {
      console.error('Error en la solicitud a OpenAI:', error);
      return of({ esDocumentoValido: false, razon: "Error en la validación del documento." });
    })
  );
}




  

}
