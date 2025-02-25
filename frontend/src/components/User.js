import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './User.css'; // Importar o arquivo CSS

const User = () => {
  const { cpf } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/usuario/${cpf}`);
        setUserData(response.data);
      } catch (err) {
        setError('Erro ao buscar dados do usuário');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [cpf]);

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="user-container hide-sidebar">
      {userData ? (
        <div className="user-data">
          <h1>Dados do Usuário</h1>
          <p><strong>Nome:</strong> {userData.nome}</p>
          <p><strong>CPF:</strong> {userData.cpf}</p>
          <p><strong>Telefone:</strong> {userData.celular}</p>
          <p><strong>Categoria:</strong> {userData.categoria}</p>
          {userData.foto && <img src={userData.foto} alt="Foto do usuário" className="user-photo" />}
        
        </div>
      ) : (
        <div className="not-found">Usuário não encontrado</div>
      )}
    </div>
  );
};

export default User;