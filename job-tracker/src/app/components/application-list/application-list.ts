import { Component, OnInit } from '@angular/core';
import { ApplicationData, Application } from '../../services/application-data';

@Component({
  selector: 'app-application-list',
  imports: [],
  templateUrl: './application-list.html',
  styleUrl: './application-list.scss'
})
export class ApplicationList implements OnInit {
  applications: Application[] = [];

  constructor(private applicationData: ApplicationData) {}

  ngOnInit(): void {
    this.applicationData.getAll().subscribe(applications => {
      this.applications = applications;
    });
  }
}