
# Projecte PR2 – Programació Web

Aquest projecte correspon a la **Pràctica 2 (PR2)** de l’assignatura **Programació Web** de la **Universitat Oberta de Catalunya (UOC)**.

L’objectiu del projecte és el desenvolupament progressiu d’una aplicació web per a la visualització i gestió de Pokémons, fent ús de JavaScript, HTML, CSS, emmagatzematge local amb `localStorage` i, en fases posteriors, comunicació asíncrona amb la **PokeAPI**.

L’enunciat oficial i vàlid de la pràctica és el publicat a l’aula virtual (aula.uoc.edu).



## Estat del projecte

Aquest repositori reflecteix l’estat del projecte corresponent al **Lliurament 1 (obligatori)** de la PR2.

En aquest lliurament s’han implementat completament totes les funcionalitats exigides per l’enunciat i, addicionalment, s’ha deixat preparada l’estructura general del projecte, la navegació i els estils visuals per facilitar el desenvolupament del **Lliurament 2**.



## Desenvolupament realitzat

S’ha implementat la lògica de dades mitjançant classes JavaScript, amb una separació clara entre el model i la interfície. La classe `User` encapsula tota la gestió d’usuaris, validacions bàsiques, persistència de dades i control de sessió mitjançant `localStorage` i serialització amb JSON.

Les classes `Pokemon` i `PokemonList` han estat definides i documentades com a preparació per al segon lliurament, tot i que la seva funcionalitat completa s’implementarà posteriorment.

S’han desenvolupat les pàgines de **login** i **registre**, amb totes les validacions realitzades exclusivament amb JavaScript, tal com exigeix l’enunciat. El sistema de sessió controla l’accés a les pàgines internes i gestiona les redireccions automàtiques segons l’estat de l’usuari.

A nivell d’interfície, s’ha creat un full d’estils CSS únic que defineix l’aspecte general de l’aplicació, el menú de navegació, els formularis i l’estructura visual de la pàgina principal. Aquest full d’estils inclou regles responsive i deixa preparada la base visual de la pàgina d’índex de Pokémons, incloent-hi els filtres visuals (encara no funcionals).

Les pàgines HTML principals ja estan estructurades i connectades mitjançant navegació funcional, incloent-hi botons de retorn correctament configurats.



## Continguts de l’assignatura aplicats

Durant aquest lliurament s’han aplicat continguts treballats al llarg de l’assignatura, entre els quals destaquen:

- Definició i ús de funcions avançades i arrow functions
- Ús de classes, constructors, encapsulació i la paraula reservada `this`
- Mètodes d’instància i mètodes estàtics
- Serialització i deserialització d’objectes amb `JSON.stringify()` i `JSON.parse()`
- Manipulació del DOM i gestió d’esdeveniments
- Validació de formularis amb JavaScript
- Emmagatzematge i persistència de dades amb `localStorage`
- Preparació per a l’ús de JavaScript asíncron i Fetch API



## Estructura del projecte

L’organització del repositori segueix una estructura modular clara:


PRA2.2/
├── css/
│   └── styles.css
├── html/
│   ├── index.html
│   ├── registro.html
│   ├── indice.html
│   ├── listas.html
│   ├── detail.html
│   └── video.html
├── js/
│   ├── clases.js
│   ├── dades.js
│   ├── index.js
│   ├── registro.js
│   ├── indice.js
│   ├── listas.js
│   ├── detail.js
│   └── menu.js
├── img/
├── LICENSE
└── README.md


Aquesta estructura permet una separació clara entre contingut, estils i lògica de l’aplicació, facilitant l’escalabilitat del projecte.

---

## Evolució prevista

El projecte queda preparat per al **Lliurament 2**, en el qual s’implementarà la comunicació amb la PokeAPI, la càrrega asíncrona de dades, la gestió funcional de filtres, la manipulació de llistes de Pokémons i la pàgina de detall completa.



## Autoria

Alexandra Schäfer Barrientos  
Assignatura: Programació Web  
Universitat Oberta de Catalunya (UOC)


