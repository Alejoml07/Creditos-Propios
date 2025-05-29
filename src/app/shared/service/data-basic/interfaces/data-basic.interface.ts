export interface BasicDataPayload {

    document: string;
    cellular: string;
    lastName: string;
    documentExpedition: string;
    email: string;
    dataPolicy: boolean;

  }

  export interface CreditResponse {

    isSuccess: boolean;
    message: string;
    result?: any;

  }

  export interface StudyRequestPayload {
    Estudio: StudyInfo;
    Datos: ClientInfo;
  }
  
  export interface StudyInfo {
    IdCliente: string;
    IdPais: string;
    FechaEstudio: string | null;
    Estado: string | null;
    CupoAsignado: number | null;
    EntidadValidadora: string | null;
  }
  
  export interface ClientInfo {
    IdCliente: string;
    Email: string;
    Celular: string;
    Nombres: string;
    Apellidos: string;
    Direccion: string;
    TipoIdentificacion: string;
    IdPais: string;
  }

  export interface DatosBasicosModel {
    document: string;
    documentType: string;
    documentExpedition: string;
    lastName: string;
    cellular: string;
    email: string;
  }
  
  export interface IDataBasic {

    saveFormDataLocalStorage(payload: BasicDataPayload): void;

    ValidarEstadoEstudioCredito(document: string): Promise<CreditResponse>;

    checkExistingCreditProcess(document: string): Promise<{ hasActiveProcess: boolean }>;

    saveEstudioCredito(payload: StudyRequestPayload): Promise<any>;

    encryptIP(ip: string): string | null;

    ValidarEstadoCelular(Celular: string): Promise<CreditResponse>;

  }