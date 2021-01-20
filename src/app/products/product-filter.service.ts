import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class ProductFilterService {

  private searchedCategories = null;
  private searchedKeyword = null;
  private searchedPriceMin = 0;
  private searchedPriceMax = null;

  public acousticCategory = false;
  public electricCategory = false;
  public amplifiersCategory = false;

  private keywordUpdated = new Subject;

  theKeyword(keyword : string){
    this.keywordUpdated.next(keyword);
    this.searchedKeyword = keyword;
  }

  getKeywordUpdateListener(){
    return this.keywordUpdated.asObservable();
  }

  setCategories(categories : string){
    this.searchedCategories = categories;
  }

  getCategories(){
    return this.searchedCategories;
  }

  setKeyword(keyword : string){
    this.searchedKeyword = keyword;
  }

  getKeyword(){
    return this.searchedKeyword;
  }

  setSearchedPriceRange(minValue: number, maxValue: number){
    this.searchedPriceMin = minValue;
    this.searchedPriceMax = maxValue;
  }

  getSearchedPriceRange(){
    return [this.searchedPriceMin,this.searchedPriceMax];
  }

}
