// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyB5M0bxNI8kj3enMyPAgaksUVXU8qrNa4M",
    authDomain: "classattendence-c4e10.firebaseapp.com",
    databaseURL: "https://classattendence-c4e10.firebaseio.com",
    projectId: "classattendence-c4e10",
    storageBucket: "classattendence-c4e10.appspot.com",
    messagingSenderId: "386280596287"
  }
};

/*
 * In development mode, for easier debugging, you can ignore zone related error
 * stack frames such as `zone.run`/`zoneDelegate.invokeTask` by importing the
 * below file. Don't forget to comment it out in production mode
 * because it will have a performance impact when errors are thrown
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.