import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword,  } from "firebase/auth";
import { auth } from "../firebaseConfig"; // Importe a configuração do Firebase

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/"); // Redirecionar para a página principal após login bem-sucedido
    } catch (err) {
      console.error("Erro ao fazer login:", err); // Log detalhado do erro
      setError("Erro ao fazer login. Verifique suas credenciais.");
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center">Login Admin</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleLogin}>
        <Form.Group>
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Senha</Form.Label>
          <Form.Control
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Button type="submit" className="mt-3 w-100">Entrar</Button>
      </Form>
    </Container>
  );
};

export default Login;
