/* ------------------------------------------------------
   PR2 / Entrega 2 — Registre d’usuaris (interfície)
   ------------------------------------------------------
   Alumna: Alexandra Schäfer Barrientos
   Data: 9 de gener de 2026
   Fitxer: registro.js

  Objectiu:
  L'objectiu d'aquest fitxer és gestionar el procés de registre des de la
  interfície, ajudant l'usuari a introduir dades coherents, detectant errors
  bàsics abans d’hora i mostrant missatges clars sense trencar la pàgina si
  falta algun element o alguna dependència.

  La validació definitiva i el guardat de la informació no es fan aquí.
  Aquesta responsabilitat es delega al model (User), que és qui aplica les
  regles del sistema, gestiona la persistència i actua com a font única de
  veritat, mantenint la UI lleugera i previsible.

------------------------------------------------------

   Estructura del fitxer:

   0. Traça inicial de càrrega del fitxer

   1. Inicialització quan el DOM està llest (DOMContentLoaded)
      1.1 Captura d'elements del DOM
      1.2 Control mínim d’elements obligatoris
      1.3 Preparació del select de poblacions
      1.4 Esdeveniments d'ajuda (població/CP/email)
      1.5 Procés de registre (click Guardar)
         1.5.1 Captura i normalització de dades
         1.5.2 Validació completa del formulari (UI)
         1.5.3 Creació d'usuari i guardat (MODEL)
         1.5.4 Finalització i redirecció
      1.6 Tornar a login

   2. Funcions d'interfície i autocompletat
      2.1 omplirSelectPoblacions()
      2.2 autocompletarCPDesDePoblacio()
      2.3 validarCPExisteixIAssignarPoblacio()
      2.4 autocompletarDominiUOC()

   3. Validació del formulari (UI / UX)
      3.1 Preparació i normalització d’entrada
      3.2 Validacions de camps obligatoris
      3.3 Validació CP i coherència amb població
      3.4 Validació email
      3.5 Validació username i comprovació de duplicats
      3.6 Validació password

   4. Helpers
      4.1 netejarText()

------------------------------------------------------ */


/* ------------------------------------------------------
   0. Traça inicial de càrrega del fitxer
------------------------------------------------------ */
UI.log("REGISTRE", "registro.js carregat");

/* ------------------------------------------------------
   1. Inicialització quan el DOM està llest (DOMContentLoaded)
------------------------------------------------------ */
/*
   Tot el que fem aquí depèn del DOM: llegir valors d'inputs, omplir un <select>,
   escoltar events i mostrar missatges. Per això esperem DOMContentLoaded: així
   treballem amb la vista ja construïda i evitem errors típics de "node null".

   A partir d'aquí organitzem la pantalla amb un criteri molt simple:
   primer assegurem que tenim els elements, després fem la UI còmoda (autocompletats),
   i finalment connectem el botó de guardar amb el flux de validació + model.
*/

document.addEventListener("DOMContentLoaded", () => {

  /* ------------------------------------------------------
     1.1 Captura d'elements del DOM
  ------------------------------------------------------ */
  /*
     Centralitzem la captura d'elements al principi perquè el fitxer sigui llegible:
     en lloc d'anar buscant nodes a cada funció, els tenim tots aquí, ben identificats.
     Això també fa que, si canvia un ID a l’HTML, ho detectem de seguida i no “peti”
     a mig flux quan l’usuari ja ha escrit dades.
  */

  const inputNom = document.getElementById("name");
  const inputCognoms = document.getElementById("surname");
  const inputAdreca = document.getElementById("address");
  const selectPoblacio = document.getElementById("city");
  const inputCodiPostal = document.getElementById("postalCode");
  const inputEmail = document.getElementById("email");
  const inputNomUsuari = document.getElementById("username");
  const inputContrasenya = document.getElementById("password");

  const botoGuardar = document.getElementById("save");
  const botoTornarLogin = document.getElementById("loginButton");

  /* ------------------------------------------------------
     1.2 Control mínim d'elements obligatoris
  ------------------------------------------------------ */
  /*
     Aquest pas és detecta, si falta algun element imprescindible, es prefereix
     aturar el fitxer aquí mateix. Continuar seria “anar arrossegant” un problema i
     acabaria en errors confusos (per exemple, llegir .value de null).

     En una pràctica com aquesta, el més útil és un error clar que ens digui:
     "revisa els IDs de registro.html".
  */

  const faltenElements = (
    !inputNom || !inputCognoms || !inputAdreca || !selectPoblacio ||
    !inputCodiPostal || !inputEmail || !inputNomUsuari || !inputContrasenya ||
    !botoGuardar || !botoTornarLogin
  );

  if (faltenElements) {
    UI.error("REGISTRE", "Falten elements del formulari. Revisa registro.html (IDs)");
    return;
  }

  /* ------------------------------------------------------
     1.3 Preparació del select de poblacions
  ------------------------------------------------------ */
  /*
     Omplim el select a partir de "cities" perquè no  es vol tenir la llista "enganxada"
     a l’HTML. És més net, més mantenible i més coherent: les dades viuen en un sol lloc
     i la UI només les pinta.

     Si "cities" no està disponible,  el helper ho registrarà. La pantalla pot seguir
     carregant, però el registre quedarà coix, i la validació ho acabarà detectant.
  */

  UI.log("REGISTRE", "UI -> omplirSelectPoblacions()");
  omplirSelectPoblacions(selectPoblacio);

  


  /* ------------------------------------------------------
     1.4 Esdeveniments d’ajuda (població/CP/email)
  ------------------------------------------------------ */
  /*
     Aquí és on fem que el formulari sigui “humà” d’utilitzar. No estem guardant res,
     només estem evitant errors típics i accelerant l’entrada:
     - si l'usuari tria una població, li posem el CP corresponent,
     - si escriu un CP, intentem seleccionar la població,
     - i si escriu “@” a l’email, li completem el domini institucional.

     Són detalls petits, però marquen la diferència en UX i mantenen coherència de dades.
  */

  selectPoblacio.addEventListener("change", () => {
    UI.log("REGISTRE", "EVENT <- change city", { value: selectPoblacio.value });
    autocompletarCPDesDePoblacio(selectPoblacio, inputCodiPostal);
  });

  inputCodiPostal.addEventListener("blur", () => {
    UI.log("REGISTRE", "EVENT <- blur postalCode", { value: inputCodiPostal.value });
    validarCPExisteixIAssignarPoblacio(inputCodiPostal, selectPoblacio);
  });

  inputEmail.addEventListener("input", () => {
    /*
       Aquest event va "a cada tecla”, així que aquí no vull logs. La idea és que la consola
       sigui útil quan depuro, no una cascada infinita. L'autocompletat és lleuger i no
       necessita traça per funcionar.
    */
    autocompletarDominiUOC(inputEmail);
  });
  

  /* ------------------------------------------------------
     1.5 Procés de registre (click Guardar)
  ------------------------------------------------------ */
  /*
     Quan l’usuari prem “Guardar”, fem el flux complet en un ordre que ens dona control:

     1. Capturem i normalitzem valors (neteja d’espais i tipus coherents).
     2. Validem a nivell d’UI per donar feedback immediat i entenedor.
     3. Si tot és OK, creem l'usuari i deleguem al MODEL el guardat i la validació final.
  */

  botoGuardar.addEventListener("click", (event) => {
    event.preventDefault();

    UI.log("REGISTRE", "EVENT <- click save");

    /* ------------------------------------------------------
       1.5.1 Captura i normalització de dades
    ------------------------------------------------------ */
    /*
       Agrupem totes les dades del formulari en un objecte perquè sigui fàcil passar-lo
       a la validació i al model. La neteja es fa amb netejarText() perquè es vol evitar
       espais “estranys” (dobles espais, espais al principi/final, etc.).

       La contrasenya es deixa tal qual (literal): és un camp sensible i no es vol tocar
       més del necessari.
    */

    const dades = {
      name: netejarText(inputNom.value),
      surname: netejarText(inputCognoms.value),
      address: netejarText(inputAdreca.value),
      city: netejarText(selectPoblacio.value),
      postalCode: netejarText(inputCodiPostal.value),
      email: netejarText(inputEmail.value),
      username: netejarText(inputNomUsuari.value),
      password: String(inputContrasenya.value ?? "")
    };

    /*
       Deixem la traça del que s'ha capturat, però sense exposar la contrasenya. A la pràctica,
       el que m’interessa és saber que hi és i la longitud, per detectar ràpidament camps buits.
    */

    UI.log("REGISTRE", "INPUT <- dades capturades", {
      name: dades.name,
      surname: dades.surname,
      city: dades.city,
      postalCode: dades.postalCode,
      email: dades.email,
      username: dades.username,
      passwordLength: dades.password.length
    });

    /* ------------------------------------------------------
       1.5.2 Validació completa del formulari (UI)
    ------------------------------------------------------ */
    /*
       Validem aquí perquè és el punt natural per donar missatges clars a l’usuari.
       Es retorna un resultat unificat { ok, message } perquè el flux sigui sempre igual:
       si és KO, alert i no continuem; si és OK, passem al model.

       Encara que aquí validem, el model revalidarà. És el nostre “doble cinturó”.
    */

    UI.log("REGISTRE", "UI -> validarFormulariRegistre(dades)");
    const resultatValidacio = validarFormulariRegistre(dades);
    UI.traceResult("REGISTRE", "UI validarFormulariRegistre()", resultatValidacio);

    if (resultatValidacio.ok === false) {
      UI.alertResultat(resultatValidacio, "Revisa el formulari");
      return;
    }

    /* ------------------------------------------------------
       1.5.3 Creació d’usuari i guardat (MODEL)
    ------------------------------------------------------ */
    /*
       Aquí ja no es juga amb UI: creem una instància de User i deleguem el guardat al model.
       Això concentra en un sol lloc el que és important (validació final + persistència).

       Si el model retorna KO, preferim quedar-nos a la pantalla i informar, en lloc de continuar
       amb una sessió o unes dades a mig camí.
    */

    UI.log("REGISTRE", "MODEL -> new User(dades)");
    const nouUsuari = new User(dades);

    UI.log("REGISTRE", "MODEL -> nouUsuari.save()");
    const resultatGuardat = nouUsuari.save(); // { ok, message, data? }
    UI.traceResult("REGISTRE", "MODEL save()", resultatGuardat);

    if (resultatGuardat.ok === false) {
      UI.alertResultat(resultatGuardat, "No s'ha pogut guardar l'usuari");
      return;
    }

    /* ------------------------------------------------------
       1.5.4 Finalització i redirecció
    ------------------------------------------------------ */
    /*
       Si s'ha arribat aquí, el registre és correcte. Donem feedback i tornem a index.html,
       que és el punt d'entrada (login).
    */

    UI.log("REGISTRE", "Registre OK", { username: dades.username });
    UI.alertResultat(resultatGuardat, "Usuari registrat correctament!");
    window.location.href = "./index.html";
  });

  /* ------------------------------------------------------
     1.6 Tornar a login
  ------------------------------------------------------ */
  /*
     Sortida ràpida: si l'usuari es penedeix o ha entrat aquí  a registre per error, el tornem a index.html.
     Fem preventDefault per assegurar que la navegació és controlada i consistent.
  */

  botoTornarLogin.addEventListener("click", (event) => {
    event.preventDefault();
    UI.log("REGISTRE", "EVENT <- click loginButton (go index.html)");
    window.location.href = "./index.html";
  });
});


