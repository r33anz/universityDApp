import { jsPDF } from 'jspdf';

async function generateIndividualPdfs(jsonFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        // Validaciones y parseo del JSON
        const jsonData = JSON.parse(event.target.result);
        
        if (!jsonData || !jsonData['Carrera(s)']) {
          throw new Error('Estructura del JSON inválida');
        }

        const pdfs = [];
        const studentInfo = {
          name: `${jsonData.Nombre} ${jsonData['Apellidos(s)']}`,
          sisCode: jsonData['Codigo SIS']
        };

        // Procesar cada carrera
        Object.entries(jsonData['Carrera(s)']).forEach(([careerName, careerData]) => {
          if (!careerData.Materias) return;
          
          // Procesar cada materia
          Object.entries(careerData.Materias).forEach(([subjectName, subjectData]) => {
            const doc = new jsPDF();
            
            // Configuración del documento
            doc.setFont('helvetica');
            doc.setFontSize(16);
            doc.text(`INFORMACIÓN ACADÉMICA`, 105, 20, { align: 'center' });
            
            // Información del estudiante
            doc.setFontSize(12);
            doc.text(`Nombre: ${studentInfo.name}`, 14, 30);
            doc.text(`Código SIS: ${studentInfo.sisCode}`, 14, 38);
            doc.text(`Carrera: ${careerName}`, 14, 46);
            
            // Información de la materia
            doc.setFontSize(14);
            doc.text(`Materia: ${subjectName}`, 14, 60);
            
            // Detalles de la materia
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
            
            // Generar blob
            const pdfBlob = doc.output('blob');
            
            pdfs.push({
              filename: `${subjectName.normalize('NFD').replace(/[\u0300-\u036f]/g, "")}.pdf`,
              blob: pdfBlob,
              path: `/${studentInfo.sisCode}/${careerName}/`,
              career: careerName,
              subject: subjectName
            });
          });
        });

        if (pdfs.length === 0) {
          throw new Error('No se generaron PDFs. Verifica que el JSON contenga materias.');
        }

        resolve(pdfs);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(new Error('Error al leer el archivo: ' + error.message));
    };
    
    reader.readAsText(jsonFile);
  });
}

export {generateIndividualPdfs };