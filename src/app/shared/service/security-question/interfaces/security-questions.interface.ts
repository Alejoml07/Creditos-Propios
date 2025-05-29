export interface SecurityQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
  }
  
  export interface ISecurityQuestionService {
    getQuestions(): Promise<SecurityQuestion[]>;
    showSecurityQuestionsModal(): Promise<boolean>; // ← nuevo método
  }