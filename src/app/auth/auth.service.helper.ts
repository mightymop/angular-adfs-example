export interface Token_Repo {
  access_token?: string,
  expires_in?: number,
  id_token?: string,
  refresh_token?: string,
  refresh_token_expires_in?: number,
  resource?: string,
  scope?: string
  token_type?: string
};

export class LoginServiceHelper {

  constructor(private adfsBaseUrl: string,
    private clientId: string,
    private timeSafetyDeduction: number = 10,
    private useCredentials: boolean = false) { }

  private setTokenRepo(repo: Token_Repo | undefined): void {
    if (repo !== undefined) {
      window.localStorage.setItem(`${this.clientId}_oidc_token_repo`, JSON.stringify(repo));
    }
    else {
      window.localStorage.setItem(`${this.clientId}_oidc_token_repo`, "");
    }
  }

  private getTokenRepo(): Token_Repo | undefined {

    let repo = window.localStorage.getItem(`${this.clientId}_oidc_token_repo`);
    if (repo !== "" && repo !== null && repo !== undefined) {
      return <Token_Repo>JSON.parse(repo);
    }

    return undefined;

  }

  private setIDToken(token: string | undefined): void {
    let repo = this.getTokenRepo();
    if (!repo) {
      repo = {
        id_token: token
      };
    }
    else {
      repo.id_token = token;
    }

    this.setTokenRepo(repo);
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

  private setAccessToken(token: Token_Repo): void {
    let repo = this.getTokenRepo();
    if (!repo) {
      repo = {
        access_token: token.access_token,
        expires_in: token.expires_in,
        id_token: token.id_token,
        refresh_token: token.refresh_token,
        refresh_token_expires_in: token.refresh_token_expires_in,
        resource: token.resource,
        scope: token.scope,
        token_type: token.token_type
      };
    }
    else {
      repo.access_token = token ? token.access_token : repo.access_token;
      repo.expires_in = token ? token.expires_in : repo.expires_in;
      repo.id_token = token ? token.id_token : repo.id_token;
      repo.refresh_token = token ? token.refresh_token : repo.refresh_token;
      repo.refresh_token_expires_in = token ? token.refresh_token_expires_in : repo.refresh_token_expires_in;
      repo.resource = token ? token.resource : repo.resource;
      repo.scope = token ? token.scope : repo.scope;
      repo.token_type = token ? token.token_type : repo.token_type;
    }

    window.localStorage.setItem(`${this.clientId}_oidc_accessTokenExpiresIn`, (this.getTimestamp() + repo.expires_in! - this.timeSafetyDeduction).toString());
    window.localStorage.setItem(`${this.clientId}_oidc_refreshTokenExpiresIn`, (this.getTimestamp() + repo.refresh_token_expires_in! - this.timeSafetyDeduction).toString());

    this.setTokenRepo(repo);
  }

  public hasIDToken(): boolean {
    let repo = this.getTokenRepo();
    if (repo) {
      return repo.id_token ? true : false;
    }
    return false;
  }

  public getIDToken(): string | undefined {
    let repo = this.getTokenRepo();
    if (repo) {
      return repo.id_token;
    }
    return undefined;
  }

  private getAccessToken(): string | undefined {
    let access_token = undefined;
    let repo = this.getTokenRepo();
    if (repo) {
      access_token = repo.access_token;
    }

    if (access_token) {

      let oidc_accessTokenExpiresIn: string | null | number = window.localStorage.getItem(`${this.clientId}_oidc_accessTokenExpiresIn`);
      if (oidc_accessTokenExpiresIn !== null && oidc_accessTokenExpiresIn !== "") {
        oidc_accessTokenExpiresIn = parseInt(oidc_accessTokenExpiresIn, 10);
        if (oidc_accessTokenExpiresIn > this.getTimestamp()) {
          return access_token;
        }
      }
    }

    return undefined;
  }

  private getRefreshToken(): string | undefined {
    let refresh_token = undefined;
    let repo = this.getTokenRepo();
    if (repo) {
      refresh_token = repo.refresh_token;
    }

    if (refresh_token) {
      let oidc_refreshTokenExpiresIn: string | null | number = window.localStorage.getItem(`${this.clientId}_oidc_refreshTokenExpiresIn`);
      if (oidc_refreshTokenExpiresIn !== null && oidc_refreshTokenExpiresIn !== "") {
        oidc_refreshTokenExpiresIn = parseInt(oidc_refreshTokenExpiresIn, 10);
        if (oidc_refreshTokenExpiresIn > this.getTimestamp()) {
          return refresh_token;
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
      this.retrieveAccessToken()
      .then((data: Token_Repo) => {
            console.debug(data);
            this.setAccessToken(data);
      })
      .catch((error: any) => {
            console.error(error);
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

  private retrieveAccessToken(): Promise<any> {

    let headers: { [key: string]: string } = {};
    headers["Content-Type"] = "application/x-www-form-urlencoded";

    const body = new URLSearchParams();
    body.set("grant_type", "authorization_code");
    body.set("code", encodeURIComponent(this.getAuthCode()!));
    body.set("client_id", this.clientId);
    body.set("redirect_uri", window.location.origin);

    return this.post(`${this.adfsBaseUrl}/oauth2/token`, body.toString(), headers);
  }

  public refreshAccessToken(force: boolean = false): Promise<string|undefined> {

    let localRefreshToken = this.getRefreshToken();

    if (!force) {
      let localAccessToken = this.getAccessToken();

      //undefined, wenn abgelaufen oder nicht vorhanden
      if (localAccessToken) {
        //der aktuelle access_token ist noch gültig
        //nimm den aktuellen, um Netzwerkressourcen zu sparen, refresh unnötig
        return new Promise((resolve)=>{resolve(localAccessToken)}); 
      }
      else {
        //undefined, wenn kein refresh_token bzw access_token vorhanden oder abgelaufen
        if (!localRefreshToken) {
          //wenn abgelaufen muss ein neuer Login vollzogen werden, da der auth code auch abgelaufen sein wird (kurze Lebenszeit)
          this.logout();
          return new Promise((resolve)=>{resolve(undefined)});
        }
      }
    }

    return new Promise((resolve, reject) => {
      let headers: { [key: string]: string } = {};
      headers["Content-Type"] = "application/x-www-form-urlencoded";

      const body = new URLSearchParams();
      body.set("grant_type", "refresh_token");
      body.set("refresh_token", localRefreshToken!);
      body.set("client_id", this.clientId);

      //access_token mit refresh_token neu beziehen... mittels refresh_token
      this.post(`${this.adfsBaseUrl}/oauth2/token`, body.toString(), headers)
        .then((data: any) => {
            this.setAccessToken(data);
            resolve(this.getAccessToken());
          })
        .catch((error: any) => {
            console.error(error)
            reject(error)
          }
        );
    });
  }

  private post(url: string, body: any, headers?: { [key: string]: string }): Promise<any> {
    return new Promise((resolve, reject) => {
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
    });
  }

  public logout() {
    this.setTokenRepo(undefined);
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