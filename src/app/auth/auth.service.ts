import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthData } from './user.model';
import { Subject } from 'rxjs';
import { environment} from "../../environments/environment"


const BACKEND_URL = environment.apiUrl + "/user";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private tokenTimer: any;
  private authStatusListener = new Subject<boolean>();
  private currentUserId: string;
  private currentUserEmail: string;
  private currentUserType: string;

  constructor(private http: HttpClient, public router: Router) {}

  getToken() {
    return this.token;
  }

  getUserId() {
    return this.currentUserId;
  }

  getUserEmail() {
    return this.currentUserEmail;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  addUser(email: string, password: string) {
    const authData: AuthData = {
      email: email,
      password: password,
    };
    this.http.post<{ email; password }>(
      BACKEND_URL + '/signup',
      authData
    ).subscribe(()=> {
      this.router.navigate(["/login"]);
    },error => {
      this.authStatusListener.next(false);
    })
  }

  loginUser(email: string, password: string) {
    const authData: AuthData = {
      email: email,
      password: password,
    };
    this.http
      .post<{ token: string; expiresIn: number; userId: string , userEmail:string}>(
        BACKEND_URL + '/login',
        authData
      )
      .subscribe((response) => {
        const token = response.token;
        this.token = token;
        if (token) {
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.isAuthenticated = true;
          this.currentUserId = response.userId;
          this.currentUserEmail = response.userEmail;
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(
            now.getTime() + expiresInDuration * 1000
          );
          console.log(expirationDate);
          this.saveAuthData(token, expirationDate, this.currentUserId, this.currentUserEmail, this.currentUserType);
          this.router.navigate(['/']);
        }
      },error => {
        this.authStatusListener.next(false);
      });
  }

  getUserType() {
    return this.http
      .get<{ userType: string}>(BACKEND_URL+"/userType");
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.currentUserId = authInformation.currentUserId;
      this.currentUserEmail = authInformation.currentUserEmail;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  private setAuthTimer(duration) {
    console.log('Timer: ' + duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.currentUserId = null;
    this.router.navigate(['/']);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string, email: string, currentUserType: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('currentUserId', userId);
    localStorage.setItem('currentUserEmail', email);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUserEmail');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const currentUserId = localStorage.getItem('currentUserId');
    const currentUserEmail = localStorage.getItem('currentUserEmail');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      currentUserId: currentUserId,
      currentUserEmail: currentUserEmail,
    };
  }
}
