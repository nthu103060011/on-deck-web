import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Live } from '../live';
import { Schedule } from '../schedule';
import { PlayerSubscription } from '../player-subscription';

@Component({
  selector: 'app-player-select',
  templateUrl: './player-select.component.html',
  styleUrls: ['./player-select.component.scss']
})
export class PlayerSelectComponent implements OnInit {
  @Input() DEBUG_MODE = false;
  @Output() followClicked = new EventEmitter<PlayerSubscription>();
  liveGames: {gamePk: string; away: string; home: string}[] = [];
  selectedGame = '';
  awayPlayers: string[] = [];
  homePlayers: string[] = [];
  selectedPlayer = '';

  constructor(private readonly http: HttpClient) { }

  ngOnInit(): void { }

  fetchSchedule(date: string): void {
    const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}&fields=dates,games,status,abstractGameCode,gamePk,teams,away,home,team,name`;
    this.http.get<Schedule>(url).subscribe((schedule) => {
      let games = schedule.dates[0].games;
      if (!this.DEBUG_MODE) {
        games = games.filter(game => game.status.abstractGameCode === 'L');
      }

      this.liveGames = games.map(game => (
        { gamePk: game.gamePk.toString(), away: game.teams.away.team.name, home: game.teams.home.team.name }
      ));
      this.selectedGame = '';
      this.awayPlayers = [];
      this.homePlayers = [];
      this.selectedPlayer = '';
    });
  }

  fetchPlayers(gamePk: string): void {
    const url = `https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live?fields=liveData,boxscore,teams,away,home,players,person,fullName`;
    this.http.get<Live>(url).subscribe((live) => {
      this.selectedPlayer = '';
      this.awayPlayers = Object.values(live.liveData.boxscore.teams.away.players).map(player => player.person.fullName);
      this.homePlayers = Object.values(live.liveData.boxscore.teams.home.players).map(player => player.person.fullName);
    });
  }

  onFollowClick(): void {
    if (this.selectedGame && this.selectedPlayer) {
      this.followClicked.emit({
        gamePk: this.selectedGame,
        vs: this.getVS(this.selectedGame),
        player: this.selectedPlayer,
        tracking: true
      });
      this.selectedGame = '';
      this.selectedPlayer = '';
    }
  }

  private getVS(gamePk: string): string {
    const game = this.liveGames.find(g => g.gamePk === gamePk);
    return `${game?.away} vs. ${game?.home}`;
  }
}
