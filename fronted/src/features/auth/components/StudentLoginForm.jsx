import React, { useState } from "react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { Label } from "../../../shared/components/Label";
import SeedPhraseModal from "../../wallet/SeedPhraseModal";
import { loginStudent, getStudentStatus } from "../service/studentService";
import { useToastContext } from "../../../shared/providers/ToastProvider";
import { getApiErrorMessage } from "../../../shared/lib/apiError";

const MIN_SIS_LENGTH = 7;

const StudentLoginForm = () => {
    const [codigoSIS, setCodigoSIS] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSeedPhrase, setShowSeedPhrase] = useState(false);
    const [seedPhrase, setSeedPhrase] = useState("");
    // null = no check yet, object = result of last on-blur lookup
    const [statusHint, setStatusHint] = useState(null);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const toast = useToastContext();

    const handleSubmit = async (e) => {
      try {
        e.preventDefault();
        if (statusHint?.hasCredential) return; // belt-and-suspenders
        setLoading(true);
        const credential = { SISCode: codigoSIS.trim() };
        const response = await loginStudent(credential);
        setSeedPhrase(response.mnemonic);
        setShowSeedPhrase(true);
      } catch (error) {
        toast.error(getApiErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    /**
     * Reset the SIS field, the in-memory seed and the status hint after the
     * seed-phrase flow concludes (either completed or aborted).
     */
    const handleSeedPhraseClose = ({ completed } = {}) => {
      setShowSeedPhrase(false);
      setSeedPhrase("");
      setCodigoSIS("");
      setStatusHint(null);
      if (completed) {
        toast.success("Credencial entregada al estudiante");
      }
    };

    /**
     * On blur: if the SIS code looks plausible, ping the backend's read-only
     * status endpoint and surface the result inline. Saves a 500 round-trip
     * via the emission endpoint when the admin retypes a SIS that already
     * has a credential.
     */
    const handleSisBlur = async () => {
      const sis = codigoSIS.trim();
      if (sis.length < MIN_SIS_LENGTH) {
        setStatusHint(null);
        return;
      }
      try {
        setCheckingStatus(true);
        const data = await getStudentStatus(sis);
        setStatusHint({ sis, ...data });
      } catch {
        // silent — the submit attempt will surface a proper error
        setStatusHint(null);
      } finally {
        setCheckingStatus(false);
      }
    };

    // The hint becomes stale as soon as the user edits the input.
    const handleSisChange = (e) => {
      const next = e.target.value.replace(/\D/g, "");
      setCodigoSIS(next);
      if (statusHint && statusHint.sis !== next) setStatusHint(null);
    };

    const hasCredentialAlready = statusHint?.sis === codigoSIS.trim() && statusHint?.hasCredential;
    const studentNotFound       = statusHint?.sis === codigoSIS.trim() && statusHint?.exists === false;

    return (
      <>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="codigoSIS" className="text-brand-blue dark:text-blue-300 font-medium">
              Codigo SIS
            </Label>
            <Input
              id="codigoSIS"
              type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength={10}
              autoFocus
              autoComplete="off"
              placeholder="Ingrese su codigo SIS"
              value={codigoSIS}
              onChange={handleSisChange}
              onBlur={handleSisBlur}
              required
              disabled={loading || showSeedPhrase}
              aria-invalid={hasCredentialAlready || studentNotFound}
              aria-describedby="codigoSIS-hint"
              className="border-gray-300 dark:border-gray-600 dark:bg-[var(--bg-muted)] dark:text-white focus-visible:ring-brand-blue"
            />

            {/* Inline status hint — never blocks the submit button outright
                except when there is already a credential (that's a hard stop). */}
            <p id="codigoSIS-hint" className="text-xs min-h-[1rem]" aria-live="polite">
              {checkingStatus && (
                <span className="text-gray-500">Verificando estado del estudiante…</span>
              )}
              {!checkingStatus && hasCredentialAlready && (
                <span className="text-red-600">
                  Este estudiante ya tiene una credencial emitida.
                </span>
              )}
              {!checkingStatus && studentNotFound && (
                <span className="text-amber-600">
                  No se encontró un estudiante con ese código SIS.
                </span>
              )}
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white"
            disabled={
              loading
              || showSeedPhrase
              || codigoSIS.trim().length < MIN_SIS_LENGTH
              || hasCredentialAlready
            }
          >
            {loading ? "Procesando..." : "Solicitar Credenciales"}
          </Button>
        </form>

        <SeedPhraseModal
          isOpen={showSeedPhrase}
          onClose={handleSeedPhraseClose}
          seedPhrase={seedPhrase}
        />
      </>
    );
};

export default StudentLoginForm;
