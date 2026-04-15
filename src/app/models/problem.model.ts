export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'exponent';

export interface MathProblem {
  id: string;
  operand1: number;
  operand2: number;
  operation: Operation;
  answer: number;
  displayText: string;
  operationSymbol: string;
}

export interface GameConfig {
  operations: Operation[];
  minValue: number;
  maxValue: number;
  questionCount: number;
  timerSeconds: number;
}

export interface GameResult {
  problem: MathProblem;
  userAnswer: number | null;
  isCorrect: boolean;
  timeSpent: number;
}

export interface HighScore {
  id: string;
  playerName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  streak: number;
  date: string;
  operations: string[];
}
