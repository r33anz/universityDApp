
---
# 📚 DApp Universitaria – Proyecto Completo

## 🧩 Estructura del Proyecto
Este repositorio contiene los tres componentes principales de la aplicación descentralizada (**DApp Universitaria**) organizados en carpetas separadas:


## ⚙️ Descripción General

- **Frontend**  
  Aplicación React que permite la interacción con la blockchain, gestión de credenciales y visualización de información universitaria.

- **Backend (Server)**  
  Servidor Node.js/Express que gestiona la lógica de negocio, comunicación con la blockchain, almacenamiento en IPFS y base de datos relacional mediante Sequelize.

- **Hardhat**  
  Entorno de desarrollo y pruebas para contratos inteligentes. Incluye scripts de despliegue, migraciones y actualizaciones de contratos.

---

## ▶️ Ejecución Individual

Cada componente debe ejecutarse de forma separada:

```bash
# Frontend
cd frontend
npm install
npm start

# Backend
cd server
npm install
ipfs daemon  # Iniciar IPFS antes del servidor
npm start

# Hardhat
cd hardhat
npm install
npx hardhat test
