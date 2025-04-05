const express = require("express");
const admin = require("firebase-admin");
const path = require("path");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

const serviceAccount = {
  type: process.env.FB_type,
  project_id: process.env.FB_project_id,
  private_key_id: process.env.FB_private_key_id,
  private_key: process.env.FB_private_key.replace(/\\n/g, "\n"),
  client_email: process.env.FB_client_email,
  client_id: process.env.FB_client_id,
  auth_uri: process.env.FB_auth_uri,
  token_uri: process.env.FB_token_uri,
  auth_provider_x509_cert_url: process.env.FB_auth_provider,
  client_x509_cert_url: process.env.FB_client_cert
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await auth.createUser({ email, password });
    await db.collection("users").doc(userRecord.uid).set({ email });
    res.status(200).send("Signup successful!");
  } catch (err) {
    res.status(400).send("Signup error: " + err.message);
  }
});

app.post("/login", async (req, res) => {
  const { email } = req.body;
  try {
    await auth.getUserByEmail(email);
    res.status(200).send("Login successful!");
  } catch (err) {
    res.status(401).send("Login error: " + err.message);
  }
});

app.post("/save-favorite", async (req, res) => {
  const { email, id, title, image, instructions } = req.body;

  if (!email || !id || !title) {
    return res.status(400).send("Missing required field");
  }

  try {
    const snapshot = await db.collection("users").where("email", "==", email).get();
    if (snapshot.empty) return res.status(404).send("User not found");

    const userDoc = snapshot.docs[0];
    await db.collection("users").doc(userDoc.id).collection("favorites").doc(id).set({
      title, image, instructions
    });

    res.status(200).send("Recipe saved to favorites!");
  } catch (err) {
    res.status(500).send("Error saving favorite: " + err.message);
  }
});

app.get("/favorites", async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json([]);

  try {
    const snapshot = await db.collection("users").where("email", "==", email).get();
    if (snapshot.empty) return res.status(404).json([]);

    const userDoc = snapshot.docs[0];
    const favsSnap = await db.collection("users").doc(userDoc.id).collection("favorites").get();
    const favs = favsSnap.docs.map(doc => doc.data());

    res.json(favs);
  } catch (err) {
    res.status(500).json([]);
  }
});


app.use((req, res) => {
  res.status(404).send("Page not found!");
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
