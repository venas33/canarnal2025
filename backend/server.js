const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { initializeApp } = require('firebase/app');
const QRCode = require('qrcode');
const cloudinary = require("cloudinary").v2;
const { getAuth } = require('firebase/auth');

dotenv.config();

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "cadastrosqrcode.firebasestorage.app"
});

const db = admin.firestore();
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Middleware para verificar autenticação do admin
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token não fornecido" });
    
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken.uid !== "lu3fjCdyZUPJnesrxZBQYsT9TQv2", "ESvdbzX1ZgepZGJsBmWngbR9qRz2") {
      return res.status(403).json({ error: "Acesso negado" });
    }
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido", details: error.message });
  }
};

app.post('/add-user', verifyAdmin, upload.single('foto'), async (req, res) => {
  try {
    const { cpf, nome, email, celular, categoria } = req.body;
    const foto = req.file;
    if (!cpf || !nome || !email || !celular || !categoria) {
      return res.status(400).send({ error: 'Todos os campos são obrigatórios' });
    }
    
    const userRef = db.collection('users').doc(cpf);
    const docSnap = await userRef.get();
    if (docSnap.exists) {
      return res.status(400).send({ error: 'Usuário com este CPF já está cadastrado' });
    }

    const FotoCadastro = `http://localhost:3000/user/${cpf}`; // Alterado para apontar para o frontend
    const qrCodeDataUrl = await QRCode.toDataURL(FotoCadastro);
    const qrCodeUploadResult = await cloudinary.uploader.upload(qrCodeDataUrl, { folder: "qrcodes" });

    let fotoUrl = '';
    if (foto) {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
          if (error) reject(new Error('Erro ao fazer upload da imagem: ' + error.message));
          else resolve(result);
        });
        uploadStream.end(foto.buffer);
      });
      fotoUrl = uploadResult.secure_url;
    }

    await userRef.set({ cpf, nome, email, celular, categoria, foto: fotoUrl, qrCodeUrl: qrCodeUploadResult.secure_url });
    res.status(200).send({ message: 'Usuário adicionado com sucesso!', qrCodeUrl: qrCodeUploadResult.secure_url });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get('/users', verifyAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get('/usuario/:cpf', async (req, res) => {
  const { cpf } = req.params;
  try {
    const docRef = db.collection('users').doc(cpf);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(docSnap.data());
  } catch (error) {
    res.status(500).json({ error: 'Erro interno no servidor', details: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
