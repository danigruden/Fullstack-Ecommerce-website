import { OnInit } from "@angular/core";
import { OnDestroy } from "@angular/core";
import { Component} from "@angular/core";
import { NgForm } from "@angular/forms";
import { Subscription } from "rxjs";
import { AuthService} from "../auth.service"

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})

export class LoginComponent implements OnInit, OnDestroy{
  constructor(private authService: AuthService) {}

  isLoading: boolean = false;
  private authStatusSub : Subscription;

  ngOnInit(){
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    );
  }


  onLogin(form : NgForm){
    if(form.valid){
      this.isLoading = true;
      this.authService.loginUser(form.value.email,form.value.password);
    }else{
      return;
    }
  }

  ngOnDestroy(){
    this.authStatusSub.unsubscribe();
  }
}
