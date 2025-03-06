import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {

  constructor(private router: Router) { }

  enviarCodigo(modo: number): Promise<string> {
    // Simular una llamada al backend para enviar el código
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Código enviado correctamente por ${modo === 1 ? 'SMS' : 'Correo'}`);
      }, 1000);
    });
  }

  verificarToken(token: string): void {
    // Simular la verificación del token
    console.log('Token verificado:', token);
    Swal.fire('Validación exitosa', 'El código de verificación es correcto.', 'success');
    this.router.navigate(['/registro/informacion-complementaria']);


  }

  mostrarAlertaVerificacion(): void {
    Swal.fire({
      title: 'Elige un método de verificación',
      html: `
      <style>
        .swal2-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: Arial, sans-serif;
        }
        .swal2-icon-button-container {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-top: 20px;
        }
        .swal2-icon-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .swal2-icon-button:hover {
          transform: scale(1.1);
        }
        .swal2-icon-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 24px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .swal2-icon-circle.sms {
          background-color: #007bff;
        }
        .swal2-icon-circle.email {
          background-color: #000;
        }
        .swal2-icon-text {
          margin-top: 8px;
          font-size: 14px;
          font-weight: bold;
          color: #333;
        }
        .swal2-instruction {
          margin-top: 15px;
          font-size: 14px;
          color: #555;
          text-align: center;
        }
        .swal2-input-container {
          margin-top: 20px;
          display: none;
          justify-content: center;
        }
        #codigoValidacion {
          width: 80%;
          max-width: 300px;
          text-align: center;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 5px;
          margin-top: 10px;
        }
        .countdown-timer {
          margin-top: 15px;
          font-size: 14px;
          color: #666;
          text-align: center;
        }
        #apiMessage {
          margin-top: 15px;
          font-size: 14px;
          color: #4CAF50;
          text-align: center;
        }
      </style>

      <div class="swal2-instruction">
        El código de verificación será enviado al cliente.
      </div>

      <div class="swal2-icon-button-container">
        <div id="smsButton" class="swal2-icon-button">
          <div id="smsCircle" class="swal2-icon-circle sms">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-chat-dots-fill" viewBox="0 0 16 16">
              <path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0m4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/>
            </svg>
          </div>
          <div class="swal2-icon-text">SMS</div>
        </div>

        <div id="emailButton" class="swal2-icon-button">
          <div id="emailCircle" class="swal2-icon-circle email">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-envelope-fill" viewBox="0 0 16 16">
              <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414zM0 4.697v7.104l5.803-3.558zM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586zm3.436-.586L16 11.801V4.697z"/>
            </svg>
          </div>
          <div class="swal2-icon-text">Correo</div>
        </div>
      </div>

      <div id="apiMessage"></div>
      <div id="countdownTimer" class="countdown-timer" style="display: none;">
        Puedes enviar un nuevo código en: <span id="timer">2:00</span>
      </div>
      <div class="swal2-input-container" id="inputContainer">
        <input id="codigoValidacion" type="text" placeholder="Ingresa el código" class="swal2-input">
      </div>
    `,      
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Enviar',
      confirmButtonColor: '#4CAF50',
      cancelButtonColor: '#d33',
      reverseButtons: true,
      didOpen: () => {
        const smsButton = document.getElementById('smsButton') as HTMLElement;
        const emailButton = document.getElementById('emailButton') as HTMLElement;
        const smsCircle = document.getElementById('smsCircle') as HTMLElement;
        const emailCircle = document.getElementById('emailCircle') as HTMLElement;
        const countdownTimer = document.getElementById('countdownTimer') as HTMLElement;
        const timerDisplay = document.getElementById('timer') as HTMLElement;
        const apiMessage = document.getElementById('apiMessage') as HTMLElement;
        const inputContainer = document.getElementById('inputContainer') as HTMLElement;
        const confirmButton = Swal.getConfirmButton();
        if (confirmButton) confirmButton.style.display = 'none';

        const disableButtons = () => {
          smsCircle.classList.add('disabled');
          emailCircle.classList.add('disabled');
          smsButton.style.pointerEvents = 'none';
          emailButton.style.pointerEvents = 'none';
        };

        const enableButtons = () => {
          smsCircle.classList.remove('disabled');
          emailCircle.classList.remove('disabled');
          smsButton.style.pointerEvents = 'auto';
          emailButton.style.pointerEvents = 'auto';
          countdownTimer.style.display = 'none';
        };

        const startCountdown = () => {
          disableButtons();
          countdownTimer.style.display = 'block';
          let countdown = 10;
          const countdownInterval = setInterval(() => {
            if (countdown <= 0) {
              clearInterval(countdownInterval);
              enableButtons();
            } else {
              const minutes = Math.floor(countdown / 60);
              const seconds = countdown % 60;
              timerDisplay.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
              countdown -= 1;
            }
          }, 1000);
        };

        smsButton.addEventListener('click', () => {
          this.enviarCodigo(1).then((message) => {
            apiMessage.innerText = message;
            inputContainer.style.display = 'flex';
            if (confirmButton) confirmButton.style.display = 'inline-block';
          });
          startCountdown();
        });

        emailButton.addEventListener('click', () => {
          this.enviarCodigo(3).then((message) => {
            apiMessage.innerText = message;
            inputContainer.style.display = 'flex';
            if (confirmButton) confirmButton.style.display = 'inline-block';
          });
          startCountdown();
        });
      },
      preConfirm: () => {
        const codigo = (document.getElementById('codigoValidacion') as HTMLInputElement).value;
        if (!codigo) {
          Swal.showValidationMessage('Por favor, ingresa un código');
        }
        return codigo;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const token = result.value;
        this.verificarToken(token);
      }
    });
  }
}
