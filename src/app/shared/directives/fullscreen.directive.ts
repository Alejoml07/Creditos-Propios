import { Directive, HostListener } from '@angular/core';
import screenfull from 'screenfull';

@Directive({
    selector: '[toggleFullscreen]',
    standalone: false
})
export class ToggleFullscreenDirective {
  @HostListener('click') onClick() {
    if (screenfull.isEnabled) {
      screenfull.toggle();
    }
  }
}