/* ------------------------------------------------------
   PR2 – Gestió del login (interfície)
---------------------------------------------------------
   Alumna: Alexandra Schäfer Barrientos
   Data: 9 de gener de 2026
   Fitxer: index.js

   Descripció:
   Aquest fitxer controla la pantalla de login (index.html) des de la
   interfície. Aquí ens encarreguem exclusivament de la interacció amb
   l’usuari: llegir el formulari, reaccionar als clics i gestionar la
   navegació segons el resultat del login.

   Objectiu:
   Definir el flux complet d'inici de sessió sense barrejar responsabilitats.
   Aquest fitxer només recull dades i delega decisions al model (User).
   La validació real, la gestió de sessió i la persistència formen part
   de la lògica del sistema i no es resolen aquí.

------------------------------------------------------
   Estructura del fitxer:

   1. Traça inicial de càrrega
   2. Inicialització quan el DOM està llest
      2.1 Captura d'elements del DOM
      2.2 Comprovació d'elements obligatoris
      2.3 Comprovació de sessió existent
      2.4 Gestió del login
      2.5 Accés a registre

------------------------------------------------------ */


/* ------------------------------------------------------
   1. Traça inicial de càrrega
------------------------------------------------------ */
UI.log("INDEX", "index.js carregat");


/* ------------------------------------------------------
   2. Inicialització quan el DOM està llest
------------------------------------------------------ */
/*
   Aquest fitxer treballa directament amb el DOM. Per això esperem que
   l'HTML estigui completament carregat abans de capturar elements o
   afegir listeners.
*/

document.addEventListener("DOMContentLoaded", () => {

  /* ------------------------------------------------------
     2.1 Captura d'elements del DOM
  ------------------------------------------------------ */
  /*
     Centralitzem aquí tots els elements necessaris del formulari de login.
     Això evita repetir cerques al DOM i deixa clar què necessita aquesta pantalla.
  */

  const inputNomUsuari = document.querySelector("#username");
  const inputContrasenya = document.querySelector("#password");
  const botoLogin = document.querySelector("#loginButton");
  const botoRegistre = document.querySelector("#registration");


  /* ------------------------------------------------------
     2.2 Comprovació d'elements obligatoris
  ------------------------------------------------------ */
  /*
     Si falta algun element essencial, parem l'execució.
     Continuar amb elements null només portaria a errors difícils de seguir.
  */

  const faltenElements = (
    !inputNomUsuari ||
    !inputContrasenya ||
    !botoLogin ||
    !botoRegistre
  );

  if (faltenElements) {
    UI.error("INDEX", "Falten elements del formulari (revisa IDs a index.html)");
    return;
  }


  /* ------------------------------------------------------
     2.3 Comprovació de sessió existent
  ------------------------------------------------------ */
  /*
     Abans de mostrar el login, preguntem al model si ja hi ha una sessió activa.
     La interfície no sap com es guarda la sessió; només interpreta el resultat.
  */

  const usernameSessio = User.obtenirUsuariActual();

  UI.log("INDEX", "MODEL <- User.obtenirUsuariActual()", { usernameSessio });

  if (usernameSessio) {
    UI.log("INDEX", "Sessió existent -> redirect a indice.html");
    window.location.href = "./indice.html";
    return;
  }


  /* ------------------------------------------------------
     2.4 Gestió del login
  ------------------------------------------------------ */
  /*
     Aquí definim el flux principal del login: llegir credencials,
     delegar validació al model i actuar segons el resultat.
  */

  botoLogin.addEventListener("click", (event) => {
    event.preventDefault();

    UI.log("INDEX", "EVENT <- click loginButton");

    /* ------------------------------------------------------
       2.4.1 Lectura de credencials
    ------------------------------------------------------ */
    /*
       Normalitzem l'entrada abans d’enviar-la al model.
       A la traça no mostrem la contrasenya, només informació de context.
    */
    const username = String(inputNomUsuari.value ?? "").trim();
    const password = String(inputContrasenya.value ?? "");

    UI.log("INDEX", "INPUT <- credencials capturades", {
      username,
      passwordLength: password.length
    });


    /* ------------------------------------------------------
       2.4.2 Validació delegada al model
    ------------------------------------------------------ */
    /*
       La interfície no decideix si un login és correcte.
       Envia dades al model i interpreta el resultat retornat.
    */
   
    const resultatLogin = User.validarCredencials(username, password);
    UI.traceResult("INDEX", "MODEL validarCredencials()", resultatLogin);

    if (resultatLogin.ok === false) {
      UI.alertResultat(resultatLogin, "No s'ha pogut iniciar sessió");
      return;
    }


    /* ------------------------------------------------------
       2.4.3 Establiment de sessió
    ------------------------------------------------------ */
    /*
       Un cop validat el login, deleguem al model la gestió de la sessió.
       La UI només comprova que l’operació ha anat bé.
    */
    const userPlain = resultatLogin?.data?.user;

    if (!userPlain || !userPlain.username) {
      UI.error("INDEX", "Usuari invàlid després del login", userPlain);
      UI.alertMissatge("Error intern després del login");
      return;
    }

    UI.alertMissatge(`Hola ${userPlain.username}, benvingut/da!`);

    const resultatSessio = User.establirUsuariActual(userPlain.username);
    UI.traceResult("INDEX", "MODEL establirUsuariActual()", resultatSessio);

    if (resultatSessio.ok === false) {
      UI.alertResultat(resultatSessio, "No s'ha pogut establir la sessió");
      return;
    }


    /* ------------------------------------------------------
       2.4.4 Redirecció final
    ------------------------------------------------------ */
    /*
       Només redirigim quan la sessió ja està correctament establerta.
    */
    window.location.href = "./indice.html";
  });


  /* ------------------------------------------------------
     2.5 Accés a registre
  ------------------------------------------------------ */
  /*
     Redirecció directa a la pantalla de registre.
     No hi ha validació ni lògica addicional en aquest punt.
  */
  botoRegistre.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "./registro.html";
  });

});
