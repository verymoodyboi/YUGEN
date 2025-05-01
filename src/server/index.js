//**************** imports
//general imports
const cors = require('cors');// for cross origin resource sharing
const sql = require("mysql");// to run sql database queries
const express = require("express");// for routing uploads  
//filmUpload imports
const multer = require("multer");// handle file uploads (film-file/thumbnail-file)
const path = require("path"); //  for file manipulation (naming files before daving to server)
const fs = require('fs'); //stands for "file system" I think. for creating (uploads/films) & (uploads/thumbnails) folders
const ffmpeg = require('fluent-ffmpeg'); // sick library for handling video files (literaly crazy features) used it to get video duration
const bcrypt = require('bcrypt')
////////////////////////////imports done
//**********************init express app
const app = express();
app.use(cors());
app.use(express.json());
/////////////////////////init done
//***********************create connection
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
///////////////////////////////connection done
//**************************** http://localhost:3001/Register
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads/pfp/'); 
  
  },
  filename: async function (req, file, cb) {
    const MaxID = await getMaxuserID(); // we await getMaxID()    
      cb(null, MaxID + '.jpg'); // Save thumbnail as 'film_id.jpg'
    
  }
});
const upload= multer({storage:storage});
app.post('/Register', upload.fields([
  { name: 'PFP', maxCount: 1 }
]), async (req, res) => {
  const userID=await getMaxuserID();
  const pfpPath= userID+"jpg";
  const { FName, LName, UserName, Bio, Email, Password, BirthDate } = req.body;
  const hashedPassword=await bcrypt.hash(Password,10);//encrypt password
  const pfpFile = req.files['PFP'] ? req.files['PFP'][0] : null;
  const RegisterQuery=`
  INSERT INTO users (username, f_name, l_name, age, is_artist, is_admin, bio,email,password_hash,pfp_path)
  VALUES (?, ?, ?, ?, ?, ?, ?,?,?,?)
`;
con.query(RegisterQuery,[UserName,FName,LName,BirthDate,0,0,Bio,Email,hashedPassword,pfpPath])

  res.send('Registration received!');
});

function getMaxuserID() {

  return new Promise((resolve, reject) => { // sql queries are async. this line insures the insert query later in code dont execute until getMaxID() is done. 
    const IdQuery = 'SELECT MAX(user_id) AS max_id FROM users;';
    con.query(IdQuery, (err, result) => {
      if (err) {
        console.log("MaxID not found");
        return resolve(null);
      } else {
        const MaxID = result[0].max_id || 0; // Get the max ID or 0 if table empty
        resolve(MaxID + 1);
      }
    });
  });
}
//////////////////////////////
//**************************** http://localhost:3001/users
app.get('/email', async (req, res) => {
  
  const selectedEmail =  req.query.email;
  console.log(selectedEmail);
  const emailQuery = 'SELECT * FROM users WHERE email = ?';
  con.query(emailQuery, [selectedEmail], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    }

    if (result.length > 0) {
      return res.status(409).send("email already in use");
    }

    res.status(200).send("email available");
  });
});
///////////////////////////// http://localhost:3001/users done
//**************************** http://localhost:3001/users
app.get('/users', (req, res) => {
  const selectedUsername = req.query.username;
  console.log(selectedUsername);
  const usernameQuery = 'SELECT username FROM users WHERE username = ?';
  con.query(usernameQuery, [selectedUsername], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    }

    if (result.length > 0) {
      return res.status(409).send("Username already in use");
    }

    res.status(200).send("Username available");
  });
});
///////////////////////////// http://localhost:3001/users done
//**************************** http://localhost:3001/upload-film 

// check last id ()
function getMaxID() {

  return new Promise((resolve, reject) => { // sql queries are async. this line insures the insert query later in code dont execute until getMaxID() is done. 
    const IdQuery = 'SELECT MAX(film_id) AS max_id FROM films;';
    con.query(IdQuery, (err, result) => {
      if (err) {
        console.log("MaxID not found");
        return resolve(null);
      } else {
        const MaxID = result[0].max_id || 0; // Get the max ID or 0 if table empty
        resolve(MaxID + 1);
      }
    });
  });
}
// loads the "/upload-form" path on localhost port 3001
app.post('/upload-film', async (req, res, next) => {
  // temp storage on local disk (uses precomputed MaxID from req)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'File') {
      cb(null, 'uploads/films/'); 
    } else if (file.fieldname === 'Thumbnail') {
      cb(null, 'uploads/thumbnails/'); 
    }
  },
  filename: async function (req, file, cb) {
    const MaxID = await getMaxID(); // we await getMaxID()
    if (MaxID === null) {
      return cb(new Error("Failed to retrieve MaxID"));
    }

    if (file.fieldname === 'File') {
      cb(null, MaxID + '.mp4'); // Save video as 'film_id.mp4' for ex
    } else if (file.fieldname === 'Thumbnail') {
      cb(null, MaxID + '.jpg'); // Save thumbnail as 'film_id.jpg'
    }
  }
});

// multer instance uploads files to server (local disk for now)
const upload = multer({ storage: storage });
  if (!fs.existsSync('uploads/films')) {
    fs.mkdirSync('uploads/films', { recursive: true });
  }
  if (!fs.existsSync('uploads/thumbnails')) {
    fs.mkdirSync('uploads/thumbnails', { recursive: true });
  }
  try {
    const MaxID = await getMaxID();  // prepare ID

    if (MaxID === null) {
      return res.status(500).send("Failed to retrieve new film ID.");
    }

    req.customFilmID = MaxID;  // Attach ID to request
   
    upload.fields([{ name: 'File' }, { name: 'Thumbnail' }])(req, res, async (err) => {
   

      // saves inputs in variables
      const { Title, Description, Genres } = req.body;// metadata
      const FilmPath = req.files.File?.[0]?.path;//film path
      const ThumbnailPath = req.files.Thumbnail?.[0]?.path; // thumbnailpath
      const time = new Date();
      const date = time.toISOString().split('T')[0];//date
      // checks for errors with variables so far
      if (!Title || !Description || !Genres || !FilmPath || !ThumbnailPath||!date) {
        console.log("Missing required fields.");
        console.log(Title,Description,Genres,FilmPath,ThumbnailPath)
        return res.status(400).send("All fields including files are required.");
      }
      //ffprobe gets video duration 
      ffmpeg.ffprobe(FilmPath, (err, metadata) => {
        if (err) {
          console.error("Error reading video metadata:", err);
          return res.status(500).send("Failed to read video duration.");
        }

        const videoDuration = metadata.format.duration.toFixed(1);
        console.log("Video Duration:", videoDuration);
        console.log("Request body:", { Title, Description, Genres, FilmPath, ThumbnailPath, videoDuration });
        //the insert into database query
        const sqlQuery = `
          INSERT INTO films (film_title, description, film_genre, film_path, thumbnail_path, film_duration, release_date)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        //exe query
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
          console.log("calledd2")
          console.log("Query successful. Inserted film:", result);
          res.send("Film data saved successfully!");
        });
      });
    });

  } catch (error) {
    console.error("Unexpected server error:", error);
    res.status(500).send("Unexpected server error.");
  }
});
//////////////////////////// http://localhost:3001/upload-film done
//**************************** http://localhost:3001/users
const reporting = multer();
app.post('/Report',reporting.none(), (req, res) => {
  const email = req.body.email;
  const report = req.body.report;
  console.log(email,report);
  const reportQuery =`
          INSERT INTO tech_reports (email,report,ischecked)
          VALUES (?, ?,?)
        `;
  con.query(reportQuery, [email,report,0], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    }

    if (result.length > 0) {
      return res.status(409).send("Username already in use");
    }

    res.status(200).send("Username available");
  });
});
///////////////////////////// http://localhost:3001/users done
// run server
app.listen(3001, () => console.log("Server running on port 3001"));