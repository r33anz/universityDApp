import UseCaseKardexRequest from "../../application/usesCases/kardex/UseCaseKardexRequest.js";

class PdfController{

    async uploadFile(req,res){
        try {
            if (!req.files || req.files.length === 0) {
              return res.status(400).json({ error: "No se proporcionó archivo PDF" });
            }

            const files = req.files.map((file, i) => ({
              blob: file.buffer,
              filename: file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, ""),
              path: `/${req.body.sisCode}/${req.body.careers[i]}/`, 
              career: req.body.careers[i],
              subject: req.body.subject[i],
              sisCode: req.body.sisCode,
            }));
      
            const result = await UseCaseKardexRequest.uploadingKardexToIPFS(files);
            return res.status(201).json({
              success: true
            });
            
        } catch (error) {
          console.error('Error en PDF Controller:', error);
          return res.status(500).json({ 
            error: error.message 
          });
        }
    }
}

export default new PdfController();