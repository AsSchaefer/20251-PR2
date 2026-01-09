/* ------------------------------------------------------
   PR2 / Entrega 2
   ------------------------------------------------------
   Alumna: Alexandra Schäfer Barrientos
   Data: 9 de gener de 2026
   Fitxer: aux.js

   Descripció:
   Aquest fitxer reuneix utilitats compartides que fan de “cola” entre pantalles
   protegides (indice.html, detail.html i listas.html). Aquí concentrem peces petites
   que es reutilitzen sovint: caixet de Pokédex, navegació cap al detall amb retorn,
   comportaments comuns de UI (menús i botons), lectura de paràmetres i la factoria
   de cards construïdes amb DOM real (sense innerHTML).

   Objectiu:
   L’objectiu és evitar duplicació i mantenir coherència de projecte: en lloc de
   repetir la mateixa lògica a cada controlador, centralitzem aquí decisions que es
   repeteixen (caixet/mini-caixet, fallbacks, i patrons de construcció de UI) perquè
   el codi sigui més net i perquè, si alguna cosa falla, preferim un comportament
   controlat abans que trencar la UI o deixar-la en un estat inconsistent.

------------------------------------------------------
   Estructura del fitxer

   0. Log mínim de càrrega (traça unificada)

   1. Claus compartides (localStorage)

   2. Caixet de Pokédex (localStorage + memòria)
      2.1 Variable de memòria (mini-caixet)
      2.2 Reset de memòria
      2.3 Llegir Pokédex del caixet
      2.4 Guardar Pokédex al caixet
      2.5 Obtenir Pokémon per id

   3. Navegació cap al detall (returnUrl + redirect)

   4. Interfície: tancament de menús 
      4.1 Estat intern per evitar duplicacions
      4.2 Tancar tots els dropdowns
      4.3 Activar tancament quan es fa click fora

   5. Interfície: text + icona de botons (equip / desitjos)
      5.1 Assegurar estructura del botó (icona + text)
      5.2 Actualitzar text i icona segons llistes de l’usuari

   6. Helpers petits (paràmetres de la URL)
      6.1 Llegir un paràmetre com a enter

   7. Factoria de cards
      7.1 Helpers de creació (icones, espais, botons, badges)
      7.2 Card base (estructura comuna)
      7.3 Header d’índex (menú)
      7.4 Header de llistes (botó eliminar)
      7.5 Card d’índex (listeners equip / desitjos)
      7.6 Card de llistes (listener eliminar)

------------------------------------------------------ */


/* ------------------------------------------------------
   0. Log mínim de càrrega (traça unificada)
------------------------------------------------------ */
UI.log("AUX", "aux.js carregat");


/* ------------------------------------------------------
   1. Claus compartides (localStorage)
------------------------------------------------------ */
/*
   Aquí concentrem les claus de localStorage que utilitza aquest mòdul. La idea és
   no repartir strings per tot arreu: si un nom de clau canvia, només el
   toquem aquí. Això fa el caixet més fiable, evita errors tipogràfics i manté el
   projecte homogeni.
*/

const AUX_CLAU_CAIXET_POKEDEX = "pr2_pokedex_data";
const AUX_CLAU_RETURN_URL = "pr2_return_url";


/* ------------------------------------------------------
   2. Caixet de Pokédex (localStorage + memòria)
------------------------------------------------------ */
/*
   Aquest bloc implementa un caixet en dues capes perquè la navegació entre pantalles
   sigui fluida i no repetim càrregues innecessàries.

   - Mini-caixet en memòria: és el camí més ràpid i ens estalvia localStorage i JSON.parse.
   - Caixet a localStorage: ens dona persistència entre recàrregues i entre pàgines.

   El criteri és de robustesa: si el caixet és buit o està corrupte, fem fallback a []
   i continuem amb un estat controlat abans que trencar la UI.
*/

/* ------------------------------------------------------
   2.1 Variable de memòria (mini-caixet)
------------------------------------------------------ */
/*
   Aquesta variable guarda la Pokédex ja resolta durant la vida de la pàgina.
   El contingut pot ser:
   - instàncies de Pokemon, si la classe està disponible,
   - o objectes plans, si no ho està (ordre de càrrega o pàgina sense clases.js).

   Aquesta flexibilitat és intencionada: es prefereix degradar funcionalitat (dades planes)
   abans que bloquejar una pantalla perquè falta una classe.
*/

