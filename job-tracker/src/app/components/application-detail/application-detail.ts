import { Component, Inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { DatePipe } from '@angular/common';
import { Application } from '../../services/application-data';

@Component({
  selector: 'app-application-detail',
  imports: [DatePipe],
  templateUrl: './application-detail.html',
  styleUrl: './application-detail.scss'
})
export class ApplicationDetail {
  constructor(
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public application: Application
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}