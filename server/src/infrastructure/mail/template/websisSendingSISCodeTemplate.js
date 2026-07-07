export const recoveryCodesTemplate = (codes) => {
    return `<!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #007bff; color: #ffffff; padding: 10px; text-align: center; border-radius: 5px; }
        .content { padding: 20px; }
        .code-list { background-color: #f8f9fa; padding: 10px; border-radius: 5px; }
        .code { font-family: monospace; margin: 5px 0; }
        .footer { margin-top: 20px; font-size: 12px; color: #6c757d; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Solicitud de Kárdex</h2>
        </div>
        <div class="content">
          <p>Estimado/a,</p>
          <p>Se solicita la emisión de los kárdex para los siguientes códigos SIS:</p>
          <div class="code-list">
            ${codes.map(code => `<div class="code">${code}</div>`).join('')}
          </div>
          <p>Agradecemos su pronta atención a esta solicitud.</p>
        </div>
        <div class="footer">
          <p>Este email fue generado automáticamente. Por favor, no responda.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  };
  