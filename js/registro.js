/* ------------------------------------------------------
    PR2 – Registre d’usuaris (interfície)
  ------------------------------------------------------
    Alumna: Alexandra Schäfer Barrientos
    Data: 23 de desembre de 2025
    Fitxer: registro.js
    
    Descripció:
    Aquest fitxer controla el registre d’usuaris des de
    la interfície.

    Definim el flux complet de registre:
        - recollim les dades del formulari,
        - validem els camps,
        - i creem l’usuari al model si tot és correcte.
  ------------------------------------------------------

    Estructura del fitxer:

    1. Inicialització del registre (DOMContentLoaded)
        1.1 Captura d’elements del DOM
        1.2 Control mínim d’elements obligatoris
        1.3 Preparació del select de poblacions
        1.4 Esdeveniments d’ajuda (població/CP/email)
        1.5 Procés de registre (validació + model + save)
        1.6 Tornar a login

    2. Funcions d’interfície i autocompletat
        2.1 omplirSelectPoblacions(selectPoblacio)
        2.2 autocompletarCPDesDePoblacio(selectPoblacio, inputCodiPostal)
        2.3 validarCPExisteixIAssignarPoblacio(inputCodiPostal, selectPoblacio)
        2.4 autocompletarDominiUOC(inputEmail)
        
    3. Validació del formulari
        3.1 validarFormulariRegistre(dades)
------------------------------------------------------ */



/* ------------------------------------------------------
    1. Inicialització del registre (DOMContentLoaded)
   ------------------------------------------------------
    Treballarem quan el DOM ja estigui carregat perquè necessitem
    recuperar inputs i botons del formulari i afegir listeners.
   ------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {

  console.log("registro.js carregat correctament.");


  /* ------------------------------------------------------
      1.1 Captura d’elements del DOM
    ------------------------------------------------------
        Recuperem tots els camps del formulari amb els IDs del HTML base.
        Guardar aquestes referències evita repetir cerques i fa el codi
        més llegible.
    ------------------------------------------------------ */

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
      1.2 Control mínim d’elements obligatoris
     ------------------------------------------------------
      Si falta algun element, el registre no es pot executar.
      Aturem el script per evitar errors posteriors amb null.
    ------------------------------------------------------ */

  const faltenElements = (
    !inputNom || !inputCognoms || !inputAdreca || !selectPoblacio ||
    !inputCodiPostal || !inputEmail || !inputNomUsuari || !inputContrasenya ||
    !botoGuardar || !botoTornarLogin
  );

  if (faltenElements) {
    console.error("Falten elements del formulari de registre. Revisa registro.html.");
    return;
  }


  /* ------------------------------------------------------
      1.3 Preparació del select de poblacions
     ------------------------------------------------------
      Omplim el desplegable amb les dades de config.js (array cities).
    ------------------------------------------------------ */
  omplirSelectPoblacions(selectPoblacio);


  /* ------------------------------------------------------
     1.4 Esdeveniments d’ajuda (població/CP/email)
    ------------------------------------------------------ */

    /* ------------------------------------------------------
        1.4.1 Canvi de població -> autocompletar codi postal
       ------------------------------------------------------ */
  selectPoblacio.addEventListener("change", () => {
    autocompletarCPDesDePoblacio(selectPoblacio, inputCodiPostal);
  });

   /* ------------------------------------------------------
        1.4.2 Sortida del camp CP -> validar i assignar població
      ------------------------------------------------------ */
  inputCodiPostal.addEventListener("blur", () => {
    validarCPExisteixIAssignarPoblacio(inputCodiPostal, selectPoblacio);
  });

   /* ------------------------------------------------------
        1.4.3 Email -> autocompletar domini @uoc.edu
      ------------------------------------------------------ */
  inputEmail.addEventListener("input", () => {
    autocompletarDominiUOC(inputEmail);
  });


   /* ------------------------------------------------------
       1.5 Procés de registre (click Guardar)
      ------------------------------------------------------
       Recollim dades, validem i, si són correctes, creem el User i fem save().
      ------------------------------------------------------ */
  botoGuardar.addEventListener("click", () => {

    console.log("Intent de registre iniciat.");


    /* ------------------------------------------------------
        1.5.1 Recollida de dades (claus en anglès)
       ------------------------------------------------------
        Les claus han de coincidir amb el constructor de User: name, surname...
        Si canviem aquestes claus, el model rebria undefined.
       ------------------------------------------------------ */
    const dades = {
      name: inputNom.value,
      surname: inputCognoms.value,
      address: inputAdreca.value,
      city: selectPoblacio.value,
      postalCode: inputCodiPostal.value,
      email: inputEmail.value,
      username: inputNomUsuari.value,
      password: inputContrasenya.value
    };


    /* ------------------------------------------------------
        1.5.2 Validació completa del formulari
       ------------------------------------------------------
       Centralitzem la validació en una funció per evitar regles disperses.
       ------------------------------------------------------ */
    const resultatValidacio = validarFormulariRegistre(dades);

    if (resultatValidacio.ok === false) {
      console.warn("Error de validació:", resultatValidacio.message);
      alert(resultatValidacio.message);
      return;
    }


    /* ------------------------------------------------------
        1.5.3 Creació d’usuari (model) i guardat
       ------------------------------------------------------
        Fem trim als camps de text perquè el model treballi amb dades netes.
        save() s’encarrega de comprovar duplicats i guardar a localStorage.
       ------------------------------------------------------ */
    const nouUsuari = new User({
      name: dades.name.trim(),
      surname: dades.surname.trim(),
      address: dades.address.trim(),
      city: dades.city.trim(),
      postalCode: String(dades.postalCode).trim(),
      email: dades.email.trim(),
      username: dades.username.trim(),
      password: dades.password
    });

    const guardat = nouUsuari.save();

    if (guardat === false) {
      console.error("No s'ha pogut guardar l'usuari (possible username repetit).");
      alert("No s'ha pogut guardar l'usuari. Revisa si el username ja existeix.");
      return;
    }

    console.log("Usuari registrat correctament. Redirecció a index.html.");
    alert("Usuari registrat correctament!");
    window.location.href = "./index.html";
  });


  /* ------------------------------------------------------
     1.6 Tornar a login
     ------------------------------------------------------ */
  botoTornarLogin.addEventListener("click", () => {
    console.log("Tornant a index.html...");
    window.location.href = "./index.html";
  });

});



