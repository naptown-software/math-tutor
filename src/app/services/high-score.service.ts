import { Injectable } from '@angular/core';
import { HighScore } from '../models/problem.model';

const STORAGE_KEY = 'math-tutor-high-scores';

@Injectable({ providedIn: 'root' })
export class HighScoreService {
  getHighScores(): HighScore[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  addHighScore(score: HighScore): void {
    const scores = this.getHighScores();
    scores.push(score);
    scores.sort((a, b) => b.percentage - a.percentage || b.score - a.score);
    const top10 = scores.slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(top10));
  }

  clearHighScores(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
