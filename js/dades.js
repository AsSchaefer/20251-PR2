/* ------------------------------------------------------
   PR2 – Configuració global
   ------------------------------------------------------
   Alumna: Alexandra Schäfer Barrientos
   Data: 23 de desembre de 2025
   Fitxer: dades.js

   Descripció:
   Aquest fitxer agrupa dades i constants globals del projecte PR2.

   És un fitxer “de suport”:
    - No conté lògica.
    - No interactua amb el DOM.
    - No fa crides a l’API.

    Simplement defineix informació estàtica que després reutilitzen
    altres scripts (registre, filtres, càrrega de pokémons, etc.).
  ------------------------------------------------------ 

  Estructura del fitxer:

    1. Configuració de l’API (PokeAPI)
    2. Llista de ciutats (registre)
    3. Llista de tipus de Pokémon (filtres)
    4. Noms de llistes d’usuari (textos de UI)
    
------------------------------------------------------ */



/* ------------------------------------------------------
   1. Configuració de l’API (PokeAPI)
   ------------------------------------------------------
   Centralitzem aquí la URL base per evitar “strings solts” repartits
   pel projecte. Si algun dia cal canviar l’endpoint o el límit,
   es fa en un únic lloc.    
   ------------------------------------------------------ */
const config = {
  apiBaseUrl: "https://pokeapi.co/api/v2/pokemon?limit="
};



/* ------------------------------------------------------
    2. Llista de ciutats (registre)
   ------------------------------------------------------
   Aquest array alimenta el formulari de registre (registro.js).
   S’utilitza per:
    - omplir el desplegable de poblacions,
    - validar codis postals existents,
    - i autocompletar ciutat <-> codi postal.
   ------------------------------------------------------ */
const cities = [
  { name: "Madrid", postalCode: "28001" },
  { name: "Barcelona", postalCode: "08001" },
  { name: "Valencia", postalCode: "46001" }
  // ...
];



/* ------------------------------------------------------
    3. Llista de tipus de Pokémon (filtres)
   ------------------------------------------------------
    Aquesta llista serveix per construir els filtres de tipus
    a la interfície (indice.html & indice.js ).
   ------------------------------------------------------ */
const type_list = [
  { id: "grass", name: "grass" },
  { id: "fire", name: "fire" },
  { id: "water", name: "water" },
  { id: "bug", name: "bug" },
  { id: "normal", name: "normal" },
  { id: "electric", name: "electric" },
  { id: "ground", name: "ground" },
  { id: "fairy", name: "fairy" },
  { id: "fighting", name: "fighting" },
  { id: "psychic", name: "psychic" },
  { id: "rock", name: "rock" },
  { id: "ghost", name: "ghost" },
  { id: "ice", name: "ice" },
  { id: "dragon", name: "dragon" },
  { id: "poison", name: "poison" },
  { id: "flying", name: "flying" }
];



/* ------------------------------------------------------
    4. Noms de llistes d’usuari (textos de UI)
   ------------------------------------------------------
    Aquest objecte permet mostrar noms “humans” a la interfície
    quan fem referència a les llistes de l’usuari.
   ------------------------------------------------------ */
const nomsLlistes = {
  myTeam: "El meu equip",
  wishes: "Desitjos"
};
