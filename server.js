const express = require('express');
const app = express();

app.use(express.static('./dist/on-deck-web'));

app.get('/', (req, res) => {
  res.sendFile('index.html', {root: 'dist/on-deck-web/'});
});

app.listen(process.env.PORT || 8080);
