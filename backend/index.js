const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const multer = require("multer");
const qrcode = require("qrcode");
const cloudinary = require("cloudinary").v2;
const serviceAccount = require("./serviceAccountKey.json");
require("dotenv").config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.post("/cadastrar", upload.single("foto"), async (req, res) => {
  try {
    const { nome, cpf, telefone, checkboxSelecionado } = req.body;

    if (!nome || !cpf || !telefone || !checkboxSelecionado || !req.file) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios!" });
    }

    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64Image, { folder: "carnaval" });

    const userData = {
      nome,
      cpf,
      telefone,
      checkboxSelecionado,
      foto: result.secure_url,
    };

    const ref = await db.collection("usuarios").add(userData);
    const userUrl = `http://localhost:5002/usuario/${cpf}`;
    const qrCodeDataUrl = await qrcode.toDataURL(userUrl);

    // Upload do QR Code para o Cloudinary
    const qrCodeUploadResult = await cloudinary.uploader.upload(qrCodeDataUrl, { folder: "carnaval" });

    await db.collection("usuarios").doc(ref.id).update({ qrCode: qrCodeUploadResult.secure_url });

    res.json({ qrCode: qrCodeUploadResult.secure_url, url: userUrl });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

app.get("/usuario/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userDoc = await db.collection("usuarios").doc(id).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json(userDoc.data());
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import ErrorBoundary from "./ErrorBoundary";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ErrorBoundary>
    <Router>
      <App />
    </Router>
  </ErrorBoundary>
);
