import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { from, lastValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log("inside AuthInterceptor");
    return from(this.handleAccess(request, next));
  }

  private async handleAccess(request: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    console.log("inside handleAccess");
    const theEndPoint = environment.luv2shopApiUrl + '/orders';
    console.log("theEndPoint: ", theEndPoint);
    // Only add an access token for secured endpoints
    const securedEndpoints = [theEndPoint];

    if (securedEndpoints.some(url => request.urlWithParams.includes(url))) {

      // get access token
      await this.auth.getAccessTokenSilently().forEach(token => {
        console.log('Access Token: ', token);
        // clone the request and add new header with access token
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });

      });

    }
    return await lastValueFrom(next.handle(request));
  }
}
