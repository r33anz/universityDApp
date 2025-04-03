import UseCaseKardexRequest from "../../application/usesCases/kardex/UseCaseKardexRequest.js";

class PdfController{

    async uploadFile(req,res){
        try {
            if (!req.file) {
              return res.status(400).json({ error: "No se proporcionó archivo PDF" });
            }
      
            const result = await UseCaseKardexRequest.uploadingKardexToIPFS({
              buffer: req.file.buffer,
              filename: req.file.originalname,
              sisCode: req.body.sisCode
            });
      
            if(result.success){
                res.status(201).json({
                    success:true
                })
            }
          } catch (error) {
            return res.status(500).json({ 
              error: error.message 
            });
          }
    }
}

export default new PdfController();