import React,{useState} from "react";
import { Button } from "../../../shared/components/Button";
import {Input} from "../../../shared/components/Input";
import {Label} from "../../../shared/components/Label";
import SeedPhraseModal  from "../../wallet/components/SeedPhraseModal";

const  StudentLoginForm = () => {
    const [codigoSIS, setCodigoSIS] = useState("")
    const [loading, setLoading] = useState(false)
    const [showSeedPhrase, setShowSeedPhrase] = useState(false)
  
    const handleSubmit = async (e) => {
      e.preventDefault()
      setLoading(true)
  
      // Simulación de envío de credenciales
      setTimeout(() => {
        setLoading(false)
        console.log(`Iniciando sesión como estudiante con código: ${codigoSIS}`)
        // Mostrar el modal de frase semilla después del login exitoso
        setShowSeedPhrase(true)
      }, 1500)
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
  
        <SeedPhraseModal isOpen={showSeedPhrase} onClose={() => setShowSeedPhrase(false)} />
      </>
    )
  }

export default StudentLoginForm;