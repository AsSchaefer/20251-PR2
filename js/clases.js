/* ------------------------------------------------------
    PR2.2 – Classes i persistència (Entrega 1)
   ------------------------------------------------------
    Alumna: Alexandra Schäfer Barrientos
    Data: 23 de desembre de 2025
    Fitxer: clases.js
    
    Descripció:
    Aquest fitxer centralitza la lògica de dades:
        - User: validacions, registre/actualització i sessió amb localStorage.
        - Pokemon i PokemonList: models preparats per a l’Entrega 2, amb
        conversió a JSON (guardar) i reconstrucció (recuperar).
 ------------------------------------------------------

    Estructura del fitxer:

    1. Classe User
        1.1 Camps privats i criteri d’encapsulació
        1.2 Constructor (inicialització del model)
        1.3 Getters i setters (validació i normalització)
        1.4 Persistència d’instància (save / update)
        1.5 Mètodes estàtics (usuaris i sessió)

    2. Classe Pokemon (Entrega 2)
        2.1 Camps privats i constructor
        2.2 Getters / setters
        2.3 toJSON / fromJSON

    3. Classe PokemonList (Entrega 2)
        3.1 Encapsulació de col·lecció
        3.2 Operacions bàsiques
        3.3 toJSON / fromJSON
        
------------------------------------------------------ */



/* ------------------------------------------------------
   1. Classe User
   ------------------------------------------------------
    Representa un usuari registrat al sistema.

    Objectiu d’aquesta classe:
        - Garantir coherència de dades (validant quan s’assignen).
        - Permetre persistència sense back-end mitjançant localStorage.

        username actua com a identificador únic dins de la “base de dades”
        local (array JSON d’usuaris).
------------------------------------------------------ */
class User {

  /* ------------------------------------------------------
     1.1 Camps privats i criteri d’encapsulació
    ------------------------------------------------------
     S’utilitzen camps privats (#) perquè les dades no es puguin
     modificar directament des de fora.

     Això obliga a passar pels setters, on:
        - normalitzem textos (trim)
        - validem formats (CP, email, password)
        - garantim que myTeam i wishes siguin arrays
  ------------------------------------------------------ */
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