/* ------------------------------------------------------
   2. Funcions d’interfície i autocompletat
   ------------------------------------------------------ */


    /* ------------------------------------------------------
        2.1 omplirSelectPoblacions(selectPoblacio)
       ------------------------------------------------------
        Omple el select amb les poblacions disponibles a cities.
        S’espera que cada element tingui name i postalCode.
       ------------------------------------------------------ */

function omplirSelectPoblacions(selectPoblacio) {

  if (!Array.isArray(cities)) {
    console.error("No existeix 'cities' o no és un array. Revisa config.js.");
    return;
  }

  cities.forEach((poblacio) => {
    const opcio = document.createElement("option");
    opcio.value = poblacio.name;
    opcio.textContent = poblacio.name;
    selectPoblacio.appendChild(opcio);
  });

  console.log("Select de poblacions omplert correctament.");
}


    /* ------------------------------------------------------
        2.2 autocompletarCPDesDePoblacio(selectPoblacio, inputCodiPostal)
       ------------------------------------------------------
       Quan es tria una població, es busca a cities i es copia el seu CP.
       ------------------------------------------------------ */
function autocompletarCPDesDePoblacio(selectPoblacio, inputCodiPostal) {

  const poblacioSeleccionada = selectPoblacio.value;

  if (poblacioSeleccionada === "") {
    inputCodiPostal.value = "";
    return;
  }

  const poblacioTrobada = cities.find((p) => p.name === poblacioSeleccionada);

  if (!poblacioTrobada) {
    console.error("No s'ha trobat la població dins 'cities'.");
    return;
  }

  inputCodiPostal.value = poblacioTrobada.postalCode;
}


    /* ------------------------------------------------------
        2.3 validarCPExisteixIAssignarPoblacio(inputCodiPostal, selectPoblacio)
       ------------------------------------------------------ */

       // Quan es surt del camp CP, es valida i s’assigna la població corresponent.
function validarCPExisteixIAssignarPoblacio(inputCodiPostal, selectPoblacio) {

  const cp = String(inputCodiPostal.value).trim();

  if (cp === "") return;

  if (!/^\d{5}$/.test(cp)) {
    alert("El codi postal ha de tenir 5 dígits.");
    return;
  }

  const poblacioPerCP = cities.find((p) => p.postalCode === cp);

  if (!poblacioPerCP) {
    alert("Aquest codi postal no existeix a la llista de poblacions.");
    selectPoblacio.value = "";
    return;
  }

  selectPoblacio.value = poblacioPerCP.name;
}


    /* ------------------------------------------------------
        2.4 autocompletarDominiUOC(inputEmail)
    ------------------------------------------------------ */

    // Si l’email acaba en “@”, completem amb “uoc.edu”.
function autocompletarDominiUOC(inputEmail) {
  const valor = inputEmail.value;

  if (valor.endsWith("@")) {
    inputEmail.value = valor + "uoc.edu";
  }
}



/* ------------------------------------------------------
3. Validació del formulari
------------------------------------------------------ */


/* ------------------------------------------------------
    3.1 validarFormulariRegistre(dades)
   ------------------------------------------------------ */
   // Valida totes les dades del formulari de registre.
function validarFormulariRegistre(dades) {

  
  //  Nom 
  if (typeof dades.name !== "string" || dades.name.trim() === "") {
    return { ok: false, message: "El nom no pot estar buit." };
  }

  // Cognoms
  if (typeof dades.surname !== "string" || dades.surname.trim() === "") {
    return { ok: false, message: "Els cognoms no poden estar buits." };
  }

  // Adreça
  if (typeof dades.address !== "string" || dades.address.trim() === "") {
    return { ok: false, message: "L'adreça no pot estar buida." };
  }

  // Població
  if (typeof dades.city !== "string" || dades.city.trim() === "") {
    return { ok: false, message: "Has de seleccionar una població." };
  }

  // Codi postal
  const cp = String(dades.postalCode).trim();

  if (!/^\d{5}$/.test(cp)) {
    return { ok: false, message: "El codi postal ha de tenir 5 dígits." };
  }

  if (!Array.isArray(cities) || !cities.some((p) => p.postalCode === cp)) {
    return { ok: false, message: "El codi postal no existeix a la llista de poblacions." };
  }

  // Email
  const email = String(dades.email).trim();
  const patroEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!patroEmail.test(email)) {
    return { ok: false, message: "El format de l'email no és vàlid." };
  }

  // Nom d’usuari
  const username = String(dades.username).trim();

  if (username === "") {
    return { ok: false, message: "El nom d'usuari no pot estar buit." };
  }

  if (typeof User.existeixUsername === "function" && User.existeixUsername(username)) {
    return { ok: false, message: "Aquest nom d'usuari ja està registrat." };
  }

  // Contrasenya
  const password = String(dades.password);
  const patroPassword = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  if (!patroPassword.test(password)) {
    return {
      ok: false,
      message: "La contrasenya ha de tenir mínim 8 caràcters, lletres, números i un caràcter especial."
    };
  }

  return { ok: true };
}
