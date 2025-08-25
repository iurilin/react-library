import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'; 
import Mybooks from './pages/Mybooks'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota para a página inicial */}
        <Route path="/" element={<Home />} />

        {/* Rota para a página de livros salvos */}
        <Route path="/meus-livros" element={<Mybooks />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;