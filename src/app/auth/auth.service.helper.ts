import { from, Observable, of } from 'rxjs';

export interface Access_token {
  access_token: string,
  expires_in: number,
  id_token?: string,
  refresh_token: string,
  refresh_token_expires_in: number,
  resource?: string,
  scope?: string
  token_type: string
};

export class LoginServiceHelper {

  constructor(private adfsBaseUrl: string,
    private clientId: string,
    private timeSafetyDeduction: number = 10,
    private useCredentials: boolean = false) { }

  private setIDToken(token: string | undefined | null): void {
    if (token !== null && token !== undefined) {
      window.localStorage.setItem(`${this.clientId}_oidc_jwt_id_token`, token);
    }
    else {
      window.localStorage.setItem(`${this.clientId}_oidc_jwt_id_token`, "");
    }
  }

  private setAuthCode(token: string | undefined | null): void {
    if (token !== null && token !== undefined) {
      window.localStorage.setItem(`${this.clientId}_oidc_jwt_auth_code`, token);
    }
    else {
      window.localStorage.setItem(`${this.clientId}_oidc_jwt_auth_code`, "");
    }
  }

  private getTimestamp(): number {
    return Math.floor(Date.now() / 1000);
  }

  private setAccessToken(token: Access_token | undefined | null): void {
    if (token !== null && token !== undefined) {

      let localToken = <Access_token | string | null>window.localStorage.getItem(`${this.clientId}_oidc_jwt_access_token`);
      if (!localToken) {
        window.localStorage.setItem(`${this.clientId}_oidc_jwt_access_token`, JSON.stringify(token));
        localToken = token;
      }
      else {
        localToken = JSON.parse(<string>localToken);
        (<Access_token>localToken).access_token = token.access_token;
        (<Access_token>localToken).expires_in = token.expires_in;
        (<Access_token>localToken).token_type = token.token_type;
        (<Access_token>localToken).id_token = token.id_token;
        window.localStorage.setItem(`${this.clientId}_oidc_jwt_access_token`, JSON.stringify(localToken));
      }

      window.localStorage.setItem(`${this.clientId}_oidc_accessTokenExpiresIn`, (this.getTimestamp() + (<Access_token>localToken).expires_in - this.timeSafetyDeduction).toString());
      window.localStorage.setItem(`${this.clientId}_oidc_refreshTokenExpiresIn`, (this.getTimestamp() + (<Access_token>localToken).refresh_token_expires_in - this.timeSafetyDeduction).toString());
    }
    else {
      window.localStorage.setItem(`${this.clientId}_oidc_jwt_access_token`, "");
      window.localStorage.setItem(`${this.clientId}_oidc_accessTokenExpiresIn`, "");
      window.localStorage.setItem(`${this.clientId}_oidc_refreshTokenExpiresIn`, "");
    }
  }

  public hasIDToken(): boolean {
    let id_token = window.localStorage.getItem(`${this.clientId}_oidc_jwt_id_token`);
    return id_token !== "" && id_token !== null;
  }

  public getIDToken(): string | undefined {
    let id_token = window.localStorage.getItem(`${this.clientId}_oidc_jwt_id_token`);
    return id_token !== null && id_token !== "" ? id_token : undefined;
  }

  private getAccessToken(): string | undefined {
    let access_token = window.localStorage.getItem(`${this.clientId}_oidc_jwt_access_token`);

    if (access_token !== null && access_token !== "") {

      let oidc_accessTokenExpiresIn: string | null | number = window.localStorage.getItem(`${this.clientId}_oidc_accessTokenExpiresIn`);
      if (oidc_accessTokenExpiresIn !== null && oidc_accessTokenExpiresIn !== "") {
        oidc_accessTokenExpiresIn = parseInt(oidc_accessTokenExpiresIn, 10);
        if (oidc_accessTokenExpiresIn > this.getTimestamp()) {
          return (<Access_token>JSON.parse(access_token)).access_token;
        }
      }
    }

    return undefined;
  }

  private getRefreshToken(): string | undefined {
    let access_token = window.localStorage.getItem(`${this.clientId}_oidc_jwt_access_token`);

    if (access_token !== null && access_token !== "") {

      let oidc_refreshTokenExpiresIn: string | null | number = window.localStorage.getItem(`${this.clientId}_oidc_refreshTokenExpiresIn`);
      if (oidc_refreshTokenExpiresIn !== null && oidc_refreshTokenExpiresIn !== "") {
        oidc_refreshTokenExpiresIn = parseInt(oidc_refreshTokenExpiresIn, 10);
        if (oidc_refreshTokenExpiresIn > this.getTimestamp()) {
          return (<Access_token>JSON.parse(access_token)).refresh_token;
        }
      }
    }

    return undefined;
  }

