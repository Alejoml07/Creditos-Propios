import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DatosBasicosComponent } from './datos-basicos/datos-basicos.component';
import { TratamientoDatosComponent } from './tratamiento-datos/tratamiento-datos.component';
import { InformacionComplementariaComponent } from './informacion-complementaria/informacion-complementaria.component';
import { DocumentoValidacionComponent } from './documento-validacion/documento-validacion.component';
import { FotoPersonaValidacionComponent } from './foto-persona-validacion/foto-persona-validacion.component';
import { DocumentoTraseraValidacionComponent } from './documento-trasera-validacion/documento-trasera-validacion.component';
import { CodigoOtpComponent } from './codigo-otp/codigo-otp.component';
import { AprobacionCreditoComponent } from './aprobacion-credito/aprobacion-credito.component';
import { CreditDeniedComponent } from './credit-denied/credit-denied.component';
import { IdentityDeniedComponent } from './identity-denied/identity-denied.component';
import { FlowStepGuard } from 'src/app/shared/guards/flow-step/flow-step.guard';

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
        // canActivate: [FlowStepGuard]

        // canActivate: [authGuard]

      },
      {
        path: 'documento-back-validacion',
        component: DocumentoTraseraValidacionComponent,
        // canActivate: [authGuard]

      },
      {
        path: 'foto-validacion',
        component: FotoPersonaValidacionComponent, 
        canActivate: [FlowStepGuard]
       
        // canActivate: [authGuard]     
        
      },
      {
        path: 'codigo-otp',
        component: CodigoOtpComponent,
        canActivate: [FlowStepGuard]

        // canActivate: [authGuard]
      },
      {
        path: 'aprobacion-credito',
        component: AprobacionCreditoComponent,
        // canActivate: [authGuard]
      },
      {
        path: 'credit-denied',
        component: CreditDeniedComponent,
        // canActivate: [authGuard]
      },
      {
        path: 'identity-denied',
        component: IdentityDeniedComponent,
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
