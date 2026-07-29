import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApplicationList } from './components/application-list/application-list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ApplicationList],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('job-tracker');
}