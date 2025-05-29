export interface IActionMessage {

    onCallMessage(payload: PayloadActionMessage): Promise<boolean>;

}

export interface PayloadActionMessage {
    title: string;
    text: string;
    icon: string;
    showCancelButton: boolean;
    allowOutsideClick: boolean;
    confirmButtonText?: string;
    cancelButtonText?: string;
}