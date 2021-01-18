import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit, OnDestroy{
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

  onSignup(form: NgForm) {
    if (form.valid) {
      this.isLoading = true;
      this.authService
        .addUser(form.value.email, form.value.password);
    } else {
      return;
    }
  }

  ngOnDestroy(){
    this.authStatusSub.unsubscribe();
  }
}
