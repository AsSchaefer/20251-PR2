/* ------------------------------------------------------
   PR2 – Detall de Pokémon
   ------------------------------------------------------
    Alumna: Alexandra Schäfer Barrientos
    Data: 23 de desembre de 2025
    Fitxer: detail.js

    Descripció:
    Aquest fitxer defineix l’estructura de la pantalla de
    detall (fitxa) d’un Pokémon.

    En aquesta fase del projecte, el codi es deixa com un
    esquelet completament comentat, sense implementar encara
    la lògica funcional.

    L’objectiu d’aquest fitxer és deixar clar quin serà
    el flux de la pantalla, quines funcions seran necessàries
    i com es treballarà amb les dades persistides quan
    s’implementi l’Entrega 2.

    És important remarcar que aquest fitxer no fa cap crida
    directa a l’API ni llegeix encara del localStorage.


/* ------------------------------------------------------

    Estructura del fitxer:

    1. Punt d’entrada
        1.1 Inicialització de la pantalla
        1.2 Identificació del Pokémon seleccionat
        1.3 Recuperació de dades des del localStorage
        1.4 Pintat de dades al DOM

    2. Funcions auxiliars previstes
    
------------------------------------------------------ */



/* ------------------------------------------------------
    1. Punt d’entrada
   ------------------------------------------------------
    Aquest bloc actua com a punt d’entrada de la pantalla
    de detall del Pokémon.

    En aquesta etapa del projecte, l’única acció real és
    comprovar que el fitxer es carrega correctament.
    La resta de passos queden descrits però no executats.
  ------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {

  console.log("detail.js carregat correctament.");

  /* ------------------------------------------------------
        1.1 Inicialització de la pantalla
     ------------------------------------------------------
        Quan la pantalla de detall estigui completament
        implementada, el primer pas serà determinar quin
        Pokémon s’ha de mostrar.

        Aquesta inicialització servirà per posar en marxa
        tot el flux de la pàgina, començant per la identificació
        del Pokémon seleccionat.
    ------------------------------------------------------ */


  /* ------------------------------------------------------
        1.2 Identificació del Pokémon seleccionat
    ------------------------------------------------------
        En aquest punt es determinarà l’identificador del Pokémon
        que l’usuari ha seleccionat prèviament a la llista.

        La manera concreta d’obtenir aquest identificador
        dependrà de com s’hagi implementat la navegació des
        de la pantalla principal del projecte.

        Aquesta decisió es prendrà a l’Entrega 2.
    ------------------------------------------------------ */


 /* ------------------------------------------------------
        1.3 Recuperació de dades des del localStorage
    ------------------------------------------------------
        El disseny del projecte estableix que la PokeAPI
        només s’utilitza una vegada, en la càrrega inicial
        de dades.

        Per aquest motiu, quan aquesta pantalla s’implementi,
        la informació del Pokémon es recuperarà exclusivament
        des del localStorage, utilitzant les dades persistides.
    ------------------------------------------------------ */


/* ------------------------------------------------------
        1.4 Pintat de dades al DOM
    ------------------------------------------------------
        Un cop obtinguda la informació completa del Pokémon,
        l’últim pas del flux serà mostrar aquestes dades
        a la interfície d’usuari.

        Aquesta part consistirà a escriure el nom, la imatge,
        els tipus, les habilitats, la descripció i les estadístiques
        dins dels elements HTML corresponents.
  ------------------------------------------------------ */
});



/* ------------------------------------------------------
    2. Funcions auxiliars previstes
   ------------------------------------------------------
    Les funcions següents no s’implementen encara.
    Es documenten únicament per deixar constància de
    quina responsabilitat tindrà cadascuna quan s’integri
    la pantalla de detall a l’Entrega 2.
------------------------------------------------------ */

    /* ------------------------------------------------------
        2.1 obtenirIdPokemonSeleccionat()
       ------------------------------------------------------
        Aquesta funció s’encarregarà d’obtenir l’identificador
        del Pokémon seleccionat per l’usuari.

        El seu objectiu serà retornar un identificador vàlid
        o indicar que no s’ha pogut determinar cap selecció.
        ------------------------------------------------------ */

    /* ------------------------------------------------------
        2.2 obtenirPokemonDesDeLocalStorage(id)
       ------------------------------------------------------
        Aquesta funció recuperarà la informació del Pokémon
        corresponent a l’identificador indicat, utilitzant
        les dades guardades al localStorage.

        No realitzarà cap crida externa ni dependrà de l’API.
    ------------------------------------------------------ */

    /* ------------------------------------------------------
        2.3 pintarPokemonAlDOM(pokemon)
       ------------------------------------------------------
        Aquesta funció serà l’encarregada d’escriure la informació
        del Pokémon dins del DOM de la pàgina de detall, utilitzant
        els elements HTML definits al fitxer detail.html.
    ------------------------------------------------------*/
