//Importing Js Modules
const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
module.exports = app

app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000)
  } catch (e) {
    console.log(e.message)
  }
}

initializeDBAndServer()

//Get All Players
app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
    SELECT player_id as playerId,player_name as playerName,jersey_number as jerseyNumber,role
    FROM cricket_team
    ORDER BY player_id`
  const playersArray = await db.all(getPlayersQuery)
  response.send(playersArray)
})

//Post Player
app.post('/players/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const postPlayerQuery = `
  INSERT INTO
    cricket_team (player_name, jersey_number, role)
  VALUES
    ('${playerName}', ${jerseyNumber}, '${role}');`
  const player = await db.run(postPlayerQuery)
  response.send('Player Added to Team')
})

//Get Player With PlayerId
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayersQuery = `
    SELECT player_id as playerId,player_name as playerName,jersey_number as jerseyNumber,role
    FROM cricket_team
    WHERE
    playerId=${playerId}`
  const player = await db.get(getPlayersQuery)
  response.send(player)
})

//Update Player
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playersDetails = request.body
  const {playerName, jerseyNumber, role} = playersDetails
  const updatePlayerQuery = `
  UPDATE 
  cricket_team
  SET 
  player_name='${playerName}',
  jersey_number=${jerseyNumber},
  role='${role}'
  WHERE
  player_id=${playerId}`
  const updateplayer = await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//Delete Player
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayersQuery = `
    DELETE FROM 
    cricket_team
    WHERE
    player_id=${playerId}`
  await db.run(deletePlayersQuery)
  response.send('Player Removed')
})
