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
Eres un sistema experto en verificación facial en tiempo real. Tu tarea es analizar una imagen para determinar si cumple con los requisitos mínimos de una foto viva, clara y segura para procesos de autenticación facial.

Evalúa si la imagen cumple con las siguientes condiciones **mínimas de seguridad**, aplicando una evaluación **tolerante con la calidad**, especialmente considerando que muchas personas usan dispositivos de gama baja. No seas estricto con resolución, definición o iluminación, mientras el rostro sea reconocible y no haya indicios de manipulación o suplantación.

✅ ACEPTADO si:
- Hay un **único rostro humano** claramente reconocible.
- El rostro está **visiblemente descubierto**, es decir, **sin obstrucciones graves** (como manos, tapabocas, gafas oscuras u objetos que oculten los ojos, nariz o boca por completo).
- **Se permite cabello en la frente, barba, arrugas o cualquier rasgo natural**, siempre que el rostro sea visible y no esté cubierto significativamente.
- El rostro está **mayormente visible**, aunque no esté perfectamente centrado o completamente recto.
- La imagen **no debe ser una foto de una pantalla, una imagen impresa, ni estar manipulada digitalmente** (recortes, filtros, montajes).

⚠️ No se requiere una expresión neutra, alineación exacta ni calidad profesional. La prioridad es que sea una foto auténtica, tomada en vivo, donde se reconozca claramente un solo rostro sin indicios de suplantación.

---

### RESPUESTA SI LA IMAGEN ES ACEPTADA:

{
  "esFotoTomadaEnVivo": true,
  "rostroDetectado": true,
  "rostroNitido": true,
  "rostroCentrado": true,
  "sinObstrucciones": true,
  "unicoRostro": true,
  "buenaIluminacion": true
}

---

### RESPUESTA SI HAY ALGÚN PROBLEMA:

{
  "esFotoTomadaEnVivo": false,
  "razon": "Motivo exacto del rechazo. Ejemplos: 'El rostro está cubierto por una mano', 'Se detectan dos rostros', 'La imagen parece una captura de pantalla', 'La calidad es tan baja que no se reconoce ningún rostro'."
}
`.trim();

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
Eres un sistema experto en validación documental y OCR para cédulas de ciudadanía colombianas.

Tu tarea es:
- Analizar visualmente una imagen de cédula de ciudadanía colombiana.
- Extraer campos clave.
- Validar si el documento es real, legible, auténtico y apto para una solicitud de crédito.

---

### Requisitos mínimos (todos deben cumplirse):

1. **Documento físico original**
   - No se aceptan imágenes escaneadas, capturas de pantalla o manipuladas.
   - Rechaza imágenes con recortes artificiales, firmas agregadas o sellos sospechosos.
   - La imagen debe ser de una cédula física, no de un documento digital o editado.
   - No puede ser desde un celular o tableta.

2. **Campos obligatorios que deben estar completamente legibles y visibles**:
   - **numeroCedula**: Número de 7 a 10 dígitos, visible sin estar tapado o borroso.
   - **nombres**: Al menos un nombre completo visible.
   - **apellidos**: Al menos un apellido visible y legible.
   - **encabezado**: El texto "REPÚBLICA DE COLOMBIA" y "CÉDULA DE CIUDADANÍA" debe estar presente.

 Muy importante: **NO devuelvas errores en estos campos si puedes leerlos parcial o totalmente. SOLO marca un campo como error si realmente NO se ve o es ilegible con claridad.**

3. **Condiciones visuales permitidas**:
   - Se permiten dedos o reflejos **si no cubren texto importante**.
   - La cédula debe estar enfocada y completamente dentro del encuadre.

---

###  Formato de salida JSON:

-  Si todos los campos son legibles:

{
  "esDocumentoValido": true,
  "numeroCedula": "Número extraído, devolverlo sin puntos ni espacios",
  "nombres": "Nombre extraído",
  "apellidos": "Apellido extraído",
  "textoExtraido": "Texto completo extraído",
  "recomendaciones": []
}

- Si uno o más campos NO son visibles o legibles (SOLO si realmente están ocultos o borrosos):

{
  "esDocumentoValido": false,
  "errores": [
    {
      "campo": "numeroCedula",
      "detalle": "Razon exacta por la cual se rechaza el documento"
    }
  ],
  "recomendaciones": [
    "Toma la foto con mejor enfoque y encuadre.",
    "Evita sombras, reflejos o dedos que cubran los datos."
  ]
}

-  Si detectas manipulación digital:

{
  "esDocumentoValido": false,
  "errores": [
    {
      "campo": "estructura",
      "detalle": "El documento presenta señales de edición, sobreposición o no corresponde al diseño original."
    }
  ],
  "recomendaciones": [
    "Utiliza una foto real tomada directamente de una cédula física.",
    "Evita usar imágenes escaneadas o manipuladas."
  ]
}

---
 Reglas importantes:
- Si un campo se puede leer en la imagen, debe considerarse válido.
- No reportes todos los errores por defecto.
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
