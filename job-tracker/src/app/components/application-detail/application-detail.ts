import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ApplicationData, Application } from '../../services/application-data';

@Component({
  selector: 'app-application-detail',
  imports: [ReactiveFormsModule],
  templateUrl: './application-detail.html',
  styleUrl: './application-detail.scss'
})
export class ApplicationDetail {
  form: FormGroup;
  saveError = '';

  constructor(
    private fb: FormBuilder,
    private applicationData: ApplicationData,
    private cdr: ChangeDetectorRef,
    private dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public application: Application
  ) {
    const entries = this.application.statusHistory ?? [];

    this.form = this.fb.group({
      entries: this.fb.array(
        entries.map(entry =>
          this.fb.group({
            status: [entry.status],
            date: [entry.date.slice(0, 10)]
          })
        )
      )
    });
  }

  get entriesArray(): FormArray {
    return this.form.get('entries') as FormArray;
  }

  removeEntry(index: number): void {
    this.entriesArray.removeAt(index);
  }

  saveChanges(): void {
    if (!this.application._id) {
      return;
    }

    this.saveError = '';

    this.applicationData.update(this.application._id, { statusHistory: this.entriesArray.value }).subscribe({
      next: () => {
        this.applicationData.notifyChanged();
        this.dialogRef.close();
      },
      error: () => {
        this.saveError = 'Could not save changes. Check your connection and try again.';
        this.cdr.detectChanges();
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
