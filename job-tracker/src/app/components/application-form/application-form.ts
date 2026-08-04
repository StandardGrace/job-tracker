import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { ApplicationData, Application } from '../../services/application-data';

@Component({
  selector: 'app-application-form',
  imports: [ReactiveFormsModule],
  templateUrl: './application-form.html',
  styleUrl: './application-form.scss'
})
export class ApplicationForm {
  form: FormGroup;
  submitError = '';

  constructor(
    private fb: FormBuilder,
    private applicationData: ApplicationData,
    private dialogRef: DialogRef,
    private cdr: ChangeDetectorRef,
    @Inject(DIALOG_DATA) public editingApplication: Application | null
  ) {
    this.form = this.fb.group({
      company: ['', Validators.required],
      role: ['', Validators.required],
      status: ['Applied'],
      source: [''],
      notes: [''],
      folderLink: ['']
    });

    if (this.editingApplication) {
      this.form.patchValue(this.editingApplication);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitError = '';

    if (this.editingApplication?._id) {
      this.applicationData.update(this.editingApplication._id, this.form.value).subscribe({
        next: () => {
          this.applicationData.notifyChanged();
          this.dialogRef.close();
        },
        error: () => {
          this.submitError = 'Could not save changes. Check your connection and try again.';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.applicationData.create(this.form.value).subscribe({
        next: () => {
          this.applicationData.notifyChanged();
          this.dialogRef.close();
        },
        error: () => {
          this.submitError = 'Could not save this application. Check your connection and try again.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}