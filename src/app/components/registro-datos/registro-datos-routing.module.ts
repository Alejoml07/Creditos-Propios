import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DatosBasicosComponent } from './datos-basicos/datos-basicos.component';
import { TratamientoDatosComponent } from './tratamiento-datos/tratamiento-datos.component';
import { InformacionComplementariaComponent } from './informacion-complementaria/informacion-complementaria.component';
import { DocumentoValidacionComponent } from './documento-validacion/documento-validacion.component';
import { FotoPersonaValidacionComponent } from './foto-persona-validacion/foto-persona-validacion.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'datos-basicos',
        component: DatosBasicosComponent,
        // canActivate: [authGuard]

      },
      {
        path: 'tratamiento-datos',
        component: TratamientoDatosComponent,
        // canActivate: [authGuard]

      },
      {
        path: 'informacion-complementaria',
        component: InformacionComplementariaComponent,
        // canActivate: [authGuard]

      },
      {
        path: 'documento-validacion',
        component: DocumentoValidacionComponent,
        // canActivate: [authGuard]

      },
      {
        path: 'foto-validacion',
        component: FotoPersonaValidacionComponent,        
        // canActivate: [authGuard]     
        
      },

      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegistroDatosRoutingModule { }
