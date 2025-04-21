const cors = require('cors');
const sql = require("mysql");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

//init express app
const app = express();
app.use(cors());
app.use(express.json());

//create connection
const con = sql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123',
  database: 'yugen_db'
});
con.connect(function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to MySQL database");
  }
});

// create films&thumbnail folders (probably not necessary but whatever)
if (!fs.existsSync('uploads/films')) {
  fs.mkdirSync('uploads/films', { recursive: true });
}
if (!fs.existsSync('uploads/thumbnails')) {
  fs.mkdirSync('uploads/thumbnails', { recursive: true });
}

// check last id ()
function getMaxID() {
  return new Promise((resolve, reject) => {
    const IdQuery = 'SELECT MAX(film_id) AS max_id FROM films;';
    con.query(IdQuery, (err, result) => {
      if (err) {
        console.log("MaxID not found");
        return resolve(null);
      } else {
        const MaxID = result[0].max_id || 0;
        resolve(MaxID + 1);
      }
    });
  });
}

// temp storage on local disk
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'File') {
      cb(null, 'uploads/films/');
    } else if (file.fieldname === 'Thumbnail') {
      cb(null, 'uploads/thumbnails/');
    }
  },
  filename: async function (req, file, cb) {
    const MaxID = await getMaxID();
    if (MaxID === null) {
      return cb(new Error("Failed to retrieve MaxID"));
    }
    const extension = path.extname(file.originalname);
    if (file.fieldname === 'File') {
      cb(null, MaxID + extension); // Save video as 'film_id.mp4'
    } else if (file.fieldname === 'Thumbnail') {
      cb(null, MaxID + '.jpg'); // Save thumbnail as 'film_id.jpg'
    }
  }
});

// multer exe upload
const upload = multer({ storage: storage });

// req handle
app.post('/upload-film', upload.fields([{ name: 'File' }, { name: 'Thumbnail' }]), async (req, res) => {
  console.log("Received POST request");

  const { Title, Description, Genres } = req.body;
  const FilmPath = req.files.File[0].path;
  const ThumbnailPath = req.files.Thumbnail[0].path;
  const time = new Date();
  const date = time.toISOString().split('T')[0];

  if (!Title || !Description || !Genres || !FilmPath || !ThumbnailPath) {
    console.log("Missing required fields.");
    return res.status(400).send("All fields including files are required.");
  }

  try {
    ffmpeg.ffprobe(FilmPath, (err, metadata) => {
      if (err) {
        console.error("Error reading video metadata:", err);
        return res.status(500).send("Failed to read video duration.");
      }
      const videoDuration = metadata.format.duration.toFixed(1); // rounded to 1 decimal
      console.log("Video Duration:", videoDuration);
      console.log("Request body:", { Title, Description, Genres, FilmPath, ThumbnailPath, videoDuration });

      const sqlQuery = `
        INSERT INTO films (film_title, description, film_genre, film_path, thumbnail_path, film_duration, release_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      con.query(sqlQuery, [
        Title,
        Description,
        JSON.stringify(Genres),
        FilmPath,
        ThumbnailPath,
        videoDuration,
        date
      ], (err, result) => {
        if (err) {
          console.error("MySQL Query Error:", err);
          return res.status(500).send("Database error: " + err.message);
        }
        console.log("MySQL Insert Success:", result);
        res.status(200).send("Film uploaded successfully!");
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
