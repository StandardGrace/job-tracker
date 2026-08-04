import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CdkDropList, CdkDrag, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DatePipe } from '@angular/common';
import { Dialog } from '@angular/cdk/dialog';
import { ApplicationData, Application } from '../../services/application-data';
import { ApplicationForm } from '../application-form/application-form';
import { ApplicationDetail } from '../application-detail/application-detail';

@Component({
  selector: 'app-application-board',
  imports: [CdkDropList, CdkDrag, DatePipe],
  templateUrl: './application-board.html',
  styleUrl: './application-board.scss'
})
export class ApplicationBoard implements OnInit {
  statuses = ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected'];
  columns: { [key: string]: Application[] } = {};

  constructor(
    private applicationData: ApplicationData,
    private cdr: ChangeDetectorRef,
    private dialog: Dialog
  ) {}

  ngOnInit(): void {
    this.loadApplications();
    this.applicationData.refresh$.subscribe(() => {
      this.loadApplications();
    });
  }

  private loadApplications(): void {
    this.applicationData.getAll().subscribe(applications => {
      this.groupByStatus(applications);
      this.cdr.detectChanges();
    });
  }

  private groupByStatus(applications: Application[]): void {
    for (const status of this.statuses) {
      this.columns[status] = applications.filter(app => app.status === status);
    }
  }

  openCreateModal(): void {
    this.dialog.open(ApplicationForm, { data: null });
  }

  openEditModal(application: Application): void {
    this.dialog.open(ApplicationForm, { data: application });
  }

  openDetailModal(application: Application): void {
    this.dialog.open(ApplicationDetail, { data: application });
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