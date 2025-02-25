import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import AppCadastro from "./AppCadastro"; // Atualize o caminho conforme necessário
import Login from "./Login";
import User from "./User"; // Importe o componente User
import Sidebar from "./Sidebar"; // Importe o componente Sidebar
import QrCodes from "./QrCodes"; // Importe o componente QrCodes
import { Container, Row, Col } from "react-bootstrap";
import { auth } from "../firebaseConfig"; // Importe a configuração do Firebase

const App = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

  const isLoginPage = location.pathname === "/login";

  return (
    <Container fluid>
      <Row>
        {!isLoginPage && user && (
          <Col md={2}>
            <Sidebar />
          </Col>
        )}
        <Col md={!isLoginPage && user ? 10 : 12}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={user ? <AppCadastro /> : <Navigate to="/login" />} />
            <Route path="/user/:cpf" element={<User />} /> {/* Adiciona a rota para User */}
            <Route path="/qrcodes" element={<QrCodes />} /> {/* Adiciona a rota para QrCodes */}
          </Routes>
        </Col>
      </Row>
    </Container>
  );
};

export default App;