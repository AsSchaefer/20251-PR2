/* ------------------------------------------------------
   PR2 – Càrrega de Pokémons (API + caixet + filtres) (Entrega 2)
   ------------------------------------------------------
    Alumna: Alexandra Schäfer Barrientos
    Data: 23 de desembre de 2025
    Fitxer: indice.js

    Descripció:
    Aquest script prepara la càrrega de Pokémons des de la PokeAPI
    i deixa a punt l’estat necessari per integrar el render, filtres
    i paginació.

    Idees clau del fitxer:
    - Primer obtenim la llista base (name + url)
    - Després fem crides de detall per completar dades (imatge, tipus, stats…)
    - La descripció en espanyol ve de l’endpoint species
    - El loader reflecteix càrrega asíncrona i evita interaccions
    - El filtre de tipus, de moment, és visual (selectedType + .active)
  ------------------------------------------------------
    
    Estructura del fitxer:
    
      1. Estat general (llistes, pàgina i configuració)
        1.1 Estat de dades (all/filtered, índex, pageSize)
        1.2 Config de càrrega (totalPokemons i URL)
        1.3 Sessió (user) i estat de filtre (selectedType)

      2. Punt d’entrada (DOMContentLoaded)

      3. Loader (mostrar/ocultar)
        3.1 mostrarLoader()
        3.2 ocultarLoader()
        
      4. Càrrega de dades des de l’API
        4.1 getPokemons(url)
        4.2 getPokemonDescription(speciesUrl)

      5. Filtres de tipus (typeList)
        5.1 inicialitzarFiltresDeTipus()
        5.2 gestionarClickTipus(elementLi)
        5.3 desactivarTotsElsTipus()

      6. Notes d’integració (render, filtres reals i paginació)
      
  ------------------------------------------------------ */



/* ------------------------------------------------------
1. Estat general (variables globals)
------------------------------------------------------ */

  /* ------------------------------------------------------
      1.1 Estat de dades (llistes i paginació)
     ------------------------------------------------------
      - allPokemons: llista completa carregada des de l’API o caixet
      - filteredPokemons: llista a mostrar quan hi hagi filtres actius
      - currentIndex: punt d’inici de la pàgina actual (paginació)
     ------------------------------------------------------ */
let allPokemons = [];
let filteredPokemons = [];
let currentIndex = 0;

/* Mida de pàgina orientativa (quan s’integri el render) */
const pageSize = 12;


  /* ------------------------------------------------------
     1.2 Config de càrrega (total i URL inicial)
     ------------------------------------------------------
      A la PokeAPI podem demanar una llista amb limit. Aquí carreguem
      un total fix (ex: 151) per treballar la 1a generació.
     ------------------------------------------------------ */
const totalPokemons = 151;
let currentURL = `${config.apiBaseUrl}` + `${totalPokemons}`;


/* ------------------------------------------------------
   1.3 Sessió i estat de filtres
   ------------------------------------------------------
    - user: es completarà quan s’integri sessió (User a clases.js)
    - selectedType: de moment només controla l’estat visual del filtre
  ------------------------------------------------------ */
let user = null;
let selectedType = null;



/* ------------------------------------------------------
    2. Punt d’entrada (DOMContentLoaded)
   ------------------------------------------------------
    S’executa quan el DOM ja està disponible. És important perquè:
    - necessitem pintar la llista de tipus (#typeList)
    - necessitem poder mostrar/ocultar el loader (#loader)
   ------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {

  console.log("indice.js carregat correctament.");

  /* ------------------------------------------------------
      2.1 Inicialització del filtre de tipus (estat visual)
     ------------------------------------------------------
      Pintem el llistat de tipus a partir de type_list (config.js).
      De moment només permet marcar .active i guardar selectedType.
    ------------------------------------------------------ */
  inicialitzarFiltresDeTipus();

  /* ------------------------------------------------------
      2.2 (Entrega 2) Punt d’entrada del flux API + render
     ------------------------------------------------------
      Quan s’integri la pantalla:
      - recuperar sessió d’usuari (User)
      - carregar caixet o cridar getPokemons()
      - omplir allPokemons i filteredPokemons
      - iniciar paginació i render
      ------------------------------------------------------ */
});



