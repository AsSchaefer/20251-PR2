/* ------------------------------------------------------
    PR2 – Gestió del login (interfície)
   ------------------------------------------------------
    Alumna: Alexandra Schäfer Barrientos
    Data: 23 de desembre de 2025
    Fitxer: index.js

    Descripció:
    Aquest fitxer controla el login des de la interfície.
    
    Aquí definim el flux complet de login:
        - recollim el que l’usuari escriu,
        - demanem al model si és correcte,
        - i decidim què passa a la pantalla (missatge / sessió / redirecció).    
    ------------------------------------------------------

    Estructura del fitxer:

    1. Punt d’entrada (DOMContentLoaded)

    2. Preparació del formulari
        2.1 Captura d’elements del DOM
        2.2 Comprovació mínima d’estructura
        
    3. Comprovació de sessió activa

    4. Flux de login (click)
        4.1 Lectura de credencials
        4.2 Validació amb el model
        4.3 Establiment de sessió
        4.4 Redirecció final

    5. Accés a registro.html
    
    ------------------------------------------------------ */


/* ------------------------------------------------------
    1. Punt d’entrada (DOMContentLoaded)
   ------------------------------------------------------
    Esperem que el DOM estigui carregat perquè aquest fitxer
    necessita recuperar inputs i botons. Això evita treballar
    amb elements inexistents (null) i errors de runtime.
    ------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {

  console.log("index.js carregat correctament.");


  /* ------------------------------------------------------
      2. Preparació del formulari
    ------------------------------------------------------ 
        2.1 Captura d’elements del DOM
    ------------------------------------------------------
        Guardem les referències del formulari per:
        - millorar llegibilitat
        - evitar repetir querySelector
    ------------------------------------------------------ */

  const inputNomUsuari = document.querySelector("#username");
  const inputContrasenya = document.querySelector("#password");
  const botoLogin = document.querySelector("#loginButton");
  const botoRegistre = document.querySelector("#registration");

  /* ------------------------------------------------------
        2.2 Comprovació mínima d’estructura
     ------------------------------------------------------
        Si falta algun element, aquest fitxer no pot complir la seva funció.
        En aquest cas parem l’execució, perquè continuar generaria errors.
     ------------------------------------------------------ */
  const faltenElements = (
    !inputNomUsuari ||
    !inputContrasenya ||
    !botoLogin ||
    !botoRegistre
  );

  if (faltenElements) {
    console.error("Falten elements del formulari de login. Revisa index.html (IDs).");
    return;
  }


  /* ------------------------------------------------------
      3. Comprovació de sessió activa
     ------------------------------------------------------
     Si ja hi ha un usuari loguejat, no té sentit tornar a mostrar
     el login. Redirigim directament a la pantalla principal.
    ------------------------------------------------------ */
  const usuariActual = User.obtenirUsuariActual();

  if (usuariActual !== null) {
    console.log("Sessió activa detectada. Usuari:", usuariActual);
    window.location.href = "./indice.html";
    return;
  }


  /* ------------------------------------------------------
     4. Flux de login (click)
    ------------------------------------------------------
    Aquest bloc descriu el flux complet:
    - llegir credencials
    - validar amb el model
    - guardar sessió
    - redirigir
  ------------------------------------------------------ */
  botoLogin.addEventListener("click", () => {

    console.log("Intent de login iniciat.");


    /* ------------------------------------------------------
        4.1 Lectura de credencials
       ------------------------------------------------------
        - Username: trim() per evitar que espais accidentals facin fallar el login.
        - Password: es llegeix tal qual (no s’ha de modificar).
    ------------------------------------------------------ */
    const nomUsuariIntroduit = String(inputNomUsuari.value).trim();
    const contrasenyaIntroduida = String(inputContrasenya.value);


    /* ------------------------------------------------------
        4.2 Validació
       ------------------------------------------------------*/
      
    // Demanem que validi les credencials.
    const resultatLogin = User.validarCredencials(
      nomUsuariIntroduit,
      contrasenyaIntroduida
    );

    if (resultatLogin.ok === false) {
      console.warn("Error de login:", resultatLogin.message);
      alert(resultatLogin.message);
      return;
    }

    console.log("Login correcte. Usuari autenticat:", resultatLogin.user.username);


    /* ------------------------------------------------------
        4.3 Establiment de sessió
       ------------------------------------------------------ */

    // Desem l’usuari actual a localStorage.
    const sessioGuardada = User.establirUsuariActual(resultatLogin.user.username);

    if (sessioGuardada === false) {
      console.error("No s'ha pogut establir la sessió.");
      alert("No s'ha pogut iniciar sessió.");
      return;
    }


    /* ------------------------------------------------------
        4.4 Redirecció final
       ------------------------------------------------------ */
       // Tot ha anat bé: avisem i redirigim.
    alert("Login correcte. Sessió iniciada.");
    window.location.href = "./indice.html";
  });


  /* ------------------------------------------------------
     5. Accés a la pàgina de registre
    ------------------------------------------------------
     El botó “Nuevo usuario” redirigeix a registro.html
     per permetre crear un nou compte.
  ------------------------------------------------------ */
  botoRegistre.addEventListener("click", () => {
    console.log("Redirigint a registro.html...");
    window.location.href = "./registro.html";
  });

});
