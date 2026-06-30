import {
  AfterViewInit,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
} from '@angular/core';

@Component({
  selector: 'app-onboarding',
  imports: [],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss',
})
export default class OnboardingComponent implements AfterViewInit {

  @ViewChildren('hiddenElement')
  hiddenElements!: QueryList<ElementRef<HTMLElement>>;

  ngAfterViewInit(): void {

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {

        if (entry.isIntersecting) {
          entry.target.classList.add('show');
        }

      });
    });

    this.hiddenElements.forEach(element => {
      observer.observe(element.nativeElement);
    });
  }
}
