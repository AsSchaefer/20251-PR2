/* ------------------------------------------------------
    PR2 – Llistes d’usuari
   ------------------------------------------------------
    Alumna: Alexandra Schäfer Barrientos
    Data: 23 de desembre de 2025
    Fitxer: listas.js
    
    Descripció:
    Gestió de la visualització de les llistes de Pokémons
    associades a l’usuari:
    - Equip personal (myTeam)
    - Llista de desitjos (wishes)

    Aquest fitxer s’encarrega exclusivament de la lògica
    de visualització i navegació.
    ------------------------------------------------------

    Estructura del fitxer:

        1. Funció mostrarLlistaPokemons
        2. Botó de retorn a la pàgina principal
        
    ------------------------------------------------------ */


/* ------------------------------------------------------
    1. Funció mostrarLlistaPokemons(tipusLlista, usuari)
   ------------------------------------------------------
    Aquesta funció mostrarà al DOM la llista de Pokémons
    corresponent a l’usuari.

    Paràmetres:
    - tipusLlista: indica quina llista es vol mostrar
    ("myTeam" o "wishes")
    - usuari: dades de l’usuari amb sessió iniciada

    En aquesta fase del projecte, la funció queda definida
    com a esquelet i s’implementarà completament a l’Entrega 2.
    ------------------------------------------------------ */

// Obtenir la llista corresponent de l’usuari
function mostrarLlistaPokemons(tipusLlista, usuari) {

  console.log(
    "mostrarLlistaPokemons cridada ->",
    "tipusLlista:", tipusLlista,
    "usuari:", usuari
  );

  // Aquí es pintarà la llista de Pokémons segons el tipus indicat
  // i es gestionarà l’eliminació d’elements (Entrega 2).

  // ...
}



/* ------------------------------------------------------
    2. Botó: tornar a la pàgina d’índex de Pokémons
    ------------------------------------------------------
    Aquest bloc gestiona la navegació de retorn cap a
    la pàgina principal (indice.html).
------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {

  const botoTornar = document.getElementById("backButton");

  if (!botoTornar) {
    console.warn("No existeix el botó #backButton");
    return;
  }

  botoTornar.addEventListener("click", () => {
    window.location.href = "indice.html";
  });

});
