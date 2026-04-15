import { Component, inject, signal, effect, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameStateService } from '../../services/game-state.service';

@Component({
  selector: 'app-flashcard',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './flashcard.component.html',
  styleUrl: './flashcard.component.scss',
})
export class FlashcardComponent {
  readonly gameState = inject(GameStateService);

  userAnswer = signal<string>('');
  isFlipped = signal<boolean>(false);
  showFeedback = signal<boolean>(false);

  @ViewChild('answerInput') answerInput?: ElementRef<HTMLInputElement>;

  constructor() {
    effect(() => {
      const feedback = this.gameState.feedbackState();
      if (feedback !== 'none') {
        this.isFlipped.set(true);
        this.showFeedback.set(true);
        setTimeout(() => {
          this.isFlipped.set(false);
          this.showFeedback.set(false);
          this.userAnswer.set('');
          this.gameState.nextQuestion();
          setTimeout(() => this.answerInput?.nativeElement.focus(), 100);
        }, 1500);
      }
    });
  }

  get progressPercent(): number {
    const total = this.gameState.problems().length;
    if (total === 0) return 0;
    return Math.round(((this.gameState.currentIndex() + 1) / total) * 100);
  }

  get timerPercent(): number {
    const cfg = this.gameState.config();
    if (cfg.timerSeconds === 0) return 100;
    return Math.round((this.gameState.timeRemaining() / cfg.timerSeconds) * 100);
  }

  get timerColor(): string {
    const pct = this.timerPercent;
    if (pct > 50) return 'var(--success)';
    if (pct > 25) return 'var(--accent)';
    return 'var(--error)';
  }

  get streakStars(): string {
    const correct = this.gameState.results().filter(r => r.isCorrect).length;
    return '⭐'.repeat(Math.floor(correct / 5));
  }

  get circumference(): number {
    return 2 * Math.PI * 28;
  }

  get timerDashOffset(): number {
    return this.circumference * (1 - this.timerPercent / 100);
  }

  submitAnswer(): void {
    const val = this.userAnswer();
    if (val === '' || val === null) return;
    const num = parseFloat(val);
    if (isNaN(num)) return;
    this.gameState.submitAnswer(num);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.submitAnswer();
    }
  }
}
