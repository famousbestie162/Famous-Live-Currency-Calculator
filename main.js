const displayScreen = document.getElementById('display');
const fromCurrency = document.getElementById('fromCurrency');
const toCurrency = document.getElementById('toCurrency');
const statusIndicator = document.getElementById('apiStatus');

// Backup static rates in case user is completely offline
let liveExchangeRates = { USD: 1.0, EUR: 0.92, GBP: 0.78, NGN: 1600.0, CAD: 1.36 };

// Fetch fresh real-time international market data on launch
async function fetchLiveRates() {
    try {
        // Utilizing a high-availability, free currency framework engine
        const response = await fetch('https://er-api.com');
        if (!response.ok) throw new Error("Network feed down");
        
        const data = await response.json();
        liveExchangeRates = data.rates;
        statusIndicator.innerText = "🟢 Real-Time Rates Active";
        statusIndicator.style.color = "#30d158"; // Eco Green status
    } catch (error) {
        console.warn("API Offline, fallback initialized:", error);
        statusIndicator.innerText = "⚠️ Offline Mode (Using Saved Rates)";
        statusIndicator.style.color = "#ff9f0a"; 
    }
}

// Automatically fetch live figures the split second the program opens
fetchLiveRates();

function appendValue(input) {
    if (displayScreen.value === 'Error' || displayScreen.value === '0') {
        displayScreen.value = '';
    }
    displayScreen.value += input;
}

function clearDisplay() {
    displayScreen.value = '';
}

function deleteLast() {
    displayScreen.value = displayScreen.value.slice(0, -1);
}

function evaluateExpression() {
    let expression = displayScreen.value;
    if (!expression) return null;

    try {
        expression = expression.replace(/×/g, '*').replace(/÷/g, '/');
        let result = Function(`"use strict"; return (${expression})`)();
        
        if (isNaN(result) || !isFinite(result)) throw new Error("Invalid Math");
        return result;
    } catch (error) {
        displayScreen.value = 'Error';
        return null;
    }
}

function calculate() {
    let finalMathResult = evaluateExpression();
    if (finalMathResult !== null) {
        if (Number.isInteger(finalMathResult)) {
            displayScreen.value = finalMathResult;
        } else {
            displayScreen.value = parseFloat(finalMathResult.toFixed(8));
        }
    }
}

function convertCurrency() {
    let numericAmount = evaluateExpression();
    
    if (numericAmount === null && displayScreen.value !== '' && displayScreen.value !== 'Error') {
        numericAmount = parseFloat(displayScreen.value);
    }

    if (numericAmount === null || isNaN(numericAmount)) return;

    const fromCode = fromCurrency.value;
    const toCode = toCurrency.value;

    // Direct mathematical translation against live USD index scaling
    const amountInUSD = numericAmount / liveExchangeRates[fromCode];
    const convertedValue = amountInUSD * liveExchangeRates[toCode];

    displayScreen.value = convertedValue.toFixed(2);
}
