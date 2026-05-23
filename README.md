# 💰 Finance Manager

Aplicação web para gerenciamento de finanças pessoais. Permite cadastrar **categorias** e **transações financeiras**, com filtros, busca em tempo real e resumo do saldo atualizado automaticamente.

---

## 🛠 Tecnologias

- **Backend:** Node.js + Express.js
- **Banco de Dados:** MySQL
- **Frontend:** HTML5, CSS3 e JavaScript puro

---

## 📁 Estrutura do Projeto

```
finance-manager/
├── .gitignore
├── .vscode/
│   └── settings.json
├── README.md
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── server.js
│   ├── db.js
│   └── routes/
│       ├── categorias.js
│       └── transacoes.js
└── frontend/
    ├── index.html
    ├── style.css
    └── app.js
```

---

## ✅ Pré-requisitos

- [Node.js](https://nodejs.org/) v18 ou superior
- [MySQL](https://dev.mysql.com/downloads/workbench/) com MySQL Workbench
- [VS Code](https://code.visualstudio.com/) com a extensão **Live Server**

---

## 🗄 Configuração do Banco de Dados

Abra o MySQL Workbench e execute:

```sql
CREATE DATABASE IF NOT EXISTS finance_manager;
USE finance_manager;

CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo ENUM('receita', 'despesa') NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    data DATE NOT NULL,
    categoria_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);
```

---

## ⚙️ Configuração do Backend

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/Ruanlucas42/finance-manager.git
cd finance-manager/backend
npm install
```

### Dependências

| Pacote | Função |
|--------|--------|
| `express` | Framework para criação das rotas da API |
| `mysql2` | Conexão com o MySQL |
| `cors` | Permite o frontend acessar a API |
| `dotenv` | Carrega as variáveis de ambiente |

### Variáveis de Ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env
```

Edite o `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=finance_manager
PORT=3000
```

> ⚠️ O arquivo `.env` está no `.gitignore` e **não deve ser enviado ao repositório**.

---

## ▶️ Rodando a Aplicação

**Backend** — dentro da pasta `backend/`:

```bash
node server.js
```

A API estará disponível em `http://localhost:3000`.

**Frontend** — no VS Code, clique com o botão direito em `frontend/index.html` e selecione **"Open with Live Server"**.
