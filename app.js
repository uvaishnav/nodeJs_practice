const express = require("express");

const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const InitializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server listening at port 3000");
    });
  } catch (e) {
    console.log(`DB ERROR : ${e}`);
    process.exit(1);
  }
};

InitializeDbAndServer();

const convertDbObjectoResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get(`/players/`, async (request, response) => {
  const getPlayerQuery = `
    select
    *
    from
    cricket_team
    order by 
    player_id;`;
  const playerArray = await db.all(getPlayerQuery);
  let responseArray = playerArray.map((dbObject) => {
    return convertDbObjectoResponseObject(dbObject);
  });
  response.send(responseArray);
});

app.use(express.json());

app.post(`/players/`, async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const postPlayerQuery = `
    insert 
    into cricket_team(player_name,jersey_number,role)
    values(
        '${playerName}',
        ${jerseyNumber},
        '${role}'
    );
    `;
  await db.run(postPlayerQuery);
  response.send("Player Added to Team");
});

app.get(`/players/:playerId/`, async (request, response) => {
  const { playerId } = request.params;

  const getPlayerReqQuery = `
    select * from cricket_team where player_id = ${playerId};`;
  const player = await db.get(getPlayerReqQuery);
  response.send(convertDbObjectoResponseObject(player));
});

app.put(`/players/:playerId/`, async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const putplayerQuery = `
    update cricket_team 
    set 
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
    where player_id = ${playerId};`;

  await db.run(putplayerQuery);
  response.send("Player Details Updated");
});

app.delete(`/players/:playerId/`, async (request, response) => {
  const { playerId } = request.params;

  const deletePlayerQuery = `
    delete from cricket_team where player_id = ${playerId};`;

  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
