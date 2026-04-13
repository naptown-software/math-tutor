import { Injectable, signal, computed, inject } from '@angular/core';
import { GameConfig, GameResult, MathProblem } from '../models/problem.model';
import { MathProblemService } from './math-problem.service';

export type GamePhase = 'setup' | 'playing' | 'results';
export type FeedbackState = 'none' | 'correct' | 'wrong';

@Injectable({ providedIn: 'root' })
export class GameStateService {
  private mathService = inject(MathProblemService);

  readonly gamePhase = signal<GamePhase>('setup');
  readonly config = signal<GameConfig>({
    operations: ['addition'],
    minValue: 1,
    maxValue: 10,
    questionCount: 10,
    timerSeconds: 30,
  });
  readonly problems = signal<MathProblem[]>([]);
  readonly currentIndex = signal<number>(0);
  readonly results = signal<GameResult[]>([]);
  readonly score = signal<number>(0);
  readonly streak = signal<number>(0);
  readonly maxStreak = signal<number>(0);
  readonly timeRemaining = signal<number>(0);
  readonly isTimerActive = signal<boolean>(false);
  readonly feedbackState = signal<FeedbackState>('none');

  readonly currentProblem = computed(() => {
    const probs = this.problems();
    const idx = this.currentIndex();
    return probs[idx] ?? null;
  });

  readonly isLastQuestion = computed(() => {
    return this.currentIndex() >= this.problems().length - 1;
  });

  readonly scorePercentage = computed(() => {
    const total = this.problems().length;
    if (total === 0) return 0;
    const correct = this.results().filter(r => r.isCorrect).length;
    return Math.round((correct / total) * 100);
  });

  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private questionStartTime: number = Date.now();

  startGame(config: GameConfig): void {
    this.config.set(config);
    const probs = this.mathService.generateProblems(
      config.questionCount,
      config.operations,
      config.minValue,
      config.maxValue
    );
    this.problems.set(probs);
    this.currentIndex.set(0);
    this.results.set([]);
    this.score.set(0);
    this.streak.set(0);
    this.maxStreak.set(0);
    this.feedbackState.set('none');
    this.gamePhase.set('playing');
    this.questionStartTime = Date.now();
    if (config.timerSeconds > 0) {
      this.timeRemaining.set(config.timerSeconds);
      this.startTimer();
    }
  }

  submitAnswer(answer: number): void {
    const problem = this.currentProblem();
    if (!problem) return;

    const timeSpent = Math.round((Date.now() - this.questionStartTime) / 1000);
    const isCorrect = this.mathService.checkAnswer(problem, answer);

    this.stopTimer();

    const result: GameResult = {
      problem,
      userAnswer: answer,
      isCorrect,
      timeSpent,
    };

    this.results.update(r => [...r, result]);

    if (isCorrect) {
      let points = 10;
      if (this.config().timerSeconds > 0 && timeSpent <= 5) {
        points += 5;
      }
      this.score.update(s => s + points);
      this.streak.update(s => s + 1);
      this.maxStreak.update(ms => Math.max(ms, this.streak()));
      this.feedbackState.set('correct');
    } else {
      this.streak.set(0);
      this.feedbackState.set('wrong');
    }
  }

  nextQuestion(): void {
    this.feedbackState.set('none');

    if (this.isLastQuestion()) {
      this.goToResults();
      return;
    }

    this.currentIndex.update(i => i + 1);
    this.questionStartTime = Date.now();

    if (this.config().timerSeconds > 0) {
      this.resetTimer();
      this.startTimer();
    }
  }

  goToSetup(): void {
    this.stopTimer();
    this.gamePhase.set('setup');
  }

  goToResults(): void {
    this.stopTimer();
    this.gamePhase.set('results');
  }

  startTimer(): void {
    this.stopTimer();
    this.isTimerActive.set(true);
    this.timerInterval = setInterval(() => {
      const current = this.timeRemaining();
      if (current <= 1) {
        this.timeRemaining.set(0);
        this.stopTimer();
        // Auto-submit with null answer (wrong)
        const problem = this.currentProblem();
        if (problem) {
          const timeSpent = this.config().timerSeconds;
          const result: GameResult = {
            problem,
            userAnswer: null,
            isCorrect: false,
            timeSpent,
          };
          this.results.update(r => [...r, result]);
          this.streak.set(0);
          this.feedbackState.set('wrong');
        }
      } else {
        this.timeRemaining.update(t => t - 1);
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isTimerActive.set(false);
  }

  resetTimer(): void {
    this.stopTimer();
    this.timeRemaining.set(this.config().timerSeconds);
  }
}
