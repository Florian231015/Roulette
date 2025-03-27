// main.js – Einsätze, Spin-Logik, Gewinnauswertung

let currentBetAmount = 0;
let bets = [];
let balance = 1000;

// DOM-Elemente
const spinBtn = document.getElementById('spinBtn');
const resultDiv = document.getElementById('result');
const wheel = document.getElementById('roulette-wheel');
const ball = document.getElementById('roulette-ball');
const betFields = document.querySelectorAll('.bet-field');
const chipElements = document.querySelectorAll('.casino-chip');
const spinSound = document.getElementById('spinSound');
const ballDropSound = document.getElementById('ballDropSound');

// DOM-Elemente für das Balance-Modal
const applyBalanceBtn = document.getElementById('applyBalanceBtn');
const customBalanceInput = document.getElementById('customBalance');
const balanceOptions = document.querySelectorAll('.balance-option');

// Mapping der Gewinnzahlen zu Positionen auf dem Rad (in Grad, angepasst an europäisches Rad)
const numberToAngle = {
  0: 0, 32: 9.7, 15: 19.5, 19: 29.2, 4: 38.9, 21: 48.6, 2: 58.4, 25: 68.1, 17: 77.8, 34: 87.6,
  6: 97.3, 27: 107, 13: 116.8, 36: 126.5, 11: 136.2, 30: 146, 8: 155.7, 23: 165.4, 10: 175.1,
  5: 184.9, 24: 194.6, 16: 204.3, 33: 214.1, 1: 223.8, 20: 233.5, 14: 243.2, 31: 253, 9: 262.7,
  22: 272.4, 18: 282.2, 29: 291.9, 7: 301.6, 28: 311.4, 12: 321.1, 35: 330.8, 3: 340.5, 26: 350.3
};

// Funktion zum Aktualisieren der Balance-Anzeige
function updateBalanceDisplay() {
  const balanceElement = document.getElementById('balance');
  balanceElement.textContent = balance;
}

// Balance-Optionen (vordefinierte Werte)
balanceOptions.forEach(option => {
  option.addEventListener('click', () => {
    const newBalance = parseInt(option.getAttribute('data-balance'));
    balance = newBalance;
    updateBalanceDisplay();
    // Modal schließen
    $('#setBalanceModal').modal('hide');
  });
});

// Benutzerdefinierte Balance übernehmen
applyBalanceBtn.addEventListener('click', () => {
  const customBalance = parseInt(customBalanceInput.value);
  if (customBalance && customBalance > 0) {
    balance = customBalance;
    updateBalanceDisplay();
    // Modal schließen
    $('#setBalanceModal').modal('hide');
    // Eingabefeld zurücksetzen
    customBalanceInput.value = '';
  } else {
    alert('Bitte gib einen gültigen Betrag ein (größer als 0).');
  }
});

// Chips-Click
chipElements.forEach(chip => {
  chip.addEventListener('click', () => {
    const value = parseInt(chip.getAttribute('data-value'));
    setCurrentBet(value, chip);
  });
});

function setCurrentBet(amount, selectedChip) {
  currentBetAmount = amount;
  highlightChip(selectedChip);
}

function highlightChip(chip) {
  chipElements.forEach(c => c.classList.remove('selected'));
  chip.classList.add('selected');
}

// Klick auf ein Zahlen-/Outside-Feld
betFields.forEach(field => {
  field.addEventListener('click', () => {
    placeBet(field);
  });
});

function placeBet(field) {
  if (currentBetAmount === 0) {
    showResult('Bitte zuerst einen Chip auswählen!', 'danger');
    return;
  }
  if (balance < currentBetAmount) {
    showResult('Nicht genug Chips in der Balance!', 'danger');
    return;
  }
  const number = field.getAttribute('data-number'); 
  const type = field.getAttribute('data-type');     
  
  const betObj = {
    number: number ? parseInt(number) : null,
    type: type || null,
    amount: currentBetAmount
  };
  bets.push(betObj);
  
  // Visuelles Feedback
  field.classList.add('active-bet');
  
  // Einsatz abziehen
  balance -= currentBetAmount;
  updateBalanceDisplay(); // Balance aktualisieren
  showResult(`Wette platziert: ${currentBetAmount} Chips auf ${number || type}`, 'info');
}

// Spin
spinBtn.addEventListener('click', () => {
  if (bets.length === 0) {
    showResult('Keine Wetten platziert!', 'danger');
    return;
  }
  const winningNumber = Math.floor(Math.random() * 37);
  spinWheelAnimation(winningNumber);
  
  setTimeout(() => {
    const totalWin = calculateWinnings(winningNumber);
    if (totalWin > 0) {
      showResult(`Gewinn! Kugel landete auf ${winningNumber}. +${totalWin} Chips`, 'success');
      balance += totalWin;
    } else {
      showResult(`Verloren! Kugel landete auf ${winningNumber}.`, 'danger');
    }
    updateBalanceDisplay(); // Balance aktualisieren
    resetBets();
    resetWheel();
  }, 8000); // Passend zur längeren Animation von 8 Sekunden
});

