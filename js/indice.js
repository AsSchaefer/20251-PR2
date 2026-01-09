/* ------------------------------------------------------
   PR2 / Entrega 2 — Índex de Pokémon (API + caixet + filtres + render)
   ------------------------------------------------------
   Alumna: Alexandra Schäfer Barrientos
   Data: 9 de gener de 2026
   Fitxer: indice.js

   Descripció:
   Aquest fitxer és el nucli d'indice.html: prepara filtres, carrega la Pokédex i
   renderitza els resultats en forma de cards. La càrrega segueix un criteri únic:
   primer provem caixet (via ràpida) i, si no hi ha dades, fem fetch a l'API (via lenta).

   Objectiu:
   L'objectiu és mantenir la pantalla àgil i coherent: si ja tenim dades, no refem l'API;
   si l'usuari torna, restaurem filtres; i si alguna peça falla (caixet buit, API KO o
   format inesperat), fem fallback controlat per no trencar la UI.

------------------------------------------------------

   Estructura del fitxer:

   1. Estat general
      1.1 Llistes i paginació (allPokemons, filteredPokemons, currentIndex, pageSize)
      1.2 Configuració de càrrega (totalPokemons, currentURL)
      1.3 Estat de tipus seleccionats (selectedTypes)

   2. Punt d'entrada (DOMContentLoaded)
      2.1 Inicialització de filtres generals
      2.2 Restaurar estat de filtres (MODEL)
      2.3 Inicialitzar filtres de tipus
      2.4 Carrega inicial de Pokédex (caixet o API)
      2.5 Actualització del menú (si existeix)
      2.6 Aplicar filtres i render inicial
      2.7 Inicialitzar Load More
      2.8 Activar tancament global de menús(AUX)

   3. Loader
      3.1 mostrarLoader()
      3.2 ocultarLoader()

   4. Caixet (AUX)
      4.1 obtenirPokemonsInicials()

   5. API (fetch)
      5.1 getPokemons()
      5.2 getPokemonDescription()

   6. Filtres de tipus
      6.1 inicialitzarFiltresDeTipus()
      6.2 gestionarClickTipus()

   7. Filtres generals + persistència (MODEL)
      7.1 inicialitzarFiltresGenerals()
      7.2 Helpers de lectura i normalització
      7.3 aplicarFiltresIRenderitzar()
      7.4 ordenarPokemons()
      7.5 Persistència d’estat (guardarEstatFiltres / restaurarEstatFiltres)
      7.6 Accions sobre llistes (alternarPokemonAEquip / alternarPokemonADeseos)

   8. Render i paginació
      8.1 Contenidor i neteja
      8.2 Cards (AUX) + integració amb accions
      8.3 Render de pàgines
      8.4 Load More

------------------------------------------------------ */


/* ------------------------------------------------------
   1. Estat general
------------------------------------------------------ */
/*
   Estat compartit de la pantalla: Pokédex completa, resultat filtrat i índex de paginació.
   Ho deixem a nivell de fitxer perquè es reusa en cada filtre/ordenació/render.
*/
let allPokemons = new PokemonList([]);
let filteredPokemons = new PokemonList([]);
let currentIndex = 0;
const pageSize = 12;

/*
   Limitem a 151 per mantenir rendiment i una càrrega inicial raonable.
   currentURL és el punt de partida del fetch massiu quan no hi ha caixet.
*/
const totalPokemons = 151;
let currentURL = `${config.apiBaseUrl}${totalPokemons}`;

/*
   selectedTypes és un Set per evitar duplicats i fer has() ràpid.
   Quan el guardem, el convertim a array perquè JSON no serialitza un Set.
*/
let selectedTypes = new Set();


