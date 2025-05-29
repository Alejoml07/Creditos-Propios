import { Component, inject } from '@angular/core';
import { LoaderService } from 'src/app/shared/service/loader/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true, // ✅ Esto es lo que Angular detecta (aunque no lo escribiste explícitamente, lo infiere)
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})

export class LoaderComponent {

  private loaderService: LoaderService = inject(LoaderService);
  
  public isLoading = this.loaderService.isLoading;

}
