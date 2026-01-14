const db = require("./db");

db.query("SELECT 1 + 1 AS result", (err, results) => {
  if (err) throw err;
  console.log(results);
});
