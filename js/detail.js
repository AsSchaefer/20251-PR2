/* ------------------------------------------------------
   PR2 / Entrega 2 — Detall de Pokémon (interfície)
   ------------------------------------------------------
   Alumna: Alexandra Schäfer Barrientos
   Data: 9 de gener de 2026
   Fitxer: detail.js

   Descripció:
   Controlador de detail.html. Aquesta pantalla construeix el detall d’un Pokémon
   a partir d’un id a la URL, recuperant les dades del caixet compartit i
   renderitzant-ho tot amb DOM real, sense innerHTML.

   Objectiu:
   Mantenim coherència amb l’índex: aquí no fem fetch, deleguem estat i llistes
   al model, i fem fallbacks defensius quan falten peces (id absent, caixet buit…)
   per no trencar la UI. La navegació també queda controlada amb returnUrl.
 
   ------------------------------------------------------
   Estructura del fitxer

   1. Punt d'entrada (DOMContentLoaded)
      1.1 Tancament de menús fora click (AUX)
      1.2 Obtenir id des de la URL (AUX)
      1.3 Recuperar Pokémon del caixet (AUX)
      1.4 Render del detall (DOM real + menú + listeners)
      1.5 Actualització del menú superior (comptadors)
      1.6 Botó tornar (returnUrl)

   2. Missatge d’error (UI defensiva)
      2.1 mostrarMissatgeError()

   3. Helpers de DOM (petites fàbriques)
      3.1 crearSaltLinia()
      3.2 crearBlocLabelValor()

   4. Render del detall (card completa)
      4.1 crearCardPokemonAmpliada()
         4.1.1 Header: títol + menú (AUX)
         4.1.2 Dropdown: obertura / tancament
         4.1.3 Dropdown: accions myTeam / wishes (MODEL + UI)
         4.1.4 Body: imatge + informació
         4.1.5 Tipus: badges
         4.1.6 Stats: muntatge de secció
         4.1.7 Muntatge final de la card

   5. Helpers d’stats 
      5.1 crearSeccioStats()
      5.2 calcularPercentStat()

   6. Botó tornar (returnUrl)
      6.1 inicialitzarBotoTornar()

   7. Helpers de format (presentació)
      7.1 capitalize()
      7.2 formatAltura()
      7.3 formatPes()
      7.4 formatHabilitats()
      7.5 mapNomStat()

------------------------------------------------------ */


/* ------------------------------------------------------
   1. Punt d'entrada (DOMContentLoaded)
------------------------------------------------------ */
/*
   Aquí arrenca el flux de detail.html. La idea és simple: validar l'id, recuperar dades
   del caixet (sense fetch) i construir la UI. Si alguna peça no hi és, parem amb un
   missatge controlat per no deixar la pantalla "trencada" o a mig pintar.
*/

document.addEventListener("DOMContentLoaded", () => {
  UI.log("DETAIL", "detail.js carregat");

  /* ------------------------------------------------------
     1.1 Tancament de menús fora click (AUX)
  ------------------------------------------------------ */
  /*
     UX compartida: qualsevol dropdown es tanca si l'usuari fa clic fora. Ho deleguem a AUX
     perquè sigui el mateix patró a totes les pantalles i no dupliquem listeners.
  */

  auxActivarTancamentMenusForaClick();

  /* ------------------------------------------------------
     1.2 Obtenir id des de la URL (AUX)
  ------------------------------------------------------ */
  /*
     Aquesta pantalla depèn d'un paràmetre: detail.html?id=...
     Si no és un enter vàlid, no podem decidir què pintar i fem fallback immediat.
  */

  const idPokemon = auxObtenirParamInt("id");

  if (idPokemon === null) {
    UI.error("DETAIL", "idPokemon null (URL sense ?id=...)");
    mostrarMissatgeError("No s'ha trobat cap Pokémon seleccionat");
    return;
  }

  /* ------------------------------------------------------
     1.3 Recuperar Pokémon del caixet (AUX)
  ------------------------------------------------------ */
  /*
     Decisió del projecte: aquí NO fem fetch. Reutilitzem la Pokédex compartida al caixet.
     Si l'usuari entra directament sense haver carregat l'índex, és normal que no hi hagi dades:
     en aquest cas preferim un missatge clar abans que trencar la UI.
  */

  const pokemon = auxGetPokemonById(idPokemon);

  if (!pokemon) {
    UI.error("DETAIL", "Pokémon no trobat al caixet", { idPokemon });
    mostrarMissatgeError("No hi ha dades guardades. Torna a l'índex i carrega la Pokédex");
    return;
  }

  /* ------------------------------------------------------
     1.4 Render del detall (DOM real + menú + listeners)
  ------------------------------------------------------ */
  /*
     Un cop tenim dades, construïm la card ampliada. La responsabilitat d'aquesta pantalla és
     "pintar" i connectar accions de UI: qualsevol canvi d'estat (llistes) el deleguem al model.
  */

  crearCardPokemonAmpliada(pokemon);

  /* ------------------------------------------------------
     1.5 Actualització del menú superior (comptadors)
  ------------------------------------------------------ */
  /*
     El menú superior depèn de l'estat real del model (myTeam/wishes). El refresquem després
     del render perquè la capçalera quedi sincronitzada.
  */

  updateMenu();

  /* ------------------------------------------------------
     1.6 Botó tornar (returnUrl)
  ------------------------------------------------------ */
  /*
     Navegació coherent: si tenim returnUrl, el respectem; si no, fallback a indice.html.
     Això evita que la pantalla quedi "sense sortida" en fluxos diferents.
  */

  inicialitzarBotoTornar();
});


