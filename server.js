const express = require('express');
const webpush = require('web-push');
const fetch = require('node-fetch');
const app = express();
const allSubscriptions = {};

function subscribePlayer(user_sub, gamePk, player) {
  if (!allSubscriptions.hasOwnProperty(gamePk)) {
    allSubscriptions[gamePk] = {};
  }
  if (!allSubscriptions[gamePk].hasOwnProperty(player)) {
    allSubscriptions[gamePk][player] = [];
  }
  allSubscriptions[gamePk][player].push(user_sub);
  console.debug('allSubscriptions =', JSON.stringify(allSubscriptions));
}

async function fetchLive() {
  removeQueue = []; // (gamePk, player, user)
  removeGameQueue = [];

  for (const [gamePk, players] of Object.entries(allSubscriptions)) {
    console.debug('fetching from statsapi.mlb.com for game', gamePk);
    const url = `https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live?fields=gameData,status,abstractGameCode,teams,away,home,name,liveData,linescore,offense,defense,pitcher,batter,onDeck,fullName`;
    const data = await fetch(url).then(res => res.json());
    if (data.gameData.status.abstractGameCode != 'L') {
      console.debug('Game over', gamePk);
      Object.values(players).reduce((acc, val) => acc.concat(val), []).forEach(user_sub => {
        console.debug('send notification to', user_sub.endpoint);
        webpush.sendNotification(
          user_sub,
          JSON.stringify({
            "notification": {
              "title": `${data.gameData.teams.away.name} vs. ${data.gameData.teams.home.name}`,
              "body": "Game over",
              "data": {gamePk: gamePk, player: '*'},
              "timestamp": Date.now()
            }
          }))
        .then(() => console.debug('send notification success'))
        .catch(err => console.error(err));

        removeGameQueue.push(gamePk);
      });
    } else {
      const playing = data.liveData.linescore;
      console.debug('playing =', JSON.stringify(playing));
      Object.entries(players).forEach(([player, users]) => {
        switch (player) {
          case playing.defense.pitcher.fullName:
            message = `${playing.defense.pitcher.fullName} is pitching`;
            break;
          case playing.offense.batter.fullName:
            message = `${playing.offense.batter.fullName} is batting`
            break;
          case playing.offense.onDeck.fullName:
            message = `${playing.offense.onDeck.fullName} is on deck`;
            break;
          default:
            message = '';
            break;
        }
        if (message) {
          users.forEach(user_sub => {
            console.debug('send notification to', user_sub.endpoint);
            webpush.sendNotification(
              user_sub,
              JSON.stringify({
                "notification": {
                  "title": `${data.gameData.teams.away.name} vs. ${data.gameData.teams.home.name}`,
                  "body": message,
                  "data": {gamePk: gamePk, player: player},
                  "timestamp": Date.now()
                }
              }))
            .then(() => console.debug('send notification success'))
            .catch(err => console.error(err));
          });
          removeQueue.push({gamePk: gamePk, player: player});
        }
      });
    }
  };

  if (removeGameQueue.length > 0) console.debug('removeGameQueue =', removeGameQueue);
  removeGameQueue.forEach(gamePk => delete allSubscriptions[gamePk]);

  if (removeQueue.length > 0) console.debug('removeQueue =', removeQueue);
  removeQueue.forEach(({gamePk, player}) => {
    delete allSubscriptions[gamePk][player];
    if (Object.keys(allSubscriptions[gamePk]).length == 0)
      delete allSubscriptions[gamePk];
  });

  if (removeGameQueue.length + removeQueue.length > 0)
    console.debug('After deleting already notified subscribers, allSubscriptions =', JSON.stringify(allSubscriptions));
  console.log('===');
}

webpush.setVapidDetails('https://on-deck-web.herokuapp.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY);

var refreshInterval = setInterval(fetchLive, (process.env.REFRESH_INTERVAL || 20) * 1000);
setInterval(async () => {
  const hour = new Date().getUTCHours() + 1;
  if (Object.keys(allSubscriptions).length > 0 && (hour < 9 || hour > 16)) {
    const url = `https://on-deck-web.herokuapp.com/stayawake`;
    await fetch(url);
  }
}, 20 * 60 * 1000);

app.use(express.static('./dist/on-deck-web'));
app.use(express.json());

app.get('/', function(req, res) {
  res.sendFile('index.html', {root: 'dist/on-deck-web/'});
});

app.post('/subscription', function(req, res) {
  console.log(req.body.pushSubscription.endpoint);
  console.log(req.body.playerSubscription.gamePk, req.body.playerSubscription.player);

  subscribePlayer(
    req.body.pushSubscription,
    req.body.playerSubscription.gamePk,
    req.body.playerSubscription.player);
  console.log('===')

  res.sendStatus(201);
});

app.get('/changeinterval/:itv', function(req, res) {
  clearInterval(refreshInterval);
  refreshInterval = setInterval(fetchLive, (req.params.itv || 20) * 1000);
  res.sendStatus(200);
});

app.get('/stayawake', function(req, res) {
  res.sendStatus(200);
});

app.get('/clearsub', function(req, res) {
  allSubscriptions = {};
});

app.listen(process.env.PORT || 8080);
