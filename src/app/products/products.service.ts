import { Injectable } from '@angular/core';
import { Product } from './product.model';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment} from "../../environments/environment"

const BACKEND_URL = environment.apiUrl + "/products";

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private products: Product[] = [];
  private productsUpdated = new Subject<{products: Product[], productCount:number, maxPrice: number, minPrice: number}>();

  constructor(private http: HttpClient, public router: Router) {}

  getProducts(productsPerPage:number,currentPage: number, selectedCategoriesQuery : string, selectedKeywordQuery: string, selectedPriceQuery: string) {
    const queryParams = `?pagesize=${productsPerPage}&page=${currentPage}${selectedCategoriesQuery}${selectedPriceQuery}${selectedKeywordQuery}`;
    this.http
      .get<{ message: string; products: any , maxProducts : number, maxPrice: number, minPrice: number}>(BACKEND_URL+queryParams)
      .pipe(
        map((productData) => {
          return {products : productData.products.map(product => {
            return {
              title: product.title,
              content: product.content,
              id: product._id,
              imagePath: product.imagePath,
              currentProdPrice: product.currentProdPrice,
              beforeDiscountPrice: product.beforeDiscountPrice,
              category: product.category,
              stock: product.stock,
              creator: product.creator
            };
          }),maxProducts: productData.maxProducts, maxPrice : productData.maxPrice, minPrice: productData.minPrice};
        })
      )
      .subscribe((transfromedProductsData) => {
        this.products = transfromedProductsData.products;
        this.productsUpdated.next({products:[...this.products],
           productCount: transfromedProductsData.maxProducts, maxPrice: transfromedProductsData.maxPrice, minPrice: transfromedProductsData.minPrice});
      });
  }
  getProductUpdateListener() {
    return this.productsUpdated.asObservable();
  }

  addProduct(title: string, content: string, image: File, regularPrice: number, discountedPrice: number, category: string, stock: number) {
    const productData = new FormData();
    productData.append('title', title);
    productData.append('content', content);
    productData.append('image', image, title);
    if(discountedPrice == null){
      productData.append('currentProdPrice', regularPrice.toString());
      productData.append('beforeDiscountPrice',"");
    }else {
      productData.append('currentProdPrice', discountedPrice.toString());
    productData.append('beforeDiscountPrice', regularPrice.toString());
    }
    productData.append('stock', stock.toString());
    productData.append('category', category);

    this.http
      .post<{ message: string; product: Product }>(
        BACKEND_URL,
        productData
      )
      .subscribe((responseData) => {
        /*
        const product: Product = {
          id: responseData.product.id,
          title: title,
          content: content,
          imagePath: responseData.product.imagePath,
        };
        this.products.push(product);
        this.productsUpdated.next([...this.products]);
        */
        this.router.navigate(['/']);
      });
  }

  updateProduct(id: string, title: string, content: string, image: File | string,  regularPrice: number, discountedPrice: number, category: string, stock: number) {
    let productData : Product | FormData;
    if (typeof image === "object") {
      productData = new FormData();
      productData.append("id",id);
      productData.append("title", title);
      productData.append("content", content);
      productData.append("image", image, title);
      if(discountedPrice == null){
        productData.append('currentProdPrice', regularPrice.toString());
        productData.append('beforeDiscountPrice',"");
      }else {
        console.log(discountedPrice)
        productData.append('currentProdPrice', discountedPrice.toString());
        productData.append('beforeDiscountPrice', regularPrice.toString());
      }
      productData.append("stock", stock.toString());
      productData.append('category', category);
    } else {
      if(discountedPrice == 0 || discountedPrice == null){
        console.log("discount is null")

      productData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        currentProdPrice: regularPrice,
        beforeDiscountPrice: null,
        category: category,
        stock: stock,
        creator: null
      };
    }else{
      console.log("iwashere")
      console.log(discountedPrice)
      productData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        currentProdPrice: discountedPrice,
        beforeDiscountPrice: regularPrice,
        category: category,
        stock: stock,
        creator: null
      }
    }
    }
    this.http
      .put(BACKEND_URL+`/${id}`, productData)
      .subscribe((response) => {
        /*
        const updatedProducts = [...this.products];
        const oldProductIndex = updatedProducts.findIndex(
          (p) => p.id === id
        );
        const product: Product = {
            id: id,
            title: title,
            content: content,
            imagePath: ""
        }
        updatedProducts[oldProductIndex] = product;
        this.products = updatedProducts;
        this.productsUpdated.next([...this.products]);
        */
        this.router.navigate(['/']);
      });
  }

  deleteProduct(productId: string) {
    return this.http
      .delete(BACKEND_URL + `/${productId}`);
  }

  getProduct(id: string){
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
      currentProdPrice: number;
      beforeDiscountPrice: number;
      category: string;
      stock: number;
      creator: string;
    }>(BACKEND_URL + `/${id}`);
  }


}
