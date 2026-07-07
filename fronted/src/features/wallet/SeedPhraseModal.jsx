import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../shared/components/Dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../shared/components/AlertDialog";
import {
  AlertTriangleIcon,
  ShieldIcon,
  CheckIcon,
  EyeOffIcon,
  EyeIcon,
  CopyIcon,
} from "../../shared/components/Icons";
import { Checkbox } from "../../shared/components/CheckBox";
import { Button } from "../../shared/components/Button";
import { copyToClipboard } from "../../shared/lib/clipboard";
import React, { useState, useEffect, useRef } from "react";

const CLIPBOARD_CLEAR_MS = 30_000;

/**
 * Single source of truth for the "I confirm…" rows shown in step 1 and step 2.
 * Both rows must look and behave identically (same Checkbox, same label
 * typography, same spacing) — extracting them guarantees no drift if styles
 * change later.
 */
function ConfirmRow({ id, checked, onChange, children }) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id={id} checked={checked} onChange={onChange} />
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none theme-text peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {children}
      </label>
    </div>
  );
}

const SeedPhraseModal = ({ isOpen, onClose, seedPhrase }) => {
    const [showSeedPhrase, setShowSeedPhrase] = useState(false)
    const [copied, setCopied] = useState(false)
    const [confirmedChecked, setConfirmedChecked] = useState(false)
    const [showCloseWarning, setShowCloseWarning] = useState(false)
    const [step, setStep] = useState(1)
    const seedWords = seedPhrase.split(" ")

    // Track the pending clipboard-wipe so we can cancel it if the user copies
    // again before the previous timer fires, and so we can wipe immediately
    // when the modal closes.
    const clipboardWipeRef = useRef(null)

    useEffect(() => {
      if (isOpen) {
        setShowSeedPhrase(false)
        setCopied(false)
        setConfirmedChecked(false)
        setStep(1)
      }
    }, [isOpen])

    // Reset the confirm-checkbox on EVERY step change (including the initial
    // mount). Each step must start with the checkbox unchecked so the user
    // re-affirms before continuing — prevents the "next button already active"
    // bug when going 1 → 2 or coming back via "Atrás".
    // The explicit reset in the isOpen-effect above covers the edge case where
    // the user closes and reopens the modal while step is already 1 (React
    // won't re-fire this effect because the value didn't change).
    useEffect(() => {
      setConfirmedChecked(false);
    }, [step]);

    // UX-4: auto-hide the seed when the tab/window loses visibility.
    useEffect(() => {
      if (!isOpen) return;
      const onVisibilityChange = () => {
        if (document.hidden) setShowSeedPhrase(false);
      };
      document.addEventListener("visibilitychange", onVisibilityChange);
      return () => document.removeEventListener("visibilitychange", onVisibilityChange);
    }, [isOpen]);

    // UX-6: prevent accidental tab/window close while the security flow is mid-way.
    useEffect(() => {
      if (!isOpen || step >= 3) return;
      const onBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = "";
      };
      window.addEventListener("beforeunload", onBeforeUnload);
      return () => window.removeEventListener("beforeunload", onBeforeUnload);
    }, [isOpen, step]);

    // UX-1: when the modal closes, wipe any pending clipboard immediately and
    // cancel a scheduled wipe (the close itself is "intent fulfilled or aborted").
    useEffect(() => {
      if (isOpen) return;
      if (clipboardWipeRef.current) {
        clearTimeout(clipboardWipeRef.current);
        clipboardWipeRef.current = null;
      }
      navigator.clipboard?.writeText("").catch(() => {});
    }, [isOpen]);

    const handleCopy = async () => {
      const success = await copyToClipboard(seedPhrase)
      if (success) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)

        // UX-1: schedule a clipboard wipe so the seed doesn't linger
        // in the OS clipboard indefinitely.
        if (clipboardWipeRef.current) clearTimeout(clipboardWipeRef.current);
        clipboardWipeRef.current = setTimeout(() => {
          navigator.clipboard?.writeText("").catch(() => {});
          clipboardWipeRef.current = null;
        }, CLIPBOARD_CLEAR_MS);
      }
    }

    const handleClose = () => {
      if (step < 3) {
        setShowCloseWarning(true)
      } else {
        onClose({ completed: true })
      }
    }

    const handleConfirmClose = () => {
      setShowCloseWarning(false)
      onClose({ completed: false })
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
              <DialogTitle className="text-brand-blue dark:text-blue-300 flex items-center">
                {step === 1 && (
                  <>
                    <AlertTriangleIcon className="h-5 w-5 text-brand-gold mr-2" />
                    Frase de Recuperación Secreta
                  </>
                )}
                {step === 2 && (
                  <>
                    <ShieldIcon className="h-5 w-5 text-brand-teal mr-2" />
                    Revela tu Frase Semilla
                  </>
                )}
                {step === 3 && (
                  <>
                    <CheckIcon className="h-5 w-5 text-brand-teal mr-2" />
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
                <div className="rounded-lg bg-brand-gold/10 dark:bg-brand-gold/15 p-4 border border-brand-gold/30">
                  <div className="flex items-start">
                    <AlertTriangleIcon className="h-5 w-5 text-brand-gold mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-brand-blue dark:text-blue-300">¡Advertencia importante!</h4>
                      <ul className="mt-2 text-sm theme-text-secondary space-y-2">
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

                <ConfirmRow
                  id="confirm-step-1"
                  checked={confirmedChecked}
                  onChange={(e) => setConfirmedChecked(e.target.checked)}
                >
                  Entiendo que es mi responsabilidad guardar mi frase semilla de forma segura
                </ConfirmRow>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
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
                          <CheckIcon className="h-3.5 w-3.5 mr-1 text-brand-teal" />
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

                <div className="relative">
                  <div className={`rounded-lg border p-6 ${showSeedPhrase ? "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10" : "bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10"}`}>
                    {showSeedPhrase ? (
                      // UX-2: block native selection / right-click / copy / drag.
                      // The only sanctioned path to the seed is the explicit
                      // Copy button (which schedules a clipboard wipe).
                      <div
                        className="grid grid-cols-3 gap-4 select-none"
                        style={{ userSelect: "none", WebkitUserSelect: "none" }}
                        onCopy={(e) => e.preventDefault()}
                        onCut={(e) => e.preventDefault()}
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                      >
                        {seedWords.map((word, index) => (
                          <div key={index} className="flex items-center p-2 bg-gray-50 dark:bg-white/5 rounded-md border border-gray-200 dark:border-white/10">
                            <span className="theme-text-tertiary text-sm mr-2">{index + 1}.</span>
                            <span className="text-brand-blue dark:text-blue-300 font-medium">{word}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <EyeOffIcon className="h-16 w-16 theme-text-tertiary mb-4" />
                        <p className="theme-text-secondary text-lg">Tu frase semilla está oculta por seguridad</p>
                        <p className="theme-text-tertiary text-sm mt-2">Haz clic en "Mostrar" para revelarla</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-lg bg-brand-red/10 dark:bg-brand-red/15 p-4 border border-brand-red/30">
                  <div className="flex items-start">
                    <AlertTriangleIcon className="h-5 w-5 text-brand-red mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-brand-blue dark:text-blue-300">¡No hagas capturas de pantalla!</h4>
                      <p className="mt-1 text-sm theme-text-secondary">
                        Las capturas de pantalla pueden ser accedidas por otras aplicaciones y representan un riesgo de
                        seguridad.
                      </p>
                    </div>
                  </div>
                </div>

                <ConfirmRow
                  id="confirm-step-2"
                  checked={confirmedChecked}
                  onChange={(e) => setConfirmedChecked(e.target.checked)}
                >
                  Confirmo que he guardado mi frase semilla en un lugar seguro
                </ConfirmRow>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="rounded-lg bg-brand-teal/10 dark:bg-brand-teal/15 p-4 border border-brand-teal/30">
                  <div className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-brand-teal mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-brand-blue dark:text-blue-300">¡Proceso completado!</h4>
                      <p className="mt-1 text-sm theme-text-secondary">
                        Has completado el proceso de seguridad de tu billetera blockchain. Ahora puedes acceder a tus
                        documentos académicos de forma segura.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg p-4 border theme-card" style={{ borderColor: 'var(--border-secondary)' }}>
                  <h4 className="text-sm font-medium text-brand-blue dark:text-blue-300 mb-2">Recomendaciones finales:</h4>
                  <ul className="text-sm theme-text-secondary space-y-1">
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
                onClick={step < 3 ? handleNextStep : () => onClose({ completed: true })}
              >
                {step < 3 ? "Continuar" : "Finalizar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={showCloseWarning} onOpenChange={setShowCloseWarning}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-brand-red flex items-center">
                <AlertTriangleIcon className="h-5 w-5 mr-2" />
                ¿Estás seguro?
              </AlertDialogTitle>
              <AlertDialogDescription>
                No has completado el proceso de seguridad de tu frase semilla. Si cierras esta ventana, no podrás ver tu
                frase semilla nuevamente y podrías perder acceso a tu billetera blockchain.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              {/* UX-5: flip visual priority — "Cancelar" is now the primary CTA
                  (safer choice, harder to misclick on Enter), and "Sí, cerrar"
                  is rendered as a destructive secondary action. */}
              <AlertDialogCancel
                onClick={handleCancelClose}
                className="bg-brand-blue hover:bg-brand-blue/90 text-white border-transparent"
              >
                Cancelar y volver
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmClose}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Sí, cerrar sin guardar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

export default SeedPhraseModal;