/* ------------------------------------------------------
   2. Punt d'entrada (DOMContentLoaded)
------------------------------------------------------ */
/*
   Flux d'arrencada:
   1) Preparem filtres i restaurem estat.
   2) Carreguem dades (caixet primer; API si toca).
   3) Apliquem filtres i pintem la primera tanda.
   4) Activem paginació i comportaments globals (menús).
*/
document.addEventListener("DOMContentLoaded", async () => {
  UI.log("INDICE", "indice.js carregat"); 
  

  /* ------------------------------------------------------
     2.1 Inicialització de filtres
  ------------------------------------------------------ */
  /*
   Preparem controls i listeners abans de renderitzar:
   - filtres generals
   - estat guardat per usuari (MODEL)
   - filtres de tipus (UI sincronitzada amb selectedTypes)
*/

  inicialitzarFiltresGenerals();
  restaurarEstatFiltres();
  inicialitzarFiltresDeTipus();

  /* ------------------------------------------------------
     2.2 Carrega inicial de dades (caixet o API)
  ------------------------------------------------------ */
  /*
     Via ràpida: caixet. Via lenta: API + guardar al caixet.
     Si no tenim dades vàlides, continuem amb [] (fallback segur).
  */
  const pokemonsInicials = await obtenirPokemonsInicials();

  const arrayInicial = Array.isArray(pokemonsInicials) ? pokemonsInicials : [];

  allPokemons = new PokemonList(arrayInicial);
  filteredPokemons = new PokemonList([...arrayInicial]);
  currentIndex = 0;

  /* ------------------------------------------------------
     2.3 Actualització del menú (si existeix)
  ------------------------------------------------------ */
  /*
   El menú mostra comptadors (myTeam/wishes). El refresquem quan la pantalla ja té estat.
*/

  UI.log("INDICE", "UI -> updateMenu() (si existeix)");
  updateMenu();
  UI.log("INDICE", "UI <- updateMenu() OK");

  /* ------------------------------------------------------
     2.4 Aplicar filtres i preparar render
  ------------------------------------------------------ */
  /*
     Primer render ja coherent amb filtres restaurats.
  */
  aplicarFiltresIRenderitzar();
  inicialitzarBotoLoadMore();

  /* ------------------------------------------------------
     2.5 Comportament global de tancament de menús (AUX)
  ------------------------------------------------------ */
  /*
     Dropdowns: "clic fora = tancar". Ho centralitzem per evitar duplicar listeners.
  */
  auxActivarTancamentMenusForaClick();
});


/* ------------------------------------------------------
   3. Loader
------------------------------------------------------ */
/*
   Loader de UX: quan anem a l'API (detalls + species) pot trigar.
   Mostrar-lo evita la sensació que "no passa res".
*/
function mostrarLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;

  loader.style.display = "block";
  document.body.classList.add("loading");
}

function ocultarLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;

  loader.style.display = "none";
  document.body.classList.remove("loading");
}


