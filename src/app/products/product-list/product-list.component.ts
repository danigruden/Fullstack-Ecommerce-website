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
  currentUserType = 'unauthenticated';

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
  componenentSettingsInitialized = false;
  searchedSettingsSet = true;

  debouncedSearch = debounce(this.onSearchByPrice, 200);

  minPrice = 0;
  maxPrice = 0;
  minValue: number = 0;
  maxValue: number = 0;
  options: Options = {
    floor: 0,
    ceil: 9999999999999,
  };

  constructor(
    public productsService: ProductsService,
    private authService: AuthService,
    public productfilterService: ProductFilterService,
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

    if (this.productfilterService.getCategories() !== null) {
      this.searchedSettingsSet = false;
      this.selectedCategoriesQuery = this.productfilterService.getCategories();
      console.log(this.selectedCategoriesQuery);
    }

    if (
      this.productfilterService.getSearchedPriceRange()[0] !== 0 ||
      this.productfilterService.getSearchedPriceRange()[1] !== null
    ) {
      //this.selectedPriceQuery = this.productfilterService.getSearchedPriceRange();
      this.searchedSettingsSet = false;
      this.minValue = this.productfilterService.getSearchedPriceRange()[0];
      this.maxValue = this.productfilterService.getSearchedPriceRange()[1];
      this.onSearchByPrice();
      console.log(this.productfilterService.getSearchedPriceRange()[1]);
    }

    if (this.productfilterService.getKeyword() !== null) {
      this.searchedSettingsSet = false;
      this.keywordInInput = this.productfilterService.getKeyword();
      this.onSearchByKeyword();
    }

    this.searchWithFilters();

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

            if (this.searchedSettingsSet) {
              this.maxValue = this.maxPrice;
            } else if (
              this.productfilterService.getSearchedPriceRange()[1] == null
            ) {
              this.maxValue = this.maxPrice;
            }

            this.options = {
              floor: 0,
              ceil: this.maxPrice,
            };
          }
          this.componenentSettingsInitialized = true;
          this.searchedSettingsSet = true;
          this.isLoading = false;
        }
      );
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authListenerSub = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.currentUserId = this.authService.getUserId();
        if(this.userIsAuthenticated){
        this.authService.getUserType().subscribe((response) => {
          this.currentUserType = response.userType;
        });
      }
      });
    if (this.userIsAuthenticated)
      this.authService.getUserType().subscribe((response) => {
        this.currentUserType = response.userType;
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

  onSelectCategory() {
    let searchCategoriesQuery;
    if (this.productfilterService.electricCategory) {
      searchCategoriesQuery =
        searchCategoriesQuery + '&category=electricGuitars';
    }
    if (this.productfilterService.acousticCategory) {
      searchCategoriesQuery =
        searchCategoriesQuery + '&category=acousticGuitars';
    }
    if (this.productfilterService.amplifiersCategory) {
      searchCategoriesQuery = searchCategoriesQuery + '&category=amplifiers';
    }
    this.selectedCategoriesQuery = searchCategoriesQuery;
    this.productfilterService.setCategories(searchCategoriesQuery);
    this.searchWithFilters();
  }
  onSearchByKeyword() {
    this.selectedKeywordQuery = `&keywordSearch=${this.keywordInInput}`;
    if (this.searchedSettingsSet) {
      this.productfilterService.setKeyword(this.keywordInInput);
      this.searchWithFilters();
    }
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
    if (this.searchedSettingsSet) {
      this.productfilterService.setSearchedPriceRange(
        this.minValue,
        this.maxValue
      );
      this.searchWithFilters();
    }
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
    this.searchedSettingsSet = false;
    this.productfilterService.clearFilters();
    this.selectedKeywordQuery = '&keywordSearch=';
    this.selectedPriceQuery = '&priceSearchMin=0&priceSearchMax=null';
    this.minValue = this.minPrice;
    this.maxValue = this.maxPrice;
    this.selectedCategoriesQuery = '';
    this.searchedSettingsSet = true;
    this.searchWithFilters();
  }

  ngOnDestroy() {
    this.productSub.unsubscribe();
    this.authListenerSub.unsubscribe();
    this.keywordFilterSub.unsubscribe();
  }
}
