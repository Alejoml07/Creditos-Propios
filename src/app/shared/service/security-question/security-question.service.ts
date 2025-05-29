import { inject, Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { ISecurityQuestionService, SecurityQuestion } from './interfaces/security-questions.interface';
import { SecurityQuestionImplementation } from './implementations/security-questions';

@Injectable({
  providedIn: 'root'
})
export class SecurityQuestionService {

  constructor() { }
  private securityQuestionImplementation: ISecurityQuestionService = inject(SecurityQuestionImplementation);

  getQuestions(): Promise<SecurityQuestion[]> {
    return this.securityQuestionImplementation.getQuestions();
  }

  showSecurityQuestionsModal(): Promise<boolean> {
    return this.securityQuestionImplementation.showSecurityQuestionsModal();
  }
}