let auxPokedexMemoria = null;


/* ------------------------------------------------------
   2.2 Reset de memòria
------------------------------------------------------ */
/*
   Quan volem forçar que la pròxima lectura no reutilitzi el mini-caixet, cridem
   aquest helper. És útil quan hem guardat una Pokédex nova a localStorage i volem
   assegurar que la següent consulta reflecteix el nou contingut.
*/

function auxResetPokedexMemoria() {
  auxPokedexMemoria = null;
  UI.log("AUX", "CACHE(mem) <- reset");
}


/* ------------------------------------------------------
   2.3 Llegir Pokédex del caixet (localStorage + memòria)
------------------------------------------------------ */
/*
   Aquesta funció és el punt únic per recuperar la Pokédex sense haver de repetir
   lògica a cada pantalla.

   El flux és clar:
   - Si ja tenim mini-caixet, el retornem directament.
   - Si no, intentem llegir localStorage i fer parse defensiu amb try/catch.
   - Si podem (Pokemon disponible), reconstruïm instàncies; si no, retornem dades planes.
   - En qualsevol cas, guardem el resultat al mini-caixet per accelerar consultes futures.
*/

function auxLlegirPokedexDelCaixet() {

  /* ------------------------------------------------------
     2.3.1 Si ja tenim memòria, no toquem localStorage
  ------------------------------------------------------ */
  /*
     Aquest pas és el que ens dona rendiment quan es creen moltes cards: retornar una
     variable és molt més barat que repetir localStorage + JSON.parse moltes vegades.
  */

  if (Array.isArray(auxPokedexMemoria)) {
    UI.log("AUX", "CACHE(mem) -> reutilitzant", { length: auxPokedexMemoria.length });
    return auxPokedexMemoria;
  }

  /* ------------------------------------------------------
     2.3.2 Llegim localStorage
  ------------------------------------------------------ */
  /*
     Si la clau no existeix o és buida, considerem que el caixet està buit i fem
     fallback a []. Guardem també aquest [] a memòria per no repetir lectures inútils.
  */

  const text = localStorage.getItem(AUX_CLAU_CAIXET_POKEDEX);

  if (!text) {
    UI.log("AUX", "CACHE(ls) -> buit, retorno []");
    auxPokedexMemoria = [];
    return [];
  }

  /* ------------------------------------------------------
     2.3.3 Parse i validació
  ------------------------------------------------------ */
  /*
     JSON.parse pot fallar si hi ha dades corruptes (o si algú ha tocat localStorage).
     Aquí preferim capturar l'error i fer fallback controlat a [] abans que trencar la UI.
  */

  try {
    const dades = JSON.parse(text);

    const arrayPlain = Array.isArray(dades) ? dades : [];
    let resultat = arrayPlain;

    /* ------------------------------------------------------
       2.3.4 Reconstrucció d'instàncies (si es pot)
    ------------------------------------------------------ */
    /*
       La reconstrucció a instàncies és opcional: només es fa si la classe Pokemon està
       disponible. Si no, retornem l'array pla i continuem funcionant. Aquest és el
       nostre “fallback” d’ordre de càrrega.
    */

    const pokemonDisponible =
      (typeof Pokemon === "function" && typeof Pokemon.fromJSON === "function");

    if (pokemonDisponible) {
      resultat = arrayPlain.map((p) => Pokemon.fromJSON(p));
      UI.log("AUX", "CACHE(ls) -> reconstruït a Pokemon", { length: resultat.length });
    } else {
      UI.warn("AUX", "MODEL Pokemon no disponible -> retorno array pla", { length: arrayPlain.length });
    }

    auxPokedexMemoria = resultat;
    return resultat;

  } catch (e) {
    /*
       Si el parse falla, assumim que el caixet és corrupte. Per no quedar atrapats en un
       bucle d'errors, fem fallback a [] i el guardem a memòria, i deixem una traça per
       poder-ho detectar quan depurem.
    */
    UI.warn("AUX", "CACHE(ls) corrupte -> retorno []", e);
    auxPokedexMemoria = [];
    return [];
  }
}


