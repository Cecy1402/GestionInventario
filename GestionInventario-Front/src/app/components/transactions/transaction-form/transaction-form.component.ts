import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';  
import { ProductService } from '../../../services/products/product.service';
 import { Product } from '../../../models/product.model';
import { Transaction, TRANSACTION_TYPE_CONFIG, TransactionType } from '../../../models/transaction.model';
import { TransactionService } from '../../../services/transactions/transaction.service';

@Component({
  selector: 'app-transaction-form',
  standalone: true,  
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.css']  
})
export class TransactionFormComponent implements OnInit {
  transactionForm: FormGroup;
  transactionId: number | null = null;
  products: Product[] = [];
  isEditMode: boolean = false;
  selectedProduct: Product | null = null;
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private transactionService: TransactionService,
    private router: Router,
    private route: ActivatedRoute  
  ) {
    this.transactionForm = this.createForm();
  }
 
  ngOnInit(): void {
    this.loadProducts();
    this.setCurrentDateTime();
     
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.transactionId = +params['id'];
        this.isEditMode = true;
        this.loadTransaction(this.transactionId);  
      }
    });
 
    this.transactionForm.get('quantity')?.valueChanges.subscribe(() => {
      this.calculateTotal();
      this.validateQuantity();
    });

    this.transactionForm.get('unitPrice')?.valueChanges.subscribe(() => {
      this.calculateTotal();
    });

    this.transactionForm.get('tipo')?.valueChanges.subscribe(() => {
      this.validateQuantity();
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      tipo: ['', Validators.required],
      date: ['', Validators.required],
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0.01)]],
      totalPrice: [{value: 0, disabled: true}],
      detail: ['']
    });
  }

  loadProducts(): void {
    this.productService.getProductsAll().subscribe({ 
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.errorMessage = 'Error al cargar los productos';
      }
    });
  }

  loadTransaction(id: number): void { 
    this.isLoading = true;
    this.transactionService.getTransactionById(id).subscribe({
      
      next: (transaction) => { 
        if (transaction) { 
          const date = new Date(transaction.transactionDate);
          const formattedDate = date.toISOString().slice(0, 16);

          this.getTransactionConfig(transaction);

          console.log("trans", transaction);

          this.transactionForm.patchValue({
            ...transaction,
            date: formattedDate,
            productId: transaction.productId.toString()
          });
          
          this.onProductChange(); 
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transaction:', error);
        this.errorMessage = 'Error al cargar la transacción';
        this.isLoading = false;
      }
    });
  }

  setCurrentDateTime(): void {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 16);
    this.transactionForm.patchValue({ date: formattedDate });
  }

  onProductChange(): void {
    const productId = this.transactionForm.get('productId')?.value;
    if (productId) {
      this.selectedProduct = this.products.find(p => p.id === +productId) || null;
      if (this.selectedProduct) { 
        if (!this.isEditMode || this.transactionForm.get('unitPrice')?.value === 0) {
          this.transactionForm.patchValue({
            unitPrice: this.selectedProduct.price
          });
        }
        this.calculateTotal();
        this.validateQuantity();
      }
    } else {
      this.selectedProduct = null;
    }
  }

  calculateTotal(): void {
    const quantity = this.transactionForm.get('quantity')?.value || 0;
    const unitPrice = this.transactionForm.get('unitPrice')?.value || 0;
    const totalPrice = quantity * unitPrice;
    this.transactionForm.patchValue({ totalPrice });
  }


  getTransactionConfig(transaction: Transaction) {
    if (!transaction?.tipo) return null; 
    return TRANSACTION_TYPE_CONFIG[transaction.tipo]; 
  } 
  
  validateQuantity(): void {
 
    if (this.transactionForm.get('tipo')?.value === TransactionType.Venta && this.selectedProduct) {
  

      const quantity = this.transactionForm.get('quantity')?.value;
      if (quantity > this.selectedProduct.stock) {
        this.transactionForm.get('quantity')?.setErrors({ 
          insufficientStock: true,
          message: `Stock insuficiente. Solo hay ${this.selectedProduct.stock} unidades disponibles.`
        });
      } else { 
        const errors = this.transactionForm.get('quantity')?.errors;
        if (errors && errors['insufficientStock']) {
          delete errors['insufficientStock'];
          delete errors['message'];
          this.transactionForm.get('quantity')?.setErrors(Object.keys(errors).length ? errors : null);
        }
      }
    }
  }

  onSubmit(): void {
    if (this.transactionForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const formValue = this.transactionForm.getRawValue();
 
      const transactionData: Transaction = {
        id: this.transactionId || 0,
        ...formValue,
        productId: + formValue.productId,
        date: new Date(formValue.date),
        totalPrice: formValue.quantity * formValue.unitPrice  
      }; 
        
      const operation = this.isEditMode 
        ? this.transactionService.updateTransaction(this.transactionId!, transactionData)
        : this.transactionService.createTransaction(transactionData);

      operation.subscribe({
        next: (transaction) => {
          this.successMessage = this.isEditMode 
            ? 'Transacción actualizada correctamente' 
            : 'Transacción registrada correctamente';
          this.isLoading = false;
          
          setTimeout(() => {
            this.router.navigate(['/transactions']);
          }, 1500);
        },
        error: (error) => {
          console.error('Error saving transaction:', error);
          this.errorMessage = error.message || 'Error al registrar la transacción';
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.transactionForm.controls).forEach(key => {
      this.transactionForm.get(key)?.markAsTouched();
    });
  }

  get formControls() {
    return this.transactionForm.controls;
  }

  getQuantityError(): string {
    const errors = this.transactionForm.get('quantity')?.errors;
    if (errors?.['insufficientStock']) {
      return errors['message'] || 'Stock insuficiente';
    }
    if (errors?.['required']) {
      return 'La cantidad es requerida';
    }
    if (errors?.['min']) {
      return 'La cantidad debe ser al menos 1';
    }
    return '';
  }
 
  canSubmit(): boolean {
    return this.transactionForm.valid && 
           !this.isLoading && 
           !this.transactionForm.get('quantity')?.errors?.['insufficientStock'];
  }
}