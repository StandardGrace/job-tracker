import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApplicationList } from './components/application-list/application-list';
import { ApplicationForm } from './components/application-form/application-form';
import { Application } from './services/application-data';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ApplicationList, ApplicationForm],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('job-tracker');
  editingApplication: Application | null = null;

  onEditRequested(application: Application): void {
    this.editingApplication = application;
  }
}