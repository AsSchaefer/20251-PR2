/* ------------------------------------------------------
   PR2 / Entrega 2 — Menú comú de pàgines protegides
   ------------------------------------------------------
   Alumna: Alexandra Schäfer Barrientos
   Data: 9 de gener de 2026
   Fitxer: menu.js

   Descripció:
   Aquest fitxer concentra la lògica del menú compartit a totes les pantalles
   protegides. Aquí fem visible l’estat de la sessió (usuari actiu) i l’estat
   de les llistes (myTeam i wishes) amb comptadors actualitzats al DOM.

   Objectiu:
   Centralitzem aquest comportament per no repetir-lo a cada pantalla i per
   mantenir un criteri únic: la UI només pinta i fa traça; la sessió i les
   dades es consulten sempre al model. Si alguna cosa falla, prioritzem un
   fallback controlat abans que trencar la UI.

------------------------------------------------------

   Estructura del fitxer:

   0. Traça mínima de càrrega

   1. Punt d'entrada (DOMContentLoaded)
      1.1 Pintat inicial del menú
      1.2 Listener de logout

   2. Actualització del menú (updateMenu)
      2.1 Comprovació de sessió (MODEL)
      2.2 Pintat del nom d’usuari
      2.3 Llistes amb fallback defensiu
      2.4 Comptadors al DOM
      2.5 Traça final

   3. Tancament de sessió (logout)
      3.1 Tancar sessió (MODEL)
      3.2 Feedback (UI amb fallback)
      3.3 Redirecció al login

------------------------------------------------------ */


/* ------------------------------------------------------
   0. Traça mínima de càrrega
------------------------------------------------------ */
UI.log("MENU", "menu.js carregat");


/* ------------------------------------------------------
   1. Punt d'entrada (DOMContentLoaded)
------------------------------------------------------ */
/*
   Esperem el DOM perquè aquí toquem elements del menú (botó, spans). El flux és
   simple: pintem estat inicial i enganxem el logout. Si falta algun node, fem
   fallback i no trenquem la UI.
*/

document.addEventListener("DOMContentLoaded", () => {

  /* ------------------------------------------------------
     1.1 Pintat inicial del menú
  ------------------------------------------------------ */
  /*
     Pintem d'entrada perquè el menú reflecteixi sessió i comptadors al moment.
     updateMenu(): la podem cridar sempre que calgui refrescar.
  */

  updateMenu();

  /* ------------------------------------------------------
     1.2 Listener de logout
  ------------------------------------------------------ */
  /*
     El menú només gestiona el click: la sessió la tanca el model. Si el botó no hi és,
     sortim en silenci.
  */
 
 const botoLogout = document.querySelector("#logoutButton");

botoLogout.addEventListener("click", (event) => {
  event.preventDefault();
  logout();
});

});


/* ------------------------------------------------------
   2. Actualització del menú (updateMenu)
------------------------------------------------------ */
/*
   Aquí concentrem el "pintat" del menú:
   - demanem sessió al model (font de veritat),
   - pintem usuari i comptadors al DOM,
   - i si el model retorna dades rares, fem fallback a 0 per no trencar la UI.
*/

function updateMenu() {

  /* ------------------------------------------------------
     2.1 Comprovació de sessió (MODEL)
  ------------------------------------------------------ */
  /*
     Si no hi ha usuari actiu, aquest menú no té sentit. Preferim redirigir al login
     abans que deixar una pantalla protegida en estat inconsistent.
  */

  const usernameActiu = User.obtenirUsuariActual();
  if (!usernameActiu) {
    window.location.href = "./index.html";
    return;
  }

  /* ------------------------------------------------------
     2.2 Pintat del nom d'usuari
  ------------------------------------------------------ */
  /*
     Pintem el username per fer visible el context de sessió. És una peça petita,
     però evita confusions quan es prova amb diferents comptes.
  */

  const menuButton = document.querySelector("#menuButton");
  if (menuButton) menuButton.textContent = usernameActiu;

  /* ------------------------------------------------------
     2.3 Llistes amb fallback defensiu (MODEL)
  ------------------------------------------------------ */
  /*
     El model retorna { ok, message, data }. Si ok no és true o les dades no són arrays,
     fem fallback a [] per mantenir el menú estable i no trencar la UI.
  */

  const resultatLlistes = User.obtenirLlistesUsuariActual();

  const myTeam = (resultatLlistes?.ok === true && Array.isArray(resultatLlistes.data?.myTeam))
    ? resultatLlistes.data.myTeam
    : [];

  const wishes = (resultatLlistes?.ok === true && Array.isArray(resultatLlistes.data?.wishes))
    ? resultatLlistes.data.wishes
    : [];

  /* ------------------------------------------------------
     2.4 Comptadors al DOM
  ------------------------------------------------------ */
  /*
     El menú només pinta números. Convertim a string i ja està: aquí no hi ha regles,
     només coherència visual.
  */

  const myTeamSpan = document.querySelector("#myTeamCount");
  const wishesSpan = document.querySelector("#wishesCount");

  if (myTeamSpan) myTeamSpan.textContent = String(myTeam.length);
  if (wishesSpan) wishesSpan.textContent = String(wishes.length);

  /* ------------------------------------------------------
     2.5 Traça final
  ------------------------------------------------------ */
  /*
     Traça curta i útil per depurar sense "novel·la": usuari i totals pintats.
  */

  UI.log("MENU", "Menú actualitzat", {
    user: usernameActiu,
    myTeam: myTeam.length,
    wishes: wishes.length
  });
}


/* ------------------------------------------------------
   3. Tancament de sessió (logout)
------------------------------------------------------ */
/*
   Flux de sortida controlat:
   - deleguem al model el tancament,
   - donem feedback amb UI (fallback a alert),
   - i redirigim a la pantalla pública per no quedar-nos en una vista protegida.
*/

function logout() {

  /* ------------------------------------------------------
     3.1 Tancar sessió (MODEL)
  ------------------------------------------------------ */
  /*
     La sessió és responsabilitat del model. Aquí només demanem l'acció i tractem
     el resultat de manera unificada.
  */

  const resultat = User.tancarSessio();

  /* ------------------------------------------------------
     3.2 Feedback (UI amb fallback)
  ------------------------------------------------------ */
  /*
     Prioritzem UI.alertResultat per coherència global. Si UI no existeix per ordre de càrrega,
     fem fallback amb alert() abans de trencar la UI.
  */

  if (typeof UI !== "undefined" && typeof UI.alertResultat === "function") {
    UI.alertResultat(resultat, "Sessió tancada correctament");
  } else {
    alert(resultat?.message ?? "Sessió tancada correctament");
  }

  /* ------------------------------------------------------
     3.3 Redirecció al login
  ------------------------------------------------------ */
  /*
     Un cop tancada la sessió, tornem a index.html per deixar l’app en un estat net.
  */
 
  window.location.href = "./index.html";
}
