import React, { useState, useEffect } from "react";

const Home = () => {
  const [livros, setLivros] = useState([]);
  const [busca, setBusca] = useState("");
  const [timeoutId, setTimeoutId] = useState(null);

  const buscarLivros = async (query) => {
    if (!query) return;
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query}`
      );
      const data = await response.json();
      if (data.items) {
        // adiciona status vazio inicialmente
        const livrosComStatus = data.items.map((livro) => ({
          ...livro,
          status: "",
        }));
        setLivros(livrosComStatus);
      }
    } catch (error) {
      console.error("Erro ao buscar livros:", error);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setBusca(value);

    if (timeoutId) clearTimeout(timeoutId);
    const newTimeoutId = setTimeout(() => {
      buscarLivros(value);
    }, 500);
    setTimeoutId(newTimeoutId);
  };

  // Função para salvar/atualizar status no backend
  const handleStatusChange = async (book, newStatus) => {
    try {
      const bookToSave = {
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors || [],
        description: book.volumeInfo.description || "",
        thumbnail: book.volumeInfo.imageLinks?.thumbnail || "",
        status: newStatus,
      };

      if (book.idBanco) {
        // Já existe no banco -> PATCH apenas status
        await fetch(`http://localhost:8080/api/books/${book.idBanco}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
      } else {
        // Ainda não existe -> POST livro completo
        const response = await fetch("http://localhost:8080/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookToSave),
        });

        const savedBook = await response.json();
        book.idBanco = savedBook.id; // guarda o id do banco no objeto
      }

      // Atualiza estado local
      setLivros((prevLivros) =>
        prevLivros.map((l) =>
          l.id === book.id
            ? { ...l, status: newStatus, idBanco: book.idBanco }
            : l
        )
      );
    } catch (error) {
      console.error("Erro ao salvar/atualizar livro:", error);
    }
  };

  return (
    <div>
      <h1>Biblioteca</h1>
      <input
        type="text"
        placeholder="Buscar livros..."
        value={busca}
        onChange={handleChange}
      />
      <div className="livros-container">
        {livros.map((livro) => (
          <div key={livro.id} className="livro-card">
            <img
              src={livro.volumeInfo.imageLinks?.thumbnail}
              alt={livro.volumeInfo.title}
            />
            <h3>{livro.volumeInfo.title}</h3>
            <p>{livro.volumeInfo.authors?.join(", ")}</p>
            <p>{livro.volumeInfo.description}</p>
            <div className="botoes">
              <button onClick={() => handleStatusChange(livro, "JA_LI")}>
                Já li
              </button>
              <button onClick={() => handleStatusChange(livro, "QUERO_LER")}>
                Quero ler
              </button>
              <p>Status: {livro.status || "Nenhum"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