/* ------------------------------------------------------
   2.4 Guardar Pokédex al caixet (localStorage)
------------------------------------------------------ */
/*
   Aquest helper desa la Pokédex a localStorage de forma segura. Com que localStorage
   només guarda strings, convertim la llista a format pla abans de JSON.stringify.

   Si un element té toJSON(), el fem servir (cas típic d’instàncies). Si no, assumim
   que ja és un objecte pla. Després de desar, invalidem el mini-caixet perquè la
   pròxima lectura reflecteixi el nou contingut.
*/

function auxGuardarPokedexAlCaixet(pokemons) {

  /* ------------------------------------------------------
     2.4.1 Validació
  ------------------------------------------------------ */
  /*
     Validació mínima per no corrompre el caixet: si no és un array, parem aquí.
     Preferim un error controlat a desar un valor inconsistent i després pagar-ho
     a totes les pantalles.
  */

  if (!Array.isArray(pokemons)) {
    UI.error("AUX", "No es pot guardar la Pokédex: 'pokemons' no és un array");
    return false;
  }

  /* ------------------------------------------------------
     2.4.2 Convertim a format pla (serialitzable)
  ------------------------------------------------------ */
  /*
     Aquest pas manté el caixet tolerant: si ens arriben instàncies, les serialitzem;
     si ens arriben objectes plans, passen tal qual. Així no obliguem el caller a
     saber en quin format estem treballant.
  */

  const arrayPlain = pokemons.map((p) => {
    if (p && typeof p.toJSON === "function") return p.toJSON();
    return p;
  });

  /* ------------------------------------------------------
     2.4.3 Guardem a localStorage
  ------------------------------------------------------ */
  /*
     localStorage pot fallar per quota o restriccions del navegador. Si passa, retornem
     false i deixem una traça clara. És millor això que trencar la UI amb una excepció.
  */

  try {
    localStorage.setItem(AUX_CLAU_CAIXET_POKEDEX, JSON.stringify(arrayPlain));

    // Reset memòria: la pròxima lectura reflecteix el nou contingut
    auxPokedexMemoria = null;

    UI.log("AUX", "CACHE(ls) <- Pokédex guardada", { length: arrayPlain.length });
    return true;

  } catch (e) {
    UI.error("AUX", "No s'ha pogut guardar la Pokédex a localStorage", e);
    return false;
  }
}


/* ------------------------------------------------------
   2.5 Obtenir Pokémon per id (consultant el caixet)
------------------------------------------------------ */
/*
   Aquesta funció és un accés ràpid per recuperar un Pokémon concret a partir del seu id.
   Normalitza l'entrada, consulta la Pokédex del caixet (memòria o localStorage) i fa la
   cerca per id.

   Si l'id no és vàlid, si el caixet està buit o si no es troba el Pokémon, fem fallback
   a null: així el caller pot decidir què mostrar sense que la UI es trenqui.
*/

function auxGetPokemonById(idPokemon) {
  const id = Number(idPokemon);
  if (!Number.isFinite(id)) return null;

  UI.log("AUX", "GetPokemonById -> consulta caixet", { id });

  const pokedex = auxLlegirPokedexDelCaixet();
  if (!Array.isArray(pokedex) || pokedex.length === 0) {
    UI.warn("AUX", "GetPokemonById -> pokedex buida (0)");
    return null;
  }

  const trobat = pokedex.find((p) => Number(p?.id) === id) ?? null;

  if (!trobat) UI.warn("AUX", "GetPokemonById -> no trobat", { id });
  return trobat;
}


/* ------------------------------------------------------
   3. Navegació cap al detall (returnUrl + redirect)
------------------------------------------------------ */
/*
   Aquest helper centralitza la navegació cap a detail.html guardant abans la URL
   actual com a returnUrl. Això ens permet tornar enrere exactament al punt d’on venim
   (incloent paràmetres i estat de filtre), sense haver de passar la informació per
   tot arreu.

   Guardem returnUrl a localStorage perquè detail.html també la pugui llegir i perquè
   no depengui d’un estat en memòria que es perdria en recarregar.
*/

