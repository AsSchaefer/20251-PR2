/* ------------------------------------------------------
    PR2 – Menú (Entrega 1)
  ------------------------------------------------------
    Alumna: Alexandra Schäfer Barrientos
    Data: 23 de desembre de 2025
    Fitxer: menu.js
    
    Descripció:
    Gestió del menú superior de l’aplicació.

    Aquest fitxer s’encarrega exclusivament de:
    - Mostrar l’usuari amb sessió iniciada.
    - Actualitzar els comptadors de myTeam i wishes.
    - Permetre tancar la sessió i tornar al login.

    No modifica dades ni llistes.
    ------------------------------------------------------

    Estructura del fitxer:

        1. Punt d’entrada (DOMContentLoaded)
            1.1. Inicialització del menú
            1.2. Preparació del botó Logout

        2. Funció updateMenu
            2.1. Comprovació de sessió activa
            2.2. Actualització del nom d’usuari
            2.3. Actualització de comptadors
            
        3. Funció logout
    ------------------------------------------------------ */


/* ------------------------------------------------------
    1. Punt d’entrada (DOMContentLoaded)
   ------------------------------------------------------
    S’utilitza DOMContentLoaded perquè aquest script depèn
    d’elements del menú que han d’existir al DOM.
   ------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {

  console.log("menu.js carregat correctament.");

  /* ------------------------------------------------------
      1.1 Inicialització del menú
     ------------------------------------------------------
      Actualitzem el menú només entrar a la pàgina.
      Si no hi ha sessió, updateMenu ja redirigeix a login.
     ------------------------------------------------------ */
  updateMenu();


  /* ------------------------------------------------------
      1.2 Preparació del botó Logout
     ------------------------------------------------------
      Configura l’event del botó per tancar sessió.
     ------------------------------------------------------ */
  const botoLogout = document.querySelector("#logoutButton");

  if (!botoLogout) {
    console.warn("No existeix #logoutButton en aquest HTML.");
    return;
  }

  botoLogout.addEventListener("click", (event) => {
    event.preventDefault(); // Evitem salts o submits inesperats
    console.log("Logout clicat.");
    logout();
  });

});



/* ------------------------------------------------------
     2. Funció updateMenu
   ------------------------------------------------------
    Actualitza el contingut visual del menú segons la sessió.

    Responsabilitats:
    - Comprovar si hi ha usuari actiu.
    - Mostrar el username.
    - Actualitzar els comptadors de llistes.
    ------------------------------------------------------ */

function updateMenu() {

  /* ------------------------------------------------------
      2.1 Comprovació de sessió activa
     ------------------------------------------------------
      Sense sessió no es pot mostrar el menú correctament.
      Es redirigeix directament a index.html.
     ------------------------------------------------------ */
  const usernameActiu = User.obtenirUsuariActual();

  if (usernameActiu === null) {
    console.warn("Cap sessió activa. Redirecció a login.");
    window.location.href = "./index.html";
    return;
  }


  /* ------------------------------------------------------
       2.2 Actualització del nom d’usuari
     ------------------------------------------------------
       Es mostra el username a l’element #menuButton.
     ------------------------------------------------------ */
  const menuButton = document.querySelector("#menuButton");

  if (menuButton) {
    menuButton.textContent = usernameActiu;
  } else {
    console.warn("No existeix #menuButton.");
  }


  /* ------------------------------------------------------
       2.3 Actualització de comptadors (myTeam / wishes)
     ------------------------------------------------------
       Es recupera l’usuari desat (objecte pla) i es compten
       els elements de cada llista.
     ------------------------------------------------------ */
  const usuari = User.cercarUsuari(usernameActiu);

  const myTeamCount = usuari?.myTeam?.length ?? 0;
  const wishesCount = usuari?.wishes?.length ?? 0;

  const myTeamSpan = document.querySelector("#myTeamCount");
  const wishesSpan = document.querySelector("#wishesCount");

  if (myTeamSpan) myTeamSpan.textContent = String(myTeamCount);
  if (wishesSpan) wishesSpan.textContent = String(wishesCount);

  console.log(
    `Menú actualitzat -> myTeam: ${myTeamCount}, wishes: ${wishesCount}`
  );
}



/* ------------------------------------------------------
    3. Funció logout
   ------------------------------------------------------
    Tanca la sessió actual i torna al login.

    Flux:
    1. Eliminar sessió del localStorage.
    2. Avisar l’usuari.
    3. Redirigir a index.html.
------------------------------------------------------ */
function logout() {

  // PAS 1: eliminar sessió
  User.tancarSessio();

  // PAS 2: feedback
  alert("Sessió tancada correctament.");

  // PAS 3: redirecció
  window.location.href = "./index.html";
}
