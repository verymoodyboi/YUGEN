//**************** imports
//general imports
const cors = require('cors'); // for cross-origin resource sharing
const express = require("express"); // for routing uploads  
//filmUpload imports
const multer = require("multer"); // handle file uploads (film-file/thumbnail-file)
const path = require("path"); // for file manipulation (naming files before saving to server)
const fs = require('fs'); //stands for "file system" I think. for creating (uploads/films) & (uploads/thumbnails) folders
const ffmpeg = require('fluent-ffmpeg'); // sick library for handling video files (literally crazy features) used it to get video duration
const bcrypt = require('bcrypt')
// Supabase Client import
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client

const supabase = createClient('https://iqvsgbsnpqvbddmdixoz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdnNnYnNucHF2YmRkbWRpeG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODIwMDAsImV4cCI6MjA2MTg1ODAwMH0.gXi9u1QIXf9gJkNvCGZror9pkJu-U0nPeerZN7F-Gzw');

////////////////////////////imports done
//**********************init express app
const app = express();
app.use(cors());
app.use(express.json());
/////////////////////////init done

//**************************** http://localhost:3001/Register
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/pfp/');
  },
  filename: async function (req, file, cb) {
    const userID = await getMaxUserID(); // Get the max user ID 
    cb(null, `${userID}.jpg`);
  }
});

const upload = multer({ storage: storage });

// Register Route
app.post('/Register', upload.fields([{ name: 'PFP', maxCount: 1 }]), async (req, res) => {
  const { FName, LName, UserName, Bio, Email, Password, BirthDate } = req.body;
  const hashedPassword = await bcrypt.hash(Password, 10);

  try {
    // Insert the new user into Supabase
    const userIDD= await getMaxUserID();
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username: UserName,
          f_name: FName,
          l_name: LName,
          age: BirthDate,  
          is_artist: false,
          is_admin: false,
          bio: Bio,
          email: Email,
          password_hash: hashedPassword,
          pfp_path: `${userIDD}.jpg`, // Example profile picture path
        }
      ]);

    if (error) {
      console.error('Error inserting user:', error);
      res.status(500).send('Error inserting user');
    } else {
      res.send('Registration successful!');
    }
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send('Server error');
  }
});

// Check if email is already taken
app.get('/email', async (req, res) => {
  const email = req.query.email;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', email);

    if (error) {
      console.error('Error checking email:', error);
      return res.status(500).send('Database error');
    }

    if (data.length > 0) {
      return res.status(409).send('Email already in use');
    }

    res.status(200).send('Email available');
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).send('Server error');
  }
});

// Check if username is already taken
app.get('/users', async (req, res) => {
  const username = req.query.username;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', username);

    if (error) {
      console.error('Error checking username:', error);
      return res.status(500).send('Database error');
    }

    if (data.length > 0) {
      return res.status(409).send('Username already in use');
    }

    res.status(200).send('Username available');
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).send('Server error');
  }
});




//**************************** http://localhost:3001/Register done

//**************************** http://localhost:3001/upload-film 




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
      const MaxID = await getMaxFilmID(); // we await getMaxFilmID()
      if (MaxID === null) {
        return cb(new Error("Failed to retrieve MaxID"));
      }

      if (file.fieldname === 'File') {
        cb(null, MaxID + '.mp4'); // Save video as 'film_id.mp4'
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
    const MaxID = await getMaxFilmID(); // prepare ID
    if (MaxID === null) {
      return res.status(500).send("Failed to retrieve new film ID.");
    }

    req.customFilmID = MaxID; // Attach ID to request

    // Use upload.fields() to process files asynchronously
    upload.fields([{ name: 'File' }, { name: 'Thumbnail' }])(req, res, async (err) => {
      if (err) {
        return res.status(500).send("Error uploading files: " + err.message);
      }

      // saves inputs in variables
      const { Title, Description, Genres } = req.body; // metadata
      const FilmPath = req.files.File?.[0]?.path; // film path
      const ThumbnailPath = req.files.Thumbnail?.[0]?.path; // thumbnail path
      const time = new Date();
      const date = time.toISOString().split('T')[0]; // date

      // checks for errors with variables so far
      if (!Title || !Description || !Genres || !FilmPath || !ThumbnailPath || !date) {
        console.log("Missing required fields.");
        return res.status(400).send("All fields including files are required.");
      }

      // ffprobe gets video duration
      try {
        ffmpeg.ffprobe(FilmPath, async (err, metadata) => {
          if (err) {
            console.error("Error reading video metadata:", err);
            return res.status(500).send("Failed to read video duration.");
          }

          const videoDuration = metadata.format.duration.toFixed(1);
          console.log("Video Duration:", videoDuration);

          // Supabase query to insert new film into 'films' table
          const { data, error } = await supabase
            .from('films')
            .insert([{
              Film_Title: Title,
              Description: Description,
              Film_Genre: Genres,
              Film_path: FilmPath,
              Thumbnail_path: ThumbnailPath,
              film_duration: videoDuration,
              release_date: date
            }]);

          if (error) {
            console.error("Supabase Query Error:", error);
            return res.status(500).send("Database error: " + error.message);
          }

          console.log("Film successfully uploaded:", data);
          res.send("Film data saved successfully!");
        });
      } catch (error) {
        console.error("Error processing video metadata:", error);
        res.status(500).send("Error processing video metadata.");
      }
    });

  } catch (error) {
    console.error("Unexpected server error:", error);
    res.status(500).send("Unexpected server error.");
  }
});

//**************************** http://localhost:3001/upload-film done

//**************************** http://localhost:3001/Report
const reporting = multer();
app.post('/Report', reporting.none(), async (req, res) => {
  const email = req.body.email;
  const report = req.body.report;
  console.log(email, report);

  // Supabase new report into 'tech_reports'
  const { data, error } = await supabase
    .from('tech_reports')
    .insert([
      {
        email: email,
        report: report,
        ischecked: false
      }
    ]);

  if (error) {
    return res.status(500).send("Database error: " + error.message);
  }

  res.status(200).send("Report submitted successfully!");
});
//**************************** http://localhost:3001/Report done

//**************************** http://localhost:3001/Review
app.post('/addthought', reporting.none(), async (req, res) => {
  const Rating = req.body.rating;
  const Comment = req.body.comment;

  const { data, error } = await supabase
    .from('thoughts')
    .insert([
      {
        comment: Comment,
        reviewerid: 0, // Placeholder ID
        reviewedid: 0, // Placeholder ID
        rating: Rating,
      }
    ]);

  if (error) {
    console.error(error);
    return res.status(500).send("Database error: " + error.message);
  }

  res.status(200).send("thought submitted successfully!");
});
//**************************** http://localhost:3001/Review done
//supabase functions
//get_next_user_id
const getMaxUserID = async () => {
  try {
    const { data, error } = await supabase.rpc('get_next_user_id');

    if (error) {
      console.error('Error fetching next user ID:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
};
//get_next_film_id
const getMaxFilmID= async() =>{
  try {
    const { data, error } = await supabase.rpc('get_next_film_id');

    if (error) {
      console.error('Error fetching next film ID:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
}
//get_avg_film_rating

const getAVGRating= async (film_id)=> {
  try {
    const { data, error } = await supabase.rpc('get_film_average_rating',{film_id});

    if (error) {
      console.error('Error fetching avg film rating:', error);
      return null;
    }
    console.log(data);
    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
    return null;
  }
}
//getAVGRating(1);
// run server
app.listen(3001, () => console.log("Server running on port 3001"));
