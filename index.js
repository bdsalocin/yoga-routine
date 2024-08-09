// Sélectionne la balise principale <main> du HTML
const main = document.querySelector("main");

// Définit un tableau de base avec des exercices (images représentées par leur index et durée minimale)
const basicArray = [
  { pic: 0, min: 1 },
  { pic: 1, min: 1 },
  { pic: 2, min: 1 },
  { pic: 3, min: 1 },
  { pic: 4, min: 1 },
  { pic: 5, min: 1 },
  { pic: 6, min: 1 },
  { pic: 7, min: 1 },
  { pic: 8, min: 1 },
  { pic: 9, min: 1 },
];

// Tableau pour stocker les exercices en cours
let exerciceArray = [];

// Fonction anonyme auto-exécutée pour récupérer les exercices stockés en local ou utiliser les exercices de base
(() => {
  // Si des exercices sont stockés localement, les récupérer
  if (localStorage.exercices) {
    exerciceArray = JSON.parse(localStorage.exercices);
  } else {
    // Sinon, utiliser les exercices de base
    exerciceArray = basicArray;
  }
})();

// Classe Exercice
class Exercice {
  constructor() {
    // Initialise l'index de l'exercice en cours
    this.index = 0;
    // Initialise les minutes de l'exercice en cours avec la valeur du premier exercice dans le tableau
    this.minutes = exerciceArray[this.index].min;
    // Initialise les secondes à zéro
    this.seconds = 0;
  }

  // Met à jour le compte à rebours de l'exercice
  updateCountdown() {
    // Formatte les secondes pour qu'elles aient toujours deux chiffres
    this.seconds = this.seconds < 10 ? "0" + this.seconds : this.seconds;

    // Met à jour le temps toutes les 10 millisecondes
    setTimeout(() => {
      // Si les minutes et les secondes sont à zéro
      if (this.minutes === 0 && this.seconds === "00") {
        // Passe à l'exercice suivant
        this.index++;
        // Joue le son de la cloche
        this.ring();
        // Si tous les exercices ont été parcourus, affiche la page de fin
        if (this.index < exerciceArray.length) {
          this.minutes = exerciceArray[this.index].min;
          this.seconds = 0;
          this.updateCountdown();
        } else {
          return page.finish();
        }
      } else if (this.seconds === "00") {
        // Si les secondes sont à zéro, décrémente les minutes et initialise les secondes à 59
        this.minutes--;
        this.seconds = 59;
        this.updateCountdown();
      } else {
        // Sinon, décrémente les secondes
        this.seconds--;
        this.updateCountdown();
      }
    }, 1000);
    // Affiche le contenu de la page de routine avec le compte à rebours et l'image de l'exercice en cours
    return (main.innerHTML = `
    <div class="exercice-container">
    <p>${this.minutes}:${this.seconds}</p>
    <img src="./img/${exerciceArray[this.index].pic}.png" />
    <div>${this.index + 1}/${exerciceArray.length}</div>
    </div>
    `);
  }

  // Joue le son de la cloche
  ring() {
    const audio = new Audio();
    audio.src = "ring.mp3";
    audio.play();
  }
}

