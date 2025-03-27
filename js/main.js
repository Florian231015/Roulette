// main.js – Einsätze, Spin-Logik, Gewinnauswertung

// Globale Variablen
let currentBetAmount = 0; // Aktueller Einsatzbetrag (ausgewählter Chip)
let bets = []; // Array für alle platzierten Wetten
let balance = 1000; // Start-Balance des Spielers

// DOM-Elemente für die Interaktion
const spinBtn = document.getElementById('spinBtn'); // Button zum Drehen des Rads
const resultDiv = document.getElementById('result'); // Container für Ergebnisnachrichten
const wheel = document.getElementById('roulette-wheel'); // Roulette-Rad (Bild)
const ball = document.getElementById('roulette-ball'); // Kugel auf dem Rad
const betFields = document.querySelectorAll('.bet-field'); // Alle Felder, auf die gewettet werden kann
const chipElements = document.querySelectorAll('.casino-chip'); // Alle Chip-Elemente zur Auswahl
const spinSound = document.getElementById('spinSound'); // Sound für das Drehen des Rads
const ballDropSound = document.getElementById('ballDropSound'); // Sound für das Landen der Kugel

// DOM-Elemente für das Balance-Modal
const applyBalanceBtn = document.getElementById('applyBalanceBtn'); // Button zum Übernehmen der neuen Balance
const customBalanceInput = document.getElementById('customBalance'); // Eingabefeld für benutzerdefinierte Balance
const balanceOptions = document.querySelectorAll('.balance-option'); // Vordefinierte Balance-Optionen

// Mapping der Zahlen zu Positionen auf dem Rad (in Grad, basierend auf einem europäischen Roulette-Rad)
const numberToAngle = {
  0: 0, 32: 9.7, 15: 19.5, 19: 29.2, 4: 38.9, 21: 48.6, 2: 58.4, 25: 68.1, 17: 77.8, 34: 87.6,
  6: 97.3, 27: 107, 13: 116.8, 36: 126.5, 11: 136.2, 30: 146, 8: 155.7, 23: 165.4, 10: 175.1,
  5: 184.9, 24: 194.6, 16: 204.3, 33: 214.1, 1: 223.8, 20: 233.5, 14: 243.2, 31: 253, 9: 262.7,
  22: 272.4, 18: 282.2, 29: 291.9, 7: 301.6, 28: 311.4, 12: 321.1, 35: 330.8, 3: 340.5, 26: 350.3
};

// Funktion zum Aktualisieren der Balance-Anzeige im HTML
function updateBalanceDisplay() {
  const balanceElement = document.getElementById('balance');
  balanceElement.textContent = balance;
}

// Event-Listener für vordefinierte Balance-Optionen (500, 1000, 5000)
balanceOptions.forEach(option => {
  option.addEventListener('click', () => {
    const newBalance = parseInt(option.getAttribute('data-balance')); // Neue Balance aus Attribut holen
    balance = newBalance; // Balance aktualisieren
    updateBalanceDisplay(); // Anzeige aktualisieren
    $('#setBalanceModal').modal('hide'); // Modal schließen
  });
});

// Event-Listener für benutzerdefinierte Balance
applyBalanceBtn.addEventListener('click', () => {
  const customBalance = parseInt(customBalanceInput.value); // Eingabe aus dem Feld holen
  if (customBalance && customBalance > 0) { // Prüfen, ob die Eingabe gültig ist
    balance = customBalance; // Balance aktualisieren
    updateBalanceDisplay(); // Anzeige aktualisieren
    $('#setBalanceModal').modal('hide'); // Modal schließen
    customBalanceInput.value = ''; // Eingabefeld zurücksetzen
  } else {
    alert('Bitte gib einen gültigen Betrag ein (größer als 0).'); // Fehlermeldung bei ungültiger Eingabe
  }
});

// Event-Listener für die Auswahl eines Chips
chipElements.forEach(chip => {
  chip.addEventListener('click', () => {
    const value = parseInt(chip.getAttribute('data-value')); // Wert des Chips holen
    setCurrentBet(value, chip); // Aktuellen Einsatz setzen
  });
});

// Funktion zum Setzen des aktuellen Einsatzes und Hervorheben des ausgewählten Chips
function setCurrentBet(amount, selectedChip) {
  currentBetAmount = amount; // Aktuellen Einsatzbetrag setzen
  highlightChip(selectedChip); // Ausgewählten Chip hervorheben
}

