//Importing Js Modules
const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
module.exports = app

app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')
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

//Get All Movie Names
app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name as movieName
    FROM movie`
  const movieNamesArray = await db.all(getMoviesQuery)
  response.send(movieNamesArray)
})

//Post Movie
app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMovieQuery = `
  INSERT INTO
    movie (director_id,movie_name,lead_actor)
  VALUES
    (${directorId}, '${movieName}', '${leadActor}');`
  const movie = await db.run(postMovieQuery)
  response.send('Movie Successfully Added')
})

//get Movie With MovieId
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
    SELECT movie_id as movieId,director_id as directorId,movie_name as movieName,lead_Actor as leadActor
    FROM movie
    WHERE
    movieId=${movieId}`
  const movie = await db.get(getMovieQuery)
  response.send(movie)
})

//Update Movie
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const updatemovieQuery = `
  UPDATE 
  movie
  SET 
  director_id=${directorId},
  movie_name='${movieName}',
  lead_actor='${leadActor}'
  WHERE
  movie_id=${movieId}`
  const updatemovie = await db.run(updatemovieQuery)
  response.send('Movie Details Updated')
})

//Delete Movie
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
    DELETE FROM 
    movie
    WHERE
    movie_id=${movieId}`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//Get All Director Names
app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
    SELECT director_id as directorId,director_name as directorName
    FROM director`
  const directorNamesArray = await db.all(getDirectorsQuery)
  response.send(directorNamesArray)
})

//Get Movies Directed by Specific Director
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const moviesQuery = `
  SELECT movie_name as movieName
  FROM movie
  WHERE director_id=${directorId}`
  const moviesArray = await db.all(moviesQuery)
  response.send(moviesArray)
})