function auxNavegarADetall(idPokemon) {
  localStorage.setItem(AUX_CLAU_RETURN_URL, window.location.href);

  UI.log("AUX", "NAV -> detail.html", {
    idPokemon,
    returnUrl: window.location.href
  });

  window.location.href = `detail.html?id=${idPokemon}`;
}


/* ------------------------------------------------------
   4. Interfície: tancament de menús 
------------------------------------------------------ */
/*
   A l'índice tenim cards amb un menú (dropdown). El comportament esperat és
   el típic: si l'usuari fa clic fora del menú, el tanquem.

   Com que això requereix un listener global al document, aquí ho fem de manera
   centralitzada i amb un estat intern per no duplicar listeners. Això ens dona
   un comportament consistent i evita efectes estranys o penalització de rendiment.
*/

/* ------------------------------------------------------
   4.1 Estat intern per evitar duplicacions
------------------------------------------------------ */
/*
   Aquest booleà ens serveix de protecció per afegir el listener global només una vegada.
   Si una pantalla crea moltes cards, no volem acabar afegint el mateix listener repetit.
*/

let auxTancamentMenusActivat = false;


/* ------------------------------------------------------
   4.2 Tancar tots els dropdowns
------------------------------------------------------ */
/*
   Aquesta funció aplica el tancament de manera simple: afegeix la classe "hidden" a tots
   els dropdowns. La decisió de fer-ho amb classe CSS manté la responsabilitat clara:
   JS decideix l’estat (obert/tancat) i CSS decideix l'aspecte.
*/

function auxTancarTotsElsMenusCards() {
  document.querySelectorAll(".card-menu-dropdown").forEach((m) => {
    m.classList.add("hidden");
  });
}


/* ------------------------------------------------------
   4.3 Activar tancament quan es fa click fora
------------------------------------------------------ */
/*
   Aquí connectem el comportament "clic fora = tanca menús" amb un listener global.
   Fem servir closest(".card-menu-wrapper") per detectar si el clic està dins del menú;
   si està dins, no tanquem res. Si és fora, tanquem tots els dropdowns.

   La podem cridar des de diferents llocs sense por de duplicar listeners.
*/

function auxActivarTancamentMenusForaClick() {
  if (auxTancamentMenusActivat) return;

  auxTancamentMenusActivat = true;

  document.addEventListener("click", (event) => {
    const clickDinsMenuCard = event.target.closest(".card-menu-wrapper");
    if (clickDinsMenuCard) return;

    auxTancarTotsElsMenusCards();
  });
}


/* ------------------------------------------------------
   5. Interfície: text + icona de botons (equip / desitjos)
------------------------------------------------------ */
/*
   En diferents pantalles hi ha botons que reflecteixen aquest estat .
   Aquí centralitzem aquesta actualització perquè:
   - no repetim el mateix patró a cada card,
   - mantenim un text/icona coherent,
   - i no trenquem la UI si un botó no té l’estructura esperada.

   Important: aquest bloc només pinta la UI. L’acció de modificar llistes es delega al model
   (User) des d’on toca (controladors), però aquí consultem User per saber quin estat hem de
   mostrar.
*/

/* ------------------------------------------------------
   5.1 Assegurar estructura del botó (icona + text)
------------------------------------------------------ */
/*
   Aquest helper garanteix que un botó tingui sempre una icona (<i>) i un text (<span>).
   Si la card o la pàgina ha creat el botó d’una altra manera, aquí "reconstruïm" la
   seva estructura perquè la resta de funcions puguin actualitzar-lo sense casos especials.

   Aquesta decisió evita que la UI es trenqui per un detall de DOM: preferim reconstruir
   de forma controlada abans que deixar el botó a mig pintar.
*/

function auxAssegurarEstructuraBotoIconaText(btn) {
  if (!btn) return { icon: null, textSpan: null };

  let icon = btn.querySelector("i");
  let textSpan = btn.querySelector("span");

  if (icon && textSpan) return { icon, textSpan };

  while (btn.firstChild) btn.removeChild(btn.firstChild);

  icon = document.createElement("i");
  icon.setAttribute("aria-hidden", "true");

  textSpan = document.createElement("span");

  btn.appendChild(icon);
  btn.appendChild(document.createTextNode(" "));
  btn.appendChild(textSpan);

  return { icon, textSpan };
}