/* ------------------------------------------------------
   4. Caixet (AUX)
------------------------------------------------------ */
/*
   Rendiment: abans de fer fetch massiu, intentem llegir del caixet.
   Si el caixet és buit, carreguem de l'API i guardem per a la següent visita.
*/
async function obtenirPokemonsInicials() {
  UI.log("INDICE", "AUX -> auxLlegirPokedexDelCaixet()");
  const caixet = auxLlegirPokedexDelCaixet();
  UI.log("INDICE", "AUX <- auxLlegirPokedexDelCaixet()", {
    esArray: Array.isArray(caixet),
    length: Array.isArray(caixet) ? caixet.length : 0
  });

  /*
     Si hi ha dades al caixet, reutilitzem directament (sense fetch).
     AUX ja gestiona si retorna instàncies o dades planes.
  */
  if (Array.isArray(caixet) && caixet.length > 0) {
  UI.log("INDICE", "CACHE <- caixet trobat", { length: caixet.length });

  // AUX ja retorna instàncies si pot (Pokemon.fromJSON disponible).
  // Si no pot, retorna dades planes. Aquí no repetim aquesta lògica.
  UI.log("INDICE", "CACHE <- retorn caixet (AUX ja gestiona instàncies/pla)", {
    length: caixet.length
  });

  return caixet;
}


  /* ------------------------------------------------------
     4.1 Caixet buit: cal anar a l'API
  ------------------------------------------------------ */
  UI.log("INDICE", "CACHE <- no hi ha caixet");

  UI.log("INDICE", "API -> getPokemons(currentURL)", { url: currentURL });
  const carregats = await getPokemons(currentURL);
  UI.log("INDICE", "API <- getPokemons(currentURL)", {
    esArray: Array.isArray(carregats),
    length: Array.isArray(carregats) ? carregats.length : 0
  });

  if (!Array.isArray(carregats) || carregats.length === 0) {
    UI.error("INDICE", "API no ha retornat dades (0).");
    return [];
  }

  /* ------------------------------------------------------
     4.2 Guardar al caixet per futures visites
  ------------------------------------------------------ */
  /*
     Si el guardat fallés, no trenquem res: simplement perdrem el guany de rendiment.
  */
  UI.log("INDICE", "AUX -> auxGuardarPokedexAlCaixet(carregats)", { length: carregats.length });
  auxGuardarPokedexAlCaixet(carregats);
  UI.log("INDICE", "CACHE <- guardat OK a localStorage", { length: carregats.length });

  return carregats;
}


/* ------------------------------------------------------
   5. API (fetch)
------------------------------------------------------ */
/*
   Només entra aquí si no hi ha caixet. Carreguem llista i detalls en paral·lel,
   i adaptem el format al model intern (Pokemon).
*/
async function getPokemons(url = currentURL) {
  try {
    UI.log("INDICE", "API -> fetch llista", { url });
    mostrarLoader();

    const respostaLlista = await fetch(url);

    if (!respostaLlista.ok) {
      UI.error("INDICE", "fetch llista KO", { status: respostaLlista.status });
      ocultarLoader();
      return [];
    }

    const dadesLlista = await respostaLlista.json();

    if (!Array.isArray(dadesLlista.results)) {
      UI.error("INDICE", "format results invàlid", { dadesLlista });
      ocultarLoader();
      return [];
    }

    UI.log("INDICE", "API <- llista OK", { length: dadesLlista.results.length });

    /* ------------------------------------------------------
       5.1 Carregar detalls en paral·lel
    ------------------------------------------------------ */
    const promesesDetall = dadesLlista.results.map(async (pokemonBasic) => {
      try {
        const respostaDetall = await fetch(pokemonBasic.url);
        if (!respostaDetall.ok) return null;

        const detall = await respostaDetall.json();

        /* ------------------------------------------------------
           5.1.1 Descripció (species -> flavor_text en ES)
        ------------------------------------------------------ */
        const speciesUrl = detall?.species?.url ?? null;

        const descripcioES = speciesUrl
          ? await getPokemonDescription(speciesUrl)
          : "Descripción no disponible en español";

        /* ------------------------------------------------------
           5.1.2 Adaptació de dades de l’API
        ------------------------------------------------------ */
         /*
          Convertim la resposta de la PokéAPI al format que espera el projecte.
        */
        const pokemonPlain = {
          id: detall.id,
          name: detall.name,
          height: detall.height,
          weight: detall.weight,
          baseExperience: detall.base_experience,
          abilities: Array.isArray(detall.abilities)
            ? detall.abilities.map((a) => a.ability.name)
            : [],
          types: Array.isArray(detall.types)
            ? detall.types.map((t) => t.type.name)
            : [],
          sprites: detall?.sprites?.other?.["official-artwork"]?.front_default ?? "",
          stats: Array.isArray(detall.stats)
            ? detall.stats.map((s) => ({ name: s.stat.name, value: s.base_stat }))
            : [],
          description: descripcioES
        }; 

        /* ------------------------------------------------------
           5.1.3 Retorn com a instància Pokemon 
        ------------------------------------------------------ */
        return new Pokemon(pokemonPlain);

      } catch (error) {
        return null;
      }
    });

    const detallsAmbNulls = await Promise.all(promesesDetall);
    const successfulPokemons = detallsAmbNulls.filter((p) => p !== null);

    UI.log("INDICE", "API <- detalls OK", { ok: successfulPokemons.length, total: detallsAmbNulls.length });

    if (successfulPokemons.length === 0) {
      UI.error("INDICE", "cap Pokémon carregat correctament (0)");
    }

    ocultarLoader();
    return successfulPokemons;

  } catch (error) {
    UI.error("INDICE", "error general getPokemons()", error);
    ocultarLoader();
    return [];
  }
}

