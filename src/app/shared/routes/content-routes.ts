import { Routes } from '@angular/router';


export const content: Routes = [
 

  
  {
    path: 'pagina',
    loadChildren: () => import('../../components/gestor-contenido/gestor-contenido.module').then(m => m.GestorContenidoModule),
    data: {
      breadcrumb: "Coupons"
    }
  },
  
  {
    path: 'mi-portal',
    loadChildren: () => import('../../components/pedido/pedido.module').then(m => m.PedidoModule),
    data: {
      breadcrumb: "Pedidos"
    }
  },

  {
    path: 'registro',
    loadChildren: () => import('../../components/registro-datos/registro-datos.module').then(m => m.RegistroDatosModule),
    data: {
      breadcrumb: "Pedidos"
    }
  },
  


 
 
  
 



  
];