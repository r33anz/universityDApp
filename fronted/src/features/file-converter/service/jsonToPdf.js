import { jsPDF } from 'jspdf';

function parseAndValidateJson(text) {
  if (!text || text.trim() === '') {
    throw new Error("El archivo JSON está vacío");
  }

  let jsonData;
  try {
    jsonData = JSON.parse(text);
  } catch (parseError) {
    throw new Error("El archivo no es un JSON válido");
  }

  const requiredFields = ['Carrera(s)', 'Nombre', 'Codigo SIS', 'Apellidos(s)'];
  const missingFields = requiredFields.filter(field => !jsonData[field]);

  if (missingFields.length > 0) {
    throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`);
  }

  if (typeof jsonData['Carrera(s)'] !== 'object' || jsonData['Carrera(s)'] === null) {
    throw new Error("El campo 'Carrera(s)' debe ser un objeto con las carreras");
  }

  return jsonData;
}

function generatePdfsFromData(jsonData) {
  const pdfs = [];
  const studentInfo = {
    name: `${jsonData.Nombre} ${jsonData['Apellidos(s)']}`,
    sisCode: jsonData['Codigo SIS']
  };

  Object.entries(jsonData['Carrera(s)']).forEach(([careerName, careerData]) => {
    if (!careerData.Materias) return;

    Object.entries(careerData.Materias).forEach(([subjectName, subjectData]) => {
      const doc = new jsPDF();

      doc.setFont('helvetica');
      doc.setFontSize(16);
      doc.text(`INFORMACIÓN ACADÉMICA`, 105, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.text(`Nombre: ${studentInfo.name}`, 14, 30);
      doc.text(`Código SIS: ${studentInfo.sisCode}`, 14, 38);
      doc.text(`Carrera: ${careerName}`, 14, 46);

      doc.setFontSize(14);
      doc.text(`Materia: ${subjectName}`, 14, 60);

      const details = [
        { label: 'Nota', value: subjectData.Nota },
        { label: 'Créditos', value: subjectData.Creditos },
        { label: 'Gestión', value: subjectData.Gestion }
      ];

      let yPosition = 70;
      details.forEach(detail => {
        doc.setFontSize(12);
        doc.text(`${detail.label}: ${detail.value}`, 14, yPosition);
        yPosition += 10;
      });

      const pdfBlob = doc.output('blob');

      pdfs.push({
        filename: `${subjectName.normalize('NFD').replace(/[̀-ͯ]/g, "")}.pdf`,
        blob: pdfBlob,
        path: `/${studentInfo.sisCode}/${careerName}/`,
        career: careerName,
        subject: subjectName,
        nota: subjectData.Nota,
        creditos: subjectData.Creditos,
        gestion: subjectData.Gestion
      });
    });
  });

  if (pdfs.length === 0) {
    throw new Error('No se generaron PDFs. Verifica que el JSON contenga materias.');
  }

  return {
    individualPdfs: pdfs,
    sisCode: jsonData['Codigo SIS'],
    studentName: `${jsonData.Nombre} ${jsonData['Apellidos(s)']}`
  };
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsText(file);
  });
}

async function generateIndividualPdfs(jsonFile) {
  const text = await readFileAsText(jsonFile);
  const jsonData = parseAndValidateJson(text);
  return generatePdfsFromData(jsonData);
}

export { generateIndividualPdfs };