/* ------------------------------------------------------
   2. Missatge d’error 
------------------------------------------------------ */
/*
   Quan falta una peça crítica (id o dades al caixet), no intentem "improvisar" UI.
   Netejem el contenidor i mostrem un text curt. És el fallback més segur per no trencar res.
*/

function mostrarMissatgeError(text) {
  const cont = document.getElementById("pokemonDetail");
  if (!cont) return;

  cont.textContent = "";

  const p = document.createElement("p");
  p.textContent = String(text);

  cont.appendChild(p);
}


/* ------------------------------------------------------
   3. Helpers de DOM (petites fàbriques)
------------------------------------------------------ */
/*
   Aquests helpers existeixen per mantenir el render net: quan el DOM es construeix "a mà",
   és fàcil repetir patrons. Aquí els encapsulem perquè el codi principal sigui més llegible.
*/

function crearSaltLinia() {
  return document.createElement("br");
}


function crearBlocLabelValor(labelText, valorText) {
  /*
     Patró visual repetit al detall: etiqueta en negreta i valor a sota. Centralitzar-ho
     evita inconsistències quan afegim o ajustem camps.
  */
  const bloc = document.createElement("div");

  const strong = document.createElement("strong");
  strong.textContent = String(labelText);

  const valor = document.createElement("span");
  valor.textContent = String(valorText);

  bloc.appendChild(strong);
  bloc.appendChild(crearSaltLinia());
  bloc.appendChild(valor);

  return bloc;
}


/* ------------------------------------------------------
   4. Render del detall (card completa)
------------------------------------------------------ */
/*
   Aquesta funció construeix tota la card del detall amb DOM real. La regla és la mateixa
   que a la resta del projecte: UI i UX aquí; estat i persistència al model. Quan alguna dada
   és incompleta, preferim fallbacks suaus (strings buits o arrays buits) abans que errors.
*/

