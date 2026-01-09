/* ------------------------------------------------------
   PR2 / Entrega 2 — Model (classes + persistencia)
   ------------------------------------------------------
   Alumna: Alexandra Schäfer Barrientos
   Data: 9 de gener de 2026
   Fitxer: clases.js

   Descripcio:
   Aquest fitxer concentra les classes principals del projecte i la persistencia a
   localStorage. Aqui definim la capa de model: on guardem estat, fem validacions
   minimes i mantenim un contracte de retorn unificat per a tota la UI.

   Objectiu:
   La resta del projecte ha de poder delegar aqui sense tocar localStorage ni repetir
   regles. Si hi ha problemes (JSON corrupte, dades parcials, quota, claus inexistents),
   preferim un fallback controlat abans que trencar la UI amb errors silenciosos o incoherents.

   ------------------------------------------------------
   
   Estructura del fitxer

   1. Traça inicial de carrega del model

   2. Helpers de retorn del model (resultatOK / resultatKO)
      2.1 resultatOK()
      2.2 resultatKO()

   3. Classe User
      3.1 Camps privats (estat intern)
      3.1.1 Claus de persistencia (localStorage)
      3.2 Constructor i inicialitzacio d'estat
      3.3 Getters / Setters
      3.4 Persistencia d'instancia
         3.4.1 toPlainObject()
         3.4.2 save()
         3.4.3 update()

      3.5 Usuaris (localStorage + JSON)
      3.6 Sessio (usuari actual)
      3.7 Usuari actual (helpers)
      3.8 Llistes (myTeam / wishes)
      3.9 Filtres index
      3.10 Gestio centralitzada de llistes

   4. Classe Pokemon
      4.1 Constructor
      4.2 Getters / Setters
      4.3 Serialitzacio (toJSON / fromJSON)

   5. Classe PokemonList
      5.1 Constructor i estat intern
      5.2 Getters / Setters
      5.3 Propietat length
      5.4 Operacions basiques
      5.5 Serialitzacio (toJSON / fromJSON)
------------------------------------------------------ */


/* ------------------------------------------------------
   1. Traça inicial de carrega del model
------------------------------------------------------ */
UI.log("MODEL", "clases.js carregat");


/* ------------------------------------------------------
   2. Helpers de retorn del model (resultatOK / resultatKO)
------------------------------------------------------ */
/*
  Contracte unificat del model: la UI sempre rep un objecte amb ok i message,
  i opcionalment data. Aixo permet tractar fluxos i errors sense excepcions
  ni formats especials (UI.alertResultat / UI.traceResult funcionen igual a tot arreu).
*/

/* ------------------------------------------------------
   2.1 resultatOK()
------------------------------------------------------ */
/*
  Retorn d'exit del model. data es opcional: quan no cal, no l'afegim per mantenir
  el resultat net i facil de loguejar/mostrar.
*/

function resultatOK(message = "OK", data = undefined) {
  return (data === undefined)
    ? { ok: true, message }
    : { ok: true, message, data };
}

/* ------------------------------------------------------
   2.2 resultatKO()
------------------------------------------------------ */
/*
  Retorn d'error del model. No llancem excepcions: preferim un KO controlat
  per no trencar la UI i poder donar un missatge clar.
*/

function resultatKO(message = "Error") {
  return { ok: false, message };
}


/* ------------------------------------------------------
   3. Classe User
------------------------------------------------------ */
/*
  Model d'usuari i persistencia associada. Aqui centralitzem:
  - validacio i normalitzacio via setters,
  - mini-caixet d'usuaris a localStorage,
  - sessio simple (username actual),
  - estat d'usuari (myTeam, wishes i filtres d'index).

  La UI no ha de tocar localStorage ni conèixer claus: delega en User i el model
  garanteix fallbacks per mantenir robustesa i no trencar la UI.
*/

class User {

  /* ------------------------------------------------------
     3.1 Camps privats (estat intern)
  ------------------------------------------------------ */
  /*
    Estat protegit amb camps privats (#). Això força a passar pels setters i evita
    deixar l'objecte en un estat incoherent des de fora del model.
  */

