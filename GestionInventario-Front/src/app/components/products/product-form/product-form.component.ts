import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../services/products/product.service';
import { Product } from '../../../models/product.model';


@Component({
  selector: 'app-product-form',
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  productId: number | null = null;
  successMessage: string = '';
  errorMessage: string = '';
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.productForm = this.createProductForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.productId = +params['id'];
        this.isEditMode = true;
        this.loadProduct(this.productId);
      }
    });
  }
  

  loadProduct(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        if (product) {
          this.productForm.patchValue(product);
        }
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.errorMessage = 'Error al cargar el producto';
      }
    });
  }

  createProductForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      imageUrl: ['https://via.placeholder.com/200']
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const productData: Product = {
        id: this.productId || 0,
        ...this.productForm.value
      };

      const operation = this.isEditMode
        ? this.productService.updateProduct(productData)
        : this.productService.createProduct(productData);

      operation.subscribe({
        next: (product) => {
          this.successMessage = this.isEditMode
            ? 'Producto actualizado correctamente'
            : 'Producto creado correctamente';

          setTimeout(() => {
            this.router.navigate(['/products']);
          }, 1500);
        },
        error: (error) => {
          console.error('Error saving product:', error);
          this.errorMessage = 'Error al guardar el producto';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.productForm.patchValue({ image: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      this.productForm.get(key)?.markAsTouched();
    });
  }

  get formControls() {
    return this.productForm.controls;
  } 
}