/* ------------------------------------------------------
   5.2 Actualitzar text i icona segons llistes de l’usuari
------------------------------------------------------ */
/*
   Aquesta funció pinta l'estat dels botons d’equip i desitjos a partir del que diu el model.
   Consultem User.estaPokemonALlistaUsuariActual(...) i, segons el resultat, mostrem:
   - paperera + "Quitar …" quan ja hi és,
   - icona d’afegir + "Añadir …" quan no hi és.

   És deliberat que aquí només actualitzem el botó: l’acció real (toggle) la fa el controlador,
   i després crida aquesta funció per reflectir el nou estat. Així mantenim responsabilitats
   clares i un flux fàcil de seguir.
*/

function auxActualitzarTextBotonsLlistes(btnEquipo, btnDeseos, idPokemon) {
  const id = Number(idPokemon);
  if (!Number.isFinite(id)) return;

  const estaEquip = User.estaPokemonALlistaUsuariActual("myTeam", id);
  const estaDeseos = User.estaPokemonALlistaUsuariActual("wishes", id);

  if (btnEquipo) {
    const partsEquipo = auxAssegurarEstructuraBotoIconaText(btnEquipo);

    if (partsEquipo.icon) {
      partsEquipo.icon.className = estaEquip ? "fa-solid fa-trash" : "fa-solid fa-heart";
    }
    if (partsEquipo.textSpan) {
      partsEquipo.textSpan.textContent = estaEquip ? "Quitar de My equipo" : "Añadir a My equipo";
    }
  }

  if (btnDeseos) {
    const partsDeseos = auxAssegurarEstructuraBotoIconaText(btnDeseos);

    if (partsDeseos.icon) {
      partsDeseos.icon.className = estaDeseos ? "fa-solid fa-trash" : "fa-solid fa-eye";
    }
    if (partsDeseos.textSpan) {
      partsDeseos.textSpan.textContent = estaDeseos ? "Quitar de Deseos" : "Añadir a Deseos";
    }
  }
}


/* ------------------------------------------------------
   6. Helpers petits (paràmetres de la URL)
------------------------------------------------------ */
/*
   Aquest bloc concentra helpers petits que fem servir sovint. En aquest cas, llegim un
   paràmetre de la URL i el convertim a número enter usable. Si no existeix o no és un
   número vàlid, fem fallback a null i deixem que el caller decideixi el flux.
*/
function auxObtenirParamInt(nomParam) {
  const params = new URLSearchParams(window.location.search);

  const valor = params.get(String(nomParam));
  if (!valor) return null;

  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}


/* ------------------------------------------------------
   7. Factoria de cards 
------------------------------------------------------ */
/*
   Aquí centralitzem la construcció de cards de Pokémon amb createElement i nodes reals.
   Evitem innerHTML per mantenir control, seguretat i coherència: construïm exactament
   el que necessitem i podem afegir listeners sense “buscar” després dins d’un string.

   L'estructura està pensada per reutilitzar:
   - Helpers petits de creació,
   - una card base comuna,
   - i variants de header + listeners segons pantalla (indice vs llistes).
*/

/* ------------------------------------------------------
   7.1 Helpers de creació (icones, espais, botons, badges)
------------------------------------------------------ */
/*
   Aquestes funcions són peces petites que repetiríem massa si no les centralitzéssim.
   L'objectiu és que qualsevol botó o badge creat aquí segueixi sempre el mateix patró
   (icona + text, espai, classes, etc.), i així el projecte manté un estil homogeni.
*/

function auxCrearIconaFA(className) {
  const i = document.createElement("i");
  i.className = String(className);
  i.setAttribute("aria-hidden", "true");
  return i;
}


function auxAfegirEspaiNode(parent) {
  parent.appendChild(document.createTextNode(" "));
}


