"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import "../app/Home.css"

const Home = () => {
  const [livros, setLivros] = useState([])
  const [busca, setBusca] = useState("")
  const [timeoutId, setTimeoutId] = useState(null)

  const buscarLivros = async (query) => {
    if (!query) return
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`)
      const data = await response.json()
      if (data.items) {
        const livrosComStatus = data.items.map((livro) => ({
          ...livro,
          status: "",
        }))
        setLivros(livrosComStatus)
      }
    } catch (error) {
      console.error("Erro ao buscar livros:", error)
    }
  }

  const handleChange = (e) => {
    const value = e.target.value
    setBusca(value)

    if (timeoutId) clearTimeout(timeoutId)
    const newTimeoutId = setTimeout(() => {
      buscarLivros(value)
    }, 500)
    setTimeoutId(newTimeoutId)
  }

  const handleStatusChange = async (book, newStatus) => {
    try {
      const bookToSave = {
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors || [],
        description: book.volumeInfo.description || "",
        thumbnail: book.volumeInfo.imageLinks?.thumbnail || "",
        status: newStatus,
      }

      if (book.idBanco) {
        await fetch(`http://localhost:8080/api/books/${book.idBanco}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        })
      } else {
        const response = await fetch("http://localhost:8080/api/books", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookToSave),
        })

        const savedBook = await response.json()
        book.idBanco = savedBook.id
      }

      setLivros((prevLivros) =>
        prevLivros.map((l) => (l.id === book.id ? { ...l, status: newStatus, idBanco: book.idBanco } : l)),
      )
    } catch (error) {
      console.error("Erro ao salvar/atualizar livro:", error)
    }
  }

  return (
    <div className="home-container">
      <div className="header">
        <div className="header-content">
          <h1 className="logo">Minha Biblioteca Pessoal</h1>
          <nav>
            <Link to="/meus-livros" className="nav-link">
              Meus Livros Salvos
            </Link>
          </nav>
        </div>
      </div>

      <div className="main-content">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por título ou autor..."
            value={busca}
            onChange={handleChange}
            className="search-input"
          />
        </div>

        <div className="books-grid">
          {livros.map((livro) => (
            <div key={livro.id} className="book-card">
              <div className="book-content">
                <img
                  src={
                    livro.volumeInfo.imageLinks?.thumbnail || "/placeholder.svg?height=200&width=150&query=book cover"
                  }
                  alt={livro.volumeInfo.title}
                  className="book-cover"
                />
                <div className="book-info">
                  <h3 className="book-title">{livro.volumeInfo.title}</h3>
                  <p className="book-author">{livro.volumeInfo.authors?.join(", ") || "Autor desconhecido"}</p>
                  <p className="book-description">
                    {livro.volumeInfo.description
                      ? livro.volumeInfo.description.substring(0, 150) + "..."
                      : "Sem descrição disponível"}
                  </p>
                  <div className="book-actions">
                    <button
                      onClick={() => handleStatusChange(livro, "QUERO_LER")}
                      className={`status-button want-to-read ${livro.status === "QUERO_LER" ? "active" : ""}`}
                    >
                      Quero Ler
                    </button>
                    <button
                      onClick={() => handleStatusChange(livro, "LENDO")}
                      className={`status-button reading ${livro.status === "LENDO" ? "active" : ""}`}
                    >
                      Lendo
                    </button>
                    <button
                      onClick={() => handleStatusChange(livro, "LIDO")}
                      className={`status-button already-read ${livro.status === "LIDO" ? "active" : ""}`}
                    >
                      Já Li
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
