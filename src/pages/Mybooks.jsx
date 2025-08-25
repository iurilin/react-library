"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import "../app/Mybooks.css"

function MyBooks() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/books")
        if (!response.ok) {
          throw new Error("Erro ao buscar livros")
        }
        const data = await response.json()
        setBooks(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  const formatStatus = (status) => {
  const normalized = status.toLowerCase();

  const statusMap = {
    quero_ler: { text: "QUERO LER", class: "want-to-read" },
    lendo: { text: "LENDO", class: "reading" },
    lido: { text: "LIDO", class: "already-read" },
  };

  return statusMap[normalized] || { text: normalized.replace(/_/g, " "), class: "default" };
};

  if (loading)
    return (
      <div className="my-books-container">
        <div className="loading">Carregando...</div>
      </div>
    )

  if (error)
    return (
      <div className="my-books-container">
        <div className="error">Erro: {error}</div>
      </div>
    )

  return (
    <div className="my-books-container">
      <div className="my-books-header">
        <Link to="/" className="back-button">
          ← Voltar para Home
        </Link>
        <h2 className="my-books-title">Meus Livros</h2>
      </div>

      {books.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum livro salvo ainda.</p>
          <Link to="/" className="home-link">
            Buscar livros para adicionar
          </Link>
        </div>
      ) : (
        <div className="books-grid">
          {books.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-authors">{book.authors}</p>
                <div className="book-status">
                  <span className={`status-badge ${formatStatus(book.status).class}`}>
                    {formatStatus(book.status).text}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyBooks
