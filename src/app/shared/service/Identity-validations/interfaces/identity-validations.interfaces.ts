export interface IIdentityValidations {

  enviarCodigoOtp(method: 'sms' | 'email' | 'whatsapp'): void;

  validarCodigoOtp(code: string): Promise<boolean>;

  construirPayloadIdv(): IdvPayload | null;

  handleIdvRisk(response: IdvRiskResponse): Promise<void>;
  
  formatearFecha(fechaISO: string): string;
}

export interface DatosBasicosStorage {
  document: string;
  cellular: string;
  lastName: string;
  documentExpedition: string;
}

export interface OtpPayload {
  IdCliente: string;
  Celular: string;
  OTP: string;
}

export interface EnvioOtpPayload {
  IdCliente: string;
  Celular: string;
}

export interface IdvRiskResponse {
  result: string;
  [key: string]: any; 
}

export interface IdvPayload {
  RequestInfo: {
    SolutionSetId: string;
    ExecuteLatestVersion: boolean;
  };
  Fields: {
    Applicants_IO: {
      Applicant: {
        ApplicantLastName1: string;
        Identifiers: {
          Identifier: {
            IdExpeditionDate: string;
            IdNumber: string;
            IdType: string;
          }[];
        };
        Telephones: {
          Telephone: {
            TelephoneNumber: string;
          }[];
        };
        IDVMatchingLogic: {
          MatchLogic: {
            Name: string;
            MatchFields: string;
            RiskLevel: 'Low' | 'Medium' | 'High';
          }[];
        };
      };
    };
    ApplicationData_IO: {
      RequestMode: string;
      Attributes: {
        SkipDSUbicaOnlyFlag: string;
      };
      Services: {
        Service: {
          Seq: number;
          Name: string;
          Consent: string;
          Active: string;
          EndOnApiFailure: string;
          EndOnPolicyFailure: string;
        }[];
      };
    };
  };
}