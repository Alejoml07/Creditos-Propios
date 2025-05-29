import { inject, Injectable } from '@angular/core';
import { BasicDataPayload, CreditResponse, IDataBasic, StudyRequestPayload } from './interfaces/data-basic.interface';
import { DataBasicImplementation } from './implementations/data-basic';

@Injectable({
  providedIn: 'root'
})
export class DataBasicService {

  private dataBasic: IDataBasic;

  private dataBasicImpl: DataBasicImplementation = inject(DataBasicImplementation);

  constructor() {

    this.dataBasic = this.dataBasicImpl;

  }

  public saveFormDataLocalStorage(payload: BasicDataPayload): void {

    this.dataBasic.saveFormDataLocalStorage(payload);

  }

  public async ValidarEstadoEstudioCredito(document: string): Promise<CreditResponse> {

    return this.dataBasic.ValidarEstadoEstudioCredito(document);
    
  }

  public async ValidarEstadoCelular(document: string): Promise<CreditResponse> {

    return this.dataBasic.ValidarEstadoCelular(document);
    
  }

  public async checkExistingCreditProcess(document: string): Promise<{ hasActiveProcess: boolean }> {

    return this.dataBasic.checkExistingCreditProcess(document);

  }

  public async addEstudioCredito(payload: StudyRequestPayload): Promise<boolean> {

    return this.dataBasic.saveEstudioCredito(payload);
    
  }
  
  public encryptIP(ip: string): string | null {

    return this.dataBasic.encryptIP(ip);

  }



}
