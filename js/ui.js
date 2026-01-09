/* ------------------------------------------------------
   PR2 / Entrega
   ------------------------------------------------------
   Alumna: Alexandra Schäfer Barrientos
   Data: 9 de gener de 2026
   Fitxer: ui.js

   Descripció:
   Aquest fitxer defineix la classe estàtica de la interficie, que actua com a punt únic
   de pas per a totes les interaccions bàsiques d’usuari que no formen part
   directa de la lògica de negoci. Concretament, aquí es centralitza la
   visualització de missatges mitjançant alert() i la traçabilitat del
   projecte a través de la consola.

   Objectiu:
   L’objectiu principal d’aquest fitxer és evitar que alert() i console.
   apareguin dispersos per tot el projecte. Centralitzant-los, s'ha aconseguit
   un codi més coherent, més fàcil de mantenir i amb un criteri únic sobre
   com es comuniquen errors, avisos i informació de seguiment, sense
   contaminar ni el model de usuri, ni la interficie amb detalls de depuració.

   ------------------------------------------------------

   Estructura del fitxer:

   1. Configuració global de la utilitat UI
      1.1 Interruptor de depuració (DEBUG)
      1.2 Prefix identificador de missatges (PREFIX)

   2. Alerts unificats
      2.1 alertMissatge()
      2.2 alertResultat()

   3. Traçabilitat unificada (logs a consola)
      3.1 log()
      3.2 warn()
      3.3 error()
      3.4 traceResult()

   4. Inicialització del fitxer
------------------------------------------------------ */


/* ------------------------------------------------------
   1. Configuració global de la utilitat UI
------------------------------------------------------ */

/*
  En aquest bloc definim la classe UI com a contenidor únic de tota la lògica
  relacionada amb avisos a l’usuari i traça de depuració. Utilitzem mètodes
  estàtics perquè no necessitem estat intern ni instàncies: la idea és
  disposar de helpers globals accessibles des de qualsevol part del projecte.

  Aquesta decisió ens permet escriure UI.log(...), UI.warn(...) o
  UI.alertMissatge(...) de manera consistent, sense repetir codi ni criteris
  a cada fitxer.
*/

class UI {

  /* ------------------------------------------------------
     1.1 Interruptor de depuració (DEBUG)
  ------------------------------------------------------ */
  /*
    Aquesta propietat funciona com un interruptor global de depuració.
    Quan DEBUG és true, tots els mètodes de traça escriuen a la consola.
    Quan DEBUG és false, la traça queda completament silenciada.
  */
  static DEBUG = true;

  /* ------------------------------------------------------
     1.2 Prefix identificador de missatges (PREFIX)
  ------------------------------------------------------ */
  /*
    Aquest prefix s’afegeix a tots els missatges de consola generats.
    Serveix per identificar ràpidament quins logs pertanyen a la PR2 i
    distingir-los dels missatges propis del navegador.

    Mantenir aquest prefix centralitzat m'ha facilitta molt la lectura 
    de la consola durant la depuració.
  */

  static PREFIX = "PR2";

  /* ------------------------------------------------------
     2. Alerts unificats
  ------------------------------------------------------ */
  /*
    En aquesta secció es centralitzen totes les finestres d’alert del projecte.
    La resta de fitxers no haurien de cridar alert() directament, sinó delegar
    sempre en aquests mètodes.
  */

  /* ------------------------------------------------------
     2.1 alertMissatge()
  ------------------------------------------------------ */
  /*
    Aquest mètode s’encarrega de mostrar un missatge simple a l’usuari,
    assegurant-se que el text sigui mínimament vàlid.

    Si el text rebut és null, no és una cadena o només conté espais,
    utilitzem un fallback controlat. Això evita alerts buits o confusos
    i garanteix que la UI (interficie) sempre mostri alguna informació comprensible.
  */

  static alertMissatge(text, fallback = "S'ha produït un error") {
    const missatge = (typeof text === "string" && text.trim() !== "")
      ? text
      : fallback;

    alert(missatge);
  }

  /* ------------------------------------------------------
     2.2 alertResultat()
  ------------------------------------------------------ */
  /*
    Aquest mètode està pensat per mostrar a l’usuari el resultat d’una acció
    retornada pel model, habitualment en forma d’objecte.

    Esperem un format amb camps com ok, message/missatge i data. A partir
    d’això, decidim quin text mostrar. Si el resultat no és un objecte vàlid,
    preferim aplicar un fallback abans que trencar la UI amb un error inesperat.
  */