// Objets utilitaires
const utils = {
  // Fonction pour afficher le contenu de la page
  pageContent: function (title, content, btn) {
    // Modifie le titre de la page
    document.querySelector("h1").innerHTML = title;
    // Modifie le contenu principal de la page
    main.innerHTML = content;
    // Modifie le contenu du conteneur de boutons
    document.querySelector(".btn-container").innerHTML = btn;
  },

  // Fonction pour gérer les événements de changement de minutes
  handleEventMinutes: function () {
    // Sélectionne tous les champs de minutes et ajoute un écouteur d'événements pour chaque champ
    document.querySelectorAll("input[type='number']").forEach((input) => {
      input.addEventListener("input", (e) => {
        // Met à jour la durée de l'exercice correspondant à l'ID du champ modifié
        exerciceArray.map((exo) => {
          if (exo.pic == e.target.id) {
            exo.min = parseInt(e.target.value);
            this.store();
          }
        });
      });
    });
  },

  // Fonction pour gérer les événements de déplacement des exercices
  handleEventArrow: function () {
    // Sélectionne tous les boutons de flèche et ajoute un écouteur d'événements pour chaque bouton
    document.querySelectorAll(".arrow").forEach((arrow) => {
      arrow.addEventListener("click", (e) => {
        let position = 0;
        // Parcourt les exercices pour trouver celui associé au bouton cliqué
        exerciceArray.map((exo) => {
          if (exo.pic == e.target.dataset.pic && position !== 0) {
            // Échange les positions des exercices
            [exerciceArray[position], exerciceArray[position - 1]] = [
              exerciceArray[position - 1],
              exerciceArray[position],
            ];
            // Affiche à nouveau la page de paramétrage des exercices
            page.lobby();
            this.store();
          } else {
            position++;
          }
        });
      });
    });
  },

  // Fonction pour supprimer un exercice
  deleteItem: function () {
    // Sélectionne tous les boutons de suppression et ajoute un écouteur d'événements pour chaque bouton
    document.querySelectorAll(".deleteBtn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        let newArr = [];
        // Parcourt les exercices pour trouver celui associé au bouton cliqué et le supprimer du tableau
        exerciceArray.map((exo) => {
          if (exo.pic != e.target.dataset.pic) {
            newArr.push(exo);
          }
        });
        // Remplace le tableau d'exercices par le nouveau tableau sans l'exercice supprimé
        exerciceArray = newArr;
        // Affiche à nouveau la page de paramétrage des exercices
        page.lobby();
        this.store();
      });
    });
  },

  // Fonction pour réinitialiser les exercices à leur état de base
  reboot: function () {
    // Réinitialise le tableau d'exercices avec les exercices de base
    exerciceArray = basicArray;
    // Affiche à nouveau la page de paramétrage des exercices
    page.lobby();
    this.store();
  },

  // Fonction pour stocker les exercices en local
  store: function () {
    // Stocke les exercices dans le stockage local du navigateur après les avoir transformés en chaîne JSON
    localStorage.exercices = JSON.stringify(exerciceArray);
  },
};

// Objet pour gérer les différentes pages
const page = {
  // Page de paramétrage des exercices
  lobby: function () {
    // Crée une liste HTML contenant les champs de durée, les images des exercices, les boutons de déplacement et de suppression
    let mapArray = exerciceArray
      .map(
        (exo) =>
          `
        <li>
        <div class='card-header'>
        <input type="number" id=${exo.pic} min="1" max="10" value=${exo.min}>
        <span>min</span>
        </div>
        <img src="./img/${exo.pic}.png"/>
        <i class="fas fa-arrow-alt-circle-left arrow" data-pic=${exo.pic}></i>
        <i class="fas fa-times-circle deleteBtn" data-pic=${exo.pic}></i>
        </li>
        `
      )
      .join("");

    // Affiche le titre de la page, la liste des exercices et le bouton de démarrage
    utils.pageContent(
      "Paramétrage <i id='reboot' class='fas fa-undo'></i>",
      "<ul>" + mapArray + "</ul>",
      "<button id='start'>Commencer<i class='far fa-play-circle'></i>"
    );

    // Associe les événements aux actions correspondantes
    utils.handleEventMinutes();
    utils.handleEventArrow();
    utils.deleteItem();
    reboot.addEventListener("click", () => utils.reboot());
    start.addEventListener("click", () => this.routine());
  },

  // Page d'exécution des exercices
  routine: function () {
    // Crée une instance de la classe Exercice
    const exercice = new Exercice();

    // Affiche la page de routine avec le compte à rebours
    utils.pageContent("Routine", exercice.updateCountdown(), null);
  },

  // Page de fin d'exécution des exercices
  finish: function () {
    // Affiche la page de fin avec un bouton pour recommencer et un bouton pour réinitialiser les exercices
    utils.pageContent(
      "C'est terminé !",
      "<button id='start'>Recommencer</button>",
      "<button id='reboot' class='btn-reboot'>Réinitialiser <i class='fas fa-times-circle'></i></button>"
    );

    // Associe les événements aux actions correspondantes
    start.addEventListener("click", () => this.routine());
    reboot.addEventListener("click", () => utils.reboot());
  },
};

// Affiche la page de paramétrage des exercices au chargement
page.lobby();
