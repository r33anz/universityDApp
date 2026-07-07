'use strict';

const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Función para convertir nombres a formato slug (para nombres de archivo)
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-')
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Elimina acentos
}

// Lista completa de materias (sin horas)
const materias = [
  "Álgebra I",
  "Cálculo I",
  "Física General",
  "Inglés I",
  "Introducción a la Programación",
  "Álgebra II",
  "Arquitectura de Computadoras I",
  "Cálculo II",
  "Elementos de Programación y Estructura de Datos",
  "Inglés II",
  "Programación",
  "Arquitectura de Computadoras II",
  "Cálculo Numérico",
  "Lógica",
  "Métodos y Técnicas de Programación",
  "Organización y Métodos",
  "Teoría de Grafos",
  "Algoritmos Avanzados",
  "Base de Datos I",
  "Probabilidad y Estadística",
  "Programación Funcional",
  "Sistemas de Información I",
  "Taller de Programación en Bajo Nivel",
  "Base de Datos II",
  "Graficación por Computadora",
  "Inteligencia Artificial I",
  "Sistemas de Información II",
  "Taller de Sistemas Operativos",
  "Teoría de Autómatas y Lenguajes Formales",
  "Estructura y Semántica de Lenguajes de Programación",
  "Ingeniería de Software",
  "Inteligencia Artificial II",
  "Programación Web",
  "Redes de Computadoras",
  "Taller de Base de Datos",
  "Arquitectura de Software",
  "Interacción Humano Computador",
  "Taller de Ingeniería de Software",
  "Tecnología de Redes Avanzadas",
  "Taller de Grado I",
  "Evaluación y Auditoría de Sistemas"
];

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Crear directorio uploads si no existe
      const uploadsDir = path.join(__dirname, '../../uploads');
      try {
        await fs.access(uploadsDir);
      } catch {
        await fs.mkdir(uploadsDir);
      }

      // Preparar datos para inserción
      const globalPlansData = materias.map((materia, index) => ({
        id: index + 1, 
        materia: materia,
        path: path.join('uploads', `${toSlug(materia)}.pdf`),
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      // Insertar todos los registros
      await queryInterface.bulkInsert('GlobalPlans', globalPlansData);

      
    } catch (error) {
      
      throw error; // Sequelize CLI manejará el error
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Eliminar todos los registros
      await queryInterface.bulkDelete('GlobalPlans', null, {});
      console.log('↩️ Seeder revertido: Todas las materias eliminadas');
    } catch (error) {
      console.error('❌ Error al revertir el seeder:', error);
      throw error;
    }
  }
};