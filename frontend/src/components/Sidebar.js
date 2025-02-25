import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css'; // Importe o arquivo CSS

const Sidebar = () => {
  const location = useLocation();

  // Não renderizar a sidebar na rota /usuario/:cpf
  if (location.pathname.startsWith('/user/')) {
    return null;
  }

  return (
    <div className="sidebar d-flex flex-column">
      <Nav className="flex-column">
        <Nav.Link as={NavLink} to="/" exact="true">
          Home
        </Nav.Link>
        <Nav.Link as={NavLink} to="/qrcodes">
          Qrcod Cadastrados
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default Sidebar;