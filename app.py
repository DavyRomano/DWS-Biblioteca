from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import sqlite3
from pathlib import Path

app = Flask(__name__)
CORS(app)

banco = Path(__file__).with_name("biblioteca.db")

def conectar():
    conexao = sqlite3.connect(banco)
    conexao.row_factory = sqlite3.Row
    return conexao

def criar_tabela():
    conexao = conectar()
    conexao.execute("""
        CREATE TABLE IF NOT EXISTS livros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            autor TEXT NOT NULL,
            ano_publicacao INTEGER,
            disponivel INTEGER DEFAULT 1
        )
    """)
    conexao.commit()
    conexao.close()

@app.route("/")
def inicio():
    return render_template("index.html")

@app.route("/livros", methods=["GET"])
def listar_livros():
    try:
        conexao = conectar()
        livros = conexao.execute(
            "SELECT id, titulo, autor, ano_publicacao, disponivel FROM livros ORDER BY id DESC"
        ).fetchall()
        conexao.close()
        return jsonify([dict(livro) for livro in livros])
    except sqlite3.Error:
        return jsonify({"erro": "Erro ao buscar os livros."}), 500

@app.route("/livros", methods=["POST"])
def cadastrar_livro():
    dados = request.get_json(silent=True)

    if not dados:
        return jsonify({"erro": "Envie os dados do livro."}), 400

    titulo = str(dados.get("titulo", "")).strip()
    autor = str(dados.get("autor", "")).strip()
    ano = dados.get("ano_publicacao")

    if not titulo or not autor or ano in (None, ""):
        return jsonify({"erro": "Preencha todos os campos."}), 400

    try:
        ano = int(ano)
        conexao = conectar()
        conexao.execute(
            "INSERT INTO livros (titulo, autor, ano_publicacao) VALUES (?, ?, ?)",
            (titulo, autor, ano)
        )
        conexao.commit()
        conexao.close()
        return jsonify({"mensagem": "Livro cadastrado!"}), 201
    except (ValueError, TypeError):
        return jsonify({"erro": "Digite um ano válido."}), 400
    except sqlite3.Error:
        return jsonify({"erro": "Erro ao salvar o livro."}), 500

if __name__ == "__main__":
    criar_tabela()
    app.run(debug=True)
