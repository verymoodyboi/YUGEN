//**************** imports
//general imports
const cors = require('cors'); // for cross-origin resource sharing
const express = require("express"); // for routing uploads  
//filmUpload imports
const multer = require("multer"); // handle file uploads (film-file/thumbnail-file)
const upload = multer({ storage: multer.memoryStorage() });

const path = require("path"); // for file manipulation (naming files before saving to server)
const fs = require('fs'); //stands for "file system" I think. for creating (uploads/films) & (uploads/thumbnails) folders
const ffmpeg = require('fluent-ffmpeg'); // sick library for handling video files (literally crazy features) used it to get video duration
const bcrypt = require('bcrypt')
// Supabase Client import
const { createClient } = require('@supabase/supabase-js');
const { number } = require('framer-motion');
const { Links } = require('react-router-dom');

// Initialize Supabase 

const supabase = createClient('https://iqvsgbsnpqvbddmdixoz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdnNnYnNucHF2YmRkbWRpeG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODIwMDAsImV4cCI6MjA2MTg1ODAwMH0.gXi9u1QIXf9gJkNvCGZror9pkJu-U0nPeerZN7F-Gzw',{
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

////////////////////////////imports done
//**********************init express app
const app = express();

app.use(cors({
  origin: "http://localhost:5173", // or whatever your frontend origin is
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
/////////////////////////init done

//**************************** http://localhost:3001/Register
// Register Route
app.post('/Register', upload.single('PFP'), async (req, res) => {
  const { FName, LName, UserName, Bio, Email, Password, BirthDate, Gender, Region } = req.body;
  const time = new Date();
  const date = time.toISOString().split('T')[0];

  try {

    // Sign up user in Supabase Auth
    const { data: dataSupa, error: errorSupa } = await supabase.auth.signUp({
      email: Email,
      password: Password,
    });

    if (errorSupa) {
      console.error("Supabase signUp error:", errorSupa.message);
      return res.status(400).send("Sign up failed: " + errorSupa.message);
    }

    const userId = dataSupa.user.id;
    const file = req.file;

  if (file) {
    console.log('File size (bytes):', file.buffer.length); // Should show size > 0

    const { error: uploadError } = await supabase.storage
      .from('pfps')
      .upload(`${userId}.jpg`, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      return res.status(500).send("Failed to upload profile picture");
    }
  }


    // Insert user into the 'users' table
   const authUID = dataSupa.user.id;

const { error: dbError } = await supabase
  .from('users')
  .insert([{
    auth_id: authUID,
    username: UserName,
    f_name: FName,
    l_name: LName,
    age: BirthDate,
    is_artist: false,
    is_admin: false,
    bio: Bio,
    email: Email,
    pfp_path: `${authUID}.jpg`,
    join_date: date,
    gender: Gender,
    region: Region
  }]);

    if (dbError) {
      console.error('Error inserting user:', dbError.message);
      return res.status(500).send('Database error while creating user');
    }

    res.send('Registration successful!');
  } catch (err) {
    console.error('Unexpected error during registration:', err);
    res.status(500).send('Server error');
  }
});
////google sign up
app.post('/RegisterGoogle', upload.single('PFP'), async (req, res) => {
  const { FName, LName, UserName, Bio, Email, BirthDate, Gender, Region, auth_id } = req.body;
  const time = new Date();
  const date = time.toISOString().split('T')[0];

  try {
    const userId = auth_id; // this must come from your Google auth flow (client passes it here)
    const file = req.file;

    if (!userId) {
      return res.status(400).send("Missing auth_id from Google sign-in");
    }

    // Upload PFP to Supabase Storage
    if (file) {
      const { error: uploadError } = await supabase.storage
        .from('pfps')
        .upload(`${userId}.jpg`, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError.message);
        return res.status(500).send("Failed to upload profile picture");
      }
    }

    // Insert user into 'users' table with auth_id as PK
    const { error: dbError } = await supabase
      .from('users')
      .insert([{
        auth_id: userId,
        username: UserName,
        f_name: FName,
        l_name: LName,
        age: BirthDate,
        is_artist: false,
        is_admin: false,
        bio: Bio,
        email: Email,
        pfp_path: `${userId}.jpg`,
        join_date: date,
        gender: Gender,
        region: Region
      }]);

    if (dbError) {
      console.error('Error inserting user:', dbError.message);
      return res.status(500).send('Database error while creating user');
    }

    res.send('Registration successful!');
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send('Server error');
  }
});

// student info rout
app.post('/StudentInfo', async (req, res) => {
  const { Uni, Email, SID } = req.body;

  try {


    const { data, error } = await supabase
      .from('users')
      .update([
        {
          sid: SID,
          university: Uni, 
          is_student: true,
        }
      ])
      .eq('email', Email);

    if (error) {
      console.error('Error updating user:', error);
      res.status(500).send('Error updating user');
    } else {
      res.send('Update successful!');
    }
  } catch (error) {
    console.error('Error during update:', error);
    res.status(500).send('Server error');
  }
});
//
// social Links rout
app.post('/updatesocials', async (req, res) => {
  const { Insta, Email, YT,LI } = req.body;

  try {


    const { data, error } = await supabase
      .from('users')
      .update([
        {
          youtube: YT,
          instagram: Insta, 
          linkedin: LI,
        }
      ])
      .eq('email', Email);

    if (error) {
      console.error('Error updating user:', error);
      res.status(500).send('Error updating user');
    } else {
      res.send('Update successful!');
    }
  } catch (error) {
    console.error('Error during update:', error);
    res.status(500).send('Server error');
  }
});
// edit profile route 

app.post('/editprofile', upload.single('PFP'), async (req, res) => {
  const { FName, LName, UserName, Bio, Email, Gender, Region, auth_id } = req.body;

  if (!auth_id) {
    return res.status(400).send("Missing auth_id");
  }

  const file = req.file;

  try {
    if (file) {
      console.log("Uploading file:", file.originalname, file.size, file.mimetype);

     await supabase.storage
  .from('pfps')
  .remove([`${auth_id}.jpg`]);

// 2. Then upload new file
const { error: uploadError } = await supabase.storage
  .from("pfps")
  .upload(`${auth_id}.jpg`, file.buffer, {
    contentType: file.mimetype,
    upsert: true, // still good to include
  });

if (uploadError) {
  console.error(" Upload error:", uploadError.message);
  return res.status(500).send("Failed to upload");
}

    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        username: UserName,
        f_name: FName,
        l_name: LName,
        bio: Bio,
        gender: Gender,
        region: Region,
        ...(file && { pfp_path: `${auth_id}.jpg` }),
      })
      .eq('auth_id', auth_id);

    if (updateError) {
      console.error("Database update error:", updateError.message);
      return res.status(500).send("Failed to update user");
    }

    res.send("Update successful!");
  } catch (err) {
    console.error("Unexpected error:", err);
    res.status(500).send("Server error");
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
  const username = req.query.username; // ✨ Get raw query param

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
   
      const trimmedUsername = data[0].username.trim();
      console.log(trimmedUsername);

return res.status(409).json(trimmedUsername);
    }

    res.status(200).send('Username available');
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).send('Server error');
  }
});







//**************************** http://localhost:3001/upload-film 





app.post('/upload-film', upload.fields([{ name: 'Film' }, { name: 'Poster' }]), async (req, res) => {
  try {
    const { Title, Thesis, Genres, Country, Crew, Cast, Uploader } = req.body;
    const filmFile = req.files?.Film?.[0];
    const posterFile = req.files?.Poster?.[0];

    if (!Title || !Thesis || !Genres || !filmFile || !posterFile) {
      return res.status(400).send('Missing required fields');
    }

    const releaseDate = new Date().toISOString().split('T')[0];
console.log(Uploader)
    const { data: insertData, error: insertError } = await supabase
      .from('films')
      .insert([{
        film_title: Title,
        thesis: Thesis,
        film_genre: Genres,
        uploader_id: Uploader, // Replace with actual logged-in user ID
        country: Country,
        crew: Crew ? JSON.parse(Crew) : null,
        cast: Cast ? JSON.parse(Cast) : null,
      }])
      .select();

    if (insertError || !insertData?.[0]) {
      console.error('Insert Error:', insertError?.message);
      return res.status(500).send('Failed to insert film');
    }

    const film = insertData[0];
    const uuid = film.film_uuid;
    const filmFileName = `${uuid}.mp4`;
    const posterFileName = `${uuid}.jpg`;

    // Upload Film
    const { error: filmUploadError } = await supabase.storage
      .from('films')
      .upload(filmFileName, filmFile.buffer, {
        contentType: filmFile.mimetype,
        upsert: true,
      });

    if (filmUploadError) {
      console.error('Film upload failed:', filmUploadError.message);
      return res.status(500).send('Failed to upload film file');
    }

    // Upload Poster
    const { error: posterUploadError } = await supabase.storage
      .from('posters')
      .upload(posterFileName, posterFile.buffer, {
        contentType: posterFile.mimetype,
        upsert: true,
      });

    if (posterUploadError) {
      console.error('Poster upload failed:', posterUploadError.message);
      return res.status(500).send('Failed to upload poster');
    }
const streamifier = require('streamifier');
const ffmpeg = require('fluent-ffmpeg');

const filmBuffer = req.files.Film[0].buffer;
const filmStream = streamifier.createReadStream(filmBuffer);

ffmpeg.ffprobe(filmStream, async (err, metadata) => {
  if (err) {
    console.error('FFprobe error:', err);
    return res.status(500).send('Could not extract film duration');
  }

  const durationInSeconds = Math.floor(metadata.format.duration);
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = durationInSeconds % 60;
  const formattedDuration = `${minutes}m ${seconds}s`;



      const { error: updateError } = await supabase
        .from('films')
        .update({
          film_path: filmFileName,
          poster_path: posterFileName,
          film_duration: formattedDuration,
        })
        .eq('film_uuid', uuid);

      if (updateError) {
        console.error('Update failed:', updateError.message);
        return res.status(500).send('Failed to update film metadata');
      }

      res.send('✅ Film uploaded successfully!');
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).send('Unexpected server error');
  }
});



//**************************** http://localhost:3001/upload-film done
//edit film 


app.post("/editfilm", upload.single("Poster"), async (req, res) => {
  const {
    Film_id,
    Title,
    Thesis,
    Genres,
    Country,
    Crew,
    Cast,
  } = req.body;

  const file = req.file;

  if (!Film_id) {
    return res.status(400).send("Missing film ID");
  }

  try {
    // If a new poster is uploaded
    if (file) {
      console.log("Uploading new poster:", file.originalname, file.size);

      // Optional: Remove old file if needed
      await supabase.storage
        .from("posters")
        .remove([`${Film_id}.jpg`]);

      const { error: uploadError } = await supabase.storage
        .from("posters")
        .upload(`${Film_id}.jpg`, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.error("Poster upload error:", uploadError.message);
        return res.status(500).send("Failed to upload poster");
      }
    }

    // Update film record
    const { error: updateError } = await supabase
      .from("films")
      .update({
        film_title: Title,
        thesis: Thesis,
        film_genre: Genres,
        country: Country,
        crew: Crew,
        cast: Cast,
        ...(file && { poster_path: `${Film_id}.jpg` }),
      })
      .eq("film_uuid", Film_id);

    if (updateError) {
      console.error("Database update error:", updateError.message);
      return res.status(500).send("Failed to update film info");
    }

    res.send("Film updated successfully!");
  } catch (err) {
    console.error("Unexpected server error:", err);
    res.status(500).send("Server error");
  }
});
// delete film 
app.post("/deletefilm", async (req, res) => {
  const { film_uuid } = req.body; //
 const { data:deleteFilmData, error:deleteFilmError } = await supabase.storage
    .from("films") // 🔁 replace with your actual bucket
    .remove([`${film_uuid}.mp4`]);

     const { data:deletePosterData, error:deletePosterError } = await supabase.storage
    .from("posters") // 🔁 replace with your actual bucket
    .remove([`${film_uuid}.jpg`]);
  const { error } = await supabase
    .from("films")
    .delete()
    .eq("film_uuid", film_uuid);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
});

//**************************** http://localhost:3001/Report
const reporting = multer();
app.post('/Report', reporting.none(), async (req, res) => {
  const email = req.body.email;
  const reportType = req.body.reportType;
  const report = req.body.report;
   const film_id =Number(req.body.film_id)
  console.log(email, report);

  // Supabase new report into 'film_reports'
  const { data, error } = await supabase
    .from('film_reports')
    .insert([
      {
        email: email,
        report_type:reportType,
        report: report,
        ischecked: false,
        film_id: film_id
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
    const id =Number(req.body.id);
console.log(id);

  const { data, error } = await supabase
    .from('thoughts')
    .insert([
      {
        comment: Comment,
        reviewer_id: 0, // Placeholder ID
        reviewed_id: id, // Placeholder ID
        rating: Rating,
      }
    ]);

  if (error) {
    console.error(error);
    return res.status(500).send("Database error: " + error.message);
  }

  res.status(200).send("thought submitted successfully!");
});
app.post('/addthoughtv1', reporting.none(), async (req, res) => {
  const Rating = req.body.rating;
  const Comment = req.body.comment;
    const id =Number(req.body.id);
    const thinker_id= Number(req.body.user_id);
console.log(id);

  const { data, error } = await supabase
    .from('thoughtsv1')
    .insert([
      {
        comment: Comment,
        user_id: thinker_id, 
       film_id: id, 
        rating: Rating,
      }
    ]);

  if (error) {
    console.error(error);
    return res.status(500).send("Database error: " + error.message);
  }

  res.status(200).send("thought submitted successfully!");
});
app.post('/replies', reporting.none(), async (req, res) => {
    //const Rating = req.body.rating;
    const Comment = req.body.comment;
    const comment_id =Number(req.body.comment_id);
        const replier_id =Number(req.body.user_id);

    //console.log("called");
  const { data, error } = await supabase
    .from('thought_replies')
    .insert([
      {
        comment: Comment,
        user_id:replier_id,
       thought_id: comment_id, // Placeholder ID
      
      }
    ]);

  if (error) {
    console.error(error);
    return res.status(500).send("Database error: " + error.message);
  }

  res.status(200).send("thought submitted successfully!");
});
//**************************** http://localhost:3001/Review done


app.get('/filmssdata', async (req, res) => {
  const offset = parseInt(req.query.offset || 0);
  const limit = parseInt(req.query.limit || 5);
  try {
    const { data, error } = await supabase
  .from('films')
  .select('film_id, film_title, thesis, film_genre, avg_rating, poster_path')
  .range(offset, offset + limit - 1);

const normalized = data.map((film) => ({
  ...film,
  poster_path: film.poster_path?.replace(/\\/g, "/"),
}));
console.log(normalized)
res.json(normalized);
  } catch (err) {
    console.error("Unexpected server error:", err);
    res.status(500).send("Unexpected server error");
  }
});

/////////////////
app.get('/filmssdata_map', async (req, res) => {

  const offset = parseInt(req.query.offset || 0);
  const limit = parseInt(req.query.limit || 5);
   const country = req.query.country;
   console.log(country)
  try {
    const { data, error } = await supabase
  .from('films')
  .select('film_id, film_title, thesis, film_genre, avg_rating, poster_path')
  .eq('country', country)
  .range(offset, offset + limit - 1);

const normalized = data.map((film) => ({
  ...film,
  poster_path: film.poster_path?.replace(/\\/g, "/"),
}));
console.log(normalized)
res.json(normalized);
  } catch (err) {
    console.error("Unexpected server error:", err);
    res.status(500).send("Unexpected server error");
  }
});
/////////////////
app.get('/latestfrom-profile', async (req, res) => {
  const offset = parseInt(req.query.offset || 0);
  const limit = parseInt(req.query.limit || 5);

  try {
    const { data, error } = await supabase
  .from('films')
  .select('film_uuid, film_title, thesis, film_genre, avg_rating, poster_path, country, crew,cast,film_path')
 .eq('uploader_id', req.query.uploaderID)
    .order('release_date', { ascending: false })
  .range(offset, offset + limit - 1);

const normalized = data.map((film) => ({
  ...film,
  poster_path: film.poster_path?.replace(/\\/g, "/"),
}));
console.log(normalized)
res.json(normalized);
  } catch (err) {
    console.error("Unexpected server error:", err);
    res.status(500).send("Unexpected server error");
  }
});
/////////////////
app.get('/thought',async(req,res)=>{
  try{
    const {data,error}= await supabase
      .from('thoughts')
      .select('*')
      console.log(data)
      res.status(200).send(data);
  }
  catch(err)
  {
    if(err)
    {
      console.log("err");
      return;
    }
  }

})
////////////////
app.get('/profile', async (req, res) => {
  const user_id = req.query.userF_id;


  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', 1);
  
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).send('Database error');
    }

    if (!data || data.length === 0) {
      return res.status(404).send('User not found');
    }
    else{
        console.log("data")
    }
    // Return the user data as JSON
    res.json(data[0]);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).send('Server error');
  }
});
//////////////
/////////////////
app.get('/getuploader',async(req,res)=>{
  try{
    const {data,error}= await supabase
      .from('users')
      .select('pfp_path,username')
      .eq('user_id', req.query.id);
      console.log("yes: " + JSON.stringify(data))
      res.status(200).send(data);
  }
  catch(err)
  {
    if(err)
    {
      console.log("err");
      return;
    }
  }

})
/////////////
// run server
app.listen(3001, () => console.log("Server running on port 3001"));
