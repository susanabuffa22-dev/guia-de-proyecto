// Declara el objeto 'google' del script de GSI para que TypeScript no se queje.
// FIX: Added detailed type declarations for the Google Identity Services library
// to resolve "Cannot find namespace 'google'" errors.
declare namespace google {
  namespace accounts {
    namespace oauth2 {
      interface TokenResponse {
        access_token: string;
        error?: string;
        error_description?: string;
        [key: string]: any;
      }

      interface TokenClient {
        requestAccessToken: (overrideConfig?: object) => void;
      }

      function initTokenClient(config: {
        client_id: string;
        scope: string;
        callback: (tokenResponse: TokenResponse) => void;
      }): TokenClient;
    }
  }
}

// ¡IMPORTANTE! Debes crear un ID de cliente de OAuth 2.0 en la Consola de Google Cloud
// y añadirlo aquí. Para fines de demostración, se utiliza un marcador de posición.
// https://developers.google.com/workspace/guides/create-credentials
const CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com";
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient: google.accounts.oauth2.TokenClient | null = null;

/**
 * Guarda un contenido HTML como un nuevo Google Doc en el Google Drive del usuario.
 * @param title El título para el nuevo Google Doc.
 * @param htmlContent El contenido completo del documento en formato HTML.
 * @returns Una promesa que se resuelve con la URL para ver el documento creado.
 */
export const saveHtmlAsGoogleDoc = (title: string, htmlContent: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!CLIENT_ID || CLIENT_ID.startsWith("YOUR_GOOGLE_CLIENT_ID_HERE")) {
      // En un proyecto real, esto debería estar configurado.
      const helpfulError = new Error(
        "Configuración requerida: Para usar 'Guardar en Google Docs', debes reemplazar el CLIENT_ID de marcador de posición en el archivo 'services/googleDriveService.ts' con tu propio ID de cliente de OAuth 2.0 de la Consola de Google Cloud."
      );
      return reject(helpfulError);
    }
    
    // El callback que se ejecuta después de obtener el token de acceso.
    const callback = async (tokenResponse: google.accounts.oauth2.TokenResponse) => {
      if (tokenResponse.error) {
        return reject(new Error(`Error de autenticación: ${tokenResponse.error_description || 'El usuario ha denegado el acceso.'}`));
      }

      try {
        const metadata = {
          name: title,
          mimeType: 'application/vnd.google-apps.document',
        };
        
        // Usamos FormData para crear una solicitud multipart.
        // Esto es requerido por la API de Drive para subir contenido y metadatos al mismo tiempo.
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([htmlContent], { type: 'text/html' }));

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenResponse.access_token}`,
          },
          body: form,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Error al guardar en Google Drive: ${errorData.error.message || response.statusText}`);
        }

        const fileData = await response.json();
        // 'webViewLink' es la URL para abrir el documento en el navegador.
        resolve(fileData.webViewLink);

      } catch (error) {
        reject(error);
      }
    };

    // Inicializa el cliente de token de Google si aún no existe.
    if (!tokenClient) {
        try {
            tokenClient = google.accounts.oauth2.initTokenClient({
              client_id: CLIENT_ID,
              scope: SCOPES,
              callback: callback,
            });
        } catch (e) {
            return reject(new Error("La librería de cliente de Google no se ha cargado. Revisa tu conexión a internet o si hay bloqueadores de scripts."));
        }
    }
    
    // Solicita el token de acceso al usuario. Esto abrirá el pop-up de consentimiento de Google.
    tokenClient.requestAccessToken();
  });
};