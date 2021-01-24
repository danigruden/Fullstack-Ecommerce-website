import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from 'src/app/cart/cart.service';
import { ProductFilterService } from '../product-filter.service';
import { ProductsService } from '../products.service';

@Component({
  selector: 'app-single-product-page',
  templateUrl: './single-product-page.component.html',
  styleUrls: ['./single-product-page.component.css']
})
export class SingleProductPageComponent implements OnInit, OnDestroy {

  constructor(private productService: ProductsService, private cartService: CartService, private productFilterService: ProductFilterService, private router: Router, private activatedRoute:  ActivatedRoute) { }

  private cartListenerSub: Subscription;

  inCart;
  isLoading=false;
  currentProdId: string;
  currentProdData: {
    _id: string,
    title: string,
    content: string,
    imagePath: string,
    currentProdPrice: number,
    beforeDiscountPrice: number,
    category: string,
    stock: number,
    creator: string};

  relatedProds : Array<{
      _id: string,
      title: string,
      content: string,
      imagePath: string,
      currentProdPrice: number,
      beforeDiscountPrice: number,
      category: string,
      stock: number,
      creator: string}>;

  currentProdQtyCart: number = 0;
  prodQty:number;
  currProdCategoryString: string = "";

  ngOnInit(): void {
    this.isLoading = true;
    this.inCart = this.cartService.getSavedCartData();
    this.cartListenerSub = this.cartService.getNewCartData()
    .subscribe(cartData  => {
      this.inCart = cartData;
      if(this.inCart !== null){

      let prodWasInCart = false;
      this.inCart.forEach(item => {
        if(item.id == this.currentProdData._id){
          this.currentProdQtyCart = item.quantity;
          this.prodQty = this.currentProdQtyCart;
          prodWasInCart = true;
        }
      });
      if(!prodWasInCart){
        this.currentProdQtyCart = 0;
        this.prodQty = this.currentProdQtyCart;
      }
    }
    });
    this.activatedRoute.paramMap.subscribe((paramMap: ParamMap) => {
    this.currentProdId = paramMap.get('productId');
    this.productService.getProduct(this.currentProdId)
    .subscribe(prodData => {
      this.currentProdData = prodData;
      let convertCategory = this.currentProdData.category.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
      this.currProdCategoryString = convertCategory.charAt(0).toUpperCase() + convertCategory.slice(1);
      let prodWasInCart = false;
      if(this.inCart !== null){
      this.inCart.forEach(item => {
        if(item.id == this.currentProdData._id){
          this.currentProdQtyCart = item.quantity;
          this.prodQty = this.currentProdQtyCart;
          prodWasInCart = true;
        }
      });
      if(!prodWasInCart){
        this.currentProdQtyCart = 0;
      }
    }
      this.productService.getRelatedProducts(this.currentProdData._id,this.currentProdData.category)
      .subscribe(responseData => {
        this.relatedProds = responseData.products;
        this.isLoading = false;
      });
    });
    });
  }

  onAddOneToCart(prodId: string,title: string, imgPath: string, currentProdPrice: number){
    if(this.prodQty < this.currentProdData.stock || this.prodQty == null){
      this.cartService.addToCart(prodId,title,imgPath,currentProdPrice);
    }
  }

  onRemoveOneFromCart(prodId: string){
    this.cartService.removeOneFromCart(prodId);
  }

  onSetNewProdQty(prodId: string){
    if(this.prodQty < this.currentProdData.stock){
      this.cartService.setNewProdQty(prodId,this.prodQty);
    }else{
      this.prodQty = this.currentProdData.stock;
      this.cartService.setNewProdQty(prodId,this.prodQty);
    }
  }

  onSearchThisCategory(){
    this.productFilterService.setSearchedPriceRange(0, null);
    this.productFilterService.setKeyword("");
    if(this.currentProdData.category == "electricGuitars"){
      this.productFilterService.electricCategory = true;
    }else{
      this.productFilterService.electricCategory = false;
    }
    if(this.currentProdData.category == "acousticGuitars"){
      this.productFilterService.acousticCategory = true;
    }else{
      this.productFilterService.acousticCategory = false;
    }
    if(this.currentProdData.category == "amplifiers"){
      this.productFilterService.amplifiersCategory = true;
    }else{
      this.productFilterService.amplifiersCategory = false;
    }
    this.productFilterService.setCategories("&category="+this.currentProdData.category);
    this.router.navigate(['/']);
  }

  onSearchAllProds(){
    this.productFilterService.clearFilters();
    this.router.navigate(['/']);
  }

  ngOnDestroy(){
    this.cartListenerSub.unsubscribe();
  }

}
