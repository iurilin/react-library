import React, { useState, useEffect } from 'react';
import api from '../service/Api.js';

function Home() {
  const [busca, setBusca] = useState('');
  const [tipoBusca, setTipoBusca] = useState('titulo'); // 'titulo', 'autor' ou 'ambos'
  const [livros, setLivros] = useState([]); // <-- ADICIONADO
  const [timeoutId, setTimeoutId] = useState(null);

  // Função que monta a query e faz a requisição
  const buscarLivros = async () => {
    if (busca.trim() === '') {
      setLivros([]);
      return;
    }

    let query = '';
    if (tipoBusca === 'titulo') {
      query = `intitle:${busca}`;
    } else if (tipoBusca === 'autor') {
      query = `inauthor:${busca}`;
    } else if (tipoBusca === 'ambos') {
      query = `intitle:${busca}+inauthor:${busca}`;
    }

    try {
      const response = await api.get(`/books/search?query=${query}`);
      setLivros(response.data.items || []); // <- CORRIGIDO com .items
    } catch (error) {
      console.error('Erro ao buscar livros:', error);
      setLivros([]); // <- Em caso de erro, limpa a lista
    }
  };

  // Debounce (espera 500ms após parar de digitar)
  useEffect(() => {
    if (timeoutId) clearTimeout(timeoutId);

    const novoTimeout = setTimeout(() => {
      buscarLivros();
    }, 500);

    setTimeoutId(novoTimeout);
  }, [busca, tipoBusca]);

  // Enter → busca imediata
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (timeoutId) clearTimeout(timeoutId);
      buscarLivros();
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Buscar Livros</h1>

      {/* Campo de busca */}
      <input
        type="text"
        placeholder="Digite sua busca"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ width: '300px', padding: '8px', fontSize: '16px' }}
      />

      {/* Seletor de tipo de busca */}
      <select
        value={tipoBusca}
        onChange={(e) => setTipoBusca(e.target.value)}
        style={{ marginLeft: '10px', padding: '8px', fontSize: '16px' }}
      >
        <option value="titulo">Título</option>
        <option value="autor">Autor</option>
        <option value="ambos">Título + Autor</option>
      </select>

      {/* Lista de livros */}
      <div style={{ marginTop: '20px' }}>
        {livros.length === 0 && <p>Nenhum livro encontrado.</p>}

        {livros.map((livro, index) => {
          const info = livro.volumeInfo || {};
          return (
            <div
              key={index}
              style={{
                border: '1px solid #ccc',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '5px'
              }}
            >
              <h3>{info.title}</h3>
              <p><strong>Autor:</strong> {info.authors ? info.authors.join(', ') : 'Desconhecido'}</p>
              <p><strong>Editora:</strong> {info.publisher || 'Desconhecida'}</p>
              <p><strong>Ano:</strong> {info.publishedDate || 'Indefinido'}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Home;