// Funktion zum Hervorheben des ausgewählten Chips (visuelles Feedback)
function highlightChip(chip) {
  chipElements.forEach(c => c.classList.remove('selected')); // Alle Chips zurücksetzen
  chip.classList.add('selected'); // Ausgewählten Chip hervorheben
}

// Event-Listener für Klicks auf Wettfelder (Zahlen oder Outside Bets)
betFields.forEach(field => {
  field.addEventListener('click', () => {
    placeBet(field); // Wette platzieren
  });
});

// Funktion zum Platzieren einer Wette
function placeBet(field) {
  if (currentBetAmount === 0) { // Prüfen, ob ein Chip ausgewählt wurde
    showResult('Bitte zuerst einen Chip auswählen!', 'danger'); // Fehlermeldung anzeigen
    return;
  }
  if (balance < currentBetAmount) { // Prüfen, ob genug Balance vorhanden ist
    showResult('Nicht genug Chips in der Balance!', 'danger'); // Fehlermeldung anzeigen
    return;
  }
  const number = field.getAttribute('data-number'); // Gewettete Zahl (falls vorhanden)
  const type = field.getAttribute('data-type'); // Gewetteter Typ (z. B. "red", "even")

  // Wette-Objekt erstellen
  const betObj = {
    number: number ? parseInt(number) : null, // Zahl (oder null, wenn Outside Bet)
    type: type || null, // Typ (oder null, wenn direkte Zahl)
    amount: currentBetAmount // Einsatzbetrag
  };
  bets.push(betObj); // Wette zum Array hinzufügen

  // Visuelles Feedback: Wettfeld hervorheben
  field.classList.add('active-bet');

  // Einsatz von der Balance abziehen
  balance -= currentBetAmount;
  updateBalanceDisplay(); // Balance aktualisieren
  showResult(`Wette platziert: ${currentBetAmount} Chips auf ${number || type}`, 'info'); // Bestätigung anzeigen
}

// Event-Listener für den Spin-Button
spinBtn.addEventListener('click', () => {
  if (bets.length === 0) { // Prüfen, ob Wetten platziert wurden
    showResult('Keine Wetten platziert!', 'danger'); // Fehlermeldung anzeigen
    return;
  }
  const winningNumber = Math.floor(Math.random() * 37); // Zufällige Gewinnzahl (0-36)
  spinWheelAnimation(winningNumber); // Animation starten

  // Nach der Animation (8 Sekunden) Gewinne auswerten
  setTimeout(() => {
    const totalWin = calculateWinnings(winningNumber); // Gewinne berechnen
    if (totalWin > 0) { // Wenn Gewinn vorhanden
      showResult(`Gewinn! Kugel landete auf ${winningNumber}. +${totalWin} Chips`, 'success'); // Erfolgsmeldung
      balance += totalWin; // Gewinn zur Balance hinzufügen
    } else { // Wenn kein Gewinn
      showResult(`Verloren! Kugel landete auf ${winningNumber}.`, 'danger'); // Verlustmeldung
    }
    updateBalanceDisplay(); // Balance aktualisieren
    resetBets(); // Wetten zurücksetzen
    resetWheel(); // Rad zurücksetzen
  }, 8000); // Dauer der Animation (8 Sekunden)
});

// Funktion für die Animation des Rads
function spinWheelAnimation(winningNumber) {
  // Zufällige Drehungen für das Rad (mindestens 6 Umdrehungen + Zufallswinkel)
  const wheelRotation = 360 * 6 + Math.floor(Math.random() * 360);
  
  // Rad drehen
  wheel.style.transform = `rotate(${wheelRotation}deg)`;
  
  // Sound für das Drehen abspielen
  spinSound.currentTime = 0;
  spinSound.play();
  
  // Sound für das Landen der Kugel abspielen (kurz vor Ende der Animation)
  setTimeout(() => {
    ballDropSound.currentTime = 0;
    ballDropSound.play();
  }, 7500); // 0,5 Sekunden vor Ende der Animation
}

// Funktion zum Zurücksetzen des Rads nach einem Spin
function resetWheel() {
  wheel.style.transition = 'none'; // Transition deaktivieren
  wheel.style.transform = 'rotate(0deg)'; // Rad auf 0 Grad zurücksetzen
  setTimeout(() => {
    wheel.style.transition = 'transform 8s cubic-bezier(0.25, 0, 0, 1)'; // Transition wieder aktivieren
  }, 50);
}

// Funktion zur Berechnung der Gewinne basierend auf der Gewinnzahl
function calculateWinnings(winningNumber) {
  let totalWin = 0; // Gesamtgewinn initialisieren
  bets.forEach(bet => {
    // Direkte Zahl: 35:1 Auszahlung
    if (bet.number !== null) {
      if (bet.number === winningNumber) {
        totalWin += bet.amount * 36; // 35:1 + Einsatz zurück
      }
    }
    // Even/Odd: 1:1 Auszahlung
    else if (bet.type === 'even') {
      if (winningNumber !== 0 && winningNumber % 2 === 0) {
        totalWin += bet.amount * 2; // 1:1 + Einsatz zurück
      }
    }
    else if (bet.type === 'odd') {
      if (winningNumber % 2 === 1) {
        totalWin += bet.amount * 2; // 1:1 + Einsatz zurück
      }
    }
    // Rot/Schwarz: 1:1 Auszahlung
    else if (bet.type === 'red') {
      const reds = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
      if (reds.includes(winningNumber)) {
        totalWin += bet.amount * 2; // 1:1 + Einsatz zurück
      }
    }
    else if (bet.type === 'black') {
      const blacks = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35];
      if (blacks.includes(winningNumber)) {
        totalWin += bet.amount * 2; // 1:1 + Einsatz zurück
      }
    }
    // 1-18, 19-36: 1:1 Auszahlung
    else if (bet.type === '1-18') {
      if (winningNumber >= 1 && winningNumber <= 18) {
        totalWin += bet.amount * 2; // 1:1 + Einsatz zurück
      }
    }
    else if (bet.type === '19-36') {
      if (winningNumber >= 19 && winningNumber <= 36) {
        totalWin += bet.amount * 2; // 1:1 + Einsatz zurück
      }
    }
    // Dutzende: 2:1 Auszahlung
    else if (bet.type === '1st12') {
      if (winningNumber >= 1 && winningNumber <= 12) {
        totalWin += bet.amount * 3; // 2:1 + Einsatz zurück
      }
    }
    else if (bet.type === '2nd12') {
      if (winningNumber >= 13 && winningNumber <= 24) {
        totalWin += bet.amount * 3; // 2:1 + Einsatz zurück
      }
    }
    else if (bet.type === '3rd12') {
      if (winningNumber >= 25 && winningNumber <= 36) {
        totalWin += bet.amount * 3; // 2:1 + Einsatz zurück
      }
    }
    // 2 to 1 (Reihen): 2:1 Auszahlung
    else if (bet.type === '2to1-row1') {
      const topRowNumbers = [3,6,9,12,15,18,21,24,27,30,33,36];
      if (topRowNumbers.includes(winningNumber)) {
        totalWin += bet.amount * 3; // 2:1 + Einsatz zurück
      }
    }
    else if (bet.type === '2to1-row2') {
      const middleRowNumbers = [2,5,8,11,14,17,20,23,26,29,32,35];
      if (middleRowNumbers.includes(winningNumber)) {
        totalWin += bet.amount * 3; // 2:1 + Einsatz zurück
      }
    }
    else if (bet.type === '2to1-row3') {
      const bottomRowNumbers = [1,4,7,10,13,16,19,22,25,28,31,34];
      if (bottomRowNumbers.includes(winningNumber)) {
        totalWin += bet.amount * 3; // 2:1 + Einsatz zurück
      }
    }
  });
  return totalWin; // Gesamtgewinn zurückgeben
}

// Funktion zum Anzeigen von Ergebnisnachrichten (z. B. Gewinn, Verlust, Info)
function showResult(message, alertType = 'info') {
  resultDiv.className = `result-display ${alertType}`; // Klasse für Styling setzen
  resultDiv.textContent = message; // Nachricht setzen
  resultDiv.classList.remove('d-none'); // Ergebnis sichtbar machen
}

// Funktion zum Zurücksetzen der Wetten nach einem Spin
function resetBets() {
  bets = []; // Wett-Array leeren
  betFields.forEach(field => field.classList.remove('active-bet')); // Visuelle Markierungen entfernen
}

// Beim Laden der Seite: Standard-Chip auswählen und Balance anzeigen
window.addEventListener('DOMContentLoaded', () => {
  setCurrentBet(5, document.querySelector('.chip-5')); // Standard-Chip (5) auswählen
  updateBalanceDisplay(); // Initiale Balance anzeigen
});