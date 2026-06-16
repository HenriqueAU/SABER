import { ComponentFixture, TestBed } from '@angular/core/testing';

import Emprestimo from './emprestimo';

describe('Emprestimo', () => {
  let component: Emprestimo;
  let fixture: ComponentFixture<Emprestimo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Emprestimo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Emprestimo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
