import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PromptFactoryService {

  createPrompt(type: 'authenticity' | 'fields' | 'visual' | 'extract'): string {
    switch (type) {
case 'authenticity':
  return `
Eres un sistema experto en verificar la autenticidad de cédulas colombianas. Tu tarea es analizar una imagen y determinar si corresponde a una **foto real de una cédula física original**, incluso si presenta signos de desgaste, reflejos o antigüedad. Sé objetivo, estable y comprensivo con documentos reales en condiciones normales de uso.

🚫 IMPORTANTE: RECHAZA CUALQUIER imagen que no provenga directamente de una cédula física. **NO se permite bajo ninguna circunstancia:**
- Fotografías de pantallas de celular o computador mostrando una cédula.
- Escaneos digitales.
- Impresiones físicas de imágenes de cédulas.
- Montajes digitales o reconstrucciones.

🟢 ACEPTAR si se cumplen estas condiciones (aunque haya imperfecciones):
1. El documento es **físico** y la imagen fue tomada directamente con una **cámara (celular o similar)** desde el documento real.
2. El **número de cédula impreso es visible y legítimo**, incluso si hay brillo o sombra leve.
3. El diseño gráfico corresponde a una **cédula colombiana oficial** (versión amarilla o digital física).
4. Puede haber texto manuscrito adicional (firma o nombre), **siempre que no tape o sustituya campos oficiales**.

🔴 RECHAZAR si:
- El número de cédula está completamente tapado o escrito a mano.
- El documento fue fotografiado desde una pantalla, es un escaneo, impresión o montaje digital.
- El diseño gráfico no coincide con el de una cédula colombiana válida.
- La imagen está borrosa o incompleta al punto de no poder verificar estructura y contenido.

📤 FORMATO JSON DE RESPUESTA

✅ Válido:
{
  "isValid": true,
  "errores": [],
  "recomendaciones": []
}

❌ Inválido:
{
  "isValid": false,
  "errores": [
    {
      "campo": "estructura",
      "detalle": "Motivo exacto. Ejemplo: 'La imagen parece una foto de una pantalla', 'El número de cédula está escrito a mano', 'El diseño no corresponde a una cédula colombiana'."
    }
  ],
  "recomendaciones": [
    "Recomendación específica para corregir el problema detectado. Ejemplo: 'No tomes la foto desde otra pantalla, enfoca directamente la cédula física.', 'Asegúrate de que el número de cédula impreso esté visible.', 'Verifica que estás usando una cédula colombiana oficial.'"
  ]
}

⚠️ ACLARACIÓN FINAL: Si el documento es físico, oficial, y el número impreso y diseño son legibles, **debe aceptarse aunque la imagen tenga imperfecciones típicas del uso**.

Responde **solo con el JSON indicado**, sin incluir explicaciones adicionales.
`.trim();

          case 'fields':
            return `
    Eres un sistema OCR especializado en lectura de cédulas colombianas. Tu tarea es validar si los campos mínimos están legibles en la imagen.

    ✅ EXIGIDO:
    - numeroCedula: 7 a 10 dígitos, visibles, sin puntos ni espacios.
    - nombres: al menos un nombre reconocible.
    - apellidos: al menos un apellido reconocible.
    - encabezado: debe estar parcialmente visible "REPÚBLICA DE COLOMBIA" o "CÉDULA DE CIUDADANÍA".

    ✅ PERMITIDO:
    - Manchas, sombra parcial, desgaste natural o baja resolución.
    - Texto parcialmente visible, si es identificable.

    🚫 RECHAZA solo si:
    - Alguno de los campos no se puede identificar con certeza.
    - El texto está completamente cubierto o ilegible.

    📤 RESPUESTA:

    ✅ Si todos los campos mínimos son visibles:
    {
      "isValid": true,
      "recomendaciones": []
    }

    ❌ Si falta alguno:
    {
      "isValid": false,
      "errores": [
        {
          "campo": "numeroCedula",
          "detalle": "El número está demasiado borroso para extraerlo."
        }
      ],
     "recomendaciones": [
    "Recomendación específica para corregir el problema detectado. "
  ]
    }
    `.trim();

          case 'visual':
      return `
    Eres un sistema experto en validación visual de cédulas colombianas. Evalúa si la imagen tiene la calidad mínima necesaria para que pueda ser procesada correctamente por OCR y validación de identidad.

    ✅ ACEPTA si:
    - Hay dedos, sombras o reflejos **que no tapen texto importante**.
    - El documento tiene desgaste, arrugas o manchas naturales.
    - La resolución es baja, pero permite leer los campos obligatorios.
    - El encuadre no es perfecto, pero se puede ver el contenido del documento.

    🚫 RECHAZA solo si:
    - Uno o más campos **críticos** están total o parcialmente cubiertos (por reflejos, dedos, sombras, mala iluminación o ángulo).
    - La imagen está **tan borrosa** que impide leer al menos uno de los campos mínimos:
      - número de cédula
      - nombres
      - apellidos
      - encabezado del documento

    📤 RESPUESTA EN FORMATO JSON:

    ✅ Si todo se puede ver con claridad razonable:
    {
      "isValid": true,
      "recomendaciones": []
    }

    ❌ Si NO se puede procesar visualmente:
    {
      "isValid": false,
      "errores": [
        {
          "campo": "numeroCedula",
          "detalle": "El número de cédula no se puede leer debido a una sombra o desenfoque."
        },
        {
          "campo": "apellidos",
          "detalle": "El campo 'apellidos' está tapado por un dedo."
        }
      ],
      "recomendaciones": [
    "Recomendación específica para corregir el problema detectado. Ejemplo: 'No tomes la foto desde otra pantalla, enfoca directamente la cédula física.', 'Asegúrate de que el número de cédula impreso esté visible.', 'Verifica que estás usando una cédula colombiana oficial.'"
  ]
    }
    `.trim();

          case 'extract':
            return `
    Eres un sistema de extracción OCR de cédulas colombianas. Extrae y devuelve:

    - numeroCedula: sin puntos ni espacios.
    - nombres
    - apellidos
    - textoExtraido: texto completo visible.

    ✅ PERMITE:
    - Texto borroso o incompleto si se puede interpretar correctamente.
    - Baja calidad de imagen, siempre que se pueda extraer algo legible.

    🚫 RECHAZA si:
    - Algún campo clave no se puede leer con certeza (por ejemplo, número completamente ilegible).
    - El documento está cortado o el texto fuera del encuadre.

    📤 RESPUESTA:

    ✅ Si todo es extraíble:
    {
      "esDocumentoValido": true,
      "numeroCedula": "1037633133",
      "nombres": "ALEJANDRO",
      "apellidos": "MUÑOZ LEZCANO",
      "textoExtraido": "Texto visible completo...",
      "recomendaciones": []
    }

    ❌ Si no:
    {
      "esDocumentoValido": false,
      "errores": [
        {
          "campo": "numeroCedula",
          "detalle": "El número no puede extraerse con claridad."
        }
      ],
      "recomendaciones": [
        "Asegúrate de que todos los datos estén dentro del encuadre y sean legibles."
      ]
    }
    `.trim();
        }
      }
}


