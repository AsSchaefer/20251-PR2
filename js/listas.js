/* ------------------------------------------------------
   PR2 / Entrega 2 — Llistes d’usuari (Mi equipo / Deseos)
   ------------------------------------------------------
   Alumna: Alexandra Schäfer Barrientos
   Data: 9 de gener de 2026
   Fitxer: listas.js

   Descripció:
   Controlador de listas.html: mostra “Mi equipo” (myTeam) i “Deseos” (wishes).
   La pantalla NO fa fetch:
   - Llegeix IDs del model (User).
   - Recupera dades del caixet (AUX).
   - Renderitza cards amb la factoria AUX.

------------------------------------------------------
   Estructura del fitxer

   1. Punt d’entrada (DOMContentLoaded)
      1.1 Captura del selector de llista
      1.2 Valor inicial + primer render
      1.3 Canvi de llista
      1.4 Botó tornar
      1.5 Actualització del menú

   2. Render principal (mostrarLlistaPokemons)
      2.1 Usuari actual
      2.2 Contenidor
      2.3 Neteja
      2.4 IDs de la llista
      2.5 Cas llista buida
      2.6 Recuperació des del caixet
      2.7 Cas caixet buit
      2.8 Render cards + eliminació

   3. Helpers

------------------------------------------------------ */


/* ------------------------------------------------------
   1. Punt d’entrada (DOMContentLoaded)
------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  UI.log("LISTAS", "listas.js carregat");

  /* ------------------------------------------------------
     1.1 Captura del selector de llista
  ------------------------------------------------------ */
  const selectLlista = document.getElementById("listSelector");
  if (!selectLlista) {
    UI.error("LISTAS", "No existeix #listSelector al DOM");
    return;
  }

  /* ------------------------------------------------------
     1.2 Valor inicial + primer render
  ------------------------------------------------------ */
  selectLlista.value = "myTeam";
  mostrarLlistaPokemons("myTeam");

  /* ------------------------------------------------------
     1.3 Canvi de llista (listener del select)
  ------------------------------------------------------ */
  selectLlista.addEventListener("change", () => {
    const tipus = String(selectLlista.value);
    UI.log("LISTAS", "EVENT <- change listSelector", { tipus });
    mostrarLlistaPokemons(tipus);
  });

  /* ------------------------------------------------------
     1.4 Botó tornar
  ------------------------------------------------------ */
  prepararBotoTornar();

  /* ------------------------------------------------------
     1.5 Menú superior (comptadors)
  ------------------------------------------------------ */
  updateMenu();
});


/* ------------------------------------------------------
   2. Render principal: mostrarLlistaPokemons()
------------------------------------------------------ */
/*
   Responsabilitat:
   - Llegeix IDs del model segons el tipus (myTeam / wishes).
   - Recupera Pokémons des del caixet (AUX) a partir d’aquests IDs.
   - Renderitza cards i connecta eliminació delegant al MODEL.
*/

