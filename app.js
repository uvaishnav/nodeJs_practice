const express = require("express");

const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("app is listening at port 3000");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// API 1

const convertDbResponseToServerResponse1 = (dbObj) => {
  return {
    playerId: dbObj.player_id,
    playerName: dbObj.player_name,
  };
};

app.get(`/players/`, async (request, response) => {
  const getPlayerQuery = `
    select * from player_details;`;

  const playersList = await db.all(getPlayerQuery);
  const responsePlayerList = playersList.map((eachPlayer) => {
    return convertDbResponseToServerResponse1(eachPlayer);
  });
  response.send(responsePlayerList);
});

// API 2

app.get(`/players/:playerId/`, async (request, response) => {
  const { playerId } = request.params;

  const getPlayerRequired = `
    select * from player_details where player_id = ${playerId};`;

  const requiredPlayer = await db.get(getPlayerRequired);
  response.send(convertDbResponseToServerResponse1(requiredPlayer));
});

app.use(express.json());

// API 3

app.put(`/players/:playerId/`, async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const updatePlayerDetails = `
    update player_details set
    player_name = '${playerName}'
    where player_id = ${playerId};`;

  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

// API 4

const convertDbResponseToServerResponse2 = (dbObj) => {
  return {
    matchId: dbObj.match_id,
    match: dbObj.match,
    year: dbObj.year,
  };
};

app.get(`/matches/:matchId/`, async (request, response) => {
  const { matchId } = request.params;

  const getRequiredMatch = `
    select * from match_details where match_id = ${matchId};`;

  const dbResponse = await db.get(getRequiredMatch);
  response.send(convertDbResponseToServerResponse2(dbResponse));
});

// API 5

const convertDbResponseToServerResponse3 = (dbObj) => {
  return {
    matchId: dbObj.match_id,
    match: dbObj.match,
    year: dbObj.year,
  };
};

app.get(`/players/:playerId/matches`, async (request, response) => {
  const { playerId } = request.params;

  const getMatchesByPlayerQuery = `
  select *
  from match_details join player_match_score  on 
  match_details.match_id = player_match_score.match_id
  where player_match_score.player_id = ${playerId};`;

  const playerMatches = await db.all(getMatchesByPlayerQuery);
  const matchDetailsResponse = playerMatches.map((eachMatch) => {
    return convertDbResponseToServerResponse3(eachMatch);
  });
  response.send(matchDetailsResponse);
});

// API 6

app.get(`/matches/:matchId/players`, async (request, response) => {
  const { matchId } = request.params;

  const getPlayerByMatchQuery = `
  select *
  from player_details join player_match_score  on 
  player_details.player_id = player_match_score.player_id
  where player_match_score.match_id = ${matchId};`;

  const matchPlayers = await db.all(getPlayerByMatchQuery);
  const playerDetailsResponse = matchPlayers.map((eachPlayer) => {
    return convertDbResponseToServerResponse1(eachPlayer);
  });
  response.send(playerDetailsResponse);
});

// API 7

app.get(`/players/:playerId/playerScores`, async (request, response) => {
  const { playerId } = request.params;

  const getPlayerStaticsQuery = `
    select player_details.player_id as playerId,
    player_name as playerName,
    sum(score) as totalScore,
    sum(fours) as totalFours,
    sum(sixes) as totalSixes
    from player_details join 
    player_match_score on player_details.player_id = player_match_score.player_id
    where player_details.player_id = ${playerId};`;

  const playerStats = await db.get(getPlayerStaticsQuery);
  response.send(playerStats);

  //   console.log(getPlayerStaticsQuery);
});

module.exports = app;
