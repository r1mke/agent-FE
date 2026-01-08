import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingStudio } from './training-studio';

describe('TrainingStudio', () => {
  let component: TrainingStudio;
  let fixture: ComponentFixture<TrainingStudio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingStudio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingStudio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