function crearCardPokemonAmpliada(pokemon) {
  const cont = document.getElementById("pokemonDetail");
  if (!cont) return;

  cont.textContent = "";

  const card = document.createElement("div");
  card.className = "detail-card";

  /* ------------------------------------------------------
     4.1 Header: títol + menú (AUX)
  ------------------------------------------------------ */
  const header = document.createElement("div");
  header.className = "detail-header";

  const titol = document.createElement("h2");
  titol.className = "detail-title";

  const idText = String(pokemon.id ?? "").padStart(3, "0");
  titol.textContent = `${capitalize(pokemon.name)}  N° ${idText}`;
  header.appendChild(titol);

  /*
     Reutilitzem el mateix menú que a l'índex via AUX. Això actua com un "mini-caixet" d'UI:
     mantenim el patró de dropdown i evitem duplicar implementació en múltiples pantalles.
  */
  const { menuBtn, dropdown, btnEquipo, btnDeseos } = auxAfegirHeaderMenuIndex(header);

  /* ------------------------------------------------------
     4.1.1 Obertura / tancament del dropdown
  ------------------------------------------------------ */
  /*
     Abans d'obrir, refresquem el text/icona segons l'estat real (model). També tanquem la resta
     de menús per mantenir obertura exclusiva i una UX més neta.
  */
  menuBtn.addEventListener("click", (event) => {
    event.preventDefault();

    // Abans d’obrir: refresquem text/icon segons estat real del model
    auxActualitzarTextBotonsLlistes(btnEquipo, btnDeseos, pokemon.id);

    // Menú exclusiu: tanquem els altres
    const estavaObert = !dropdown.classList.contains("hidden");
    auxTancarTotsElsMenusCards();

    // Si no estava obert, l’obrim
    if (!estavaObert) dropdown.classList.remove("hidden");
  });

  /* ------------------------------------------------------
     4.1.2 Listeners dels botons del menú (myTeam / wishes)
  ------------------------------------------------------ */
  /*
     Connectem listeners aquí perquè els botons neixen aquí (sense IDs globals ni cerques extra).
     Flux: toggle al model → traça → refresc del dropdown → updateMenu() → tancar dropdowns.
     Això manté coherència i evita que la UI quedi en un estat visual diferent de l'estat real.
  */

  function executarToggleILancarUI(tipusLlista) {
    /* Toggle al model */
    const resultat = User.alternarPokemonALlistaUsuariActual(tipusLlista, pokemon.id);

    // Traça homogènia del projecte
    UI.traceResult("DETAIL", `toggle ${tipusLlista} (id=${pokemon.id})`, resultat);

    /* Alert només si cal (límit 6 a myTeam) */
    const esMyTeam = (tipusLlista === "myTeam");
    const esKo = (resultat?.ok === false);
    const esLimit6 = (resultat?.message === "My equipo solo puede tener 6 Pokémon");

    if (esMyTeam && esKo && esLimit6) {
      UI.alertResultat(resultat, "Límit d'equip");
    }

    /* Refrescos visuals */
    auxActualitzarTextBotonsLlistes(btnEquipo, btnDeseos, pokemon.id);

    // Menú superior (comptadors): mantenim updateMenu() directe
    updateMenu();

    // Tancar menús 
    auxTancarTotsElsMenusCards();
  }

  /* Listener: Mi equipo */
  btnEquipo.addEventListener("click", (event) => {
    event.preventDefault();
    executarToggleILancarUI("myTeam");
  });

  /* Listener: Deseos */
  btnDeseos.addEventListener("click", (event) => {
    event.preventDefault();
    executarToggleILancarUI("wishes");
  });

  /* ------------------------------------------------------
     4.2 Body: imatge + informació
  ------------------------------------------------------ */
  /*
     Construïm la part informativa del detall amb fallbacks simples (strings buits o "-").
     Això ens dona robustesa: si alguna propietat no existeix, la UI segueix sent usable.
  */

  const body = document.createElement("div");
  body.className = "detail-body";

  const imgWrap = document.createElement("div");
  imgWrap.className = "detail-image";

  const img = document.createElement("img");
  img.src = pokemon.sprites || "";
  img.alt = pokemon.name || "pokemon";

  imgWrap.appendChild(img);

  const info = document.createElement("div");
  info.className = "detail-info";

  const desc = document.createElement("p");
  desc.className = "detail-description";
  desc.textContent = pokemon.description || "";
  info.appendChild(desc);

  const dades = document.createElement("div");
  dades.className = "detail-data";

  // Dades amb format (unitats + fallbacks)
  const altura = crearBlocLabelValor("Altura", formatAltura(pokemon.height));
  const pes = crearBlocLabelValor("Peso", formatPes(pokemon.weight));
  const habilitats = crearBlocLabelValor("Habilidad", formatHabilitats(pokemon.abilities));
  const exp = crearBlocLabelValor("Experiencia base", pokemon.baseExperience ?? "-");

  dades.appendChild(altura);
  dades.appendChild(pes);
  dades.appendChild(habilitats);
  dades.appendChild(exp);

  info.appendChild(dades);

  /* ------------------------------------------------------
     4.3 Tipus: badges
  ------------------------------------------------------ */
  /*
     Tipus com a badges. Si el format no és l'esperat, fem fallback a [] i no trenquem res.
  */

  const tipusWrap = document.createElement("div");
  tipusWrap.className = "detail-types";

  const labelTipus = document.createElement("strong");
  labelTipus.textContent = "Tipo ";
  tipusWrap.appendChild(labelTipus);

  const tipus = Array.isArray(pokemon.types) ? pokemon.types : [];
  tipus.forEach((t) => {
    const badge = document.createElement("span");
    badge.className = "detail-type-badge";
    badge.textContent = String(t);
    tipusWrap.appendChild(badge);
  });

  info.appendChild(tipusWrap);

  body.appendChild(imgWrap);
  body.appendChild(info);

  /* ------------------------------------------------------
     4.4 Stats: secció separada
  ------------------------------------------------------ */
  /*
     Les stats van en una secció independent per mantenir el layout previsible. El càlcul de percentatge
     està pensat perquè una dada estranya no trenqui la barra ni desmunti el disseny.
  */

  const statsSection = crearSeccioStats(pokemon.stats);

  /* ------------------------------------------------------
     4.5 Muntatge final de la card
  ------------------------------------------------------ */
  /*
     Muntem la jerarquia final i la inserim al DOM. Un cop la card existeix, deixem el dropdown
     en estat coherent (text + icona) sense esperar el primer clic.
  */

  card.appendChild(header);
  card.appendChild(body);
  card.appendChild(statsSection);

  cont.appendChild(card);

  /*
     Quan la card ja existeix al DOM, deixem els botons del menú en estat coherent
     (text + icona) sense esperar que l’usuari obri el dropdown.
  */

  auxActualitzarTextBotonsLlistes(btnEquipo, btnDeseos, pokemon.id);
}


