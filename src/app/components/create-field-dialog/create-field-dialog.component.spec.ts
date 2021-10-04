import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFieldDialogComponent } from './create-field-dialog.component';

describe('CreateFieldDialogComponent', () => {
  let component: CreateFieldDialogComponent;
  let fixture: ComponentFixture<CreateFieldDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateFieldDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateFieldDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
