import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import User from './components/User';
import 'bootstrap/dist/css/bootstrap.min.css';

// ...outros imports...

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/user/:cpf" component={User} />
        {/* outras rotas */}
      </Switch>
    </Router>
  );
}

export default App;