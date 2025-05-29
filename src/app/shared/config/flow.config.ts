import { AprobacionCreditoComponent } from "src/app/components/registro-datos/aprobacion-credito/aprobacion-credito.component";
import { CodigoOtpComponent } from "src/app/components/registro-datos/codigo-otp/codigo-otp.component";
import { DatosBasicosComponent } from "src/app/components/registro-datos/datos-basicos/datos-basicos.component";
import { DocumentoValidacionComponent } from "src/app/components/registro-datos/documento-validacion/documento-validacion.component";
import { FotoPersonaValidacionComponent } from "src/app/components/registro-datos/foto-persona-validacion/foto-persona-validacion.component";

export interface FlowStep {
  path: string;
  key: string;
  component: any;
}

export const COMPONENT_MAP: Record<string, () => any> = {
  datosBasicos: () => DatosBasicosComponent,
  documentoValidacion: () => DocumentoValidacionComponent,
  fotoPersona: () => FotoPersonaValidacionComponent,
  otp: () => CodigoOtpComponent, // ✅ así ya no lanza error
  aprobacion: () => AprobacionCreditoComponent
};