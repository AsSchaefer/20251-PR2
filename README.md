Projecte PR2 – Programació Web

Aquest projecte correspon a la **Pràctica 2 (PR2)** de l’assignatura **Programació Web** de la **Universitat Oberta de Catalunya (UOC)**.

L’objectiu del projecte és el desenvolupament d’una aplicació web que permet als usuaris **autenticar-se**, **visualitzar**, **filtrar** i **gestionar Pokémons**, aplicant JavaScript modern, manipulació del DOM, persistència amb `localStorage` i comunicació amb la **PokeAPI**.

L’enunciat oficial i vàlid de la pràctica és el publicat a l’aula virtual de la UOC.

---

## Estat del projecte

Aquest repositori reflecteix l’estat **final** del projecte corresponent al **Lliurament 2** de la PR2.

S’han implementat totes les funcionalitats requerides a l’enunciat, incloent:

* autenticació i registre d’usuaris,
* càrrega i caixet de dades de la PokeAPI,
* filtres combinats,
* gestió de llistes d’usuari,
* pàgina de detall,
* navegació protegida,
* i persistència completa de dades.

---

## Desenvolupament realitzat

L’aplicació segueix una arquitectura clara amb **separació de responsabilitats** entre:

* **Model de dades**
* **Interfície (DOM)**
* **Controladors**
* **Utilitats compartides**

### Model de dades

La lògica principal es basa en tres classes fonamentals:

* **User**
  Gestiona tota la informació relacionada amb l’usuari:

  * dades personals,
  * validacions,
  * autenticació,
  * sessió activa,
  * i persistència de dades mitjançant `localStorage`.

  Cada usuari té associades les seves pròpies llistes:

  * `myTeam` (màxim 6 Pokémons)
  * `wishes` (sense límit)

* **Pokemon**
  Representa un Pokémon amb totes les seves dades:

  * id, nom, tipus,
  * imatge,
  * estadístiques,
  * altura, pes,
  * habilitats,
  * experiència base.

  Inclou mètodes de serialització per permetre el guardat segur al caixet.

* **PokemonList**
  Modelitza les llistes de Pokémons associades a cada usuari.
  Aquesta classe encapsula:

  * afegir i eliminar Pokémons,
  * evitar duplicats,
  * aplicar restriccions (límit de 6 a `myTeam`),
  * i la persistència de les llistes.

Aquest disseny permet mantenir el **model com a font única de veritat** i evita duplicació de lògica a la interfície.

---

## Interfície i navegació

L’aplicació està formada per les següents pàgines:

* **Login (`index.html`)**
  Autenticació d’usuaris amb redirecció automàtica segons estat de sessió.

* **Registre (`registro.html`)**
  Formulari complet amb totes les validacions exigides realitzades exclusivament amb JavaScript.

* **Índex de Pokémons (`indice.html`)**

  * càrrega paginada de Pokémons,
  * filtres combinats (tipus, nom/número, rang de pes),
  * afegir/eliminar Pokémons a les llistes,
  * navegació cap al detall.

* **Llistes (`listas.html`)**
  Visualització independent de:

  * `myTeam`
  * `wishes`
    amb eliminació directa i navegació al detall.

* **Detall (`detail.html`)**
  Mostra tota la informació completa d’un Pokémon i permet tornar a l’índex mantenint el context.

* **Vídeo (`video.html`)**
  Pàgina amb el vídeo explicatiu obligatori de la pràctica.

L’accés a les pàgines internes està protegit: **si l’usuari no està loguejat és redirigit automàticament al login**.

---

## Comunicació amb la PokeAPI i caixet

Un dels objectius principals de la pràctica és **minimitzar les crides a la PokeAPI**.

Per aquest motiu:

* la càrrega de Pokémons es fa **una única vegada** (o cap, si ja existeixen dades),
* la informació es desa al `localStorage` com a Pokédex compartida,
* totes les pàgines treballen sobre aquest caixet,
* els filtres s’apliquen sempre sobre les dades emmagatzemades,
* si la API falla, es gestionen fallbacks controlats.

Aquest enfocament millora el rendiment i compleix estrictament l’enunciat.

---

## Traçabilitat i depuració

El projecte incorpora una utilitat `UI` per centralitzar:

* missatges `alert`,
* logs de consola,
* avisos i errors,
* traça del flux de l’aplicació.

Aquesta traçabilitat ha estat clau per:

* detectar errors,
* identificar fluxos incorrectes,
* millorar la separació de responsabilitats,
* i mantenir el codi net i coherent.

La traça es pot activar o desactivar fàcilment.

---

## Continguts de l’assignatura aplicats

Durant el desenvolupament s’han aplicat, entre d’altres:

* Classes, getters, setters i encapsulació
* Mètodes estàtics i d’instància
* Manipulació avançada del DOM
* Gestió d’esdeveniments
* Validació de formularis amb JavaScript
* `localStorage` i serialització amb JSON
* Fetch API i asincronia
* Gestió d’estat i navegació
* Arquitectura modular

---

## Estructura del projecte

```text
PR2/
├── css/
│   └── styles.css
├── html/
│   ├── detail.html
│   ├── index.html
│   ├── indice.html
│   ├── listas.html
│   ├── registro.html
│   └── video.html
├── js/
│   ├── aux.js
│   ├── clases.js
│   ├── dades.js
│   ├── detail.js
│   ├── index.js
│   ├── indice.js
│   ├── listas.js
│   ├── menu.js
│   ├── registro.js
│   └── ui.js
├── img/
├── video/
│   └── explicacio-pr2.mp4
├── LICENSE
└── README.md

---

## Vídeo explicatiu

El projecte inclou un vídeo explicatiu en format `.mp4`, tal com exigeix l’enunciat, on s’expliquen:

* les principals dificultats trobades,
* la reorganització del projecte,
* la separació de responsabilitats,
* i les decisions de disseny adoptades.

**Ruta:** `video/explicacio-pr2.mp4`

---

## Autoria

**Alexandra Schäfer Barrientos**
Assignatura: Programació Web
Universitat Oberta de Catalunya (UOC)


