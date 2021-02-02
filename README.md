# Description

Ecommerce website I made with Angular, Node.js, Express and MongoDB. Site has two user types: regular and admin. Users can filter all products by keyword (regex search in database), by category and by price (from min to max) with slider. Users can put products in cart that opens as dropdown in header. They can order these products, after that they get comfirmation email from SMTP server with Nodemailer. Users can then see all their previous orders on "My profile" and also see order status (ordered, delivery sent, delivered). Admins have additional navigation bar where they can add another product or edit already created one. They can also see all orders from all users and change order status to inform clients about delivery. Last navigation bar for admin users is "Analytics" where they can see bar chart of income per day. 

# Ecommerce website

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.2.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
