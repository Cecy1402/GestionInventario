import { Routes } from '@angular/router';
import { ProductListComponent } from './components/products/product-list/product-list.component';
import { ProductFormComponent } from './components/products/product-form/product-form.component';
import { ProductDetailComponent } from './components/products/product-detail/product-detail.component';
import { TransactionListComponent } from './components/transactions/transaction-list/transaction-list.component';
import { TransactionFormComponent } from './components/transactions/transaction-form/transaction-form.component';
import { TransactionDetailComponent } from './components/transactions/transaction-detail/transaction-detail.component';

export const routes: Routes = [
    {  path: '', redirectTo: '/products', pathMatch: 'full'},
    { path: 'products', component: ProductListComponent },
    { path: 'products/new', component: ProductFormComponent },
    { path: 'products/edit/:id', component: ProductFormComponent },
    { path: 'products/detail/:id', component: ProductDetailComponent },
    { path: 'transactions', component: TransactionListComponent },
    { path: 'transactions/new', component: TransactionFormComponent }, 
    { path: 'transactions/edit/:id', component: TransactionFormComponent },
    { path: 'transactions/detail/:id', component: TransactionDetailComponent },
    //{ path: 'transaction-search', component: TransactionSearchComponent },
    { path: '**', redirectTo: '/products' }


];
