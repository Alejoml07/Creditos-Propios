import { Injectable } from "@angular/core";
import Swal, { SweetAlertIcon } from "sweetalert2";
import { IActionMessage, PayloadActionMessage } from "../interfaces/action-message.interface";

@Injectable({
    providedIn: 'root'
  })
export class SweetAlert2ActionImplementation implements IActionMessage {

    public async onCallMessage(payload: PayloadActionMessage): Promise<boolean> {

        const { title, text, allowOutsideClick, cancelButtonText, confirmButtonText, icon } = payload;

        const result = await Swal.fire({
            title,
            text,
            allowOutsideClick,
            cancelButtonText,
            confirmButtonText,
            icon: this.onGetIcon(icon),
        });

        return result.isConfirmed;

    }

    private onGetIcon(value: string): SweetAlertIcon {

        const validIcons: SweetAlertIcon[] = ['success', 'error', 'warning', 'info', 'question'];

        if (validIcons.includes(value as SweetAlertIcon)) {

            return value as SweetAlertIcon;

        }

        return 'success';

    }

}