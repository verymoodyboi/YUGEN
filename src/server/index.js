const cors = require('cors');   
const sql = require("mysql");
const express = require("express");
const app = express();
app.use(cors());
app.use(express.json());
const con = sql.createConnection({
    host:'localhost',
    user:'root',
    password:'123',
    database:'yugen_db'
})
con.connect(function(err)
{
    if(err)
    {
        console.log(err);
    }
    else{
        console.log("connected");
     
    }

})
app.post('/upload-film', (req, res) => {
    console.log("Received POST request to /upload-film");
  
    const { Title, Description, Genres, FilmPath, ThumbnailPath } = req.body;
  
    console.log("Request body:", { Title, Description, Genres, FilmPath, ThumbnailPath });
  
    // Check if all required fields are present
    if (!Title || !Description || !Genres || !FilmPath || !ThumbnailPath) {
      console.log("Missing required fields.");
      return res.status(400).send("All fields including paths are required.");
    }
  
    const sqlQuery = `
      INSERT INTO films (film_title, description, film_genre, film_path, thumbnail_path)
      VALUES (?, ?, ?, ?, ?)
    `;
    console.log("SQL Query:", sqlQuery);
    console.log("SQL Values:", [
      Title,
      Description,
      JSON.stringify(Genres), // Convert genres array to a JSON string
      FilmPath,
      ThumbnailPath
    ]);
  
    con.query(sqlQuery, [
      Title,
      Description,
      JSON.stringify(Genres), // Genres as a JSON string
      FilmPath,
      ThumbnailPath
    ], (err, result) => {
      if (err) {
        console.error("MySQL Query Error:", err);
        return res.status(500).send("Database error: " + err.message);
      }
      console.log("Query successful. Inserted film:", result);
      res.send("Film data saved successfully!");
    });
  });

app.listen(3001, () => console.log("Server running on port 3001"));
