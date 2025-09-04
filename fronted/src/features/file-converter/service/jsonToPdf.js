import { jsPDF } from 'jspdf';

async function generateIndividualPdfs(jsonFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target.result || event.target.result.trim() === '') {
          throw new Error("El archivo JSON está vacío");
        }

        let jsonData;
        try {
          jsonData = JSON.parse(event.target.result);
        } catch (parseError) {
          if (parseError.message.includes("Unexpected end of JSON input")) {
            throw new Error("El archivo no es un JSON válido");
          } 
        }
      
        const requiredFields = ['Carrera(s)', 'Nombre', 'Codigo SIS', 'Apellidos(s)'];
        const missingFields = requiredFields.filter(field => !jsonData[field]);
        
        if (missingFields.length > 0) {
          throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`);
        }

        if (typeof jsonData['Carrera(s)'] !== 'object' || jsonData['Carrera(s)'] === null) {
          throw new Error("El campo 'Carrera(s)' debe ser un objeto con las carreras");
        }

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

        resolve({ individualPdfs :pdfs,
                  sisCode: jsonData['Codigo SIS']
                });
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