function spinWheelAnimation(winningNumber) {
  // Zufällige Drehungen für das Rad
  const wheelRotation = 360 * 6 + Math.floor(Math.random() * 360); // 6 Umdrehungen + Zufall
  
  // Rad drehen
  wheel.style.transform = `rotate(${wheelRotation}deg)`;
  
  // Sound abspielen
  spinSound.currentTime = 0;
  spinSound.play();
  
  // Kugel bleibt oben in der Mitte, keine Bewegung
  setTimeout(() => {
    // Sound für Kugel-Landung abspielen (auch wenn die Kugel sich nicht bewegt)
    ballDropSound.currentTime = 0;
    ballDropSound.play();
  }, 7500); // Etwas vor Ende der 8-Sekunden-Animation
}

function resetWheel() {
  wheel.style.transition = 'none';
  wheel.style.transform = 'rotate(0deg)';
  // Kugel bleibt oben in der Mitte, keine Änderung nötig
  setTimeout(() => {
    wheel.style.transition = 'transform 8s cubic-bezier(0.25, 0, 0, 1)';
  }, 50);
}

// Gewinnlogik
function calculateWinnings(winningNumber) {
  let totalWin = 0;
  bets.forEach(bet => {
    // Konkrete Zahl
    if (bet.number !== null) {
      if (bet.number === winningNumber) {
        totalWin += bet.amount * 36;
      }
    }
    // Even/Odd
    else if (bet.type === 'even') {
      if (winningNumber !== 0 && winningNumber % 2 === 0) {
        totalWin += bet.amount * 2;
      }
    }
    else if (bet.type === 'odd') {
      if (winningNumber % 2 === 1) {
        totalWin += bet.amount * 2;
      }
    }
    // Rot/Schwarz
    else if (bet.type === 'red') {
      const reds = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
      if (reds.includes(winningNumber)) {
        totalWin += bet.amount * 2;
      }
    }
    else if (bet.type === 'black') {
      const blacks = [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35];
      if (blacks.includes(winningNumber)) {
        totalWin += bet.amount * 2;
      }
    }
    // 1-18, 19-36
    else if (bet.type === '1-18') {
      if (winningNumber >= 1 && winningNumber <= 18) {
        totalWin += bet.amount * 2;
      }
    }
    else if (bet.type === '19-36') {
      if (winningNumber >= 19 && winningNumber <= 36) {
        totalWin += bet.amount * 2;
      }
    }
    // Dutzende
    else if (bet.type === '1st12') {
      if (winningNumber >= 1 && winningNumber <= 12) {
        totalWin += bet.amount * 3;
      }
    }
    else if (bet.type === '2nd12') {
      if (winningNumber >= 13 && winningNumber <= 24) {
        totalWin += bet.amount * 3;
      }
    }
    else if (bet.type === '3rd12') {
      if (winningNumber >= 25 && winningNumber <= 36) {
        totalWin += bet.amount * 3;
      }
    }
    // 2 to 1
    else if (bet.type === '2to1-row1') {
      const topRowNumbers = [3,6,9,12,15,18,21,24,27,30,33,36];
      if (topRowNumbers.includes(winningNumber)) {
        totalWin += bet.amount * 3;
      }
    }
    else if (bet.type === '2to1-row2') {
      const middleRowNumbers = [2,5,8,11,14,17,20,23,26,29,32,35];
      if (middleRowNumbers.includes(winningNumber)) {
        totalWin += bet.amount * 3;
      }
    }
    else if (bet.type === '2to1-row3') {
      const bottomRowNumbers = [1,4,7,10,13,16,19,22,25,28,31,34];
      if (bottomRowNumbers.includes(winningNumber)) {
        totalWin += bet.amount * 3;
      }
    }
  });
  return totalWin;
}

function showResult(message, alertType = 'info') {
  resultDiv.className = `result-display ${alertType}`;
  resultDiv.textContent = message;
  resultDiv.classList.remove('d-none');
}

function resetBets() {
  bets = [];
  betFields.forEach(field => field.classList.remove('active-bet'));
}

// Beim Laden: Standard-Chip auswählen und Balance anzeigen
window.addEventListener('DOMContentLoaded', () => {
  setCurrentBet(5, document.querySelector('.chip-5'));
  updateBalanceDisplay(); // Initiale Anzeige der Balance
});