  private getAuthCode(): string | undefined {
    let auth_code = window.localStorage.getItem(`${this.clientId}_oidc_jwt_auth_code`);
    return auth_code !== null && auth_code !== "" ? auth_code : undefined;
  }

  public checkLogin(): boolean {

    if (!this.hasIDToken() && location.hash) {
      this.parse();
      this.retrieveAccessToken().subscribe(
        {
          next: (data: Access_token) => {
            console.debug(data);
            this.setAccessToken(data);
          },
          error: (error: any) => {
            console.error(error);
          }
        });
    }

    return this.hasIDToken();
  }

  private parse() {

    let hash = location.hash.substring(1); //führendes # abschneiden
    let href = location.href.substring(location.href.lastIndexOf("/") + 1);
    if (hash == '' && href != '') {
      hash = href;
      if (hash.startsWith("?")) {
        hash = hash.substring(1);
      }
    }
    let params = hash.split("&");

    for (let param of params) {
      if (param.startsWith("code")) {
        let token = param.substring(param.indexOf("code=") + 5);
        console.debug("AUTH CODE: " + token);
        this.setAuthCode(token);
      }
      else
        if (param.startsWith("id_token")) {
          let token = param.substring(param.indexOf("id_token=") + 9);
          console.debug("ID TOKEN: " + token);
          this.setIDToken(token);
        }
    }
  }

  private retrieveAccessToken(): Observable<any> {

    let headers: { [key: string]: string } = {};
    headers["Content-Type"] = "application/x-www-form-urlencoded";

    const body = new URLSearchParams();
    body.set("grant_type", "authorization_code");
    body.set("code", encodeURIComponent(this.getAuthCode()!));
    body.set("client_id", this.clientId);
    body.set("redirect_uri", window.location.origin);

    return this.post(`${this.adfsBaseUrl}/oauth2/token`, body.toString(), headers);
  }

  public refreshAccessToken(force: boolean = false): Observable<any> {

    let localRefreshToken = this.getRefreshToken();

    if (!force) {
      let localAccessToken = this.getAccessToken();

      //undefined, wenn abgelaufen oder nicht vorhanden
      if (localAccessToken) {
        //der aktuelle access_token ist noch gültig
        //nimm den aktuellen, um Netzwerkressourcen zu sparen, refresh unnötig
        return of(localAccessToken);
      }
      else {
        //undefined, wenn kein refresh_token bzw access_token vorhanden oder abgelaufen
        if (!localRefreshToken) {
          //wenn abgelaufen muss ein neuer Login vollzogen werden, da der auth code auch abgelaufen sein wird (kurze Lebenszeit)
          this.logout();
          return of(undefined);
        }
      }
    }

    return from(new Promise((resolve, reject) => {
      let headers: { [key: string]: string } = {};
      headers["Content-Type"] = "application/x-www-form-urlencoded";

      const body = new URLSearchParams();
      body.set("grant_type", "refresh_token");
      body.set("refresh_token", localRefreshToken!);
      body.set("client_id", this.clientId);

      //access_token mit refresh_token neu beziehen... mittels refresh_token
      this.post(`${this.adfsBaseUrl}/oauth2/token`, body.toString(), headers)
        .subscribe({
          next: (data: any) => {
            this.setAccessToken(data);
            resolve(this.getAccessToken());
          },
          error: (error: any) => {
            console.error(error)
            reject(error)
          }
        });
    }));
  }

  private post(url: string, body: any, headers?: { [key: string]: string }): Observable<any> {
    return from(new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      if (this.useCredentials) {
        xhr.withCredentials = true;
      }
      xhr.open('POST', url);
      if (headers) {
        for (let key in headers) {
          xhr.setRequestHeader(key, headers[key]);
        }
      }
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            const responseData = JSON.parse(xhr.responseText);
            resolve(responseData);
          }
          else {
            reject(xhr.statusText);
          }
        }
      };
      xhr.onerror = function (err: any) {
        reject(err);
      }
      xhr.send(body);
    }));
  }

  public logout() {
    this.setAccessToken(null);
    this.setIDToken(null);
    this.setAuthCode(null);
    window.location.hash = '';

    let url = `${this.adfsBaseUrl}/ls/?wa=wsignout1.0&wtrealm=${window.location.origin}`;
    window.location.href = url;
  }

  public login() {

    const urlparams = new URLSearchParams();
    urlparams.set("response_type", "code id_token");
    urlparams.set("redirect_uri", window.location.origin);
    urlparams.set("scope", "openid profile email");
    urlparams.set("client_id", this.clientId);
    urlparams.set("nonce", "random-nonce");

    let url = `${this.adfsBaseUrl}/oauth2/authorize?${urlparams.toString()}`;
    window.location.href = url;
  }

}