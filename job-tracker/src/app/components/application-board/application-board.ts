import { Component, OnInit } from '@angular/core';
import { CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ApplicationData, Application } from '../../services/application-data';

@Component({
  selector: 'app-application-board',
  imports: [CdkDropList, CdkDrag],
  templateUrl: './application-board.html',
  styleUrl: './application-board.scss'
})
export class ApplicationBoard implements OnInit {
  statuses = ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected'];
  columns: { [key: string]: Application[] } = {};

  constructor(private applicationData: ApplicationData) {}

  ngOnInit(): void {
    this.applicationData.getAll().subscribe(applications => {
      this.groupByStatus(applications);
    });
  }

  private groupByStatus(applications: Application[]): void {
    for (const status of this.statuses) {
      this.columns[status] = applications.filter(app => app.status === status);
    }
  }

  drop(event: CdkDragDrop<Application[]>, newStatus: string): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const movedApplication = event.container.data[event.currentIndex];
      if (movedApplication._id) {
        this.applicationData.update(movedApplication._id, { status: newStatus }).subscribe();
      }
    }
  }
}