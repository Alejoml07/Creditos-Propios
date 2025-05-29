import { Injectable } from '@angular/core';
import { ISecurityQuestionService, SecurityQuestion } from '../interfaces/security-questions.interface';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SecurityQuestionImplementation implements ISecurityQuestionService {

  constructor() {}

  async getQuestions(): Promise<SecurityQuestion[]> {
    return [
      {
        question: '¿Cuál es el nombre de tu primera mascota?',
        options: ['Max', 'Firulais', 'Rocky', 'Nina'],
        correctAnswer: 'Firulais'
      },
      {
        question: '¿En qué ciudad naciste?',
        options: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla'],
        correctAnswer: 'Medellín'
      },
      {
        question: '¿Cuál es tu color favorito?',
        options: ['Rojo', 'Azul', 'Verde', 'Negro'],
        correctAnswer: 'Azul'
      }
    ];
  }
  public async showSecurityQuestionsModal(): Promise<boolean> {
    const questions = await this.getQuestions();
    const answers: { question: string; selected: string; correct: string }[] = [];
  
    for (const [index, question] of questions.entries()) {
      const result = await Swal.fire({
        title: `<div style="font-size: 1.5rem; font-weight: 700; color: #2c3e50; margin-bottom: 1rem;">Pregunta ${index + 1}</div>`,
        html: `
          <div style="text-align: left; display: flex; flex-direction: column; gap: 1rem;">
            <div style="font-size: 1.125rem; color: #34495e; font-weight: 500;">
              ${question.question}
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${question.options.map((option, i) => `
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 1rem; color: #555;">
                  <input type="radio" name="question" value="${option}" style="accent-color: #3498db; width: 18px; height: 18px; cursor: pointer;" />
                  ${option}
                </label>
              `).join('')}
            </div>
          </div>
        `,
        confirmButtonText: 'Responder',
        confirmButtonColor: '#3498db',
        background: '#f9f9f9',
        width: 650,
        padding: '2rem 2rem 1.5rem',
        customClass: {
          popup: 'swal2-rounded swal2-shadow'
        },
        preConfirm: () => {
          const selected = (document.querySelector('input[name="question"]:checked') as HTMLInputElement)?.value;
          if (!selected) {
            Swal.showValidationMessage('Por favor selecciona una respuesta para continuar');
            return;
          }
          return selected;
        },
        allowOutsideClick: false
      });
  
      if (!result.isConfirmed || !result.value) return false;
  
      answers.push({
        question: question.question,
        selected: result.value,
        correct: question.correctAnswer
      });
    }
  
    const allCorrect = answers.every(a => a.selected === a.correct);
  
    if (!allCorrect) {
      await Swal.fire({
        icon: 'error',
        title: '<span style="font-size: 1.5rem; font-weight: 700; color: #e74c3c;">Validación fallida</span>',
        text: 'No respondiste correctamente todas las preguntas. Inténtalo nuevamente.',
        confirmButtonText: 'Finalizar',
        confirmButtonColor: '#e74c3c',
        background: '#fefefe',
        width: 500,
        padding: '2rem 2rem 1.5rem'
      });
      return false;
    }
  
    await Swal.fire({
      icon: 'success',
      title: '<span style="font-size: 1.5rem; font-weight: 700; color: #27ae60;">¡Validación exitosa!</span>',
      text: 'Has respondido correctamente todas las preguntas de seguridad.',
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#27ae60',
      background: '#fefefe',
      width: 500,
      padding: '2rem 2rem 1.5rem'
    });
  
    return true;
  }

}