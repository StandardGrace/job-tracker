import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApplicationList } from './components/application-list/application-list';
import { ApplicationBoard } from './components/application-board/application-board';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ApplicationList, ApplicationBoard],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('job-tracker');
}