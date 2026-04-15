import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameStateService } from '../../services/game-state.service';
import { HighScoreService } from '../../services/high-score.service';
import { HighScore } from '../../models/problem.model';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss',
})
export class ResultsComponent {
  readonly gameState = inject(GameStateService);
  private highScoreService = inject(HighScoreService);

  playerName = signal<string>('');
  scoreSaved = signal<boolean>(false);

  readonly highScores = computed(() => this.highScoreService.getHighScores().slice(0, 5));

  get totalCorrect(): number {
    return this.gameState.results().filter(r => r.isCorrect).length;
  }

  get totalQuestions(): number {
    return this.gameState.problems().length;
  }

  get percentage(): number {
    return this.gameState.scorePercentage();
  }

  get totalTimeSpent(): number {
    return this.gameState.results().reduce((sum, r) => sum + r.timeSpent, 0);
  }

  get emoji(): string {
    const pct = this.percentage;
    if (pct >= 90) return '🏆';
    if (pct >= 70) return '⭐';
    if (pct >= 50) return '👍';
    return '💪';
  }

  get message(): string {
    const pct = this.percentage;
    if (pct === 100) return "Perfect Score! You're a Math Genius! 🎉";
    if (pct >= 90) return "Outstanding! You're on fire! 🔥";
    if (pct >= 70) return "Great job! Keep it up! ⭐";
    if (pct >= 50) return "Good effort! Practice makes perfect! 💪";
    return "Keep practicing! You'll get there! 🌟";
  }

  get percentageClass(): string {
    const pct = this.percentage;
    if (pct >= 90) return 'pct-gold';
    if (pct >= 70) return 'pct-green';
    if (pct >= 50) return 'pct-blue';
    return 'pct-red';
  }

  get qualifiesForLeaderboard(): boolean {
    const scores = this.highScoreService.getHighScores();
    if (scores.length < 10) return true;
    return this.percentage >= scores[scores.length - 1].percentage;
  }

  saveScore(): void {
    if (!this.playerName().trim()) return;
    const hs: HighScore = {
      id: `${Date.now()}-${Math.random()}`,
      playerName: this.playerName().trim(),
      score: this.gameState.score(),
      totalQuestions: this.totalQuestions,
      percentage: this.percentage,
      streak: this.gameState.maxStreak(),
      date: new Date().toLocaleDateString(),
      operations: this.gameState.config().operations,
    };
    this.highScoreService.addHighScore(hs);
    this.scoreSaved.set(true);
  }
}
