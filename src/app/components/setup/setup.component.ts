import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GameStateService } from '../../services/game-state.service';
import { HighScoreService } from '../../services/high-score.service';
import { GameConfig, Operation } from '../../models/problem.model';

interface GradePreset {
  label: string;
  config: GameConfig;
}

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './setup.component.html',
  styleUrl: './setup.component.scss',
})
export class SetupComponent {
  private gameState = inject(GameStateService);
  private highScoreService = inject(HighScoreService);

  selectedOperations = signal<Set<Operation>>(new Set(['addition']));
  minValue = signal<number>(1);
  maxValue = signal<number>(10);
  questionCount = signal<number>(10);
  timerSeconds = signal<number>(30);

  readonly gradePresets: GradePreset[] = [
    {
      label: 'Grade 1-2',
      config: { operations: ['addition', 'subtraction'], minValue: 1, maxValue: 10, questionCount: 10, timerSeconds: 30 },
    },
    {
      label: 'Grade 3-4',
      config: { operations: ['addition', 'subtraction', 'multiplication'], minValue: 1, maxValue: 20, questionCount: 10, timerSeconds: 20 },
    },
    {
      label: 'Grade 5-6',
      config: { operations: ['addition', 'subtraction', 'multiplication', 'division'], minValue: 1, maxValue: 50, questionCount: 15, timerSeconds: 20 },
    },
    {
      label: 'Grade 7-8',
      config: { operations: ['addition', 'subtraction', 'multiplication', 'division', 'exponent'], minValue: 1, maxValue: 100, questionCount: 20, timerSeconds: 15 },
    },
  ];

  readonly operations: { value: Operation; label: string; emoji: string }[] = [
    { value: 'addition', label: 'Addition', emoji: '➕' },
    { value: 'subtraction', label: 'Subtraction', emoji: '➖' },
    { value: 'multiplication', label: 'Multiplication', emoji: '✖️' },
    { value: 'division', label: 'Division', emoji: '➗' },
    { value: 'exponent', label: 'Exponents', emoji: '⚡' },
  ];

  readonly questionCounts = [5, 10, 15, 20];
  readonly timerOptions = [
    { value: 10, label: '10s' },
    { value: 20, label: '20s' },
    { value: 30, label: '30s' },
    { value: 60, label: '60s' },
    { value: 0, label: 'No Timer' },
  ];

  get highScores() {
    return this.highScoreService.getHighScores().slice(0, 3);
  }

  get canStart(): boolean {
    return this.selectedOperations().size > 0 && this.minValue() < this.maxValue();
  }

  applyPreset(preset: GradePreset): void {
    this.selectedOperations.set(new Set(preset.config.operations));
    this.minValue.set(preset.config.minValue);
    this.maxValue.set(preset.config.maxValue);
    this.questionCount.set(preset.config.questionCount);
    this.timerSeconds.set(preset.config.timerSeconds);
  }

  isOperationSelected(op: Operation): boolean {
    return this.selectedOperations().has(op);
  }

  toggleOperation(op: Operation): void {
    const ops = new Set(this.selectedOperations());
    if (ops.has(op)) {
      ops.delete(op);
    } else {
      ops.add(op);
    }
    this.selectedOperations.set(ops);
  }

  startGame(): void {
    if (!this.canStart) return;
    const config: GameConfig = {
      operations: Array.from(this.selectedOperations()),
      minValue: this.minValue(),
      maxValue: this.maxValue(),
      questionCount: this.questionCount(),
      timerSeconds: this.timerSeconds(),
    };
    this.gameState.startGame(config);
  }
}