/* ------------------------------------------------------
   5.2 getPokemonDescription(): obtenir descripció en ES
------------------------------------------------------ */
/*
   La descripció ve de species. Retornem sempre un string (encara que sigui fallback)
   per no complicar la càrrega massiva.
*/
async function getPokemonDescription(speciesUrl) {
  try {
    const response = await fetch(speciesUrl);
    if (!response.ok) return "Descripció no disponible en espanyol";

    const speciesData = await response.json();

    if (!Array.isArray(speciesData.flavor_text_entries)) {
      return "Descripció no disponible en espanyol";
    }

    const spanishEntry = speciesData.flavor_text_entries.find(
      (entry) => entry.language?.name === "es"
    );

    if (!spanishEntry || typeof spanishEntry.flavor_text !== "string") {
      return "Descripció no disponible en espanyol";
    }

    return spanishEntry.flavor_text.replace(/\n/g, " ").replace(/\f/g, " ");

  } catch (error) {
    return "Error al carregar descripció";
  }
}


/* ------------------------------------------------------
   6. Filtres de tipus
------------------------------------------------------ */
/*
   Tipus amb toggle: la classe "active" reflecteix selectedTypes (Set),
   i selectedTypes és el que filtra realment.
*/
function inicialitzarFiltresDeTipus() {
  const typeListUl = document.querySelector("#typeList");
  if (!typeListUl) return;

  while (typeListUl.firstChild) typeListUl.removeChild(typeListUl.firstChild);

  if (!Array.isArray(type_list)) return;

  type_list.forEach((type) => {
    const li = document.createElement("li");
    li.textContent = type.name;
    li.dataset.typeName = String(type.name);

    if (selectedTypes.has(String(type.name))) li.classList.add("active");

    li.addEventListener("click", (event) => {
      event.preventDefault();
      gestionarClickTipus(li);
    });

    typeListUl.appendChild(li);
  });
}

/* ------------------------------------------------------
   6.1 gestionarClickTipus(): toggle del tipus seleccionat
------------------------------------------------------ */
/*
   Toggle al Set + repaint immediat: "clic = canvi".
*/
function gestionarClickTipus(elementLi) {
  const tipusClicat = String(elementLi.dataset.typeName);

  if (elementLi.classList.contains("active")) {
    elementLi.classList.remove("active");
    selectedTypes.delete(tipusClicat);
  } else {
    elementLi.classList.add("active");
    selectedTypes.add(tipusClicat);
  }

  UI.log("INDICE", "EVENT <- click tipus", {
    tipus: tipusClicat,
    selectedTypesSize: selectedTypes.size
  });

  aplicarFiltresIRenderitzar();
}


