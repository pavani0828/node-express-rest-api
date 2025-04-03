//Importing Js Modules
const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'cricketMatchDetails.db')
let db = null

const dbAndServerInitialize = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(e.message)
  }
}

dbAndServerInitialize()

//Get All Players
app.get('/players/', async (request, response) => {
  const getAllPlayersQuery = `
    SELECT player_id AS playerId,player_name AS playerName
    FROM player_details;`
  const playerDetails = await db.all(getAllPlayersQuery)
  response.send(playerDetails)
})

//Get Specific Player Details
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerDetailsQuery = `
    SELECT player_id AS playerId,player_name AS playerName
    FROM player_details
    WHERE playerId=${playerId};`
  const player = await db.get(getPlayerDetailsQuery)
  response.send(player)
})

//Update Details of Specific Player
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body
  const updatePlayerDetailsQuery = `
    UPDATE player_details
    SET player_name = '${playerName}'
    WHERE player_id = ${playerId};`
  await db.run(updatePlayerDetailsQuery)
  response.send('Player Details Updated')
})

//Get Match Details of Specific Match
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getMatchDetailsQuery = `
    SELECT match_id AS matchId,match,year
    FROM match_details
    WHERE matchId=${matchId};`
  const matchDetails = await db.get(getMatchDetailsQuery)
  response.send(matchDetails)
})

//Get Match Details of Specific Player
app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const getPlayerMatchDetailsQuery = `
    SELECT match_details.match_id AS matchId,match_details.match,match_details.year
    FROM match_details 
    NATURAL JOIN player_match_score
    WHERE player_match_score.player_id=${playerId};`
  const playerMatchDetails = await db.all(getPlayerMatchDetailsQuery)
  response.send(playerMatchDetails)
})

//Get List of All Players of Specific Match
app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getPlayersOfSpecificMatchQuery = `
    SELECT player_details.player_id AS playerId,player_details.player_name AS playerName
    FROM player_match_score
    NATURAL JOIN player_details 
    WHERE match_id=${matchId};`
  const playersArray = await db.all(getPlayersOfSpecificMatchQuery)
  response.send(playersArray)
})

//Return Stats
app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const getStatsQuery = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};`
  const plaerScored = await db.get(getStatsQuery)
  response.send(plaerScored)
})

//Exporting App Module
module.exports = app
