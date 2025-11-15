import ngrok from 'ngrok';

const PORT = 3000; // Your local Express server port

(async () => {
  try {
    const url = await ngrok.connect(PORT);
    console.log(`🚀 ngrok tunnel running at: ${url}`);
    console.log(`Use ${url}/api/moderation/callback as your Sightengine callback URL`);
  } catch (err) {
    console.error('❌ Failed to start ngrok:', err);
  }
})();