/* ------------------------------------------------------
   7. Filtres generals + persistència (MODEL)
------------------------------------------------------ */
/*
   Filtres generals: cerca (id/nom), rang de pes i ordenació.
   Decisió d'UX: si hi ha cerca, la tractem com a "directa" i no la barregem amb tipus/pes.
*/
function inicialitzarFiltresGenerals() {
  const btnBuscar = document.getElementById("searchButton");
  const inputBuscar = document.getElementById("searchInput");
  const inputMin = document.getElementById("weightMin");
  const inputMax = document.getElementById("weightMax");
  const selectOrden = document.getElementById("orden");

  if (btnBuscar) {
    btnBuscar.addEventListener("click", (event) => {
      event.preventDefault();
      
      UI.log("INDICE", "EVENT <- click buscar");
      aplicarFiltresIRenderitzar();
    });
  }

  if (inputBuscar) {
    inputBuscar.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        UI.log("INDICE", "EVENT <- enter buscar");
        aplicarFiltresIRenderitzar();
      }
    });
  }

  if (selectOrden) {
    selectOrden.addEventListener("change", (event) => {
      event.preventDefault();
      
      UI.log("INDICE", "EVENT <- change orden", { value: selectOrden.value });
      aplicarFiltresIRenderitzar();
    });
  }

  if (inputMin) {
    inputMin.addEventListener("change", () => {
      UI.log("INDICE", "EVENT <- change weightMin", { value: inputMin.value });
      aplicarFiltresIRenderitzar();
    });
  }

  if (inputMax) {
    inputMax.addEventListener("change", () => {
      UI.log("INDICE", "EVENT <- change weightMax", { value: inputMax.value });
      aplicarFiltresIRenderitzar();
    });
  }
}

/* ------------------------------------------------------
   7.1 Helpers de lectura i normalització de valors
------------------------------------------------------ */
/*
   Helpers curts per no embrutar el filtre principal amb lectura d'inputs i conversions.
*/
function obtenirTextCerca() {
  const input = document.getElementById("searchInput");
  return input ? String(input.value).trim() : "";
}