function auxCrearBotoIconaText({ className, iconClass, text }) {
  /*
     Aquest helper crea un botó amb estructura estable (icona + text) per no repetir
     el mateix patró a diferents parts del fitxer. Això també ens garanteix que, quan
     després actualitzem botons (icona/text), la UI no es trenqui perquè falta un node.
  */
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = String(className);

  const icon = auxCrearIconaFA(iconClass);

  const span = document.createElement("span");
  span.textContent = String(text);

  btn.appendChild(icon);
  auxAfegirEspaiNode(btn);
  btn.appendChild(span);

  return btn;
}


function auxCrearBadgesTipus(typesArray) {
  /*
     Aquí convertim el llistat de tipus en badges visibles. Si no tenim array, fem fallback
     a [] i retornem el contenidor buit: és millor això que trencar la card per un tipus
     inesperat.
  */
  const typesContainer = document.createElement("div");
  typesContainer.className = "pokemon-types";

  const types = Array.isArray(typesArray) ? typesArray : [];

  types.forEach((type) => {
    const badge = document.createElement("span");
    badge.className = "type-badge";
    badge.textContent = String(type);
    typesContainer.appendChild(badge);
  });

  return typesContainer;
}


/* ------------------------------------------------------
   7.2 Card base (estructura comuna)
------------------------------------------------------ */
/*
   Aquesta funció construeix la base comuna de qualsevol card: contenidor, header,
   imatge, nom, id i badges de tipus. Retornem també referències als nodes creats perquè
   altres funcions hi afegeixin controls al header o modifiquin parts concretes sense
   haver de tornar a cercar al DOM.

   També centralitzem aquí la navegació cap al detall en fer clic a la imatge o al nom.
   Així no repartim listeners idèntics a cada variant de card.
*/

function auxCrearCardPokemonBase(pokemon) {
  const card = document.createElement("div");
  card.className = "card";

  const header = document.createElement("div");
  header.className = "card-header";
  card.appendChild(header);

  const img = document.createElement("img");
  img.src = pokemon?.sprites || "";
  img.alt = pokemon?.name || "pokemon";

  const name = document.createElement("div");
  name.className = "pokemon-name";
  name.textContent = pokemon?.name || "";

  const id = document.createElement("div");
  id.className = "pokemon-id";
  id.textContent = `Nº ${String(pokemon?.id ?? "").padStart(3, "0")}`;

  const typesContainer = auxCrearBadgesTipus(pokemon?.types);

  card.appendChild(img);
  card.appendChild(name);
  card.appendChild(id);
  card.appendChild(typesContainer);

  img.addEventListener("click", () => auxNavegarADetall(pokemon.id));
  name.addEventListener("click", () => auxNavegarADetall(pokemon.id));

  return { card, header, img, name, id, typesContainer };
}


/* ------------------------------------------------------
   7.3 Header d’índice (menú ...)
------------------------------------------------------ */
/*
   En la pantalla d'índice, el header de cada card incorpora un menú amb dues accions.
   Aquí construïm aquest header i retornem les referències necessàries perquè el controlador
   o la funció de card hi connecti listeners i actualitzacions d’estat.
*/

function auxAfegirHeaderMenuIndex(header) {
  const menuWrapper = document.createElement("div");
  menuWrapper.className = "card-menu-wrapper";

  const menuBtn = document.createElement("button");
  menuBtn.className = "card-menu-btn";
  menuBtn.type = "button";
  menuBtn.textContent = "⋯";

  const dropdown = document.createElement("div");
  dropdown.className = "card-menu-dropdown hidden";

  const btnEquipo = auxCrearBotoIconaText({
    className: "card-menu-item",
    iconClass: "fa-solid fa-heart",
    text: "My equipo",
  });

  const btnDeseos = auxCrearBotoIconaText({
    className: "card-menu-item",
    iconClass: "fa-solid fa-eye",
    text: "Deseos",
  });

  dropdown.appendChild(btnEquipo);
  dropdown.appendChild(btnDeseos);

  menuWrapper.appendChild(menuBtn);
  menuWrapper.appendChild(dropdown);
  header.appendChild(menuWrapper);

  return { menuWrapper, menuBtn, dropdown, btnEquipo, btnDeseos };
}


