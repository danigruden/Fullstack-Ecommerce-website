import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-single-product-page',
  templateUrl: './single-product-page.component.html',
  styleUrls: ['./single-product-page.component.css']
})
export class SingleProductPageComponent implements OnInit {

  constructor() { }

  isLoading=false;

  ngOnInit(): void {
  }

}
