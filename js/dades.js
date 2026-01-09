/* ------------------------------------------------------
   PR2 – Configuració global
---------------------------------------------------------
   Alumna: Alexandra Schäfer Barrientos
   Data: 9 de gener de 2026
   Fitxer: dades.js

   Descripció:
   Aquest fitxer centralitza totes les dades estàtiques del projecte PR2.
   Són valors que no canvien durant l'execució i que es reutilitzen en
   diferents pantalles (API, registre i filtres).

   Objectiu:
   Evitar literals escampats pel codi i tenir un únic punt de referència
   per a configuració i llistes fixes. Aquí no hi ha lògica ni comportament:
   només dades compartides.

------------------------------------------------------

   Estructura del fitxer:

   1. Configuració de l'API (PokeAPI)
   2. Llista de ciutats (registre)
   3. Llista de tipus de Pokémon (filtres)

------------------------------------------------------ */


/* ------------------------------------------------------
   1. Configuració de l'API (PokeAPI)
------------------------------------------------------ */
/*
   Centralitzem la URL base de la PokeAPI perquè la resta del projecte
   pugui construir peticions sense repetir literals.

   Si en algun moment canvia l’endpoint o el criteri de càrrega,
   només cal tocar aquest objecte.
*/

const config = {
  apiBaseUrl: "https://pokeapi.co/api/v2/pokemon?limit="
};


/* ------------------------------------------------------
   2. Llista de ciutats (registre)
------------------------------------------------------ */
/*
   Dades utilitzades al procés de registre d'usuari.

   Aquesta llista serveix per omplir desplegables i sincronitzar
   ciutat i codi postal. 

   Afegir noves ciutats és tan simple com afegir un nou objecte.
*/

const cities = [
  { name: "Madrid", postalCode: "28001" },
  { name: "Barcelona", postalCode: "08001" },
  { name: "Valencia", postalCode: "46001" }
  // ...
];


/* ------------------------------------------------------
   3. Llista de tipus de Pokémon (filtres)
------------------------------------------------------ */
/*
   Defineix els tipus disponibles per al sistema de filtres
   de l'índex.

   Cada element té:
   - id   : valor utilitzat a la lògica
   - name : text que es mostra a la UI

   Encara que ara id i name coincideixin, mantenim aquesta
   estructura per facilitar canvis futurs sense tocar la UI.
*/

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
