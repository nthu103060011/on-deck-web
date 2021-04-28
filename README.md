# On Deck
A web app that pushes a notification when your favorite baseball player is on deck.

## For Users
Go to https://on-deck-web.herokuapp.com/ and follow your favorite players as the game begins!

### Notify Events
You would receive a push notification when the followed player is
* Pitching
* Batting
* On deck

### Supported Browsers
This service highly relies on a web technology called [Web Push](https://developer.mozilla.org/en-US/docs/Web/API/Push_API), which hasn't been supported by all common browsers.
According to [this compatibility table](https://developer.mozilla.org/en-US/docs/Web/API/Push_API#browser_compatibility), this service might currently support
* PC (Windows, macOS, and Linux)
  * Chrome, Edge, Firefox, and Opera
* Android
  * Chrome, Firefox, and Opera
* iOS
  * 😿

## For Developers

### Setup
0. Assume you already have `git`, `nodejs`, and `npm` installed.

1. Clone and install packages.
    ```
    $ git clone https://github.com/nthu103060011/on-deck-web.git
    $ cd on-deck-web
    $ npm install
    ```

2. Set environment variables.
    * VAPID key pair for web push.
        ```
        $ npx web-push generate-vapid-keys
        # public key and private key are printed here
        $ export VAPID_PUBLIC_KEY="paste_the_public_key_here"
        $ export VAPID_PRIVATE_KEY="paste_the_private_key_here"
        ```
        Open `on-deck-web/src/environments/environment.prod.ts` in editor and replace the value of `SERVER_PUBLIC_KEY` with the public key you just generated.
    * Server URL.  
        Open `on-deck-web/src/environments/environment.prod.ts` in editor and replace the value of  `SERVER_URL` with `http://localhost:8080`.

3. Build and run.
    ```
    $ npm run build
    $ npm run start
    ```

4. Open the browser and navigate to `http://localhost:8080`.

### References
* [Angular](https://angular.io/docs)
* [NG-ZORRO](https://ng.ant.design/docs/introduce/en)
* [Service Worker](https://angular.io/guide/service-worker-intro)
* [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
* [Push Subscription](https://serviceworke.rs/push-subscription-management_index_doc.html)
* [Angular Push Notifications: a Complete Step-by-Step Guide](https://blog.angular-university.io/angular-push-notifications/)
* [MLB API Endpoint](http://statsapi.mlb.com/api/v1/schedule?sportId=1)
* [MLB API Simple Usage](https://www.reddit.com/r/Sabermetrics/comments/a6i15y/mlb_statsapi_account/ee10koq?utm_source=share&utm_medium=web2x&context=3)
