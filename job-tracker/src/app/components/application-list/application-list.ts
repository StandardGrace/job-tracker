import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ApplicationData, Application } from '../../services/application-data';

@Component({
  selector: 'app-application-list',
  imports: [],
  templateUrl: './application-list.html',
  styleUrl: './application-list.scss'
})
export class ApplicationList implements OnInit {
  @Output() editRequested = new EventEmitter<Application>(); // this component can send events up to whatever parent is using it
  applications: Application[] = [];

  constructor(private applicationData: ApplicationData) {}

  ngOnInit(): void {
    this.applicationData.getAll().subscribe(applications => {
      this.applications = applications;
    });
  }

  onEditClick(application: Application): void {
    this.editRequested.emit(application);
  }
}