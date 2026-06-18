/* =========================================================================
   config.js — SOURCE UNIQUE DE VÉRITÉ POUR LE JAVASCRIPT
   -------------------------------------------------------------------------
   Toutes les données utilisées par le JavaScript sont centralisées ici :
   - prix du simulateur de devis (base au m² + options)
   - étapes du simulateur
   - zones / communes d'intervention
   - paramètres d'animation

   👉 Pour adapter le site à un nouveau client, il suffit de modifier ce
      fichier (chiffres, options, communes) — aucune valeur n'est dupliquée
      ailleurs dans le JS.

   ⚠️  Les TEXTES affichés à l'écran (nom de l'entreprise, téléphone, ville…)
       restent gérés dans le HTML via les tokens [[...]] décrits dans
       PERSONNALISATION.md. Ce fichier ne contient que de la donnée « moteur ».
   ========================================================================= */

window.SITE_CONFIG = {

  /* ----------------------------------------------------------------------
     1) SIMULATEUR DE DEVIS
     ----------------------------------------------------------------------
     Le devis est une FOURCHETTE = somme de :
       (surface × prix au m²)  +  (somme des options choisies)
     Chaque valeur a un minimum et un maximum -> on affiche « entre X et Y ».
     Tous les montants sont en euros.
  */
  simulateur: {

    devise: '€',

    // Estimation toujours indicative, jamais contractuelle.
    disclaimer:
      'Estimation indicative générée automatiquement, sans engagement et non contractuelle. ' +
      'Seule une visite sur place permet d’établir un devis précis et personnalisé.',

    // Réglage du curseur de surface (en m²)
    surface: {
      min: 20,
      max: 1000,
      defaut: 150,
      pas: 10,
      // Prix de base de l'aménagement, au m² (terrassement, préparation,
      // plantations de base, finitions). Fourchette resserrée (~±13 %)
      // pour une estimation crédible.
      prixM2: { min: 50, max: 66 }
    },

    /*
       Options « oui / non ». Chaque option ajoute un montant forfaitaire
       (fourchette min / max) à l'estimation lorsqu'elle est activée.
       - id        : identifiant technique (ne pas traduire)
       - label     : libellé court (récap)
       - question  : question posée à l'étape correspondante
       - icone     : classe Font Awesome
       - min / max : montant ajouté si l'option est choisie
       - aide      : petite phrase de réassurance sous la question (optionnel)
    */
    options: [
      {
        id: 'terrasse',
        label: 'Terrasse',
        question: 'Souhaitez-vous une terrasse ?',
        icone: 'fa-solid fa-square',
        min: 4150,
        max: 5450,
        aide: 'Bois, pierre naturelle ou dallage grand format.'
      },
      {
        id: 'gazon',
        label: 'Gazon / engazonnement',
        question: 'Un gazon parfait fait partie du projet ?',
        icone: 'fa-solid fa-seedling',
        min: 2100,
        max: 2700,
        aide: 'Gazon semé ou rouleau, prêt à fouler.'
      },
      {
        id: 'eclairage',
        label: 'Éclairage extérieur',
        question: 'Voulez-vous un éclairage d’ambiance ?',
        icone: 'fa-solid fa-lightbulb',
        min: 1350,
        max: 1850,
        aide: 'Mise en lumière des allées, arbres et façades.'
      },
      {
        id: 'arrosage',
        label: 'Arrosage automatique',
        question: 'Un arrosage automatique vous intéresse ?',
        icone: 'fa-solid fa-droplet',
        min: 1800,
        max: 2350,
        aide: 'Programmé et enterré, pour un jardin sans contrainte.'
      },
      {
        id: 'piscine',
        label: 'Piscine / point d’eau',
        question: 'Un point d’eau ou une piscine est prévu ?',
        icone: 'fa-solid fa-water',
        min: 9600,
        max: 12800,
        aide: 'Bassin, fontaine ou piscine paysagée intégrée au jardin.'
      }
    ]
  },

  /* ----------------------------------------------------------------------
     2) COMMUNES / ZONES D'INTERVENTION
     ----------------------------------------------------------------------
     Affichées sous forme de « tags » sur la page contact (rassurance +
     SEO local léger). Remplacez par les communes réelles du client.
  */
  zones: [
    'Évry-Courcouronnes',
    'Massy',
    'Palaiseau',
    'Savigny-sur-Orge',
    'Brunoy',
    'Yerres',
    'Montgeron',
    'Draveil',
    'Corbeil-Essonnes',
    'Athis-Mons',
    'Longjumeau',
    'Sud de Paris'
  ],

  /* ----------------------------------------------------------------------
     3) PARAMÈTRES D'ANIMATION (réglage fin du « wow »)
     ----------------------------------------------------------------------
     Centralisés ici pour calmer ou intensifier les effets sans toucher au
     code des animations.
  */
  animation: {
    tiltMax: 9,          // inclinaison max des cartes 3D (en degrés)
    parallaxIntensite: 0.18, // force du parallax (0 = aucun, 0.3 = fort)
    countUpDuree: 1600,  // durée des compteurs animés (ms)
    feuilles: true,      // particules de feuilles dans le hero (true/false)
    feuillesDensite: 9   // nombre de feuilles (volontairement limité = perf/batterie)
  }
};
