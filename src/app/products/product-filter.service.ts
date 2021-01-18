import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({ providedIn: 'root' })
export class ProductFilterService {

  private searchedKeyword = null;

  private keywordUpdated = new Subject;

  theKeyword(keyword : string){
    this.keywordUpdated.next(keyword);
    this.searchedKeyword = keyword;
    //localStorage.setItem("keyword" ,keyword);
  }

  getKeywordUpdateListener(){
    return this.keywordUpdated.asObservable();
  }

  setKeyword(keyword : string){
    //localStorage.setItem("keyword" ,keyword);
    this.searchedKeyword = keyword;
  }

  getKeyword(){
    return this.searchedKeyword;
    //return localStorage.getItem("keyword");
  }
}
