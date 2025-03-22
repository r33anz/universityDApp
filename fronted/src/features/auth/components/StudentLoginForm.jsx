import React,{useState} from "react";
import { Button } from "../../../shared/components/Button";
import {Input} from "../../../shared/components/Input";
import {Label} from "../../../shared/components/Label";
import SeedPhraseModal  from "../../wallet/SeedPhraseModal";
import { loginStudent } from "../service/studentService";
import { useToastContext } from "../../../shared/providers/ToastProvider";
import { ApiError } from "../../../shared/lib/apiError";

const  StudentLoginForm = () => {
    const [codigoSIS, setCodigoSIS] = useState("")
    const [loading, setLoading] = useState(false)
    const [showSeedPhrase, setShowSeedPhrase] = useState(false)
    const [seedPhrase, setSeedPhrase] = useState(" ")
    const toast = useToastContext()

    const handleSubmit = async (e) => {
        try {
            e.preventDefault()
            setLoading(true)
            const credential = {SISCode:codigoSIS};
            const response = await loginStudent(credential);
            const seedPhrase = response.mnemonic 
            setSeedPhrase(seedPhrase)
            setShowSeedPhrase(true)
        } catch (error) {
            if (error.response?.data) {
                const apiError = new ApiError(
                    error.response.data.message,
                    error.response.data.errorCode,
                    error.response.data.details
                );

                toast.error(apiError.getStatusErrorMessage())
            } else if (error instanceof ApiError || error.name === "ApiError") {
                toast.error(error.getStatusErrorMessage())
            } else{
                toast.error("Ocurrió un error inesperado")
            }
        } finally {
            setLoading(false)
        }
    }
  
    return (
      <>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="codigoSIS" className="text-[#184494ff] font-medium">
              Código SIS
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">{/* SVG icon */}</div>
              <Input
                id="codigoSIS"
                type="text"
                placeholder="Ingrese su código SIS"
                value={codigoSIS}
                onChange={(e) => setCodigoSIS(e.target.value)}
                required
                className="pl-10 border-gray-300 focus-visible:ring-[#184494ff]"
              />
            </div>
          </div>
  
          <Button type="submit" className="w-full bg-[#184494ff] hover:bg-[#184494ff]/90 text-white" disabled={loading}>
            {loading ? "Procesando..." : "Solicitar Credenciales"}
          </Button>
  
        </form>
  
        <SeedPhraseModal 
            isOpen={showSeedPhrase} 
            onClose={() => setShowSeedPhrase(false)}
            seedPhrase={seedPhrase}
            />
      </>
    )
  }

export default StudentLoginForm;