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
  isLoading = true;
  loadError = '';
  dragError = '';

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

  loadApplications(): void {
    this.isLoading = true;
    this.loadError = '';
    this.applicationData.getAll().subscribe({
      next: applications => {
        this.groupByStatus(applications);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadError = 'Could not load applications. Check your connection and try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
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
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );

    const movedApplication = event.container.data[event.currentIndex];
    if (!movedApplication._id) {
      return;
    }

    this.dragError = '';
    this.applicationData.update(movedApplication._id, { status: newStatus }).subscribe({
      next: () => {
        this.applicationData.notifyChanged();
      },
      error: () => {
        transferArrayItem(
          event.container.data,
          event.previousContainer.data,
          event.currentIndex,
          event.previousIndex
        );
        this.dragError = 'Could not update status — check your connection. The card has been moved back.';
        this.cdr.detectChanges();
      }
    });
  }
}