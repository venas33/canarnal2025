import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Table, Container, Button } from 'react-bootstrap';
import { db } from '../firebaseConfig'; // Importe a configuração do Firebase


const QrCodes = () => {
  const [qrcodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQrCodes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const qrCodesData = querySnapshot.docs.map(doc => doc.data());
        setQrCodes(qrCodesData);
      } catch (err) {
        setError('Erro ao buscar QR Codes cadastrados');
      } finally {
        setLoading(false);
      }
    };

    fetchQrCodes();
  }, []);

  const handleDownload = async (url) => {
    const img = new Image();
    img.src = url;
    img.crossOrigin = 'Anonymous';
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 709; // 3x3 inches at 100 DPI
      canvas.height = 709; ;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'qrcode.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <Container>
      <h1>QR Codes Cadastrados</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>CPF</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Celular</th>
            <th>Categoria</th>
            <th>QR Code</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {qrcodes.map((user) => (
            <tr key={user.cpf}>
              <td>{user.cpf}</td>
              <td>{user.nome}</td>
              <td>{user.email}</td>
              <td>{user.celular}</td>
              <td>{user.categoria}</td>
              <td>
                <a href={user.qrCodeUrl} target="_blank" rel="noopener noreferrer">
                  Ver QR Code
                </a>
              </td>
              <td>
                <Button variant="primary" onClick={() => handleDownload(user.qrCodeUrl)}>
                  Download
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default QrCodes;