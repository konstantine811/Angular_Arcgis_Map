import { Component, Inject, OnInit } from '@angular/core';
import {
  Validators,
  FormBuilder,
  FormControl,
  FormGroupDirective,
  NgForm,
} from '@angular/forms';
// material
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ErrorStateMatcher } from '@angular/material/core';
// models
import { IFieldArcgisAttr } from 'src/app/models/data/field-data';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: FormControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }
}

@Component({
  selector: 'app-create-field-dialog',
  templateUrl: './create-field-dialog.component.html',
  styleUrls: ['./create-field-dialog.component.scss'],
})
export class CreateFieldDialogComponent implements OnInit {
  fieldForm = this.fb.group({
    fieldName: [
      null,
      [Validators.required, Validators.pattern('^([0-9]{2}.){5}([0-9]{1,2})$')],
    ],
    cropName: [
      null,
      [Validators.required, Validators.pattern('^(([а-яА-Я-\\s]){2,30})$')],
    ],
    harvestYear: [
      2021,
      [Validators.required, Validators.pattern('(?:(?:19|20)[0-9]{2})')],
    ],
  });

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateFieldDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: IFieldArcgisAttr
  ) {
    if (this.data) {
      this.fieldForm.controls['fieldName'].setValue(this.data.FieldName);
      this.fieldForm.controls['cropName'].setValue(this.data.CropName);
      this.fieldForm.controls['harvestYear'].setValue(this.data.HarvestYear);
    }
  }

  ngOnInit(): void {
    this.dialogRef.backdropClick().subscribe((res) => {
      console.log(res);
    });
  }

  onSubmit() {
    if (!this.fieldForm.invalid) {
      this.dialogRef.close(this.fieldForm.value);
    }
  }

  matcher = new MyErrorStateMatcher();
}