  #name;
  #surname;
  #address;
  #city;
  #postalCode;
  #email;
  #username;
  #password;

  #myTeam;
  #wishes;
  #indexFilters;

  /* ------------------------------------------------------
     3.1.1 Claus de persistencia (localStorage)
  ------------------------------------------------------ */
  /*
    Claus centralitzades per no repetir strings al projecte i evitar incoherencies.
  */

  static USERS_KEY = "pr2_usuaris";
  static CURRENT_USER_KEY = "pr2_current_user";

  /* ------------------------------------------------------
     3.2 Constructor i inicialitzacio d'estat
  ------------------------------------------------------ */
  /*
    Inicialitzem llistes i filtres amb valors per defecte. Aixo dona una base estable
    per a la UI: encara que faltin dades, el model sempre te estructures coherents.
  */

  constructor({ name, surname, address, city, postalCode, email, username, password }) {

    this.#myTeam = [];
    this.#wishes = [];

    this.#indexFilters = {
      selectedTypes: [],
      searchText: "",
      weightMin: "",
      weightMax: "",
      orden: "idAsc"
    };

    // Assignem passant pels setters
    this.name = name;
    this.surname = surname;
    this.address = address;
    this.city = city;
    this.postalCode = postalCode;
    this.email = email;
    this.username = username;
    this.password = password;
  }

  /* ------------------------------------------------------
     3.3 Getters / Setters
  ------------------------------------------------------ */
  /*
    Validacions minimes per integritat. La UI valida per UX; el model valida per assegurar
    que el que persisteix a localStorage te sentit, encara que algu manipuli inputs.
  */

  get name(){ return this.#name; }
  set name(valor){
    if (typeof valor !== "string" || valor.trim() === "") return;
    this.#name = valor.trim();
  }

  get surname(){ return this.#surname; }
  set surname(valor){
    if (typeof valor !== "string" || valor.trim() === "") return;
    this.#surname = valor.trim();
  }

  get address(){ return this.#address; }
  set address(valor){
    if (typeof valor !== "string" || valor.trim() === "") return;
    this.#address = valor.trim();
  }

  get city(){ return this.#city; }
  set city(valor){
    if (typeof valor !== "string" || valor.trim() === "") return;
    this.#city = valor.trim();
  }

  get postalCode(){ return this.#postalCode; }
  set postalCode(valor){
    /*
      El codi postal el guardem com a string i validem 5 digits per evitar valors parcials
      o formats estranys al mini-caixet d'usuaris.
    */
    const text = String(valor ?? "").trim();
    if (!/^\d{5}$/.test(text)) return;
    this.#postalCode = text;
  }

  get email(){ return this.#email; }
  set email(valor){
    /*
      Validacio basica d'email: no busquem perfeccio, nomes evitar errors evidents
      abans de persistir.
    */
    const text = String(valor ?? "").trim();
    const patroEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!patroEmail.test(text)) return;
    this.#email = text;
  }

  get username(){ return this.#username; }
  set username(valor){
    if (typeof valor !== "string" || valor.trim() === "") return;
    this.#username = valor.trim();
  }

  get password(){ return this.#password; }
  set password(valor){
    /*
      Contrasenya: validacio de robustesa (8+ amb lletra, numero i simbol).
      No normalitzem el text, nomes validem i guardem tal qual.
    */
    const patroPassword = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (typeof valor !== "string" || !patroPassword.test(valor)) return;
    this.#password = valor;
  }

  get myTeam(){ return this.#myTeam; }
  set myTeam(valor){
    if (!Array.isArray(valor)) return;
    this.#myTeam = valor;
  }

  get wishes(){ return this.#wishes; }
  set wishes(valor){
    if (!Array.isArray(valor)) return;
    this.#wishes = valor;
  }

  get indexFilters(){ return this.#indexFilters; }
  set indexFilters(valor){
    /*
      Reconstruim filtres amb valors segurs en lloc de copiar a cegues. Si el JSON
      es parcial o antic, fem fallback per no trencar el render de l'index.
    */
    if (valor === null || typeof valor !== "object") return;

    this.#indexFilters = {
      selectedTypes: Array.isArray(valor.selectedTypes) ? valor.selectedTypes : [],
      searchText: typeof valor.searchText === "string" ? valor.searchText : "",
      weightMin: (valor.weightMin ?? ""),
      weightMax: (valor.weightMax ?? ""),
      orden: typeof valor.orden === "string" ? valor.orden : "idAsc"
    };
  }

  /* ------------------------------------------------------
     3.4 Persistencia d'instancia
  ------------------------------------------------------ */
  /*
    Persistim com a objecte pla (JSON) i no com a instancia amb metodes. Això fa el caixet
    mes estable i evita sorpreses en serialitzacio/deserialitzacio.
  */

  /* ------------------------------------------------------
     3.4.1 toPlainObject()
  ------------------------------------------------------ */
  /*
    Format de dades que guardem a localStorage. Es intern del model: la UI no l'ha d'usar directament.
  */

  toPlainObject() {
    return {
      name: this.#name,
      surname: this.#surname,
      address: this.#address,
      city: this.#city,
      postalCode: this.#postalCode,
      email: this.#email,
      username: this.#username,
      password: this.#password,
      myTeam: this.#myTeam,
      wishes: this.#wishes,
      indexFilters: this.#indexFilters
    };
  }

  /* ------------------------------------------------------
     3.4.2 save()
  ------------------------------------------------------ */
  /*
    Alta d'usuari: comprovem duplicat per username i persistim la col·leccio sencera.
    Si localStorage falla, retornem KO per no deixar la UI pensant que tot ha anat be.
  */

  save() {
    const usuaris = User.obtenirUsuaris();

    if (usuaris.some((u) => u.username === this.#username)) {
      return resultatKO("Aquest nom d'usuari ja esta registrat");
    }

    usuaris.push(this.toPlainObject());
    const ok = User.desarUsuaris(usuaris);

    return ok
      ? resultatOK("Usuari guardat correctament")
      : resultatKO("No s'ha pogut guardar l'usuari");
  }

  /* ------------------------------------------------------
     3.4.3 update()
  ------------------------------------------------------ */
  /*
    Actualitzacio d'usuari: busquem per username i substituim el registre. Si no existeix
    o no podem desar, retornem KO per mantenir consistencia de flux.
  */

  update() {
    const usuaris = User.obtenirUsuaris();
    const index = usuaris.findIndex((u) => u.username === this.#username);

    if (index === -1) {
      return resultatKO("No s'ha trobat l'usuari per actualitzar");
    }

    usuaris[index] = this.toPlainObject();
    const ok = User.desarUsuaris(usuaris);

    return ok
      ? resultatOK("Usuari actualitzat correctament")
      : resultatKO("No s'ha pogut actualitzar l'usuari");
  }

  /* ------------------------------------------------------
     3.5 Usuaris (localStorage + JSON)
  ------------------------------------------------------ */
  /*
    Porta d'entrada al mini-caixet d'usuaris. Lectura defensiva amb fallbacks a []:
    si el JSON es corrupte, no trenquem la UI.
  */

  static obtenirUsuaris() {
    const text = localStorage.getItem(User.USERS_KEY);
    if (text === null) return [];

    try {
      const usuaris = JSON.parse(text);
      return Array.isArray(usuaris) ? usuaris : [];
    } catch {
      return [];
    }
  }

  static desarUsuaris(usuaris) {
    /*
      Escriptura defensiva: si hi ha quota o bloqueig, retornem false i deixem que el flux
      superior decideixi (sense excepcions).
    */
    try {
      localStorage.setItem(User.USERS_KEY, JSON.stringify(usuaris));
      return true;
    } catch {
      return false;
    }
  }

  static cercarUsuari(username) {
    /*
      Cerca per username (netejat). Retornem usuari pla o null com a fallback controlat.
    */
    if (typeof username !== "string" || username.trim() === "") return null;
    const usernameNet = username.trim();
    return User.obtenirUsuaris().find((u) => u.username === usernameNet) ?? null;
  }

  static existeixUsername(username) {
    /*
      Helper curt per consultes de UI. Igualment, el model es defensa a save() si toca.
    */
    return User.cercarUsuari(username) !== null;
  }


  /* ------------------------------------------------------
     3.6 Sessio (usuari actual)
  ------------------------------------------------------ */
  /*
    Sessio simple: guardem el username actual. Es suficient per protegir pantalles i
    mantenir un flux net sense que la UI hagi de gestionar estat manualment.
  */

  static establirUsuariActual(username) {
    /*
      Inici de sessio: validem entrada i intentem persistir. Si falla localStorage,
      retornem KO i evitem redireccions en fals.
    */
    if (typeof username !== "string" || username.trim() === "") {
      return resultatKO("Username invalid per iniciar sessio");
    }

    try {
      localStorage.setItem(User.CURRENT_USER_KEY, username.trim());
      return resultatOK("Sessio iniciada");
    } catch {
      return resultatKO("No s'ha pogut iniciar sessio");
    }
  }


  static obtenirUsuariActual() {
    /*
      Retorn simple: string o null. La UI decideix si redirigeix.
    */
    return localStorage.getItem(User.CURRENT_USER_KEY); // string o null
  }


  static tancarSessio() {
    /*
      Eliminem la clau i retornem OK. Encara que no existis, no es un error.
    */
    localStorage.removeItem(User.CURRENT_USER_KEY);
    return resultatOK("Sessio tancada");
  }


  static validarCredencials(username, password) {
    /*
      Validacio contra el mini-caixet. Retorn unificat:
      - KO si falta info, usuari inexistent o password incorrecte
      - OK amb dades si el login es correcte
    */
    if (typeof username !== "string" || username.trim() === "") {
      return resultatKO("Has d'indicar un nom d'usuari");
    }
    if (typeof password !== "string" || password === "") {
      return resultatKO("Has d'indicar una contrasenya");
    }

    const usuari = User.cercarUsuari(username);
    if (!usuari) return resultatKO("Usuari no registrat");
    if (usuari.password !== password) return resultatKO("Contrasenya incorrecta");

    return resultatOK("Login correcte", { user: usuari });
  }


  /* ------------------------------------------------------
     3.7 Usuari actual (helpers)
  ------------------------------------------------------ */
  /*
    Helpers per evitar que la UI combini "sessio + cerca". Si no hi ha sessio, retornem
    null/KO de manera controlada.
  */

  static obtenirObjecteUsuariActual() {
    const usernameActual = User.obtenirUsuariActual();
    if (!usernameActual) return null;
    return User.cercarUsuari(usernameActual);
  }


  static actualitzarUsuariActual(usuariPlainActualitzat) {
    /*
      Punt centralitzat per actualitzar i desar un usuari pla. Si falta username o
      l'usuari no existeix, retornem KO i no toquem el caixet.
    */
    if (!usuariPlainActualitzat || !usuariPlainActualitzat.username) {
      return resultatKO("Dades d'usuari invalides");
    }

    const usuaris = User.obtenirUsuaris();
    const index = usuaris.findIndex((u) => u.username === usuariPlainActualitzat.username);
    if (index === -1) return resultatKO("Usuari no trobat");

    usuaris[index] = usuariPlainActualitzat;

    const ok = User.desarUsuaris(usuaris);
    return ok ? resultatOK("Usuari actualitzat") : resultatKO("No s'ha pogut desar l'usuari");
  }


  /* ------------------------------------------------------
     3.8 Llistes (myTeam / wishes)
  ------------------------------------------------------ */
  /*
    Lectura i escriptura de llistes de l'usuari actual amb fallbacks a [] per robustesa.
  */

  static obtenirLlistesUsuariActual() {
    const u = User.obtenirObjecteUsuariActual();

    const myTeam = Array.isArray(u?.myTeam) ? u.myTeam : [];
    const wishes = Array.isArray(u?.wishes) ? u.wishes : [];

    return resultatOK("Llistes obtingudes", { myTeam, wishes });
  }


  static desarLlistesUsuariActual(myTeamIds, wishesIds) {
    const u = User.obtenirObjecteUsuariActual();

    u.myTeam = Array.isArray(myTeamIds) ? myTeamIds : [];
    u.wishes = Array.isArray(wishesIds) ? wishesIds : [];

    return User.actualitzarUsuariActual(u);
  }


  /* ------------------------------------------------------
     3.9 Filtres index
  ------------------------------------------------------ */
  /*
    Persistim l'estat de filtres/ordenacio per usuari. Quan recuperem, retornem sempre
    una estructura completa (fallbacks) per no trencar l'index.
  */

  static obtenirFiltresIndexUsuariActual() {
    const u = User.obtenirObjecteUsuariActual();

    const f = (u.indexFilters && typeof u.indexFilters === "object")
      ? u.indexFilters
      : {};

    return resultatOK("Filtres obtinguts", {
      selectedTypes: Array.isArray(f.selectedTypes) ? f.selectedTypes : [],
      searchText: typeof f.searchText === "string" ? f.searchText : "",
      weightMin: f.weightMin ?? "",
      weightMax: f.weightMax ?? "",
      orden: typeof f.orden === "string" ? f.orden : "idAsc"
    });
  }


  static desarFiltresIndexUsuariActual(filtres) {
    const u = User.obtenirObjecteUsuariActual();

    const f = (filtres && typeof filtres === "object") ? filtres : {};

    u.indexFilters = {
      selectedTypes: Array.isArray(f.selectedTypes) ? f.selectedTypes : [],
      searchText: typeof f.searchText === "string" ? f.searchText : "",
      weightMin: f.weightMin ?? "",
      weightMax: f.weightMax ?? "",
      orden: typeof f.orden === "string" ? f.orden : "idAsc"
    };

    return User.actualitzarUsuariActual(u);
  }



  /* ------------------------------------------------------
     3.10 Gestio centralitzada de llistes
  ------------------------------------------------------ */
  /*
    Operacions sobre myTeam/wishes (toggle, eliminar, consultar). Regles i persistencia
    viuen aqui: la UI nomes demana accions i rep resultats unificats.
  */

  static alternarPokemonALlistaUsuariActual(tipusLlista, pokemonId) {
    const u = User.obtenirObjecteUsuariActual();

    if (tipusLlista !== "myTeam" && tipusLlista !== "wishes") {
      return resultatKO("Tipus de llista no valid");
    }

    const id = Number(pokemonId);
    if (!Number.isFinite(id)) {
      return resultatKO("ID de Pokemon no valid");
    }

    u.myTeam = Array.isArray(u.myTeam) ? u.myTeam : [];
    u.wishes = Array.isArray(u.wishes) ? u.wishes : [];

    const esEquip = (tipusLlista === "myTeam");
    const llista = esEquip ? u.myTeam : u.wishes;

    const jaHiEs = llista.includes(id);

    // Toggle: si hi es, l'elimina
    if (jaHiEs) {
      if (esEquip) {
        u.myTeam = u.myTeam.filter(x => x !== id);
      } else {
        u.wishes = u.wishes.filter(x => x !== id);
      }

      const r = User.actualitzarUsuariActual(u);
      return r.ok
        ? resultatOK("Eliminat de la llista", { accio: "eliminat" })
        : r;
    }

    // Toggle: si no hi es, l'afegeix (myTeam maxim 6)
    if (esEquip && u.myTeam.length >= 6) {
      return resultatKO("My equipo solo puede tener 6 Pokémon");
    }

    llista.push(id);

    const r = User.actualitzarUsuariActual(u);
    return r.ok
      ? resultatOK("Afegit a la llista", { accio: "afegit" })
      : r;
  }


  static eliminarPokemonDeLlistaUsuariActual(tipusLlista, pokemonId) {
    /*
      Eliminacio directa d'un id a una llista i persistencia del canvi. Validem tipus i id
      per evitar modificar estat amb entrades incorrectes.
    */
    const u = User.obtenirObjecteUsuariActual();

    if (tipusLlista !== "myTeam" && tipusLlista !== "wishes") {
      return resultatKO("Tipus de llista no valid");
    }

    const id = Number(pokemonId);
    if (!Number.isFinite(id)) {
      return resultatKO("ID de Pokemon no valid");
    }

    u.myTeam = Array.isArray(u.myTeam) ? u.myTeam : [];
    u.wishes = Array.isArray(u.wishes) ? u.wishes : [];

    if (tipusLlista === "myTeam") {
      u.myTeam = u.myTeam.filter(x => x !== id);
    } else {
      u.wishes = u.wishes.filter(x => x !== id);
    }

    return User.actualitzarUsuariActual(u);
  }


  static estaPokemonALlistaUsuariActual(tipusLlista, pokemonId) {
    /*
      Consulta tolerant per a la UI: davant qualsevol dubte (sense sessio, id invalid),
      retornem false com a fallback segur.
    */
    const u = User.obtenirObjecteUsuariActual();
    if (!u) return false;

    const id = Number(pokemonId);
    if (!Number.isFinite(id)) return false;

    const llista = (tipusLlista === "myTeam")
      ? (Array.isArray(u.myTeam) ? u.myTeam : [])
      : (Array.isArray(u.wishes) ? u.wishes : []);

    return llista.includes(id);
  }

}


/* ------------------------------------------------------
   4. Classe Pokemon
------------------------------------------------------ */
/*
  Entitat Pokemon amb normalitzacio minima i fallbacks. L'objectiu es que la UI
  pugui accedir a camps de manera previsible (arrays sempre array, textos sempre string).
  Incloem toJSON/fromJSON per treballar amb caixet (objectes plans) sense perdre robustesa.
*/

class Pokemon {

  #id;
  #name;
  #height;
  #weight;
  #baseExperience;
  #abilities;
  #types;
  #sprites;
  #stats;
  #description;

  /* ------------------------------------------------------
     4.1 Constructor
  ------------------------------------------------------ */
  /*
    Inicialitzem passant pels setters per aplicar el mateix criteri tant si ve de l'API
    com si ve del caixet (JSON).
  */

  constructor({ id, name, description, height, weight, baseExperience, abilities, types, sprites, stats }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.height = height;
    this.weight = weight;
    this.baseExperience = baseExperience;
    this.abilities = abilities;
    this.types = types;
    this.sprites = sprites;
    this.stats = stats;
  }

  /* ------------------------------------------------------
     4.2 Getters / Setters
  ------------------------------------------------------ */
  /*
    Normalitzacio practica: quan no hi ha valor, fem fallback a "" o [] per no trencar la UI.
  */

  get id(){ return this.#id; }
  set id(valor){
    const n = Number(valor);
    this.#id = Number.isFinite(n) ? n : valor;
  }

  get name(){ return this.#name; }
  set name(valor){
    this.#name = (valor ?? "").toString();
  }

  get description(){ return this.#description; }
  set description(valor){
    this.#description = (valor ?? "").toString();
  }

  get height(){ return this.#height; }
  set height(valor){
    const n = Number(valor);
    this.#height = Number.isFinite(n) ? n : valor;
  }

  get weight(){ return this.#weight; }
  set weight(valor){
    const n = Number(valor);
    this.#weight = Number.isFinite(n) ? n : valor;
  }

  get baseExperience(){ return this.#baseExperience; }
  set baseExperience(valor){
    const n = Number(valor);
    this.#baseExperience = Number.isFinite(n) ? n : valor;
  }

  get abilities(){ return this.#abilities; }
  set abilities(valor){
    this.#abilities = Array.isArray(valor) ? valor : [];
  }

  get types(){ return this.#types; }
  set types(valor){
    this.#types = Array.isArray(valor) ? valor : [];
  }

  get sprites(){ return this.#sprites; }
  set sprites(valor){
    this.#sprites = (valor ?? "").toString();
  }

  get stats(){ return this.#stats; }
  set stats(valor){
    this.#stats = Array.isArray(valor) ? valor : [];
  }


  /* ------------------------------------------------------
     4.3 Serialitzacio (toJSON / fromJSON)
  ------------------------------------------------------ */
  /*
    toJSON: format pla per guardar al caixet.
    fromJSON: reconstruccio defensiva d'una instancia.
  */

  toJSON() {
    return {
      id: this.#id,
      name: this.#name,
      description: this.#description,
      height: this.#height,
      weight: this.#weight,
      baseExperience: this.#baseExperience,
      abilities: this.#abilities,
      types: this.#types,
      sprites: this.#sprites,
      stats: this.#stats
    };
  }


  static fromJSON(pokemonPlain) {
    const p = (pokemonPlain && typeof pokemonPlain === "object") ? pokemonPlain : {};

    return new Pokemon({
      id: p.id ?? null,
      name: p.name ?? "",
      description: p.description ?? "",
      height: p.height ?? 0,
      weight: p.weight ?? 0,
      baseExperience: p.baseExperience ?? 0,
      abilities: Array.isArray(p.abilities) ? p.abilities : [],
      types: Array.isArray(p.types) ? p.types : [],
      sprites: p.sprites ?? "",
      stats: Array.isArray(p.stats) ? p.stats : []
    });
  }
}


/* ------------------------------------------------------
   5. Classe PokemonList
------------------------------------------------------ */
/*
  Col·leccio de Pokemon amb estat protegit. Ens serveix per encapsular operacions comunes
  i evitar treballar amb arrays crus a tot arreu. Manté validacions minimes per evitar
  embrutar l'estat si arriba un Pokemon invalid.
*/

class PokemonList {

  #pokemons;

  /* ------------------------------------------------------
     5.1 Constructor i estat intern
  ------------------------------------------------------ */
  constructor(pokemons = []) {
    this.#pokemons = Array.isArray(pokemons) ? pokemons : [];
  }

  /* ------------------------------------------------------
     5.2 Getters / Setters
  ------------------------------------------------------ */
  get pokemons(){ return this.#pokemons; }
  set pokemons(valor){
    if (!Array.isArray(valor)) return;
    this.#pokemons = valor;
  }

  /* ------------------------------------------------------
     5.3 Propietat length
  ------------------------------------------------------ */
  get length() {
    return this.#pokemons.length;
  }

  /* ------------------------------------------------------
     5.4 Operacions basiques
  ------------------------------------------------------ */

  addPokemon(pokemon) {
    /*
      Evitem afegir valors buits o sense id usable. Es una proteccio simple per no
      contaminar la col·leccio en fluxos d'error.
    */
    if (!pokemon) return;

    const id = Number(pokemon?.id);
    if (!Number.isFinite(id)) return;

    this.#pokemons.push(pokemon);
  }

  removePokemonById(pokemonId) {
    /*
      Si l'id no es numeric, no fem res. Això evita filtres estranys per entrades invalides.
    */
    const id = Number(pokemonId);
    if (!Number.isFinite(id)) return;

    this.#pokemons = this.#pokemons.filter((p) => Number(p?.id) !== id);
  }

  hasPokemonId(pokemonId) {
    const id = Number(pokemonId);
    if (!Number.isFinite(id)) return false;
    return this.#pokemons.some((p) => Number(p?.id) === id);
  }

  toIdArray() {
    return this.#pokemons
      .map((p) => Number(p?.id))
      .filter((n) => Number.isFinite(n));
  }

  /* ------------------------------------------------------
     5.5 Serialitzacio (toJSON / fromJSON)
  ------------------------------------------------------ */
  /*
    Suport per guardar i reconstruir llistes des de caixet.
  */
 
  toJSON() {
    return this.#pokemons.map((p) => (typeof p?.toJSON === "function" ? p.toJSON() : p));
  }

  static fromJSON(pokemonsPlainArray) {
    if (!Array.isArray(pokemonsPlainArray)) return new PokemonList([]);
    const instancies = pokemonsPlainArray.map((p) => Pokemon.fromJSON(p));
    return new PokemonList(instancies);
  }
}
