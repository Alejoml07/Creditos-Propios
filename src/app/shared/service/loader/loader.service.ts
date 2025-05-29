import { Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private _isLoading = signal(false);

  readonly isLoading = this._isLoading.asReadonly();

  public show(): void {

    this._isLoading.set(true);

  }


  public hide() {

    this._isLoading.set(false);

  }

  public toggle() {

    this._isLoading.update(current => !current);

  }

}
