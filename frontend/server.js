const express = require('express');
const app = express();
const port = 4000;

app.use('/public', express.static('public'));


app.listen(port, () => {
  console.log(`Frontend app listening on port ${port}`);
});