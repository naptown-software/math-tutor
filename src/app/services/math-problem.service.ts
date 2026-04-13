import { Injectable } from '@angular/core';
import { MathProblem, Operation } from '../models/problem.model';

@Injectable({ providedIn: 'root' })
export class MathProblemService {
  private generatedKeys = new Set<string>();

  private rand(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getSymbol(op: Operation): string {
    switch (op) {
      case 'addition': return '+';
      case 'subtraction': return '−';
      case 'multiplication': return '×';
      case 'division': return '÷';
      case 'exponent': return '^';
    }
  }

  private buildProblem(op: Operation, min: number, max: number): MathProblem {
    let operand1: number, operand2: number, answer: number;

    switch (op) {
      case 'addition': {
        operand1 = this.rand(min, max);
        operand2 = this.rand(min, max);
        answer = operand1 + operand2;
        break;
      }
      case 'subtraction': {
        operand1 = this.rand(min, max);
        operand2 = this.rand(min, operand1);
        answer = operand1 - operand2;
        break;
      }
      case 'multiplication': {
        operand1 = this.rand(min, max);
        operand2 = this.rand(min, max);
        answer = operand1 * operand2;
        break;
      }
      case 'division': {
        answer = this.rand(Math.max(1, min), max);
        operand2 = this.rand(1, max);
        operand1 = answer * operand2;
        break;
      }
      case 'exponent': {
        operand1 = this.rand(2, 12);
        operand2 = this.rand(2, 3);
        answer = Math.pow(operand1, operand2);
        break;
      }
    }

    const symbol = this.getSymbol(op);
    const displayText = `${operand1} ${symbol} ${operand2} = ?`;

    return {
      id: `${op}-${operand1}-${operand2}-${Date.now()}-${Math.random()}`,
      operand1,
      operand2,
      operation: op,
      answer,
      displayText,
      operationSymbol: symbol,
    };
  }

  generateProblem(operations: Operation[], min: number, max: number): MathProblem {
    const op = operations[Math.floor(Math.random() * operations.length)];
    let problem = this.buildProblem(op, min, max);
    let attempts = 0;

    while (this.generatedKeys.has(`${problem.operand1}${problem.operationSymbol}${problem.operand2}`) && attempts < 20) {
      problem = this.buildProblem(op, min, max);
      attempts++;
    }

    this.generatedKeys.add(`${problem.operand1}${problem.operationSymbol}${problem.operand2}`);
    return problem;
  }

  generateProblems(count: number, operations: Operation[], min: number, max: number): MathProblem[] {
    this.generatedKeys.clear();
    const problems: MathProblem[] = [];
    for (let i = 0; i < count; i++) {
      problems.push(this.generateProblem(operations, min, max));
    }
    return problems;
  }

  checkAnswer(problem: MathProblem, answer: number): boolean {
    return problem.answer === answer;
  }
}
