import { inject, Injectable } from '@angular/core';
import { IActionMessage, PayloadActionMessage } from './interfaces/action-message.interface';
import { SweetAlert2ActionImplementation } from './implementations/sweetalert-action';

@Injectable({
  providedIn: 'root'
})
export class ActionMessageService {

  private actionMessage: IActionMessage;

  private sweetAlert2Implementation: SweetAlert2ActionImplementation = inject(SweetAlert2ActionImplementation);

  constructor() {

    this.actionMessage = this.sweetAlert2Implementation;

  }


  public async onCallMessage(payload: PayloadActionMessage): Promise<boolean> {
    
    return this.actionMessage.onCallMessage(payload);

  }
  
}
