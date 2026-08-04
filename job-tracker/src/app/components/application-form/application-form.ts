import { Component, Inject } from '@angular/core';
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

  constructor(
    private fb: FormBuilder,
    private applicationData: ApplicationData,
    private dialogRef: DialogRef,
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

    if (this.editingApplication?._id) {
      this.applicationData.update(this.editingApplication._id, this.form.value).subscribe(() => {
        this.applicationData.notifyChanged();
        this.dialogRef.close();
      });
    } else {
      this.applicationData.create(this.form.value).subscribe(() => {
        this.applicationData.notifyChanged();
        this.dialogRef.close();
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}