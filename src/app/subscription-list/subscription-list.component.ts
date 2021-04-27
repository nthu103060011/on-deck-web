import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PlayerSubscription } from '../player-subscription';

@Component({
  selector: 'app-subscription-list',
  templateUrl: './subscription-list.component.html',
  styleUrls: ['./subscription-list.component.scss']
})
export class SubscriptionListComponent implements OnInit {
  @Output() playerFollowed = new EventEmitter<PlayerSubscription>();
  subscriptions: PlayerSubscription[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  followPlayer(subscription: PlayerSubscription): void {
    if (!this.subscriptions.find(sub => sub.gamePk === subscription.gamePk && sub.player === subscription.player)) {
      this.subscriptions = [...this.subscriptions, subscription];
      this.playerFollowed.emit(subscription);
    }
  }

  contFollowPlayer(subscription: PlayerSubscription): void {
    subscription.tracking = true;
    this.playerFollowed.emit(subscription);
  }

  untrackPlayer({gamePk, player}: {gamePk: string, player: string}): void {
    this.subscriptions.filter(subscription => subscription.gamePk === gamePk && (player === '*' || subscription.player === player))
      .forEach(subscription => subscription.tracking = false);
  }
}