function mostrarLlistaPokemons(tipusLlista) {
  const tipus = String(tipusLlista);
  UI.log("LISTAS", "RENDER -> mostrarLlistaPokemons()", { tipus });

  /* ------------------------------------------------------
     2.1 Usuari actual (font de veritat)
  ------------------------------------------------------ */
  const usuari = User.obtenirObjecteUsuariActual();

  /* ------------------------------------------------------
     2.2 Contenidor de render
  ------------------------------------------------------ */
  const cont = document.getElementById("listasContainer");
  if (!cont) {
    UI.error("LISTAS", "No existeix #listasContainer al DOM");
    return;
  }

  /* ------------------------------------------------------
     2.3 Neteja del contenidor
  ------------------------------------------------------ */
  cont.textContent = "";

  /* ------------------------------------------------------
     2.4 IDs de la llista (MODEL)
  ------------------------------------------------------ */
  const ids = obtenirIdsLlistaUsuari(tipus, usuari);
  UI.log("LISTAS", "MODEL <- obtenirIdsLlistaUsuari()", { length: ids.length });

  /* ------------------------------------------------------
     2.5 Cas llista buida
  ------------------------------------------------------ */
  if (ids.length === 0) {
    const p = document.createElement("p");
    p.className = "no-results-message";
    p.textContent = (tipus === "myTeam")
      ? "No tienes Pokémons en Mi equipo"
      : "No tienes Pokémons en Deseos";
    cont.appendChild(p);

    UI.log("LISTAS", "RENDER <- llista buida (0)");
    return;
  }

  /* ------------------------------------------------------
     2.6 Recuperació de Pokémons des del caixet (AUX)
  ------------------------------------------------------ */
  /*
     - No construïm PokemonList perquè aquí només renderitzem.
     - Aux ja fa tota la feina “pesada” (llegir caixet + buscar per id).
     - Si un id no existeix al caixet, l’ignorem i continuem.
  */

  const pokemons = [];

  ids.forEach((id) => {
    const pokemon = auxGetPokemonById(id);
    if (!pokemon) return;
    pokemons.push(pokemon);
  });

  /* ------------------------------------------------------
     2.7 Cas: caixet buit / cap Pokémon recuperat
  ------------------------------------------------------ */
  /*
     Si l'usuari entra directament a listas.html sense haver passat per l'indice,
     pot no existir la Pokédex al caixet. En lloc de trencar, mostrem missatge clar.
  */

  if (pokemons.length === 0) {
    const p = document.createElement("p");
    p.className = "no-results-message";
    p.textContent = "No se ha encontrado la Pokédex en caché. Vuelve al índice para cargarla";
    cont.appendChild(p);

    UI.warn("LISTAS", "No s'ha pogut construir llista (probable caixet buit)");
    return;
  }

  UI.log("LISTAS", "AUX <- pokemons recuperats del caixet", { length: pokemons.length });

  
  /* ------------------------------------------------------
     2.8 Render cards (AUX) + eliminació (MODEL)
  ------------------------------------------------------ */
  /*
     - AUX crea la card i nosaltres passem QUÈ FER quan es prem eliminar.
     - Eliminar modifica el model.
     - Si OK: refresquem menú i re-renderitzem des de font de veritat.
  */

  pokemons.forEach((pokemon) => {
  const card = auxCrearCardPokemonLista(pokemon, tipus, {
    onEliminar: (tipusEliminar, idPokemon) => {
      UI.log("LISTAS", "ACTION -> eliminarPokemonDeLlistaUsuariActual()", {
        tipusEliminar,
        idPokemon
      });

      const resultat = User.eliminarPokemonDeLlistaUsuariActual(tipusEliminar, idPokemon);
      UI.traceResult("LISTAS", "MODEL eliminarPokemonDeLlistaUsuariActual()", resultat);

      if (resultat?.ok === true) {
        updateMenu();
        mostrarLlistaPokemons(tipusEliminar);
      }
    }
  });

  cont.appendChild(card);
});


  UI.log("LISTAS", "RENDER <- mostrarLlistaPokemons() OK");
}


/* ------------------------------------------------------
   3. Helpers
------------------------------------------------------ */

function obtenirIdsLlistaUsuari(tipusLlista, usuari) {
  const myTeam = Array.isArray(usuari?.myTeam) ? usuari.myTeam : [];
  const wishes = Array.isArray(usuari?.wishes) ? usuari.wishes : [];

  return (String(tipusLlista) === "myTeam") ? myTeam : wishes;
}


function prepararBotoTornar() {
  const botoTornar = document.getElementById("backButton");
  if (!botoTornar) return;

  botoTornar.addEventListener("click", (event) => {
    event.preventDefault();
    UI.log("LISTAS", "EVENT <- click backButton (go indice.html)");
    window.location.href = "indice.html";
  });
}
