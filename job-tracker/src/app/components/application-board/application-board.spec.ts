import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationBoard } from './application-board';

describe('ApplicationBoard', () => {
  let component: ApplicationBoard;
  let fixture: ComponentFixture<ApplicationBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationBoard],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationBoard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