function normalitzarText(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function obtenirPesMin() {
  const input = document.getElementById("weightMin");
  if (!input) return null;

  const valor = String(input.value).trim();
  if (valor === "") return null;

  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function obtenirPesMax() {
  const input = document.getElementById("weightMax");
  if (!input) return null;

  const valor = String(input.value).trim();
  if (valor === "") return null;

  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function obtenirOrdre() {
  const select = document.getElementById("orden");
  return select ? String(select.value) : "idAsc";
}

function aplicarFiltresIRenderitzar() {
  UI.log("INDICE", "FILTRES -> aplicarFiltresIRenderitzar()", {
    allLength: allPokemons?.pokemons?.length ?? 0,
    selectedTypesSize: selectedTypes?.size ?? 0,
    searchText: obtenirTextCerca(),
    weightMin: String(document.getElementById("weightMin")?.value ?? "").trim(),
    weightMax: String(document.getElementById("weightMax")?.value ?? "").trim(),
    orden: document.getElementById("orden")?.value ?? "idAsc"
  });

  let resultat = [...(allPokemons?.pokemons ?? [])];

  /* ------------------------------------------------------
     7.2.2 Filtre per text (id o nom)
  ------------------------------------------------------ */
  /*
     Si hi ha cerca: id exacte (números) o includes sobre nom normalitzat.
     Si hi ha cerca, no apliquem tipus/pes per mantenir el buscador previsible.
  */
  const textRaw = obtenirTextCerca();
  const text = normalitzarText(textRaw);

  const hiHaText = (text !== "");
  const esNumero = hiHaText && /^[0-9]+$/.test(text);

  if (hiHaText) {
    if (esNumero) {
      const idBuscat = Number(text);
      resultat = resultat.filter((p) => Number(p?.id) === idBuscat);
    } else {
      resultat = resultat.filter((p) => {
        const nom = normalitzarText(p?.name ?? "");
        return nom.includes(text);
      });
    }

  } else {
    /* ------------------------------------------------------
       No hi ha cerca: filtrem "explorant" (TIPUS + PES)
    ------------------------------------------------------ */

    /* ------------------------------------------------------
       7.2.1 Filtre per tipus (Set selectedTypes)
    ------------------------------------------------------ */
    /*
       Si hi ha tipus actius, el Pokémon passa si en té algun (some()).
    */
    if (selectedTypes.size > 0) {
      resultat = resultat.filter((p) => {
        const tipusPokemon = Array.isArray(p?.types) ? p.types : [];
        return tipusPokemon.some((t) => selectedTypes.has(String(t)));
      });
    }

    /* ------------------------------------------------------
       7.2.3 Filtre per rang de pes (min/max)
    ------------------------------------------------------ */
    /*
      UX defensiva: si min > max, invertim rang i sincronitzem inputs.
    */

    const pesMin = obtenirPesMin();
    const pesMax = obtenirPesMax();

    let min = pesMin;
    let max = pesMax;

    if (min !== null && max !== null && Number(min) > Number(max)) {
      const tmp = min;
      min = max;
      max = tmp;

      const inputMin = document.getElementById("weightMin");
      const inputMax = document.getElementById("weightMax");
      if (inputMin) inputMin.value = String(min);
      if (inputMax) inputMax.value = String(max);

      UI.log("INDICE", "FILTRES <- rang pes invertit, corregit", { min, max });
    }

    if (min !== null) resultat = resultat.filter((p) => Number(p?.weight) >= Number(min));
    if (max !== null) resultat = resultat.filter((p) => Number(p?.weight) <= Number(max));
  }

  /* ------------------------------------------------------
     7.2.4 Ordenació i actualització d’estat filtrat
  ------------------------------------------------------ */
  /*
     Ordenem, actualitzem PokemonList filtrat i reiniciem paginació.
  */
  resultat = ordenarPokemons(resultat, obtenirOrdre());

  filteredPokemons = new PokemonList(resultat);
  currentIndex = 0;

  netejarResultats();

  const arrayFiltrat = filteredPokemons?.pokemons ?? [];

  /* ------------------------------------------------------
     7.2.5 Cas resultat buit
  ------------------------------------------------------ */
  /*
     Si no hi ha resultats: missatge + botó coherent. També persistim filtres.
  */
  if (arrayFiltrat.length === 0) {
    UI.log("INDICE", "FILTRES <- resultat buit (0)");
    mostrarMissatgeSenseResultats();
    actualitzarBotoLoadMore();

    UI.log("INDICE", "MODEL -> User.desarFiltresIndexUsuariActual(estat) (resultat buit)");
    guardarEstatFiltres();
    UI.log("INDICE", "MODEL <- User.desarFiltresIndexUsuariActual(estat) OK (resultat buit)");
    return;
  }

  UI.log("INDICE", "FILTRES <- resultat filtrat", { length: arrayFiltrat.length });

  /* ------------------------------------------------------
     7.2.6 Persistència de filtres (MODEL)
  ------------------------------------------------------ */
  /*
     Persistim via model (la UI no toca localStorage directament).
  */
  UI.log("INDICE", "MODEL -> User.desarFiltresIndexUsuariActual(estat)");
  guardarEstatFiltres();
  UI.log("INDICE", "MODEL <- User.desarFiltresIndexUsuariActual(estat) OK");

  renderitzarPrimeraPagina();
}

/* ------------------------------------------------------
   7.3 ordenarPokemons(): criteris d’ordenació
------------------------------------------------------ */
/*
   Ordenació separada per mantenir el filtre principal llegible.
   Retornem una còpia perquè sort() modifica l'array original.
*/
function ordenarPokemons(llista, ordre) {
  const copia = [...llista];

  switch (ordre) {
    case "idDesc":
      copia.sort((a, b) => Number(b?.id) - Number(a?.id));
      break;

    case "nameAsc":
      copia.sort((a, b) => String(a?.name).localeCompare(String(b?.name)));
      break;

    case "nameDesc":
      copia.sort((a, b) => String(b?.name).localeCompare(String(a?.name)));
      break;

    case "idAsc":
    default:
      copia.sort((a, b) => Number(a?.id) - Number(b?.id));
      break;
  }

  return copia;
}


/* ------------------------------------------------------
   7.4 Persistència de filtres: guardar i restaurar estat
------------------------------------------------------ */
/*
   Pont UI <-> MODEL: la UI construeix l'estat (inputs + selectedTypes) i el model el persisteix per usuari.
*/
function guardarEstatFiltres() {
  const estat = {
    selectedTypes: Array.from(selectedTypes),
    searchText: obtenirTextCerca(),
    weightMin: String(document.getElementById("weightMin")?.value ?? "").trim(),
    weightMax: String(document.getElementById("weightMax")?.value ?? "").trim(),
    orden: document.getElementById("orden")?.value ?? "idAsc"
  };

  UI.log("INDICE", "MODEL -> User.desarFiltresIndexUsuariActual()", estat);
  const r = User.desarFiltresIndexUsuariActual(estat);
  UI.traceResult("INDICE", "MODEL desarFiltresIndexUsuariActual()", r);

  return r;
}

function restaurarEstatFiltres() {
  UI.log("INDICE", "MODEL -> User.obtenirFiltresIndexUsuariActual()");
  const r = User.obtenirFiltresIndexUsuariActual();
  UI.log("INDICE", "MODEL <- User.obtenirFiltresIndexUsuariActual()", r);

  /*
     Si no hi ha estat (primer ús) o el format és invàlid, no fem res.
  */
  if (!r || r.ok !== true || !r.data) return;

  const estat = r.data;

  /*
     Reconstruïm selectedTypes com a Set (es guarda com array).
  */
  selectedTypes = new Set(
    Array.isArray(estat.selectedTypes) ? estat.selectedTypes : []
  );

  /*
     Recarreguem inputs perquè la UI reflecteixi l'estat abans de renderitzar.
  */
  const inputBuscar = document.getElementById("searchInput");
  const inputMin = document.getElementById("weightMin");
  const inputMax = document.getElementById("weightMax");
  const selectOrden = document.getElementById("orden");

  if (inputBuscar) inputBuscar.value = estat.searchText ?? "";
  if (inputMin) inputMin.value = estat.weightMin ?? "";
  if (inputMax) inputMax.value = estat.weightMax ?? "";
  if (selectOrden) selectOrden.value = estat.orden ?? "idAsc";
}


/* ------------------------------------------------------
   7.5 Accions sobre llistes (delegació al MODEL)
------------------------------------------------------ */
/*
   Helpers per a callbacks de les cards. La lògica real és del model (validacions + persistència).
*/
function alternarPokemonAEquip(pokemonId) {
  return User.alternarPokemonALlistaUsuariActual("myTeam", pokemonId);
}

function alternarPokemonADeseos(pokemonId) {
  return User.alternarPokemonALlistaUsuariActual("wishes", pokemonId);
}


/* ------------------------------------------------------
   8. Render i paginació
------------------------------------------------------ */
/*
   Render paginat per rendiment: evitem enganxar 151 cards al DOM d'un sol cop.
*/

/* ------------------------------------------------------
   8.1 Accés i neteja del contenidor de resultats
------------------------------------------------------ */
/*
   Helpers de DOM: obtenir contenidor, netejar-lo (sense innerHTML) i mostrar missatge de "sense resultats".
*/
function obtenirContenidorResultats() {
  const cont = document.getElementById("resultados");
  if (!cont) return null;
  return cont;
}

function netejarResultats() {
  const cont = obtenirContenidorResultats();
  if (!cont) return;

  while (cont.firstChild) cont.removeChild(cont.firstChild);
}

function mostrarMissatgeSenseResultats() {
  const cont = obtenirContenidorResultats();
  if (!cont) return;

  const p = document.createElement("p");
  p.className = "no-results-message";
  p.textContent = "No se han encontrado Pokémon con los filtros seleccionados";
  cont.appendChild(p);
}

/* ------------------------------------------------------
   8.2 Cards (AUX) + integració amb accions
------------------------------------------------------ */
/*
   AUX crea la card; aquí connectem callbacks cap al model i deixem traça.
   Alert només en el cas important (límit de 6 a My equipo).
*/
function crearCardPokemon(pokemon) {
  UI.log("INDICE", "AUX -> auxCrearCardPokemonIndex()", {
    id: pokemon?.id ?? null,
    name: pokemon?.name ?? null
  });

  return auxCrearCardPokemonIndex(pokemon, {
    onToggleEquipo: (id) => {
      UI.log("INDICE", "ACTION -> alternarPokemonAEquip()", { id });

      const resultat = alternarPokemonAEquip(id);

      // Traça estàndard del model
      UI.traceResult("INDICE", "MODEL alternarPokemonAEquip()", resultat);

     
   // Només mostrem alert quan el model diu que has arribat al màxim de 6 (és el cas que realment necessita explicació).
  if (resultat?.ok === false && resultat?.message === "My equipo solo puede tener 6 Pokémon") {
    UI.alertResultat(resultat, "Límit d'equip");
  }
},

    onToggleDeseos: (id) => {
      UI.log("INDICE", "ACTION -> alternarPokemonADeseos()", { id });

      const resultat = alternarPokemonADeseos(id);

      UI.traceResult("INDICE", "MODEL alternarPokemonADeseos()", resultat);

    },

    onUpdateMenu: () => updateMenu()

  });
}

/* ------------------------------------------------------
   8.3 Render de pàgines (paginació amb currentIndex)
------------------------------------------------------ */
/*
   Pinta un tros [inici, fi), actualitza currentIndex i sincronitza el botó "Carregar més".
*/
function renderitzarPagina() {
  const cont = obtenirContenidorResultats();
  if (!cont) return;

  const arrayFiltrat = filteredPokemons?.pokemons ?? [];

  const inici = currentIndex;
  const fi = Math.min(currentIndex + pageSize, arrayFiltrat.length);

  UI.log("INDICE", "RENDER -> renderitzarPagina()", {
    inici,
    fi,
    pageSize,
    total: arrayFiltrat.length
  });

  const tros = arrayFiltrat.slice(inici, fi);

  tros.forEach((pokemon) => {
    cont.appendChild(crearCardPokemon(pokemon));
  });

  currentIndex = fi;

  actualitzarBotoLoadMore();

  UI.log("INDICE", "RENDER <- renderitzarPagina() OK", {
    currentIndex,
    remaining: Math.max(0, arrayFiltrat.length - currentIndex)
  });
}

function renderitzarPrimeraPagina() {
  /*
     Després de canviar filtres/ordre, reiniciem paginació i netegem abans de pintar.
  */
  currentIndex = 0;
  netejarResultats();
  renderitzarPagina();
}

/* ------------------------------------------------------
   8.4 Load More (Carregar més): inicialització i actualització d’estat
------------------------------------------------------ */
/*
   El botó reflecteix l'estat de paginació: si no hi ha més, es desactiva; si no hi ha resultats, s'amaga.
*/
function inicialitzarBotoLoadMore() {
  const btn = document.getElementById("loadMore");
  if (!btn) return;

  btn.addEventListener("click", (event) => {
    event.preventDefault();
    UI.log("INDICE", "EVENT <- click Load More");
    renderitzarPagina();
  });

  actualitzarBotoLoadMore();
}

function actualitzarBotoLoadMore() {
  const btn = document.getElementById("loadMore");
  if (!btn) return;

  const arrayFiltrat = filteredPokemons?.pokemons ?? [];

  const jaNoHiHaMes = currentIndex >= arrayFiltrat.length;

  btn.disabled = jaNoHiHaMes;

  /*
     Si no hi ha resultats, amaguem el botó perquè no confongui l'usuari.
  */
  if (arrayFiltrat.length === 0) {
    btn.style.display = "none";
    return;
  }

  btn.style.display = "block";
  btn.textContent = jaNoHiHaMes ? "No hi ha més Pokemons" : "Carregar més Pokemons";
}
