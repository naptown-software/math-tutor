import { Component, inject } from '@angular/core';
import { GameStateService } from './services/game-state.service';
import { SetupComponent } from './components/setup/setup.component';
import { FlashcardComponent } from './components/flashcard/flashcard.component';
import { ResultsComponent } from './components/results/results.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SetupComponent, FlashcardComponent, ResultsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly gameState = inject(GameStateService);
}
