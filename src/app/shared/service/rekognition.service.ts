import { Injectable } from '@angular/core';
import { RekognitionClient, DetectFacesCommand } from '@aws-sdk/client-rekognition';

@Injectable({
  providedIn: 'root'
})
export class RekognitionService {

  private rekognitionClient: RekognitionClient;

  constructor() {
    this.rekognitionClient = new RekognitionClient({
      region: 'us-east-2',
      credentials: {
        accessKeyId: 'AKIA34AMCWEEZVZ5FBUF', 
        secretAccessKey: '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' 
      }
    });
  }

  async validarFoto(photoBase64: string): Promise<{ 
    esRostro: boolean, 
    calidadImagen: string, 
    fotoEsReciente: boolean, 
    fotoReal: boolean, 
    expresionNatural: boolean, 
    mensaje: string 
  }> {
    try {
      const photoBuffer = this.base64ToUint8Array(photoBase64);

      const command = new DetectFacesCommand({
        Image: { Bytes: photoBuffer },
        Attributes: ['ALL']
      });

      const response = await this.rekognitionClient.send(command);

      if (!response.FaceDetails || response.FaceDetails.length === 0) {
        return {
          esRostro: false,
          calidadImagen: 'N/A',
          fotoEsReciente: false,
          fotoReal: false,
          expresionNatural: false,
          mensaje: 'No se detectó un rostro en la imagen. Asegúrate de que sea una selfie tomada en el momento.'
        };
      }

      if (response.FaceDetails.length > 1) {
        return {
          esRostro: false,
          calidadImagen: 'N/A',
          fotoEsReciente: false,
          fotoReal: false,
          expresionNatural: false,
          mensaje: 'Se detectaron múltiples rostros. Solo se permite una persona en la imagen.'
        };
      }

      const face = response.FaceDetails[0];

      // 📌 Validar nitidez e iluminación
      const sharpness = face.Quality?.Sharpness ?? 0;
      const brightness = face.Quality?.Brightness ?? 0;

      let calidadImagen = 'Buena';
      let mensaje = 'Rostro detectado correctamente.';

      if (sharpness < 40) {
        calidadImagen = 'Baja';
        mensaje = 'La imagen está borrosa. Asegúrate de que la foto sea nítida.';
      } else if (brightness < 20 || brightness > 90) {
        calidadImagen = 'Iluminación deficiente';
        mensaje = 'La iluminación no es adecuada. Asegúrate de que la imagen tenga buena luz.';
      }

      // 📌 Validar si la imagen es reciente
      const ageRange = face.AgeRange;
      const estimatedAge = (ageRange?.Low ?? 0) + (ageRange?.High ?? 0) / 2;
      const fotoEsReciente = estimatedAge >= 18 && estimatedAge <= 60;

      // 📌 Validar si la foto es de una persona real
      const hasSmile = face.Smile?.Value ?? false;
      const hasOpenEyes = (face.EyesOpen?.Value ?? false);
      const hasOpenMouth = (face.MouthOpen?.Value ?? false);
      const expresionNatural = hasSmile || hasOpenEyes || hasOpenMouth;

      // 🔍 Analizar características de pantalla o foto impresa
      const hasShadows = face.Confidence ?? 0 < 80; // Si la confianza en la detección del rostro es baja, podría ser una foto de otra pantalla.
      const isFlatColor = brightness > 70 && sharpness < 30; // Alto brillo con baja nitidez puede indicar una pantalla.

      const fotoReal = expresionNatural && sharpness > 40 && brightness > 20 && !hasShadows && !isFlatColor;

      if (!fotoEsReciente) {
        mensaje = 'Parece que la imagen no es reciente. Asegúrate de tomar una selfie en el momento.';
      }

      if (!fotoReal) {
        mensaje = 'La foto parece tomada desde otro dispositivo o una imagen impresa. Asegúrate de que sea una selfie real.';
      }

      return {
        esRostro: true,
        calidadImagen,
        fotoEsReciente,
        fotoReal,
        expresionNatural,
        mensaje
      };

    } catch (error) {
      console.error('Error en AWS Rekognition:', error);
      throw new Error('No se pudo procesar la imagen.');
    }
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
}
