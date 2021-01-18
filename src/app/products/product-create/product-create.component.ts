import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { ProductsService } from '../products.service';
import { Product } from '../product.model';
import { mimeType } from './mime-type.validator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-product-create',
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.css'],
})
export class ProductCreateComponent implements OnInit, OnDestroy {
  enteredTitle = '';
  enteredContent = '';
  product: Product;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  private mode = 'create';
  private productId: string;
  private authStatusSub: Subscription;

  constructor(
    public productsService: ProductsService,
    public route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(() => {
        (authStatus) => {
          this.isLoading = false;
        };
      });
        this.form = new FormGroup({
          title: new FormControl(null, {
            validators: [Validators.required, Validators.minLength(3)],
          }),
          content: new FormControl(null, { validators: [Validators.required] }),
          image: new FormControl(null, {
            validators: [Validators.required],
            asyncValidators: [mimeType],
          }),
          regularPrice: new FormControl(null, {
            validators: [Validators.required],
          }),
          discountedPrice: new FormControl(null),
          category: new FormControl(null, {
            validators: [Validators.required],
          }),
          stock: new FormControl(null, { validators: [Validators.required] }),
        });

        this.route.paramMap.subscribe((paramMap: ParamMap) => {
          if (paramMap.has('productId')) {
            console.log("Entering edit mode")
            this.mode = 'edit';
            this.productId = paramMap.get('productId');
            this.isLoading = true;
            this.productsService
              .getProduct(this.productId)
              .subscribe((productData) => {
                console.log(productData);
                this.isLoading = false;
                this.product = {
                  id: productData._id,
                  title: productData.title,
                  content: productData.content,
                  imagePath: productData.imagePath,
                  currentProdPrice: productData.currentProdPrice,
                  beforeDiscountPrice: productData.beforeDiscountPrice,
                  category: productData.category,
                  stock: productData.stock,
                  creator: productData.creator,
                };
                if(this.product.beforeDiscountPrice == null){
                  console.log("No discount");
                  this.form.setValue({
                    title: this.product.title,
                    content: this.product.content,
                    image: this.product.imagePath,
                    regularPrice: this.product.currentProdPrice,
                    discountedPrice: "",
                    category: this.product.category,
                    stock: this.product.stock,
                  });
                }else{
                  this.form.setValue({
                    title: this.product.title,
                    content: this.product.content,
                    image: this.product.imagePath,
                    regularPrice: this.product.beforeDiscountPrice,
                    discountedPrice: this.product.currentProdPrice,
                    category: this.product.category,
                    stock: this.product.stock,
                    });
                }
              });
          } else {
            this.mode = 'create';
            this.productId = null;
          }
        });
    this.isLoading = false;
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSaveProduct() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.productsService.addProduct(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image,
        this.form.value.regularPrice,
        this.form.value.discountedPrice,
        this.form.value.category,
        this.form.value.stock
      );
    } else {
      this.productsService.updateProduct(
        this.productId,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image,
        this.form.value.regularPrice,
        this.form.value.discountedPrice,
        this.form.value.category,
        this.form.value.stock
      );
    }
    this.form.reset();
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}