/* ------------------------------------------------------
   5. Helpers d’stats (robustesa de layout)
------------------------------------------------------ */
/*
   Aquestes funcions només existeixen per construir i protegir la secció de stats:
   - si falten stats, pintem una llista buida (no error)
   - si un valor surt de rang, clampem percentatges per no trencar l'amplada de la barra
*/

function crearSeccioStats(stats) {
  const section = document.createElement("div");
  section.className = "detail-stats";

  const titol = document.createElement("h3");
  titol.className = "detail-stats-title";
  titol.textContent = "Puntos de base";
  section.appendChild(titol);

  const llista = document.createElement("div");
  llista.className = "detail-stats-list";

  const arr = Array.isArray(stats) ? stats : [];

  arr.forEach((s) => {
    const fila = document.createElement("div");
    fila.className = "stat-row";

    const nom = document.createElement("div");
    nom.className = "stat-name";
    nom.textContent = mapNomStat(s.name);

    const barraWrap = document.createElement("div");
    barraWrap.className = "stat-bar-wrap";

    const barra = document.createElement("div");
    barra.className = "stat-bar";

    // Protecció UI: percentatge perquè la barra no trenqui el layout
    const valor = Number(s.value);
    const percent = calcularPercentStat(valor);
    barra.style.width = `${percent}%`;

    barraWrap.appendChild(barra);

    fila.appendChild(nom);
    fila.appendChild(barraWrap);

    llista.appendChild(fila);
  });

  section.appendChild(llista);
  return section;
}

function calcularPercentStat(valor) {
  const max = 200;
  const v = Number.isFinite(valor) ? valor : 0;
  const clamped = Math.max(0, Math.min(v, max));
  return Math.round((clamped / max) * 100);
}


/* ------------------------------------------------------
   6. Botó tornar (returnUrl)
------------------------------------------------------ */
/*
   Navegació controlada amb estat compartit: si hi ha returnUrl a localStorage, el respectem.
   Si no existeix, fallback a indice.html. Això manté el flux estable i evita pantalles "sense retorn".
*/

function inicialitzarBotoTornar() {
  const btn = document.getElementById("backButton");
  if (!btn) return;

  btn.addEventListener("click", (event) => {
    event.preventDefault();

    const returnUrl = localStorage.getItem(AUX_CLAU_RETURN_URL);

    UI.log("DETAIL", "EVENT <- click backButton", { returnUrl: returnUrl ?? null });

    if (returnUrl) window.location.href = returnUrl;
    else window.location.href = "indice.html";
  });
}


/* ------------------------------------------------------
   7. Helpers de format (presentació)
------------------------------------------------------ */
/*
   Helpers de presentació: aquí només fem transformacions a text i unitats.
   Si el valor no és vàlid, retornem "-" per mantenir la UI robusta.
*/

function capitalize(text) {
  if (typeof text !== "string" || text.length === 0) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}


function formatAltura(height) {
  // PokéAPI: decímetres -> metres
  const n = Number(height);
  if (!Number.isFinite(n)) return "-";
  return `${(n / 10).toFixed(1)} m`;
}


function formatPes(weight) {
  // PokéAPI: hectograms -> kg
  const n = Number(weight);
  if (!Number.isFinite(n)) return "-";
  return `${(n / 10).toFixed(1)} kg`;
}


function formatHabilitats(abilities) {
  const arr = Array.isArray(abilities) ? abilities : [];
  if (arr.length === 0) return "-";
  return arr.join(", ");
}


function mapNomStat(nomApi) {
  switch (String(nomApi)) {
    case "hp": return "PS";
    case "attack": return "Ataque";
    case "defense": return "Defensa";
    case "special-attack": return "Ataque Esp.";
    case "special-defense": return "Defensa Esp.";
    case "speed": return "Velocidad";
    default: return String(nomApi);
  }
}
