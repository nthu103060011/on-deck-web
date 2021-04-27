export interface Live {
  gameData: {status: {abstractGameCode: string}};
  liveData: {boxscore: Boxscore};
}

interface Boxscore {
  teams: {away: Team, home: Team};
}

interface Team {
  players: {[key: string]: {person: {fullName: string}}};
}
