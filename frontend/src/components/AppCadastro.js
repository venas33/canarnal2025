import React, { useState, useRef } from "react";
import { Form, Button, Container, Row, Col, Card, Alert } from "react-bootstrap";
import axios from "axios";
import { auth } from "../firebaseConfig"; // Importe a configuração do Firebase
import { Route, Routes } from 'react-router-dom';
import User from './User';
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/App.css";

function AppCadastro() {
  const [formData, setFormData] = useState({
    cpf: "",
    nome: "",
    email: "",
    celular: "",
    categoria: "",
    foto: null,
  });

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCapture = () => {
    const context = canvasRef.current.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasRef.current.toBlob((blob) => {
      setFormData((prev) => ({ ...prev, foto: blob }));
      setIsCameraOpen(false);
    }, "image/jpeg");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowErrorMessage("");
    setShowSuccessMessage(false);

    const formDataToSend = new FormData();
    formDataToSend.append("cpf", formData.cpf);
    formDataToSend.append("nome", formData.nome);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("celular", formData.celular);
    formDataToSend.append("categoria", formData.categoria);
    if (formData.foto) {
      formDataToSend.append("foto", formData.foto);
    }

    const qrCodeUrl = `http://localhost:3000/user/${formData.cpf}`; // Alterado para apontar para o frontend
    formDataToSend.append("qrCodeUrl", qrCodeUrl);

    console.log("Enviando dados:", [...formDataToSend.entries()]);

    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        await axios.post("http://localhost:5000/add-user", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`,
          },
        });
        setShowSuccessMessage(true);
      } else {
        setShowErrorMessage("Usuário não autenticado.");
      }
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      if (error.response && error.response.status === 400 && error.response.data.error === 'Usuário com este CPF já está cadastrado') {
        setShowErrorMessage("Usuário com este CPF já está cadastrado.");
      } else {
        setShowErrorMessage("Erro ao cadastrar usuário.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCamera = () => {
    setIsCameraOpen(true);
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    });
  };

  return (
    <Routes>
      <Route path="/user/:cpf" element={<User />} /> {/* Nova rota para exibir os dados do usuário */}
      <Route path="/" element={
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col md={6}>
              <Card>
                <Card.Body>
                  <Card.Title className="text-center">Cadastro de identificação 2025</Card.Title>
                  {showSuccessMessage && (
                    <Alert variant="success" className="text-center">
                      Cadastro finalizado! Qrcode Gerado com sucesso.
                    </Alert>
                  )}
                  <br></br>
                  {showErrorMessage && (
                    <Alert variant="danger" className="text-center">
                      {showErrorMessage}
                    </Alert>
                  )}
                  <Form onSubmit={handleSubmit}>
                    <Form.Group>
                      <Form.Label>CPF/CNPJ </Form.Label>
                      <Form.Control type="text" name="cpf" required onChange={handleChange} />
                    </Form.Group>
                    <br></br>
                    <Form.Group>
                      <Form.Label>Nome Completo</Form.Label>
                      <Form.Control type="text" name="nome" required onChange={handleChange} />
                    </Form.Group>
                    <br></br>
                    <Form.Group>
                      <Form.Label>Email </Form.Label>
                      <Form.Control type="email" name="email" required onChange={handleChange} />
                    </Form.Group>
                    <Form.Group>
                      <br></br>
                      <Form.Label>Celular </Form.Label>
                      <Form.Control type="text" name="celular" required onChange={handleChange} />
                    </Form.Group>
<br></br>
                    <Form.Group>
                      <Form.Control as="select" name="categoria" required onChange={handleChange}>
                        <option value="">Selecione a Categoria</option>
                        <option value="Camarote /3x5(20Pessoas)">Camarote /3x5(20Pessoas)</option>
                        <option value="Bar Restaurante/5x10(com conzina de 5x4)">Bar Restaurante/5x10(com conzina de 5x4)</option>
                        <option value="Barracas de Lanche/ 5x5">Barracas de Lanche/ 5x5</option>
                        <option value="Barracas de coquetel/3x3">Barracas de coquetel/3x3</option>
                        <option value="Food Truck/6,3x2x2">Food Truck/6,3x2x2</option>
                        <option value="Caminhão Gelo">Caminhão Gelo</option>
                        <option value="Bebida/ 1 Caixa térmica (200L)">Bebida/ 1 Caixa térmica (200L)</option>
                        <option value="Ambulantes de Bebida/1 isopor(48L)">Ambulantes de Bebida/1 isopor(48L)</option>
                        <option value="Ambulante Pipoqueiro/1 Carrinho">Ambulante Pipoqueiro/1 Carrinho</option>
                        <option value="Ambulante Baleiro/1 Carrinho">Ambulante Baleiro/1 Carrinho</option>
                        <option value="Ambulantes Salgado e Churros/1 Carrinho">Ambulantes Salgado e Churros/1 Carrinho</option>
                        <option value="Ambulante Brinquedo/Copos/1 Carrinho">Ambulante Brinquedo/Copos/1 Carrinho</option>
                        <option value="Ambulantes Algodão doce/ 1 Carrinho">Ambulantes Algodão doce/ 1 Carrinho</option>
                        <option value="Barraca de lanhce/bebida/5x5">Barraca de lanhce/bebida/5x5</option>
                      </Form.Control>
                    </Form.Group>
<br/>
                    <Form.Group className="text-center">
                      <Form.Label>Tirar Foto (Opcional) </Form.Label>
                      <Button className= "mx-3 pr bg-primary" variant="secondary"  onClick={openCamera}>Abrir Câmera</Button>
                      {isCameraOpen && (
                        <div className="camera">
                          <video ref={videoRef} width="100%" height="auto" />
                          <Button variant="primary" onClick={handleCapture}>Capturar Foto</Button>
                          <canvas ref={canvasRef} style={{ display: "none" }} width="640" height="480"></canvas>
                        </div>
                      )}
                    </Form.Group>

                    <Button type="submit" className="mt-3 w-100" disabled={isSubmitting}>
                      {isSubmitting ? "Processando..." : "Cadastrar"}
                    </Button>
                  </Form>

             
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      } />
    </Routes>
  );
}

export default AppCadastro;