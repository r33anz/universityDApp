import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../shared/components/Dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../shared/components/AlertDialog";
import {
  AlertTriangleIcon,
  ShieldIcon,
  CheckIcon,
  EyeOffIcon,
  EyeIcon,
  CopyIcon,
} from "../../../shared/components/Icons";
import { Checkbox } from "../../../shared/components/CheckBox";
import { Button } from "../../../shared/components/Button";
import React, { useState, useEffect } from "react";

const  SeedPhraseModal = ({ isOpen, onClose }) => {
    const [showSeedPhrase, setShowSeedPhrase] = useState(false)
    const [copied, setCopied] = useState(false)
    const [confirmedChecked, setConfirmedChecked] = useState(false)
    const [showCloseWarning, setShowCloseWarning] = useState(false)
    const [step, setStep] = useState(1)
  
    const seedPhrase = "aaaaa bbbbb ccccccccc dddd eeee fff ggg hhh iii jjjj lll kk"
    const seedWords = seedPhrase.split(" ")
  
    useEffect(() => {
      if (isOpen) {
        setShowSeedPhrase(false)
        setCopied(false)
        setConfirmedChecked(false)
        setStep(1)
      }
    }, [isOpen])
  
    const handleCopy = () => {
      navigator.clipboard.writeText(seedPhrase)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  
    const handleClose = () => {
      if (step < 3) {
        setShowCloseWarning(true)
      } else {
        onClose()
      }
    }
  
    const handleConfirmClose = () => {
      setShowCloseWarning(false)
      onClose()
    }
  
    const handleCancelClose = () => {
      setShowCloseWarning(false)
    }
  
    const handleNextStep = () => {
      setStep(step + 1)
    }
  
    return (
      <>
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#184494ff] flex items-center">
                {step === 1 && (
                  <>
                    <AlertTriangleIcon className="h-5 w-5 text-[#e3b505ff] mr-2" />
                    Frase de Recuperación Secreta
                  </>
                )}
                {step === 2 && (
                  <>
                    <ShieldIcon className="h-5 w-5 text-[#107e7dff] mr-2" />
                    Revela tu Frase Semilla
                  </>
                )}
                {step === 3 && (
                  <>
                    <CheckIcon className="h-5 w-5 text-[#107e7dff] mr-2" />
                    Confirmación
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {step === 1 &&
                  "Tu frase semilla es la clave para acceder a tu billetera blockchain. Si la pierdes, perderás acceso a tus documentos académicos."}
                {step === 2 &&
                  "Guarda estas 12 palabras en un lugar seguro. Esta frase es la única forma de recuperar tu billetera."}
                {step === 3 &&
                  "Has completado el proceso de seguridad. Recuerda mantener tu frase semilla en un lugar seguro y nunca compartirla con nadie."}
              </DialogDescription>
            </DialogHeader>
  
            {step === 1 && (
              <div className="space-y-4">
                <div className="rounded-md bg-[#e3b505ff]/10 p-4 border border-[#e3b505ff]/30">
                  <div className="flex items-start">
                    <AlertTriangleIcon className="h-5 w-5 text-[#e3b505ff] mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-[#184494ff]">¡Advertencia importante!</h4>
                      <ul className="mt-2 text-sm text-gray-600 space-y-2">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Nunca compartas tu frase semilla con nadie.</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Si alguien tiene acceso a tu frase, tendrá acceso completo a tu billetera.</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>TransferKardex nunca te pedirá esta frase.</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Guárdala en un lugar seguro, offline y protegido.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
  
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="confirm"
                    checked={confirmedChecked}
                    onChange={(e) => setConfirmedChecked(e.target.checked)}
                    className="border-[#184494ff] data-[state=checked]:bg-[#184494ff]"
                  />
                  <label
                    htmlFor="confirm"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Entiendo que es mi responsabilidad guardar mi frase semilla de forma segura
                  </label>
                </div>
              </div>
            )}
  
            {step === 2 && (
              <div className="space-y-4">
                {/* Botones de acción en una barra superior separada */}
                <div className="flex justify-end space-x-2 mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                    className="h-8 px-2 text-xs"
                  >
                    {showSeedPhrase ? (
                      <>
                        <EyeOffIcon className="h-3.5 w-3.5 mr-1" />
                        Ocultar
                      </>
                    ) : (
                      <>
                        <EyeIcon className="h-3.5 w-3.5 mr-1" />
                        Mostrar
                      </>
                    )}
                  </Button>

                  {showSeedPhrase && (
                    <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 px-2 text-xs">
                      {copied ? (
                        <>
                          <CheckIcon className="h-3.5 w-3.5 mr-1 text-[#107e7dff]" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <CopyIcon className="h-3.5 w-3.5 mr-1" />
                          Copiar
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Contenedor de la frase semilla */}
                <div className="relative">
                  <div className={`rounded-md border p-6 ${showSeedPhrase ? "bg-white" : "bg-gray-100"}`}>
                    {showSeedPhrase ? (
                      <div className="grid grid-cols-3 gap-4">
                        {seedWords.map((word, index) => (
                          <div key={index} className="flex items-center p-2 bg-gray-50 rounded-md border border-gray-200">
                            <span className="text-gray-500 text-sm mr-2">{index + 1}.</span>
                            <span className="text-[#184494ff] font-medium">{word}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <EyeOffIcon className="h-16 w-16 text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg">Tu frase semilla está oculta por seguridad</p>
                        <p className="text-gray-500 text-sm mt-2">Haz clic en "Mostrar" para revelarla</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-md bg-[#e80414ff]/10 p-4 border border-[#e80414ff]/30">
                  <div className="flex items-start">
                    <AlertTriangleIcon className="h-5 w-5 text-[#e80414ff] mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-[#184494ff]">¡No hagas capturas de pantalla!</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        Las capturas de pantalla pueden ser accedidas por otras aplicaciones y representan un riesgo de
                        seguridad.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="confirm-saved"
                    checked={confirmedChecked}
                    onChange={(e) => setConfirmedChecked(e.target.checked)}
                    className="border-[#184494ff] data-[state=checked]:bg-[#184494ff]"
                  />
                  <label
                    htmlFor="confirm-saved"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Confirmo que he guardado mi frase semilla en un lugar seguro
                  </label>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="rounded-md bg-[#107e7dff]/10 p-4 border border-[#107e7dff]/30">
                  <div className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-[#107e7dff] mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-[#184494ff]">¡Proceso completado!</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        Has completado el proceso de seguridad de tu billetera blockchain. Ahora puedes acceder a tus
                        documentos académicos de forma segura.
                      </p>
                    </div>
                  </div>
                </div>
  
                <div className="rounded-md bg-white p-4 border border-gray-200">
                  <h4 className="text-sm font-medium text-[#184494ff] mb-2">Recomendaciones finales:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Considera escribir tu frase en papel y guardarla en un lugar seguro.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>No guardes tu frase en archivos digitales sin cifrar.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Si sospechas que alguien conoce tu frase, crea una nueva billetera inmediatamente.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
  
            <DialogFooter className="flex justify-between sm:justify-between">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                  Atrás
                </Button>
              )}
  
              <Button
                type="button"
                disabled={!confirmedChecked && step < 3}
                onClick={step < 3 ? handleNextStep : onClose}
                className="bg-[#184494ff] hover:bg-[#184494ff]/90"
              >
                {step < 3 ? "Continuar" : "Finalizar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
  
        {/* Diálogo de advertencia al cerrar */}
        <AlertDialog open={showCloseWarning} onOpenChange={setShowCloseWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[#e80414ff] flex items-center">
                <AlertTriangleIcon className="h-5 w-5 mr-2" />
                ¿Estás seguro?
              </AlertDialogTitle>
              <AlertDialogDescription>
                No has completado el proceso de seguridad de tu frase semilla. Si cierras esta ventana, no podrás ver tu
                frase semilla nuevamente y podrías perder acceso a tu billetera blockchain.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleCancelClose}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmClose} className="bg-[#e80414ff] hover:bg-[#e80414ff]/90">
                Sí, cerrar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

export default SeedPhraseModal;