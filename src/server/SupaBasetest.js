const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient('https://iqvsgbsnpqvbddmdixoz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdnNnYnNucHF2YmRkbWRpeG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyODIwMDAsImV4cCI6MjA2MTg1ODAwMH0.gXi9u1QIXf9gJkNvCGZror9pkJu-U0nPeerZN7F-Gzw');

// Handle file uploads
const upload = multer();

// Review route
app.post('/Review', upload.none(), async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    return res.status(400).json({ error: 'Rating and comment are required' });
  }

  try {
    // Insert the review into the Supabase database
    const { data, error } = await supabase
      .from('review')  // Review table in Supabase
      .insert([
        {
          comment,
          reviewerid: 0, // Modify this based on your app's logic
          reviewedid: 0, // Modify this based on your app's logic
          rating,
        },
      ]);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Database error' });
    }

    return res.status(200).json({ message: 'Review submitted successfully', data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});

// Run the server
app.listen(3001, () => {
  console.log("Server running on port 3001");
});
