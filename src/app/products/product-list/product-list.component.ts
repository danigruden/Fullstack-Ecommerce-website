import { Options } from '@angular-slider/ngx-slider';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { CartService } from 'src/app/cart/cart.service';
import { ProductFilterService } from '../product-filter.service';
import { Product } from '../product.model';
import { ProductsService } from '../products.service';
import { debounce } from 'ts-debounce';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  userIsAuthenticated = false;

  private productSub: Subscription;
  private authListenerSub: Subscription;
  private keywordFilterSub: Subscription;

  currentPage: number = 1;
  totalProducts: number = 10;
  productsPerPage: number = 9;
  productsPerPageOptions = [6, 9, 12, 15];
  currentUserId;
  isLoading: boolean = false;
  selectedCategoriesQuery = '';
  keywordInInput = '';
  selectedKeywordQuery = '&keywordSearch=';
  selectedPriceQuery = '&priceSearchMin=0&priceSearchMax=null';
  acousticCategory = false;
  electricCategory = false;
  amplifiersCategory = false;
  componenentSettingsInitialized = false;

  debouncedTest = debounce(this.onSearchByPrice, 200);

  maxPrice = 0;
  minPrice = 0;
  minValue: number = 0;
  maxValue: number = 0;
  options: Options = {
    floor: 0,
    ceil: this.maxPrice,
  };

  constructor(
    public productsService: ProductsService,
    private authService: AuthService,
    private productfilterService: ProductFilterService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.isLoading = true;

    this.keywordFilterSub = this.productfilterService
      .getKeywordUpdateListener()
      .subscribe((keyword) => {
        this.keywordInInput = keyword.toString();
        this.onSearchByKeyword();
      });

    this.keywordInInput = this.productfilterService.getKeyword();
    if (this.keywordInInput !== null) {
      this.onSearchByKeyword();
    } else {
      this.keywordInInput = '';
      this.onSearchByKeyword();
    }

    this.currentUserId = this.authService.getUserId();
    this.productSub = this.productsService
      .getProductUpdateListener()
      .subscribe(
        (productData: {
          products: Product[];
          productCount: number;
          maxPrice: number;
          minPrice: number;
        }) => {
          this.products = productData.products;
          this.totalProducts = productData.productCount;

          if (!this.componenentSettingsInitialized) {
            this.maxPrice = Number((productData.maxPrice + 1).toFixed(0));

            this.maxValue = this.maxPrice;

            this.options = {
              floor: 0,
              ceil: this.maxPrice,
            };
          }
          this.componenentSettingsInitialized = true;
          this.isLoading = false;
        }
      );
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authListenerSub = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.currentUserId = this.authService.getUserId();
      });
  }

  onAddToCart(
    prodId: string,
    prodTitle: string,
    imgPath: string,
    currentProdPrice: number
  ) {
    this.cartService.addToCart(prodId, prodTitle, imgPath, currentProdPrice);
  }

  onChangePage(pageEvent: PageEvent) {
    this.currentPage = pageEvent.pageIndex + 1;
    this.productsPerPage = pageEvent.pageSize;
    this.searchWithFilters();
  }

  onDelete(productId: string) {
    this.isLoading = true;
    this.productsService.deleteProduct(productId).subscribe(
      () => {
        this.searchWithFilters();
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  onSelectCategory(category: string) {
    let stringReplace = '';

    if (category == 'electricCategory') {
      if (this.electricCategory == false) {
        this.electricCategory = true;
        stringReplace =
          this.selectedCategoriesQuery + '&category=electricGuitars';
      } else {
        this.electricCategory = false;
        stringReplace = this.selectedCategoriesQuery.replace(
          '&category=electricGuitars',
          ''
        );
      }
    }

    if (category == 'acousticCategory') {
      if (this.acousticCategory == false) {
        this.acousticCategory = true;
        stringReplace =
          this.selectedCategoriesQuery + '&category=acousticGuitars';
      } else {
        this.acousticCategory = false;
        stringReplace = this.selectedCategoriesQuery.replace(
          '&category=acousticGuitars',
          ''
        );
      }
    }

    if (category == 'amplifiersCategory') {
      if (this.amplifiersCategory == false) {
        this.amplifiersCategory = true;
        stringReplace = this.selectedCategoriesQuery + '&category=amplifiers';
      } else {
        this.amplifiersCategory = false;
        stringReplace = this.selectedCategoriesQuery.replace(
          '&category=amplifiers',
          ''
        );
      }
    }

    this.selectedCategoriesQuery = stringReplace;
    this.searchWithFilters();
  }

  debounce<Params extends any[]>(
    func: (...args: Params) => any,
    timeout: number
  ): (...args: Params) => void {
    let timer: NodeJS.Timeout;
    return (...args: Params) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args);
      }, timeout);
    };
  }

  onSearchByPrice() {
    this.selectedPriceQuery = `&priceSearchMin=${this.minValue}&priceSearchMax=${this.maxValue}`;
    console.log('maxprice' + this.maxPrice);
    console.log('maxvalue' + this.maxValue);
    this.searchWithFilters();
  }

  onSearchByKeyword() {
    this.selectedKeywordQuery = `&keywordSearch=${this.keywordInInput}`;
    this.productfilterService.setKeyword(this.keywordInInput);
    this.searchWithFilters();
  }

  searchWithFilters() {
    this.productsService.getProducts(
      this.productsPerPage,
      this.currentPage,
      this.selectedCategoriesQuery,
      this.selectedPriceQuery,
      this.selectedKeywordQuery
    );
  }

  clearFilters() {
    this.productfilterService.theKeyword('');
  }

  ngOnDestroy() {
    this.productSub.unsubscribe();
    this.authListenerSub.unsubscribe();
    this.keywordFilterSub.unsubscribe();
  }
}
