export interface Schedule {
  dates: Date[];
}

interface Date {
  games: Game[];
}

interface Game {
  gamePk: string;
  status: {abstractGameCode: string};
  teams: {away: Team, home: Team};
}

interface Team {
  team: {name: string};
}
