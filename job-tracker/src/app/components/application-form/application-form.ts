import { Component, Input, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApplicationData, Application } from '../../services/application-data';

@Component({
  selector: 'app-application-form',
  imports: [ReactiveFormsModule],
  templateUrl: './application-form.html',
  styleUrl: './application-form.scss'
})
export class ApplicationForm implements OnChanges {
  @Input() editingApplication: Application | null = null;

  form: FormGroup;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private applicationData: ApplicationData
  ) {
    this.form = this.fb.group({
      company: ['', Validators.required],
      role: ['', Validators.required],
      status: ['Applied'],
      source: [''],
      notes: [''],
      folderLink: ['']
    });
  }

  ngOnChanges(): void {
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
        this.submitted = true;
      });
    } else {
      this.applicationData.create(this.form.value).subscribe(() => {
        this.submitted = true;
        this.form.reset({ status: 'Applied' });
      });
    }
  }
}