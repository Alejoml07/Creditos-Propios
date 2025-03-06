import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistroDatosRoutingModule } from './registro-datos-routing.module';
import { DatosBasicosComponent } from './datos-basicos/datos-basicos.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';
import { TratamientoDatosComponent } from './tratamiento-datos/tratamiento-datos.component';
import { InformacionComplementariaComponent } from './informacion-complementaria/informacion-complementaria.component';
import { DocumentoValidacionComponent } from './documento-validacion/documento-validacion.component';
import { FotoPersonaValidacionComponent } from './foto-persona-validacion/foto-persona-validacion.component';


@NgModule({
  declarations: [
    DatosBasicosComponent,
    TratamientoDatosComponent,
    InformacionComplementariaComponent,
    DocumentoValidacionComponent,
    FotoPersonaValidacionComponent
  ],
  imports: [
    CommonModule,
    RegistroDatosRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
  ]
})
export class RegistroDatosModule { }
