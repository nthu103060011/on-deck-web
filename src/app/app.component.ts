import { environment } from './../environments/environment.prod';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SubscriptionListComponent } from './subscription-list/subscription-list.component';
import { PlayerSubscription } from './player-subscription';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild(SubscriptionListComponent) private subscriptionListComponent?: SubscriptionListComponent;
  DEBUG_MODE = false;
  interval = 20;
  showSubFailAlert = false;
  showServerErrorAlert = false;
  showHelpModal = false;
  private pushSubscription?: PushSubscription;

  constructor(
      private readonly http: HttpClient,
      private readonly swPush: SwPush) {
    // Not triggered if the page is hard (force) reloaded. Need to normal reload again.
    // See: https://github.com/angular/angular/issues/29067#issuecomment-469062835
    this.swPush.messages.subscribe(payload => {
      console.log('get push notification', payload);
      this.notificationReceived((payload as {notification: {data: {gamePk: string, player: string}}}).notification.data);
    });
  }

  ngOnInit(): void {
    this.subscribePushNotifications();
  }

  subscribePlayer(subscription: PlayerSubscription): void {
    console.log('POST to /subscription', subscription);
    this.http.post(
      environment.SERVER_URL + '/subscription',
      {pushSubscription: this.pushSubscription, playerSubscription: subscription},
      {observe: 'response', responseType: 'text'})
      .pipe(catchError((err: HttpErrorResponse) => {
        subscription.tracking = false;
        this.showServerErrorAlert = true;
        console.error(err);
        return throwError(`Subscribe to player ${subscription.player} failed. Please contact the site developer.`);
      }))
      .subscribe(value => {});
  }

  private notificationReceived(notificationData: {gamePk: string, player: string}): void {
    this.subscriptionListComponent?.untrackPlayer(notificationData);
  }

  private subscribePushNotifications(): void {
    navigator.serviceWorker.ready
    .then(registration => {
      registration.pushManager.getSubscription()
        .then(subscription => {
          if (subscription) {
            console.log('Already subscribed', subscription.endpoint);
            this.pushSubscription = subscription;
          } else {
            // Request permission to send notifications
            this.swPush.requestSubscription({serverPublicKey: environment.SERVER_PUBLIC_KEY})
              .then(sub => {
                console.log('Successfully subscribed', sub.endpoint);
                this.pushSubscription = sub;
              })
              .catch(err => {
                console.error(err);
                this.showSubFailAlert = true;
                console.error('Could not subscribe to notifications. Please allow notifications and reload page.');
              });
          }
        }).catch(err => console.error('Cannot get subscriptions from push manager.'));
    }).catch(err => console.error('Service worker not ready.'));
  }
}
