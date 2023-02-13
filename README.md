# AngularAdfsExample

- `npm i`

## Start

Nach Click auf Anmelden wird eine Weiterleitung aufs ADFS vollzogen.

Nach der Eingabe der `poldom.local` Logindaten:
`2422...@poldom.local` und dem Kennwort erfolgt ein Login.

Swagger: `https://dc2019.poldom.local/test_service/swagger/index.html`

*OPEN ID CONNECT LOGIN:*
In Swagger muss dann bei `Authorize` dann ein Haken bei `openid` gesetzt werden.

*ANMELDUNG MIT VORHANDENEM TOKEN:*
Bearer TOKEN

Man ist angemeldet und kommt auf die "Home"-Page.

Der Anmeldebutton wird zum Abmeldebutton.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.1.2.

Info: Bei der Anmeldung speichert die Webseite den ID_TOKEN sowie den Authorization Code und REFRESH_TOKEN.
Mit den beiden letzteren kann man später einen ACCESS_TOKEN vom ADFS anfordern.
Dieser ACCESS_TOKEN ist in der Regel kurzlebig. Er wird gebraucht für die Anfrage an einem Backend.
Vor der Backendanfrage wird also ein ACCESS_TOKEN erfragt und dann mit diesem die Anfrage ans Backend gestellt.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