/* ------------------------------------------------------
   2. Funcions d’interfície i autocompletat
------------------------------------------------------ */
/*
   Aquest bloc agrupa peces petites que es repeteixen i que es no volen tenir barrejades amb
   el punt d'entrada. Són helpers de UI: creen opcions del select, sincronitzen CP i ciutat
   i fan un autocompletat simple de l’email.

   Totes les funcions que treballen amb poblacions depenen de cities.
   Si no està carregat, es fa un fallback controlat per no trencar la interfície.
*/

/* ------------------------------------------------------
   2.1 omplirSelectPoblacions()
------------------------------------------------------ */
/*
   Aquesta funció agafa l'array global de cities i el converteix en <option> dins del select.
   Ho fem amb DOM real (createElement) perquè és més net i perquè evitem concatenar HTML.

   Si cities no és un array, s'atura l'execució perquè és un problema de configuració, no d'ús.
*/

function omplirSelectPoblacions(selectPoblacio) {
  if (!Array.isArray(cities)) {
    UI.error("REGISTRE", "No hi ha cities (dades.js)");
    return;
  }

  cities.forEach((poblacio) => {
    const opcio = document.createElement("option");
    opcio.value = poblacio.name;
    opcio.textContent = poblacio.name;
    selectPoblacio.appendChild(opcio);
  });
}

/* ------------------------------------------------------
   2.2 autocompletarCPDesDePoblacio()
------------------------------------------------------ */
/*
   Sincronitza "població -> codi postal" per agilitzar el formulari i evitar incoherències.
*/

function autocompletarCPDesDePoblacio(selectPoblacio, inputCodiPostal) {
  const poblacioSeleccionada = netejarText(selectPoblacio.value);

  if (poblacioSeleccionada === "") {
    inputCodiPostal.value = "";
    return;
  }

  if (!Array.isArray(cities)) return;

  const poblacioTrobada = cities.find((p) => p.name === poblacioSeleccionada);
  if (!poblacioTrobada) return;

  inputCodiPostal.value = poblacioTrobada.postalCode;
}

/* ------------------------------------------------------
   2.3 validarCPExisteixIAssignarPoblacio()
------------------------------------------------------ */
/*
   Aquest és el flux invers: "codi postal -> població". És útil perquè hi ha usuaris que
   comencen pel CP, i així evitem que CP i ciutat quedin desalineats.
*/

function validarCPExisteixIAssignarPoblacio(inputCodiPostal, selectPoblacio) {
  const cp = netejarText(inputCodiPostal.value);
  if (cp === "") return;

  if (!/^\d{5}$/.test(cp)) {
    UI.alertMissatge("El codi postal ha de tenir 5 dígits");
    return;
  }

  if (!Array.isArray(cities)) return;

  const poblacioPerCP = cities.find((p) => String(p.postalCode) === cp);

  if (!poblacioPerCP) {
    UI.alertMissatge("Aquest codi postal no existeix a la llista de poblacions");
    selectPoblacio.value = "";
    return;
  }

  selectPoblacio.value = poblacioPerCP.name;
}

/* ------------------------------------------------------
   2.4 autocompletarDominiUOC()
------------------------------------------------------ */
/*
   Autocompletat petit però pràctic: si l'usuari escriu "@", és completa "uoc.edu".
   No valida res, només ajuda. La validació d'email es fa a la secció 3.
*/
function autocompletarDominiUOC(inputEmail) {
  const valor = String(inputEmail.value ?? "");
  if (valor.endsWith("@")) inputEmail.value = valor + "uoc.edu";
}


/* ------------------------------------------------------
   3. Validació del formulari (UI / UX)
------------------------------------------------------ */
/*
   Aquí validem el formulari abans de crear l'usuari. Aquesta validació està pensada
   per UX: missatges clars i immediats, i un flux que s'atura al primer error perquè
   l'usuari sàpiga què ha de corregir.

   Aquesta validació és d'UI. El model (User) torna a validar sempre abans de desar.
*/

function validarFormulariRegistre(dades) {

  /* ------------------------------------------------------
     3.1 Preparació i normalització d'entrada
  ------------------------------------------------------ */
  /*
     Ens preparem per casos límit: si "dades" no és un objecte vàlid, fem fallback a {}.
     Així no trenquem la interficie amb errors de propietats inexistents i podem retornar un missatge
     controlat si calgués.

     També fem trim() aquí per assegurar que validem sobre valors nets, encara que per algun
     motiu la funció es cridés amb dades no normalitzades.
  */

  const d = (dades && typeof dades === "object") ? dades : {};

  const name = String(d.name ?? "").trim();
  const surname = String(d.surname ?? "").trim();
  const address = String(d.address ?? "").trim();
  const city = String(d.city ?? "").trim();
  const postalCode = String(d.postalCode ?? "").trim();
  const email = String(d.email ?? "").trim();
  const username = String(d.username ?? "").trim();
  const password = String(d.password ?? "");

  /* ------------------------------------------------------
     3.2 Validacions de camps obligatoris
  ------------------------------------------------------ */
  /*
     Comencem pel que és més directe: camps buits i mínims raonables. Són validacions
     simples, però són les que eviten la major part d'errors d'entrada i donen feedback ràpid.
  */

  if (name === "") {
    return { ok: false, message: "El nom no pot estar buit" };
  }
  if (name.length < 2) {
    return { ok: false, message: "El nom ha de tenir com a mínim 2 caràcters" };
  }

  if (surname === "") {
    return { ok: false, message: "Els cognoms no poden estar buits" };
  }

  if (address === "") {
    return { ok: false, message: "L'adreça no pot estar buida" };
  }

  if (city === "") {
    return { ok: false, message: "Has de seleccionar una població" };
  }

  /* ------------------------------------------------------
     3.3 Validació CP i coherència amb població
  ------------------------------------------------------ */
  /*
     Aquí validem en dos nivells:
     - format del CP (5 dígits),
     - i coherència amb la ciutat segons cities.

     Si no tenim cities, no és pot comprovar coherència: ho retornem com a error de
     configuració perquè és una dependència real del formulari.
  */

  const patroCP = /^\d{5}$/;
  if (!patroCP.test(postalCode)) {
    return { ok: false, message: "El codi postal ha de tenir 5 dígits" };
  }

  if (!Array.isArray(cities)) {
    return { ok: false, message: "No hi ha dades de poblacions (cities). Revisa dades.js" };
  }

  const ciutatTrobada = cities.find((p) => String(p?.name ?? "").trim() === city);

  if (!ciutatTrobada) {
    return { ok: false, message: "La població seleccionada no és vàlida" };
  }

  if (String(ciutatTrobada.postalCode) !== postalCode) {
    return { ok: false, message: "El codi postal no coincideix amb la població seleccionada" };
  }

  /* ------------------------------------------------------
     3.4 Validació email
  ------------------------------------------------------ */
  /*
     Patró simple per detectar errors evidents. No és buscz una validació perfecta,
     però sí evitar els casos típics que després donen problemes (sense @, sense domini, espais).
  */

  const patroEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!patroEmail.test(email)) {
    return { ok: false, message: "El format de l'email no és vàlid" };
  }

  /* ------------------------------------------------------
     3.5 Validació username i comprovació de duplicats
  ------------------------------------------------------ */
  /*
     El username ha de ser usable (no buit, mida mínima). Com el model té una funció
     per detectar duplicats, l’aprofitem aquí per avisar abans d’intentar guardar.
  */

  if (username === "") {
    return { ok: false, message: "El nom d'usuari no pot estar buit" };
  }
  if (username.length < 3) {
    return { ok: false, message: "El nom d'usuari ha de tenir com a mínim 3 caràcters" };
  }

  const existeixFuncioExisteixUsername =
    (typeof User !== "undefined" && typeof User.existeixUsername === "function");

  if (existeixFuncioExisteixUsername && User.existeixUsername(username)) {
    return { ok: false, message: "Aquest nom d'usuari ja està registrat" };
  }

  /* ------------------------------------------------------
     3.6 Validació password
  ------------------------------------------------------ */
  /*
     Aquí posem un criteri mínim de complexitat per forçar a treballar
     validacions i evitar contrasenyes massa febles. El missatge és concret perquè l'usuari
     entengui què li falta, sense haver d'endevinar.
  */
 
  const patroPassword = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
  if (!patroPassword.test(password)) {
    return {
      ok: false,
      message: "La contrasenya ha de tenir mínim 8 caràcters, lletres, números i un caràcter especial"
    };
  }

  /*
     Si hem arribat fins aquí, l'entrada és coherent a nivell d’UI i podem continuar cap al model.
  */
  return { ok: true, message: "Validació OK" };
}


/* ------------------------------------------------------
   4. Helpers
------------------------------------------------------ */
/* ------------------------------------------------------
   4.1 netejarText()
------------------------------------------------------ */
/*
   Neteja un text eliminant espais sobrants.
   Serveix per evitar valors inconsistents abans de validar o guardar dades.
*/

function netejarText(valor) {
  return String(valor ?? "").trim().replace(/\s+/g, " ");
}