/* ------------------------------------------------------
   7.4 Header de llistes (botó eliminar)
------------------------------------------------------ */
/*
   A la pantalla de llistes, la necessitat és més directa: un botó "Eliminar" per treure
   el Pokémon de la llista. Aquí construïm aquest control sense menú perquè és més
   simple i fa la UX més clara.
*/

function auxAfegirHeaderBotoEliminar(header) {
  const btnEliminar = auxCrearBotoIconaText({
    className: "card-menu-item",
    iconClass: "fa-solid fa-trash",
    text: "Eliminar",
  });

  btnEliminar.classList.add("btn-eliminar-llista");
  header.appendChild(btnEliminar);

  return { btnEliminar };
}


/* ------------------------------------------------------
   7.5 Card d'índice (listeners equip / desitjos)
------------------------------------------------------ */
/*
   Aquesta funció construeix una card completa per a l'indice': base + menú + listeners.
   La part important aquí és la separació de responsabilitats: aux.js connecta la UI
   amb callbacks, però l'acció real (toggle/persistència) la deleguem al controlador.

   Després de cada acció, refresquem text i icona perquè el menú reflecteixi l'estat
   real del model, i tanquem el dropdown per mantenir un comportament coherent.
*/

function auxCrearCardPokemonIndex(pokemon, { onToggleEquipo, onToggleDeseos, onUpdateMenu } = {}) {
  const { card, header } = auxCrearCardPokemonBase(pokemon);
  const { menuBtn, dropdown, btnEquipo, btnDeseos } = auxAfegirHeaderMenuIndex(header);

  auxActualitzarTextBotonsLlistes(btnEquipo, btnDeseos, pokemon.id);

  menuBtn.addEventListener("click", (event) => {
    event.preventDefault();

    /*
       Abans d'obrir, actualitzem el contingut del menú per assegurar que pinta
       l'estat actual (pot haver canviat per altres accions de la pàgina).
    */
    auxActualitzarTextBotonsLlistes(btnEquipo, btnDeseos, pokemon.id);

    /*
       Obrim de forma exclusiva: tanquem tot, i només reobrim aquest si no estava obert.
       Això evita tenir múltiples dropdowns oberts alhora.
    */
    const estavaObert = !dropdown.classList.contains("hidden");
    auxTancarTotsElsMenusCards();
    if (!estavaObert) dropdown.classList.remove("hidden");
  });

  btnEquipo.addEventListener("click", (event) => {
    event.preventDefault();

    if (typeof onToggleEquipo === "function") onToggleEquipo(pokemon.id);

    auxActualitzarTextBotonsLlistes(btnEquipo, btnDeseos, pokemon.id);

    if (typeof onUpdateMenu === "function") onUpdateMenu();

    auxTancarTotsElsMenusCards();
  });

  btnDeseos.addEventListener("click", (event) => {
    event.preventDefault();

    if (typeof onToggleDeseos === "function") onToggleDeseos(pokemon.id);

    auxActualitzarTextBotonsLlistes(btnEquipo, btnDeseos, pokemon.id);

    if (typeof onUpdateMenu === "function") onUpdateMenu();
    auxTancarTotsElsMenusCards();
  });

  return card;
}


/* ------------------------------------------------------
   7.6 Card de llistes (listener eliminar)
------------------------------------------------------ */
/*
   Variant per a la pantalla de llistes: base + botó eliminar + delegació de l’acció.
   Passem tipusLlista perquè el mateix constructor serveixi per myTeam o wishes sense
   duplicar codi.

   Igual que a l'índex, aquí no fem persistència: deleguem l'eliminació al controlador
   i, si cal, demanem refresc del menú global via callback.
*/

function auxCrearCardPokemonLista(pokemon, tipusLlista, { onEliminar } = {}) {
  const { card, header } = auxCrearCardPokemonBase(pokemon);
  const { btnEliminar } = auxAfegirHeaderBotoEliminar(header);

  btnEliminar.addEventListener("click", (event) => {
    event.preventDefault();

    // En el nostre projecte, listas.js SEMPRE passa aquest callback.
    onEliminar(tipusLlista, pokemon.id);
  });

  return card;
}