# Red de seguridad de tests — universityDApp/server

> Suite de testing creada como **safety net** antes de cualquier refactor.
> Captura el comportamiento **actual** del sistema, incluyendo bugs documentados.

## Estado actual

| Métrica | Valor |
|---|---|
| Test files | **15/15 passing** |
| Tests | **108 passing, 1 skipped** |
| Coverage (statements) | **74.48%** |
| Coverage (branches) | **83.82%** |
| Coverage (functions) | **87.5%** |
| Bugs SUT documentados | **IM-1, IM-2, IM-3, IM-4, IM-6, IM-7, IM-9, IM-11, IM-12, IM-13** |

### Test skipped

`EmailService.test.js > wraps transport errors` — el SUT **sí ejecuta** el catch y wrappea
el error (verificado vía `process.stdout.write`), pero Vitest 1.6 reporta el `new Error('smtp')`
del mock como uncaught aunque el handler esté adjuntado. Probadas 4 variantes (mockRejectedValue,
mockImplementation sync/async, Promise.catch, try/catch) — todas exhiben el mismo síntoma. El
camino feliz cubre el contrato. Reactivar al actualizar Vitest.

## Cómo ejecutar

```bash
npm install                  # instala vitest, supertest, @vitest/coverage-v8
npm test                     # todos los tests
npm run test:unit            # solo tests unitarios
npm run test:integration     # solo tests de integración
npm run test:watch           # modo watch
npm run test:coverage        # genera reporte de cobertura
```

## Estructura

```
tests/
├── setup.js                 # env vars dummy + silencio de console
├── helpers/factories.js     # builders de entidades de dominio
├── unit/
│   ├── services/            # 7 services × ~10 tests
│   ├── useCases/            # 3 useCases × ~6 tests
│   ├── errors/              # 3 clases de error
│   └── templates/           # URINFTTemplate
└── integration/             # routes con supertest, useCases mockeados
```

## Bugs corregidos (Fase 2)

| ID | Cómo se arregló | Test actualizado |
|---|---|---|
| ✅ IM-1 | Eliminado `catch{}` vacío en `CredentialManagementService.emitCredential`; el error propaga al useCase que ya lo wrappea como `CREDENTIAL_EMISSION_ERROR`. También añadido `await` faltante en `StudentService.assignedCredential`. | `CredentialManagementService.test.js > emitCredential — error propagation (IM-1 fixed)` |
| ✅ IM-2 | Añadido `await` a `CredentialManagement.getAddress` en `UseCaseKardexRequest.uploadingKardexToIPFS`. | `UseCaseKardexRequest.test.js > IM-2 FIXED: awaits getAddress…` |
| ✅ IM-3 | Añadidas las factories `KardexError.fileExists/ipfsRemoveError/contractError` con statusCode y errorCode default. | `errors.test.js > KardexError.<factory>` |
| ⚠️ IM-6 RE-OPENED | Originalmente "arreglado" cambiando string `'true'` → boolean `true`. **Revertido** tras detectar en runtime que la columna real en Postgres es `VARCHAR` (migración 20250312030825 la creó como `Sequelize.STRING`, no BOOLEAN como dice el modelo). Sin migración que altere el tipo, el query con boolean rompe con `operator does not exist: character varying = boolean`. | `StudentService.test.js > queries with the string literal 'true'` |
| ✅ IM-11 | Añadida factory `StudentError.invalidInput` (statusCode 400). `verifyByWallet` con address inválido ahora devuelve el 400 INVALID_WALLET_ADDRESS intencionado. | `UseCaseEmitStudentCredential.test.js > BR-S9: throws INVALID_WALLET_ADDRESS` |
| ✅ IM-13 | Removido `new` de `KardexError.fileUploadRequired()` en `PdfController`. Subir sin archivos ahora devuelve 400 FILE_UPLOAD_REQUIRED. | `pdfRoutes.test.js > 400 when no files are attached` |

**Efecto cascada:** al definir `KardexError.contractError` (IM-3), los errores del contrato en el flujo de kardex ahora preservan su `errorCode` original (`TX_REVERTED`, `INSUFFICIENT_FUNDS`, etc.) en lugar de caer al genérico `KARDEX_PROCESSING_ERROR`. Test actualizado: `UseCaseKardexRequest.test.js > re-throws ContractError-flagged errors as KardexError wrappers preserving the inner errorCode`.

## Bugs aún documentados (no críticos)

| ID | Síntoma | Justificación de no arreglar ahora |
|---|---|---|
| IM-4 | `attendMultipleNotifications` devuelve `updatedCount: undefined` | El frontend no usa ese campo; arreglo trivial pero requiere coordinación con cliente |
| IM-7 | `studentAskedKardex` filtra por `IN_PROCESS`, no `NOT_ATTENDED` | Comportamiento intencional según la máquina de estados actual |
| IM-9 | IPFS sin overwrite añade `_${Date.now()}` al filename | Evita colisiones, semánticamente OK |
| IM-12 | `IpfsService.metadataJSON` con `client=null` re-wrappea el error | Defensivo: el `client` no debería ser null en runtime real (validado en initialize) |

## Estrategia de mocking

| Dependencia externa | Cómo se mockea |
|---|---|
| Modelos Sequelize | `vi.mock(model path)` con métodos `findOne/findAll/update/create` |
| Contratos ethers (`CredentialManagementContract`, `NFTContract`) | `vi.mock` reemplaza el singleton |
| `ipfs-http-client` | `vi.mock` de `ipfsConnection.js` con `client` y `uploadFile` stubs |
| `nodemailer` | `vi.mock` de `mailSenderConnection.js` exportando `sendMail` stub |
| Socket.io (`io` desde `app.js`) | `vi.mock('src/app.js', () => ({ io: { emit: vi.fn() } }))` |
| `pdf-lib` | `vi.mock` con `PDFDocument.load/create` que devuelven docs fake |
| `fs/promises` | `vi.mock` con `readFile` stub |
| `dbConnection.js` | mockeado en tests de integración para evitar conexión Postgres |
| `contractManagementInstance.js` | mockeado en integración para neutralizar `contract.on(...)` que se dispara al importar `app.js` |

**Regla:** los tests **NUNCA** abren conexiones reales (DB, IPFS, RPC, SMTP).
Cualquier test que necesite eso debe ir bajo `tests/e2e/` (no implementado aún).

## Próximos pasos sugeridos

1. `npm install` y `npm test` — verificar que los 80+ tests pasan
2. Si algún test falla, **NO modificar la lógica**: actualizar el test para reflejar lo que el código realmente hace
3. Empezar Fase 2 (bugs reales) — al arreglar IM-1, IM-2, IM-3, IM-4, IM-6, IM-9 los tests correspondientes fallarán intencionalmente y se deben actualizar
4. Añadir e2e tests bajo `tests/e2e/` cuando exista entorno con docker-compose (postgres + ipfs + hardhat node)