/* ------------------------------------------------------
    3. Loader (mostrar/ocultar)
   ------------------------------------------------------
    Aquestes funcions controlen l’spinner i la classe CSS "loading".
    Són una part important del feedback d’una càrrega asíncrona.
   ------------------------------------------------------ */

  /* ------------------------------------------------------
      3.1 mostrarLoader()
    ------------------------------------------------------ */
    // Mostrem l’spinner i afegeix la classe CSS "loading"
function mostrarLoader() {
  const loader = document.getElementById("loader");

  if (!loader) {
    console.warn("No existeix #loader al DOM. No es pot mostrar l'spinner.");
    return;
  }

  loader.style.display = "block";
  document.body.classList.add("loading");
}

  /* ------------------------------------------------------
      3.2 ocultarLoader()
     ------------------------------------------------------ */
     // Amaga l’spinner i treu la classe CSS "loading"
function ocultarLoader() {
  const loader = document.getElementById("loader");

  if (!loader) {
    console.warn("No existeix #loader al DOM. No es pot ocultar l'spinner.");
    return;
  }

  loader.style.display = "none";
  document.body.classList.remove("loading");
}



/* ------------------------------------------------------
    4. Càrrega de dades des de l’API
   ------------------------------------------------------ */


    /* ------------------------------------------------------
       4.1 getPokemons(url)
       ------------------------------------------------------
        Flux general de la PokeAPI:
        1. Crida inicia -> results: [{ name, url }]
        2. Per cada element -> crida de detall (url) per obtenir dades completes
        3. La descripció ve de species.url i es busca en espanyol
        4. Es retorna una llista d’objectes plans amb les dades principals
      
        Important:
      - Aquesta funció és asíncrona i retorna una Promise amb la llista
      - En cas d’error, es retorna una llista buida
      - Es mostra/oculta el loader durant la càrrega
------------------------------------------------------ */
async function getPokemons(url = currentURL) {

  console.log("Iniciant càrrega de pokémons:", url);

  try {

    mostrarLoader();

    /* ------------------------------------------------------
        4.1.1 Llista base (name + url de detall)
      ------------------------------------------------------ */
    const respostaLlista = await fetch(url);

    if (!respostaLlista.ok) {
      console.error(
        "Resposta incorrecta obtenint llista:",
        respostaLlista.status,
        respostaLlista.statusText
      );
      ocultarLoader();
      return [];
    }

    const dadesLlista = await respostaLlista.json();

    if (!Array.isArray(dadesLlista.results)) {
      console.error("Format inesperat: s'esperava results com a array.");
      ocultarLoader();
      return [];
    }

    /* ------------------------------------------------------
        4.1.2 Detall de cada pokémon (Promise.all)
       ------------------------------------------------------
        Es fa en paral·lel per accelerar la càrrega.
        Si un element falla, retornem null i després el descartem.
       ------------------------------------------------------ */
    const promesesDetall = dadesLlista.results.map(async (pokemonBasic) => {
      try {

        const respostaDetall = await fetch(pokemonBasic.url);

        if (!respostaDetall.ok) {
          console.warn("No s'ha pogut obtenir el detall de:", pokemonBasic.name);
          return null;
        }

        const detall = await respostaDetall.json();

      /* ------------------------------------------------------
          4.1.3 Descripció en espanyol (species.url)
         ------------------------------------------------------ */
        const speciesUrl = detall?.species?.url ?? null;
        const descripcioES = speciesUrl
          ? await getPokemonDescription(speciesUrl)
          : "Descripción no disponible en español";

      /* ------------------------------------------------------
          4.1.4 Objecte pla amb dades principals
         ------------------------------------------------------
          Aquest format és útil perquè:
          - és fàcil de renderitzar
          - és guardable a localStorage
          - es pot convertir a Pokemon (clases.js) quan convingui
        ------------------------------------------------------ */
        return {
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

      } catch (error) {
        console.error("Error carregant detall d'un pokémon:", error);
        return null;
      }
    });

    const detallsAmbNulls = await Promise.all(promesesDetall);

    /* ------------------------------------------------------
        4.1.5 Neteja: eliminem elements fallits (null)
        ------------------------------------------------------ */
    const successfulPokemons = detallsAmbNulls.filter((p) => p !== null);

    console.log("Càrrega completada. Pokémons obtinguts:", successfulPokemons.length);

    ocultarLoader();
    return successfulPokemons;

  } catch (error) {
    console.error("Error general obtenint pokémons:", error);
    ocultarLoader();
    return [];
  }
}



  /* ------------------------------------------------------
      4.2 getPokemonDescription(speciesUrl)
     ------------------------------------------------------
      Busca el text en espanyol dins flavor_text_entries.
      Neteja \n i \f perquè sigui llegible en UI.
     ------------------------------------------------------ */
async function getPokemonDescription(speciesUrl) {

  try {

    const response = await fetch(speciesUrl);

    if (!response.ok) {
      console.warn(
        "No s'ha pogut obtenir species:",
        response.status,
        response.statusText
      );
      return "Descripción no disponible en español";
    }

    const speciesData = await response.json();

    if (!Array.isArray(speciesData.flavor_text_entries)) {
      console.warn("Format inesperat a flavor_text_entries.");
      return "Descripción no disponible en español";
    }

    const spanishEntry = speciesData.flavor_text_entries.find(
      (entry) => entry.language?.name === "es"
    );

    if (!spanishEntry || typeof spanishEntry.flavor_text !== "string") {
      return "Descripción no disponible en español";
    }

    return spanishEntry.flavor_text
      .replace(/\n/g, " ")
      .replace(/\f/g, " ");

  } catch (error) {
    console.error("Error a getPokemonDescription:", error);
    return "Error al cargar descripción";
  }
}



/* ------------------------------------------------------
   5. Filtres de tipus (typeList)
   ------------------------------------------------------
    De moment és un filtre visual:
    - pinta la llista de tipus
    - gestiona .active
    - guarda selectedType
  ------------------------------------------------------ */


    /* ------------------------------------------------------
        5.1 inicialitzarFiltresDeTipus()
       ------------------------------------------------------
      Pinta #typeList a partir de type_list (dades.js).
      Cada <li> guarda el type.id a dataset.type.
      ------------------------------------------------------ */
function inicialitzarFiltresDeTipus() {

  const typeListUl = document.querySelector("#typeList");

  if (!typeListUl) {
    console.error("No existeix #typeList al DOM.");
    return;
  }

  typeListUl.innerHTML = "";

  if (!Array.isArray(type_list)) {
    console.error("type_list no existeix o no és un array. Revisa config.js.");
    return;
  }

  type_list.forEach((type) => {

    const li = document.createElement("li");
    li.textContent = type.name;
    li.dataset.type = String(type.id);

    if (selectedType !== null && String(selectedType) === String(type.id)) {
      li.classList.add("active");
    }

    li.addEventListener("click", (event) => {
      event.preventDefault();
      gestionarClickTipus(li);
    });

    typeListUl.appendChild(li);
  });

  console.log("Tipus carregats:", type_list.length);
}



  /* ------------------------------------------------------
      5.2 gestionarClickTipus(elementLi)
     ------------------------------------------------------
      Gestiona selecció/deselecció:
      - si ja estava actiu → selectedType = null
      - si no ho estava → activar i guardar el nou tipus

      Quan hi hagi render, aquest canvi servirà per filtrar pokémons
      i reiniciar paginació.
    ------------------------------------------------------ */
function gestionarClickTipus(elementLi) {

  const tipusClicat = String(elementLi.dataset.type);
  const jaEstavaActiu = elementLi.classList.contains("active");

  console.log(
    "Click tipus:",
    tipusClicat,
    "jaActiu?",
    jaEstavaActiu,
    "selectedType abans:",
    selectedType
  );

  desactivarTotsElsTipus();

  if (jaEstavaActiu) {
    selectedType = null;
    console.log("Tipus desactivat.");
    return;
  }

  elementLi.classList.add("active");
  selectedType = tipusClicat;

  console.log("Tipus seleccionat:", selectedType);
}



  /* ------------------------------------------------------
      5.3 desactivarTotsElsTipus()
     ------------------------------------------------------
     Treu la classe .active de tots els tipus del llistat.
     ------------------------------------------------------ */
function desactivarTotsElsTipus() {
  const totsElsLi = document.querySelectorAll("#typeList li");
  totsElsLi.forEach((li) => li.classList.remove("active"));
}



/* ------------------------------------------------------
    6. Notes d’integració (render, filtres reals i paginació)
   ------------------------------------------------------
    Quan s’integri el render:
    - allPokemons = await getPokemons()
    - filteredPokemons = allPokemons (o filtre per selectedType)
    - currentIndex i pageSize controlaran la paginació
    - es podrà implementar caixet a localStorage per evitar recàrregues
------------------------------------------------------ */
