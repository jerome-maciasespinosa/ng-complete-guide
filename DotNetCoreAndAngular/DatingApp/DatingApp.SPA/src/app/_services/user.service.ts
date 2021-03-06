import { PaginatedResult } from './../_models/pagination';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { User } from '../_models/User';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { AuthHttp } from 'angular2-jwt';

@Injectable()
export class UserService {
  baseUrl = environment.apiUrl;

constructor(private authHttp: AuthHttp) { }
  getUsers(page?: number, itemsPerPage?: number, userParams?: any, likesParam?: string) {
    const paginatedResult: PaginatedResult<User[]> = new PaginatedResult<User[]>();
    let queryString = '?';

    if (page !== null && itemsPerPage !== null) {
      queryString += 'pageNumber=' + page + '&pageSize=' + itemsPerPage + '&';
    }

    if (likesParam === 'Likers') {
      queryString += 'Likers=true&';
    }

    if (likesParam === 'Likees') {
      queryString += 'Likees=true&';
    }

    if (userParams != null) {
      queryString += 'minAge=' + userParams.minAge + '&maxAge=' + userParams.maxAge + '&gender=' + userParams.gender
        + '&orderBy=' + userParams.orderBy;
    }

    return this.authHttp.get(this.baseUrl + 'users' + queryString)
    .map((response: Response) => {
      paginatedResult.result = response.json();
      if (response.headers.get('Pagination') != null) {
        paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
      }
      return paginatedResult;
    })
    .catch(this.handleError);
  }
  getUser(id): Observable<User> {
    return this.authHttp
      .get(this.baseUrl + 'users/' + id)
      .map(response => <User>response.json())
      .catch(this.handleError);
  }
  updateUser(id: number, user: User) {
    return this.authHttp.put(this.baseUrl + 'users/' + id, user).catch(this.handleError);
  }


  deletePhoto(userId: number, id: number) {
    return this.authHttp.delete(this.baseUrl + 'users/' + userId + '/photos/' + id).catch(this.handleError);
  }
  sendLike(id: number, recipientId: number) {
    return this.authHttp.post(this.baseUrl + 'users/' + id + '/like/' + recipientId, {}).catch(this.handleError);
  }
  setMainPhoto(userId: number, id: number) {
    return this.authHttp.post(this.baseUrl + 'users/' + userId + '/photos/' + id + '/setMain', {}).catch(this.handleError);
  }

  // private jwt() {
  //   const token = localStorage.getItem('token');
  //   if (token) {
  //     const headers = new Headers({'Authorization': 'Bearer ' + token});
  //     headers.append('Content-Type', 'application/json');
  //     return new RequestOptions({headers: headers});
  //   }

  // }

  private handleError(error: any) {
    if (error.status === 400) {
      return Observable.throw(error._body);
    }
    const applicationError = error.headers.get('Application-Error');
    if (applicationError) {
      return Observable.throw(applicationError);
    }
    const serverError = error.json();
    let modelStateErrors = '';
    if (serverError) {
      for (const key in serverError) {
        if (serverError[key]) {
          modelStateErrors += serverError[key] + '\n';
        }
      }
    }
    return Observable.throw(modelStateErrors || 'Server Error');
  }
}