  static alertResultat(resultat, fallback = "Acció completada") {
    if (!resultat || typeof resultat !== "object") {
      alert(fallback);
      return;
    }

    /*
      Acceptem tant message com missatge per fer el codi tolerant a
      possibles inconsistències entre diferents parts del projecte.
      Aquesta flexibilitat evita errors innecessaris durant la integració.
    */
    const missatge = resultat.message ?? resultat.missatge ?? fallback;

    /*
      Si el resultat indica explícitament un error (ok === false),
      remarquem el missatge amb el prefix "ERROR:" per fer-lo més clar
      visualment, ja que alert() no permet estils.
    */
    if (resultat.ok === false) alert("ERROR: " + missatge);
    else alert(missatge);
  }

  /* ------------------------------------------------------
     3. Traçabilitat unificada (logs a consola)
  ------------------------------------------------------ */
  /*
    En aquest bloc definim tots els helpers de traça del projecte.
    El format general dels missatges és:

    [PR2] [ctx] missatge

    El paràmetre ctx ens indica el context o origen del log (MODEL, UI,
    INDEX, REGISTRE, etc.), cosa que facilita seguir el flux del programa.
    Tots aquests mètodes respecten l’interruptor UI.DEBUG.
  */

  /* ------------------------------------------------------
     3.1 log()
  ------------------------------------------------------ */
  /*
    log() s’utilitza per mostrar informació de seguiment normal del flux
    del programa. Quan hi ha dades addicionals, les passem com a segon
    argument perquè la consola les mostri com a objecte inspeccionable,
    millorant la depuració.
  */

  static log(ctx, msg, data) {
    if (!UI.DEBUG) return;

    if (data !== undefined) console.log(`[${UI.PREFIX}] [${ctx}] ${msg}`, data);
    else console.log(`[${UI.PREFIX}] [${ctx}] ${msg}`);
  }

  /* ------------------------------------------------------
     3.2 warn()
  ------------------------------------------------------ */
  /*
    warn() el fem servir per avisos no crítics: situacions estranyes,
    casos límit o dades inesperades que no trenquen l’execució però
    que convé revisar.

    Visualment destaca més que un log normal, sense arribar al nivell
    d’un error greu.
  */

  static warn(ctx, msg, data) {
    if (!UI.DEBUG) return;

    if (data !== undefined) console.warn(`[${UI.PREFIX}] [${ctx}] ${msg}`, data);
    else console.warn(`[${UI.PREFIX}] [${ctx}] ${msg}`);
  }

  /* ------------------------------------------------------
     3.3 error()
  ------------------------------------------------------ */
  /*
    error() s’utilitza quan detectem una situació que realment indica
    un problema que cal corregir. Mantenim el mateix format i criteri
    que la resta de logs per coherència global del projecte.
  */
  static error(ctx, msg, data) {
    if (!UI.DEBUG) return;

    if (data !== undefined) console.error(`[${UI.PREFIX}] [${ctx}] ${msg}`, data);
    else console.error(`[${UI.PREFIX}] [${ctx}] ${msg}`);
  }

  /* ------------------------------------------------------
     3.4 traceResult()
  ------------------------------------------------------ */
  /*
    Aquest mètode serveix per traçar de manera estàndard els resultats
    retornats pel model. Ens permet veure ràpidament si ok és true o false
    i inspeccionar les dades associades sense repetir codi a cada lloc.

    Si el resultat no és un objecte vàlid, fem un warn per indicar un ús
    incorrecte del helper, prioritzant detectar l’error sense trencar la UI.
  */

  static traceResult(ctx, label, resultat) {
    if (!UI.DEBUG) return;

    if (!resultat || typeof resultat !== "object") {
      UI.warn(ctx, `${label} -> resultat invàlid`, resultat);
      return;
    }

    UI.log(ctx, `${label} -> ok=${resultat.ok}`, {
      message: resultat.message ?? resultat.missatge,
      data: resultat.data
    });
  }
}


/* ------------------------------------------------------
   4. Inicialització del fitxer
------------------------------------------------------ */
/*
  En aquest punt deixem un log mínim per confirmar que ui.js s’ha carregat
  correctament. És especialment útil per detectar problemes d’ordre de
  càrrega si algun altre fitxer intenta utilitzar UI abans d’hora.
*/

UI.log("UI", "ui.js carregat");