  /* ------------------------------------------------------
     1.2 Constructor (inicialització del model)
    ------------------------------------------------------
    Rep un objecte perquè és el format natural quan:
        - les dades vénen d’un formulari
        - o bé d’un JSON recuperat de localStorage

        Primer inicialitzem les col·leccions del model (arrays),
        i després assignem la resta via setters per validar des del principi.
  ------------------------------------------------------ */
  constructor({ name, surname, address, city, postalCode, email, username, password }) {

    // Col·leccions del model (encara buides a l’Entrega 1)
    this.#myTeam = [];
    this.#wishes = [];

    // Assignació validada i normalitzada
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
     1.3 Getters i setters (validació i normalització)
    ------------------------------------------------------
    Criteri general de validació:
        - Textos: string no buit (després de trim)
        - CP: exactament 5 dígits
        - Email: format general usuari@domini.ext
        - Password: mínim 8 caràcters, amb lletres, números i especial
        - Llistes: han de ser arrays
    ------------------------------------------------------ 
         1.3.1 Dades personals bàsiques
    ------------------------------------------------------ */
  get name(){ return this.#name; }
  set name(valor){
    if (typeof valor !== "string" || valor.trim() === "") {
      console.error("El nom no pot estar buit.");
      return;
    }
    this.#name = valor.trim();
  }

  get surname(){ return this.#surname; }
  set surname(valor){
    if (typeof valor !== "string" || valor.trim() === "") {
      console.error("Els cognoms no poden estar buits.");
      return;
    }
    this.#surname = valor.trim();
  }

  get address(){ return this.#address; }
  set address(valor){
    if (typeof valor !== "string" || valor.trim() === "") {
      console.error("L'adreça no pot estar buida.");
      return;
    }
    this.#address = valor.trim();
  }

  get city(){ return this.#city; }
  set city(valor){
    if (typeof valor !== "string" || valor.trim() === "") {
      console.error("La població no pot estar buida.");
      return;
    }
    this.#city = valor.trim();
  }


  /* ------------------------------------------------------ 
     1.3.2 Formats específics (CP / email / password)
  ------------------------------------------------------ */
  get postalCode(){ return this.#postalCode; }
  set postalCode(valor){
    const text = String(valor).trim();

    // Es guarda com a text perquè és un identificador, no un càlcul
    if (!/^\d{5}$/.test(text)) {
      console.error("El codi postal ha de tenir 5 dígits.");
      return;
    }

    this.#postalCode = text;
  }

  get email(){ return this.#email; }
  set email(valor){
    const text = String(valor).trim();
    const patroEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validació general suficient per aquesta pràctica
    if (!patroEmail.test(text)) {
      console.error("El format de l'email no és vàlid.");
      return;
    }

    this.#email = text;
  }

  get username(){ return this.#username; }
  set username(valor){
    if (typeof valor !== "string" || valor.trim() === "") {
      console.error("El nom d'usuari no pot estar buit.");
      return;
    }
    this.#username = valor.trim();
  }

  get password(){ return this.#password; }
  set password(valor){
    const patroPassword = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    // Regla mínima de robustesa (simula un registre real)
    if (typeof valor !== "string" || !patroPassword.test(valor)) {
      console.error("La contrasenya ha de tenir mínim 8 caràcters, lletres, números i un caràcter especial.");
      return;
    }

    this.#password = valor;
  }


  /* ------------------------------------------------------ 
     1.3.3 Col·leccions del model (myTeam / wishes)
     ------------------------------------------------------ */
  get myTeam(){ return this.#myTeam; }
  set myTeam(valor){
    if (!Array.isArray(valor)) {
      console.error("myTeam ha de ser un array.");
      return;
    }
    this.#myTeam = valor;
  }

  get wishes(){ return this.#wishes; }
  set wishes(valor){
    if (!Array.isArray(valor)) {
      console.error("wishes ha de ser un array.");
      return;
    }
    this.#wishes = valor;
  }


  /* ------------------------------------------------------
     1.3.4. (save / update)
     ------------------------------------------------------
    localStorage guarda text, així que:
        - convertim la instància a objecte pla (sense #)
        - guardem dins d’un array d’usuaris en format JSON

        username és la clau lògica per evitar duplicats i per actualitzar.
  ------------------------------------------------------ 
     save()
  ------------------------------------------------------
     Afegeix un usuari nou si el username encara no existeix.
  ------------------------------------------------------ */
  save() {

    // PAS 1: obtenir llista actual
    const usuaris = User.obtenirUsuaris();

    // PAS 2: validar unicitat del username
    const jaExisteix = usuaris.some((u) => u.username === this.#username);
    if (jaExisteix) {
      console.error(`L'usuari '${this.#username}' ja existeix.`);
      return false;
    }

    // PAS 3: convertir a format guardable + desar
    usuaris.push(this.toPlainObject());
    console.log(`Usuari '${this.#username}' guardat correctament.`);
    return User.desarUsuaris(usuaris);
  }

  /* ------------------------------------------------------
    update()
  ------------------------------------------------------
  Substitueix l’usuari existent (mateix username) pel nou estat.
  ------------------------------------------------------ */
  update() {

    // Obtenim llista actual
    const usuaris = User.obtenirUsuaris();

    // Trobem posició de l’usuari
    const index = usuaris.findIndex((u) => u.username === this.#username);
    if (index === -1) {
      console.error(`No s'ha trobat l'usuari '${this.#username}' per actualitzar.`);
      return false;
    }

    // Substituim i desem
    usuaris[index] = this.toPlainObject();
    console.log(`Usuari '${this.#username}' actualitzat correctament.`);
    return User.desarUsuaris(usuaris);
  }

  /* ------------------------------------------------------
      toPlainObject()
     ------------------------------------------------------
      Converteix la instància a un objecte pla per serialitzar.
     ------------------------------------------------------ */
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
      wishes: this.#wishes
    };
  }


  /* ------------------------------------------------------
     1.5 Mètodes estàtics (usuaris i sessió)
    ------------------------------------------------------
     Aquests mètodes representen la “base de dades local”:
        - lectura i escriptura d’usuaris
        - cerca per username
        - validació de login
        - control de sessió (usuari actual)
  ------------------------------------------------------ */
  static USERS_KEY = "pr2_usuaris";
  static CURRENT_USER_KEY = "pr2_current_user";

  /* ------------------------------------------------------
      obtenirUsuaris()
     ------------------------------------------------------
      Recuperem l’array d’usuaris desat a localStorage.
    ------------------------------------------------------ */
  static obtenirUsuaris() {
    const text = localStorage.getItem(User.USERS_KEY);

    if (text === null) return [];

    try {
      const usuaris = JSON.parse(text);
      if (!Array.isArray(usuaris)) {
        console.error("Les dades d'usuaris no tenen format d'array.");
        return [];
      }
      return usuaris;
    } catch (error) {
      console.error("Error parsejant usuaris del localStorage:", error);
      return [];
    }
  }

  /* ------------------------------------------------------
      desarUsuaris(usuaris)
     ------------------------------------------------------
     Desem l’array d’usuaris a localStorage.      
     ------------------------------------------------------ */

  static desarUsuaris(usuaris) {
    try {
      localStorage.setItem(User.USERS_KEY, JSON.stringify(usuaris));
      return true;
    } catch (error) {
      console.error("Error guardant usuaris a localStorage:", error);
      return false;
    }
  }

  /* ------------------------------------------------------
     cercarUsuari(username)
     ------------------------------------------------------
     Retornem l’usuari amb el username indicat, o null si no existeix.    
     ------------------------------------------------------ */
  static cercarUsuari(username) {
    if (typeof username !== "string" || username.trim() === "") {
      console.error("Username invàlid per cercar usuari.");
      return null;
    }

    const usernameNet = username.trim();
    const usuaris = User.obtenirUsuaris();
    return usuaris.find((u) => u.username === usernameNet) ?? null;
  }

  /* ------------------------------------------------------
      existeixUsername(username)
     ------------------------------------------------------ 
     Comprovem si un username ja està registrat.
     ------------------------------------------------------ */
  static existeixUsername(username) {
    return User.cercarUsuari(username) !== null;
  }

  /* ------------------------------------------------------
     validarCredencials(username, password)
     ------------------------------------------------------
     Validem les credencials d’accés.
        Retornem un objecte amb dos casos possibles:
        - { ok: false, message: "..." } si hi ha error
        - { ok: true, user: {...} } si és correcte
    ------------------------------------------------------ */
  static validarCredencials(username, password) {

    // PAS 1: validar entrada mínima
    if (typeof username !== "string" || username.trim() === "") {
      return { ok: false, message: "Has d'indicar un nom d'usuari." };
    }
    if (typeof password !== "string" || password === "") {
      return { ok: false, message: "Has d'indicar una contrasenya." };
    }

    // PAS 2: cercar usuari i comparar password
    const usuari = User.cercarUsuari(username);
    if (usuari === null) {
      return { ok: false, message: "Usuari no registrat." };
    }
    if (usuari.password !== password) {
      return { ok: false, message: "Contrasenya incorrecta." };
    }

    return { ok: true, user: usuari };
  }

  /* ------------------------------------------------------
     establirUsuariActual(username)
     ------------------------------------------------------
     Desem l’username de l’usuari actual a localStorage.
     ------------------------------------------------------ */
  static establirUsuariActual(username) {
    if (typeof username !== "string" || username.trim() === "") {
      console.error("No es pot establir l'usuari actual.");
      return false;
    }

    try {
      localStorage.setItem(User.CURRENT_USER_KEY, username.trim());
      return true;
    } catch (error) {
      console.error("Error guardant la sessió a localStorage:", error);
      return false;
    }
  }

  /* ------------------------------------------------------
     obtenirUsuariActual()
    ------------------------------------------------------ 
    Recuperem l’username de l’usuari actual des de localStorage.   
    ------------------------------------------------------ */
  static obtenirUsuariActual() {
    return localStorage.getItem(User.CURRENT_USER_KEY);
  }

  /* ------------------------------------------------------
     tancarSessio()
  - ----------------------------------------------------- 
        Eliminem l’usuari actual de localStorage.
    ------------------------------------------------------ */
  static tancarSessio() {
    localStorage.removeItem(User.CURRENT_USER_KEY);
    return true;
  }

}




/* ------------------------------------------------------
    2. Classe Pokemon (Entrega 2)
   ------------------------------------------------------
    Representa un Pokémon amb les seves dades bàsiques
    i estadístiques.

    Objectiu d’aquesta classe:
        - Encapsular les dades d’un Pokémon.
        - Permetre serialització (toJSON) i reconstrucció (fromJSON)
        per facilitar la persistència a localStorage en l’Entrega 2.

                        
    ------------------------------------------------------ */
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
     2.1 Constructor
     ------------------------------------------------------ 
     Recep un objecte pla amb les propietats del Pokémon.    
     ------------------------------------------------------ */
  constructor({ id, name, description, height, weight, baseExperience, abilities, types, sprites, stats }) {
    this.#id = id;
    this.#name = name;
    this.#description = description;
    this.#height = height;
    this.#weight = weight;
    this.#baseExperience = baseExperience;
    this.#abilities = abilities;
    this.#types = types;
    this.#sprites = sprites;
    this.#stats = stats; // IMPORTANT: necessari per serialitzar
  }

  /* ------------------------------------------------------
     2.2 Getters i setters
     ------------------------------------------------------ */


  get id(){ return this.#id; }
  set id(valor){ this.#id = valor; }

  get name(){ return this.#name; }
  set name(valor){ this.#name = valor; }

  get description(){ return this.#description; }
  set description(valor){ this.#description = valor; }

  get height(){ return this.#height; }
  set height(valor){ this.#height = valor; }

  get weight(){ return this.#weight; }
  set weight(valor){ this.#weight = valor; }

  get baseExperience(){ return this.#baseExperience; }
  set baseExperience(valor){ this.#baseExperience = valor; }

  get abilities(){ return this.#abilities; }
  set abilities(valor){ this.#abilities = valor; }

  get types(){ return this.#types; }
  set types(valor){ this.#types = valor; }

  get sprites(){ return this.#sprites; }
  set sprites(valor){ this.#sprites = valor; }

  get stats(){ return this.#stats; }
  set stats(valor){ this.#stats = valor; }

  /* ------------------------------------------------------
     2.3 Serialització (toJSON / fromJSON)
    ------------------------------------------------------ */
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
    return new Pokemon(pokemonPlain);
  }
}



/* ------------------------------------------------------
    3. Classe PokemonList (Entrega 2)
   ------------------------------------------------------
    Encapsula una col·lecció de Pokémons.

    A nivell de projecte, ens interessa perquè:
    - centralitza afegir/eliminar
    - i permet serialitzar la llista completa quan calgui guardar-la
    ------------------------------------------------------ */
class PokemonList {
  #pokemons;

  constructor(pokemons = []) {
    this.#pokemons = pokemons;
  }

  get pokemons(){ return this.#pokemons; }
  set pokemons(valor){
    if (!Array.isArray(valor)) {
      console.error("PokemonList.pokemons ha de ser un array.");
      return;
    }
    this.#pokemons = valor;
  }

  /* ------------------------------------------------------
     3.2 Operacions bàsiques
     ------------------------------------------------------*/ 
    
// Afegim un Pokémon a la col·lecció  
  addPokemon(pokemon) {
    this.#pokemons.push(pokemon);
  }

  // Eliminemun Pokémon per ID  
  removePokemonById(pokemonId) {
    this.#pokemons = this.#pokemons.filter((p) => p.id !== pokemonId);
  }

  /* ------------------------------------------------------
  3.3 Serialització de col·lecció
  ------------------------------------------------------ */
  toJSON() {
    return this.#pokemons.map((p) => p.toJSON());
  }

  static fromJSON(pokemonsPlainArray) {
    if (!Array.isArray(pokemonsPlainArray)) {
      return new PokemonList([]);
    }

    const instancies = pokemonsPlainArray.map((p) => Pokemon.fromJSON(p));
    return new PokemonList(instancies);
  }
}
