import { ComponentFixture, TestBed } from '@angular/core/testing';

import  Exemplar  from './exemplar';

describe('Exemplar', () => {
  let component: Exemplar;
  let fixture: ComponentFixture<Exemplar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Exemplar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Exemplar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
