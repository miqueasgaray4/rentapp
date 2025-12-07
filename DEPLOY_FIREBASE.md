# Guía de Despliegue en Firebase Hosting

Sigue estos pasos para desplegar tu aplicación RentAI en Internet usando Firebase.

## Prerrequisitos
Ya hemos habilitado la funcionalidad experimental de frameworks web para Next.js en tu entorno.

## Paso 1: Iniciar Sesión
Ejecuta el siguiente comando en tu terminal para conectar tu cuenta de Google:
```bash
firebase login
```
*Si ya estás logueado, puedes saltar este paso.*

## Paso 2: Inicializar el Proyecto
Ejecuta este comando para configurar el proyecto:
```bash
firebase init hosting
```

**Responde a las preguntas de la siguiente manera:**
1.  **Are you ready to proceed?** -> `Yes` (o simplemente Enter)
2.  **Please select an option:**
    *   Si ya creaste el proyecto en la consola de Firebase: Selecciona `Use an existing project`.
    *   Si no: Selecciona `Create a new project`.
3.  **Detected an existing Next.js codebase in the current directory, should we use this?** -> `Yes`
4.  **In which region would you like to host server-side content, if applicable?** -> Selecciona `us-central1` (o la que prefieras, us-central1 es estándar).
5.  **Set up automatic builds and deploys with GitHub?** -> `No` (por ahora, para hacerlo simple).

## Paso 3: Configurar Variables de Entorno
Firebase necesita saber tus claves API (Gemini y MercadoPago) en el servidor.
Para esto, debes configurarlas en Cloud Functions o usar el archivo `.env` si usas la nueva integración.

Con la integración de Web Frameworks, Firebase intentará leer tu `.env.local`. Sin embargo, para producción es mejor establecerlas explícitamente si falla.

## Paso 4: Desplegar
Una vez configurado, ejecuta:
```bash
firebase deploy
```

Esto construirá tu aplicación y la subirá a la nube. Al finalizar, te dará una URL (ej: `https://rentai-app.web.app`) donde podrás ver tu aplicación funcionando.

## Notas Importantes
*   **Plan Blaze**: Para que las funciones de servidor (API de MercadoPago y Gemini) funcionen, tu proyecto de Firebase debe estar en el **Plan Blaze (Pay as you go)**. Es gratuito hasta ciertos límites, pero requiere una tarjeta de crédito configurada en Google Cloud.
*   **Dominios**: Firebase te da un dominio gratuito `.web.app`.
