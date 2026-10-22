from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import sqlite3
from pathlib import Path

app = Flask(__name__)
CORS(app)

# Usa o mesmo arquivo biblioteca.db do projeto de POO.
BANCO = Path(__file__).with_name("biblioteca.db")


def conectar():
    conexao = sqlite3.connect(BANCO)
    conexao.row_factory = sqlite3.Row
    return conexao


def preparar_banco():
    # Cria a tabela apenas se ela ainda não existir.
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
            "SELECT id, titulo, autor, ano_publicacao, disponivel "
            "FROM livros ORDER BY id DESC"
        ).fetchall()
        conexao.close()
        return jsonify([dict(livro) for livro in livros])
    except sqlite3.Error:
        return jsonify({"erro": "Não foi possível buscar os livros."}), 500


@app.route("/livros", methods=["POST"])
def cadastrar_livro():
    dados = request.get_json(silent=True)

    if not dados:
        return jsonify({"erro": "Envie os dados do livro em JSON."}), 400

    titulo = str(dados.get("titulo", "")).strip()
    autor = str(dados.get("autor", "")).strip()
    ano = dados.get("ano_publicacao")

    if not titulo or not autor or ano in (None, ""):
        return jsonify({"erro": "Preencha título, autor e ano."}), 400

    try:
        ano = int(ano)
        conexao = conectar()
        cursor = conexao.execute(
            "INSERT INTO livros (titulo, autor, ano_publicacao, disponivel) "
            "VALUES (?, ?, ?, 1)",
            (titulo, autor, ano)
        )
        conexao.commit()
        novo_id = cursor.lastrowid
        conexao.close()

        return jsonify({
            "mensagem": "Livro cadastrado com sucesso!",
            "id": novo_id
        }), 201
    except (ValueError, TypeError):
        return jsonify({"erro": "O ano precisa ser um número inteiro."}), 400
    except sqlite3.Error:
        return jsonify({"erro": "Erro ao salvar o livro no banco."}), 500


if __name__ == "__main__":
    preparar_banco()
    app.run(debug=True)
