
export enum Difficulty {
  BASIC = '初级',
  INTERMEDIATE = '中级',
  ADVANCED = '高级'
}

export enum QuestionType {
  SINGLE = 'SINGLE',
  MULTIPLE = 'MULTIPLE',
  BOOLEAN = 'BOOLEAN'
}

export interface Question {
  id: number;
  type: QuestionType;
  content: string;
  options: string[];
  correctAnswers: string[]; // For single/boolean, this has 1 element. For multiple, >= 1.
  explanation: string;
}

export interface QuizState {
  questions: Question[];
  userAnswers: Record<number, string[]>;
  startTime: number;
  endTime: number | null;
  status: 'idle' | 'loading' | 'ongoing' | 'completed';
  difficulty: Difficulty;
}

export interface QuizResult {
  score: number;
  correctCount: number;
  partialCount: number;
  wrongCount: number;
  totalQuestions: number;
  timeSpent: number;
}
