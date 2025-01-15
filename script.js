document.addEventListener("DOMContentLoaded", function() {
    // Crear una baraja de póker
    const suits = ["♠", "♥", "♦", "♣"];
    const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    let deck = [];

    let currentPlayer = 1; // Turno inicial del jugador 1
    let lastBet = 0; // La última apuesta realizada
    
    let money1 = 100; // Dinero inicial
    let money2 = 100; // Dinero inicial
    let money3 = 100; // Dinero inicial
    let money4 = 100; // Dinero inicial

    let fase = 0;
    let players = []; // Declarar players en el ámbito global

    let bet = 0; // Dinero apostado
    let player2Bet = 0; // Dinero apostado
    let player3Bet = 0; // Dinero apostado
    let player4Bet = 0; // Dinero apostado

    let totalBet = 0; // Total apostado

    let revealedCards = []; // Arreglo donde almacenaremos las cartas reveladas
    let revealedCount = 0;  // Contador para las cartas reveladas



// Recibir el ID del jugador
socket.on("playerId", (playerId) => {
    console.log(`Eres el jugador ${playerId}`);
});

// Recibir el estado del juego
socket.on("gameState", (gameState) => {
    console.log("Estado del juego:", gameState);
    // TODO: Renderizar el estado en el cliente
});

// Enviar acciones al servidor
function sendPlayerAction(actionType, payload) {
    socket.emit("playerAction", { actionType, ...payload });
}

// Ejemplo: Apostar
document.getElementById("bet-button").addEventListener("click", () => {
    sendPlayerAction("bet", { amount: 10 });
});
    
    // Función para actualizar la visualización del dinero y la apuesta
    function updateMoneyDisplay() {
        document.getElementById("money1").textContent = money1;
        document.getElementById("money2").textContent = money2;
        document.getElementById("money3").textContent = money3;
        document.getElementById("money4").textContent = money4;
        document.getElementById("player1-bet").textContent = `Apuesta Jugador 1: ${bet}`;
        document.getElementById("player2-bet").textContent = `Apuesta Jugador 2: ${player2Bet}`;
        document.getElementById("player3-bet").textContent = `Apuesta Jugador 3: ${player3Bet}`;
        document.getElementById("player4-bet").textContent = `Apuesta Jugador 4: ${player4Bet}`;
        document.getElementById("total-bet").textContent = totalBet; // Mostrar el apostado total
    }
    
    // Función para cambiar el turno
    function changeTurn() {
        // Debugging: Ver el turno actual antes de cambiar
        console.log(`Cambiando de turno. El turno actual es del jugador ${currentPlayer}`);
        
        // Desactivar todos los botones antes de cambiar de turno
        updateButtonsForCurrentTurn(0);  // Desactiva todos los botones

        // Buscar al siguiente jugador activo
        let nextPlayer = (currentPlayer % 4) + 1; // Inicializa al siguiente jugador
        while (isPlayerRetired(nextPlayer)) {
            nextPlayer = (nextPlayer % 4) + 1; // Saltar al siguiente jugador si está retirado
        }

        // Cambiar al siguiente jugador activo
        currentPlayer = nextPlayer;
        
        // Debugging: Ver el nuevo turno
        console.log(`Ahora es el turno del jugador ${currentPlayer}`);
        
        // Activar los botones del jugador actual
        updateButtonsForCurrentTurn(currentPlayer);
    }

    // Función para verificar si un jugador está retirado
    function isPlayerRetired(player) {
        // Asumimos que las apuestas de jugadores retirados son null o algún valor que indique retiro
        if (player === 1 && bet === null) return true;
        if (player === 2 && player2Bet === null) return true;
        if (player === 3 && player3Bet === null) return true;
        if (player === 4 && player4Bet === null) return true;
        return false;
    }
    

    function updateButtonsForCurrentTurn(player) {
        // Desactivar todos los botones primero
        const allButtons = document.querySelectorAll('button');
        allButtons.forEach(button => button.disabled = true);

        // Activar los botones para el jugador actual
        switch(player) {
            case 1:
                document.getElementById('bet-button').disabled = false;
                document.getElementById('check-button').disabled = false;
                document.getElementById('fold-button').disabled = false;
                document.getElementById('play-button').disabled = false;
                break;
            case 2:
                document.getElementById('dev-play-button-2').disabled = false;
                document.getElementById('dev-fold-button-2').disabled = false;
                document.getElementById('dev-bet-player-2').disabled = false;
                document.getElementById('dev-check-player-2').disabled = false;
                break;
            case 3:
                document.getElementById('dev-fold-button-3').disabled = false;
                document.getElementById('dev-play-button-3').disabled = false;
                document.getElementById('dev-bet-player-3').disabled = false;
                document.getElementById('dev-check-player-3').disabled = false;
                break;
            case 4:
                document.getElementById('dev-fold-button-4').disabled = false;
                document.getElementById('dev-play-button-4').disabled = false;
                document.getElementById('dev-check-player-4').disabled = false;
                document.getElementById('dev-bet-player-4').disabled = false;
                
                break;
            
        }

        if (bet > 0 || player2Bet > 0 || player3Bet > 0 || player4Bet > 0 ) {
            document.getElementById('check-button').disabled = true;
            document.getElementById('dev-check-player-2').disabled = true;
            document.getElementById('dev-check-player-3').disabled = true;
            document.getElementById('dev-check-player-4').disabled = true;
        }

        if (fase == 0) {
            document.getElementById('check-button').disabled = true;
            document.getElementById('dev-check-player-2').disabled = true;
            document.getElementById('dev-check-player-3').disabled = true;
            document.getElementById('dev-check-player-4').disabled = true;
        }
        
    }

    // Función para verificar si todos los jugadores tienen la misma apuesta
    function checkAndEqualizeBets() {
        // Crear un arreglo con todas las apuestas de jugadores activos
        let bets = [bet, player2Bet, player3Bet, player4Bet];
    
        // Filtrar las apuestas de los jugadores que no están activos (retirados)
        let activeBets = bets.filter(bet => bet !== null && bet !== -1);  // Asumiendo que null o -1 indica que el jugador se ha retirado
    
        // Obtener la apuesta más alta de los jugadores activos
        let maxBet = Math.max(...activeBets); // Obtener la apuesta más alta de los jugadores activos
    
        // Compara maxBet con todas las apuestas de jugadores activos
        if (activeBets.some(bet => bet !== maxBet)) {  // Si hay alguna apuesta diferente a la máxima
            document.getElementById('reveal-button').disabled = true; // Desactiva el botón
            changeTurn(); 
        } else {
            const allButtons = document.querySelectorAll('button');
            allButtons.forEach(button => button.disabled = true); // Desactiva todos los botones
            document.getElementById('reveal-button').disabled = false; // Habilita el botón "revelar cartas"
            document.getElementById("show-cards-button").disabled = false;
        }
    
        // Actualizar la visualización de las apuestas
        updateMoneyDisplay();
    }

    function createDeck() {
        deck = [];
        for (let suit of suits) {
            for (let rank of ranks) {
                deck.push({ rank, suit });
            }
        }
        console.log("Baraja creada:", deck);
    }
  
    function shuffleDeck() {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        console.log("Baraja barajada:", deck);
    }
  
    function dealCards(playerCount) {
        const players = [];
        updateButtonsForCurrentTurn(currentPlayer);
        for (let i = 0; i < playerCount; i++) {
            players.push({
                id: i + 1,
                hand: [deck.pop(), deck.pop()],
            });
        }
        return players;
    }
  
    document.getElementById("show-cards-button").addEventListener("click", () => {
        renderPlayers(players, true); // Renderiza todas las cartas boca arriba
        console.log("Cartas reveladas:", revealedCards)
        document.getElementById("show-cards-button").disabled = true; // Desactiva el botón después de usarlo
    });

    function renderPlayers(players, showAllCards = false) {
        ["player-top", "player-left", "player-right", "player-bottom"].forEach(id => {
            document.getElementById(id).innerHTML = ""; // Limpiar los divs de los jugadores
        });
    
        players.forEach((player, index) => {
            // Si el jugador está retirado, no renderizar nada
            if (player.retired) return;
    
            const playerDiv = document.getElementById(
                index === 0
                    ? "player-bottom"
                    : index === 1
                    ? "player-left"
                    : index === 2
                    ? "player-top"
                    : "player-right"
            );
    
            player.hand.forEach((card) => {
                const cardDiv = document.createElement("div");
                const isRed = card.suit === "♥" || card.suit === "♦";
    
                // Determina si la carta se muestra boca arriba o abajo
                const faceUp = showAllCards || index === 0; // Mostrar todas boca arriba si "showAllCards" es true
    
                cardDiv.className = `card ${faceUp ? "face-up" : "face-down"} ${
                    isRed && faceUp ? "red" : ""
                }`;
    
                cardDiv.textContent = faceUp ? `${card.rank}${card.suit}` : "";
                playerDiv.appendChild(cardDiv);
            });
        });
    }
  
    function renderDeck() {
        const deckDiv = document.getElementById("deck");
        deckDiv.innerHTML = "";
        const cardDiv = document.createElement("div");
        cardDiv.className = "card face-down";
        cardDiv.textContent = "M"; // Mazo
        deckDiv.appendChild(cardDiv);
    }
  
    function renderDiscardPile() {
        const discardPileDiv = document.getElementById("discard-pile");
        discardPileDiv.innerHTML = "";
        const cardDiv = document.createElement("div");
        cardDiv.className = "card face-down";
        cardDiv.textContent = "D"; // Descartes
        discardPileDiv.appendChild(cardDiv);
    }
  
    function renderRevealedCards() {
        const revealedContainer = document.getElementById("revealed-cards");
        revealedContainer.innerHTML = ""; // Limpiar
  
        // Crear los huecos para las cartas reveladas
        for (let i = 1; i <= 5; i++) {
            const slot = document.createElement("div");
            slot.className = "revealed-slot";
            slot.id = `slot${i}`;
            revealedContainer.appendChild(slot);
        }
    }
  
    // Añadir evento para repartir cartas
    document.getElementById("deal-button").addEventListener("click", () => {
        createDeck();
        shuffleDeck();
        players = dealCards(4); // 4 jugadores
        renderPlayers(players);
        renderDeck();
        renderDiscardPile();
        renderRevealedCards(); // Llamar a la función para crear los huecos para las cartas reveladas
        


        // Desactivar el botón "Repartir", aplicar el estilo y mostrar los botones "Jugar" y "Retirarse"
        document.getElementById("deal-button").disabled = true;
        document.getElementById("deal-button").classList.add("disabled"); // Añadir la clase para hacerlo más oscuro
        document.getElementById("play-button").style.display = "inline-block";
        document.getElementById("dev-play-button-4").style.display = "inline-block";// Mostrar "Jugar"
        document.getElementById("dev-play-button-3").style.display = "inline-block";// Mostrar "Jugar"
        document.getElementById("dev-play-button-2").style.display = "inline-block";// Mostrar "Jugar"
        document.getElementById("fold-button").style.display = "inline-block"; // Mostrar "Retirarse"
        document.getElementById("reveal-button").style.display = "none"; // No mostrar el botón "Revelar cartas"
        document.getElementById("bet-button").style.display = "none"; // No mostrar el botón "Apostar"
        document.getElementById("dev-bet-player-2").style.display = "none"; // No mostrar el botón "Apostar"
        document.getElementById("dev-bet-player-3").style.display = "none"; // No mostrar el botón "Apostar"
        document.getElementById("dev-bet-player-4").style.display = "none"; // No mostrar el botón "Apostar"
        document.getElementById("bet-button").style.display = "none"; // No mostrar el botón "Apostar"
        document.getElementById("bet-button").style.display = "none"; // No mostrar el botón "Apostar"
    });

  
    function revealCard() {
        console.log("Revelar carta activado");
    
        // Si no hay más cartas en el mazo
        if (deck.length === 0) {
            console.log("No hay más cartas en el mazo");
            return;
        }
    
        // Asegurarse de que haya espacio para más cartas
        if (revealedCount < 5) {
            if (revealedCount === 0) {
                // Revelamos las primeras 3 cartas
                for (let i = 0; i < 3; i++) {
                    const revealedSlot = document.getElementById(`slot${revealedCount + 1}`);
                    if (revealedSlot) {
                        const revealedCard = deck.pop(); // Tomar la carta del mazo
                        const cardElement = document.createElement('div');
                        cardElement.classList.add('card', 'revealed'); // Añadir la clase 'revealed' a la carta
                        
                        // Dependiendo del palo, asignamos el color
                        if (revealedCard.suit === "♥" || revealedCard.suit === "♦") {
                            cardElement.classList.add('red');
                        } else {
                            cardElement.classList.add('black');
                        }
    
                        cardElement.textContent = `${revealedCard.rank}${revealedCard.suit}`;
                        revealedSlot.appendChild(cardElement);
                        revealedCards.push(revealedCard); // Añadimos la carta al arreglo de cartas reveladas
                        revealedCount++;
                        console.log("Carta revelada:", revealedCard);
                    }
                }
            } else {
                // Revelamos solo 1 carta a partir del segundo clic
                const revealedSlot = document.getElementById(`slot${revealedCount + 1}`);
                if (revealedSlot) {
                    const revealedCard = deck.pop(); // Tomar la carta del mazo
                    const cardElement = document.createElement('div');
                    cardElement.classList.add('card', 'revealed'); // Añadir la clase 'revealed' a la carta
                    
                    // Dependiendo del palo, asignamos el color
                    if (revealedCard.suit === "♥" || revealedCard.suit === "♦") {
                        cardElement.classList.add('red');
                    } else {
                        cardElement.classList.add('black');
                    }
    
                    cardElement.textContent = `${revealedCard.rank}${revealedCard.suit}`;
                    revealedSlot.appendChild(cardElement);
                    revealedCards.push(revealedCard); // Añadimos la carta al arreglo de cartas reveladas
                    revealedCount++;
                    console.log("Carta revelada:", revealedCard);
                }
            }
            console.log("Huecos restantes:", 5 - revealedCount);
        }
    
        // Al revelar cartas, transferir el dinero apostado al apostado total
        totalBet = totalBet + bet + player2Bet + player3Bet + player4Bet;
        if (bet !== null){
            bet = 0; // Resetear la apuesta actual
        }
        if (player2Bet !== null){
            player2Bet = 0;
        }
        if (player3Bet !== null){
            player3Bet = 0;
        }
        if (player4Bet !== null){
            player4Bet = 0;
        }
        
        updateMoneyDisplay();
    }
  
    // Evento para revelar cartas
    document.getElementById('reveal-button').addEventListener('click', revealCard);
  
    // Apuestas y dinero
    // Inicializar visualización de dinero
    updateMoneyDisplay();

    
  
    // Función para jugar (apostar 5)
    document.getElementById("play-button").addEventListener("click", () => {
        if (money1 >= 5) {
            money1 -= 5;
            bet += 5;
            updateMoneyDisplay();
            console.log(`Apostaste 5, dinero restante: ${money1}, apostado: ${bet}`);
    
            // Ocultar "Jugar" y mostrar los botones "Apostar", "Check" y "Revelar Cartas"
            document.getElementById("play-button").style.display = "none";
            document.getElementById("reveal-button").style.display = "inline-block";
            document.getElementById("bet-button").style.display = "inline-block";
            document.getElementById("check-button").style.display = "inline-block"; // Mostrar botón "Check"
    
            // Deshabilitar el botón "Revelar Cartas" inicialmente
            document.getElementById("reveal-button").disabled = true;
            changeTurn();
        } else {
            alert("No tienes suficiente dinero para jugar.");
        }
    });
  
   // Crear botón de "Check"

   const checkButton = document.createElement("button");
   checkButton.id = "check-button";
   checkButton.textContent = "Check";
   checkButton.style.display = "none"; // Ocultar inicialmente
   document.body.appendChild(checkButton); // Añadir al DOM


   // Evento para el botón de Check
    document.getElementById("check-button").addEventListener("click", () => {
        console.log(`Jugador ${currentPlayer} hizo check.`);
        changeTurn(); // Cambiar turno después de hacer check

        document.getElementById("check-button").disabled = true; // Deshabilitar tras hacer check

        // Desactivar el botón "Apostar" cuando se hace "Check"
        document.getElementById("bet-button").disabled = true;
    });
  
    function retirePlayer(playerIndex) {
        if (playerIndex < 0 || playerIndex >= players.length) {
            console.error(`Índice de jugador inválido: ${playerIndex}`);
            return; // Salir de la función si el índice es incorrecto
        }
        players[playerIndex].retired = true; // Marcar al jugador como retirado
        renderPlayers(players); // Volver a renderizar los jugadores
    }

    // Función para retirarse
    document.getElementById("fold-button").addEventListener("click", () => {
        console.log(`Jugador ${currentPlayer} se ha retirado.`);
        const currentPlayerIndex = currentPlayer - 1; // Obtener índice del jugador actual
        retirePlayer(currentPlayerIndex);
        changeTurn(); // Cambiar turno después de retirarse
        document.getElementById("reveal-button").style.display = "inline-block";
        document.getElementById("play-button").style.display = "none";
        document.getElementById("fold-button").style.display = "none";
        document.getElementById("bet-button").style.display = "none"; // Ocultar botón de apostar
        document.getElementById("check-button").style.display = "none";
        totalBet = totalBet + bet;
        bet = null;
        updateMoneyDisplay();
    });

    // Modificación a la función de apostar
    document.getElementById("bet-button").addEventListener("click", () => {
        const amount = parseInt(prompt("¿Cuánto dinero quieres apostar?", 5));
        if ((amount + bet) >= lastBet && (amount + bet) <= money1) {
            money1 -= amount;
            bet += amount;
            lastBet = bet;  // Actualizar la última apuesta
            updateMoneyDisplay();
            console.log(`Apostaste ${amount}, dinero restante: ${money1}, apostado: ${bet}`);
    
            checkAndEqualizeBets();
            
            console.log(`Jugador ${currentPlayer} apostó $${bet}.`);


            // Deshabilitar el botón "apostar" después de usarlo
            document.getElementById("bet-button").disabled = true;
            
            // Desactivar el botón "Check" cuando se apostó
            document.getElementById("check-button").disabled = true;
        } else {
            alert("Cantidad no válida o insuficiente dinero.");
        }
    });
    
    // Modificación a la función de revelar cartas
    document.getElementById("reveal-button").addEventListener("click", () => {
        // Mostrar las apuestas de cada jugador en la interfaz
        document.getElementById("player1-bet").textContent = `Jugador 1: $${bet}`;
        document.getElementById("player2-bet").textContent = `Jugador 2: $${player2Bet}`;
        document.getElementById("player3-bet").textContent = `Jugador 3: $${player3Bet}`;
        document.getElementById("player4-bet").textContent = `Jugador 4: $${player4Bet}`;
    
        // Mostrar el total apostado
        document.getElementById("total-bet").textContent = totalBet;
    
        // Deshabilitar el botón "Revelar Cartas"
        document.getElementById("reveal-button").disabled = true;
    
        
        lastBet = 0;
        fase = fase + 1;
        console.log(`has pasado a la fase ${fase}`)

        if (fase >= 3) { // Verifica si estamos en la fase 3
            document.getElementById("show-cards-button").style.display = "inline-block";
        }
        
        if(bet !== null){
            currentPlayer = 1;
        }

        if (bet == null){
            currentPlayer = 2; // Cambiar turno después de revelar las cartas
        }

        if (bet == null && player2Bet == null){
            currentPlayer = 3; // Cambiar turno después de revelar las cartas
        }

        if (bet == null && player2Bet == null && player3Bet == null){
            currentPlayer = 4; // Cambiar turno después de revelar las cartas
        }
        
        console.log(`Ahora es el turno del jugador ${currentPlayer}`);
        updateMoneyDisplay();
        updateButtonsForCurrentTurn(currentPlayer);
        
    });


    
    // Simular Check para Jugadores 2, 3 y 4
    document.getElementById("dev-check-player-2").addEventListener("click", () => {
        console.log(`Jugador ${currentPlayer} hizo check.`);
        changeTurn(); // Cambiar turno después de hacer check

        document.getElementById("dev-check-player-2").disabled = true; // Deshabilitar para evitar múltiples clics
        
        // Desactivar el botón de apostar cuando se haga "check"
        document.getElementById("dev-bet-player-2").disabled = true;

        if(player4Bet == null && player3Bet == null){
            checkAndEqualizeBets();
        }
    });

    document.getElementById("dev-check-player-3").addEventListener("click", () => {
        console.log(`Jugador ${currentPlayer} hizo check.`);
        changeTurn(); // Cambiar turno después de hacer check

        document.getElementById("dev-check-player-3").disabled = true; // Deshabilitar para evitar múltiples clics
        
        // Desactivar el botón de apostar cuando se haga "check"
        document.getElementById("dev-bet-player-3").disabled = true;

        if(player4Bet == null){
            checkAndEqualizeBets();
        }
    });

    document.getElementById("dev-check-player-4").addEventListener("click", () => {
        console.log(`Jugador ${currentPlayer} hizo check.`);
        checkAndEqualizeBets();
   
        document.getElementById("dev-check-player-4").disabled = true; // Deshabilitar para evitar múltiples clics
        
        // Desactivar el botón de apostar cuando se haga "check"
        document.getElementById("dev-bet-player-4").disabled = true;
    });

// Simular Apuesta para Jugadores 2, 3 y 4
document.getElementById("dev-bet-player-2").addEventListener("click", () => {
    const amount = parseInt(prompt("¿Cuánto dinero quieres apostar?", 5));
    if ((amount + player2Bet) >= lastBet && (amount + player2Bet) <= money1) {
        money2 -= amount;
        player2Bet += amount; // Apuesta jugador 2
        lastBet = player2Bet;  // Actualizar la última apuesta
        updateMoneyDisplay();
        
        // Actualizar el contador de apuestas del jugador 2
        document.getElementById("player2-bet").textContent = `Jugador 2: $${player2Bet}`;
        
        console.log(`Jugador ${currentPlayer} apostó $${player2Bet}.`);

        checkAndEqualizeBets();
        
        // Desactivar el botón de apostar y el de check para el jugador 2
        document.getElementById("dev-bet-player-2").disabled = true;
        document.getElementById("dev-check-player-2").disabled = true;
    } else {
        alert("Cantidad no válida o insuficiente dinero.");
    }


});

document.getElementById("dev-bet-player-3").addEventListener("click", () => {
    const amount = parseInt(prompt("¿Cuánto dinero quieres apostar?", 5));
    if ((amount + player3Bet) >= lastBet && (amount + player3Bet) <= money1) {
        money3 -= amount;
        player3Bet += amount; // Apuesta jugador 3
        lastBet = player3Bet;  // Actualizar la última apuesta
        updateMoneyDisplay();
        
        // Actualizar el contador de apuestas del jugador 3
        document.getElementById("player3-bet").textContent = `Jugador 3: $${player3Bet}`;
        
        console.log(`Jugador ${currentPlayer} apostó $${player3Bet}.`);

        checkAndEqualizeBets();
        
        // Desactivar el botón de apostar y el de check para el jugador 3
        document.getElementById("dev-bet-player-3").disabled = true;
        document.getElementById("dev-check-player-3").disabled = true;
    } else {
        alert("Cantidad no válida o insuficiente dinero.");
    }


});

document.getElementById("dev-bet-player-4").addEventListener("click", () => {
    const amount = parseInt(prompt("¿Cuánto dinero quieres apostar?", 5));
    if ((amount + player4Bet) >= lastBet && (amount + player4Bet) <= money1) {
        money4 -= amount;
        player4Bet += amount; // Apuesta jugador 4
        lastBet = player4Bet;  // Actualizar la última apuesta
        updateMoneyDisplay();
        
        // Actualizar el contador de apuestas del jugador 2
        document.getElementById("player4-bet").textContent = `Jugador 4: $${player4Bet}`;
        
        console.log(`Jugador ${currentPlayer} apostó $${player4Bet}.`);
    

        // Llamamos a la función para igualar o subir apuestas
        checkAndEqualizeBets();
        console.log(`apuesta 1 es ${bet}`);
        console.log(`apuesta 2 es ${player2Bet}`);    
        console.log(`apuesta 3 es ${player3Bet}`); 
        console.log(`apuesta 4 es ${player4Bet}`); 



        
        // Desactivar el botón de apostar y el de check para el jugador 2
        document.getElementById("dev-bet-player-4").disabled = true;
        document.getElementById("dev-check-player-4").disabled = true;
    } else {
        alert("Cantidad no válida o insuficiente dinero.");
    }

    
});

// Función para jugar jugador 2 (apostar 5)
document.getElementById("dev-play-button-2").addEventListener("click", () => {
    if (money2 >= 5) {
        money2 -= 5;
        player2Bet += 5;
        updateMoneyDisplay();
        console.log(`Apostaste 5, dinero restante: ${money2}, apostado: ${player2Bet}`);
        changeTurn();

        // Ocultar "Jugar" y mostrar los botones "Apostar", "Check" y "Revelar Cartas"
        document.getElementById("dev-play-button-2").style.display = "none";
        document.getElementById("dev-bet-player-2").style.display = "inline-block";
        document.getElementById("dev-check-player-2").style.display = "inline-block"; // Mostrar botón "Check"

    } else {
        alert("No tienes suficiente dinero para jugar.");
    }

});

// Función para jugar jugador 3 (apostar 5)
document.getElementById("dev-play-button-3").addEventListener("click", () => {
    if (money3 >= 5) {
        money3 -= 5;
        player3Bet += 5;
        updateMoneyDisplay();
        console.log(`Apostaste 5, dinero restante: ${money3}, apostado: ${player3Bet}`);
        changeTurn();

        // Ocultar "Jugar" y mostrar los botones "Apostar", "Check" y "Revelar Cartas"
        document.getElementById("dev-play-button-3").style.display = "none";
        document.getElementById("dev-bet-player-3").style.display = "inline-block";
        document.getElementById("dev-check-player-3").style.display = "inline-block"; // Mostrar botón "Check"

    } else {
        alert("No tienes suficiente dinero para jugar.");
    }

});

// Función para jugar jugador 4 (apostar 5)
document.getElementById("dev-play-button-4").addEventListener("click", () => {
    if (money4 >= 5) {
        money4 -= 5;
        player4Bet += 5;
        updateMoneyDisplay();
        console.log(`Apostaste 5, dinero restante: ${money4}, apostado: ${player4Bet}`);
        checkAndEqualizeBets();
        

        // Ocultar "Jugar" y mostrar los botones "Apostar", "Check" y "Revelar Cartas"
        document.getElementById("dev-play-button-4").style.display = "none";
        document.getElementById("dev-bet-player-4").style.display = "inline-block";
        document.getElementById("dev-check-player-4").style.display = "inline-block"; // Mostrar botón "Check"

    } else {
        alert("No tienes suficiente dinero para jugar.");
    }
});

// Función para retirarse
document.getElementById("dev-fold-button-2").addEventListener("click", () => {
    console.log(`Jugador ${currentPlayer} se ha retirado.`);
    const currentPlayerIndex = currentPlayer - 1; // Obtener índice del jugador actual
    retirePlayer(currentPlayerIndex);
    changeTurn(); // Cambiar turno después de retirarse
    document.getElementById("dev-play-button-2").style.display = "none";
    document.getElementById("dev-fold-button-2").style.display = "none";
    document.getElementById("dev-check-player-2").style.display = "none";
    document.getElementById("dev-bet-player-2").style.display = "none"; // Ocultar botón de apostar
    totalBet = totalBet + player2Bet;
    player2Bet = null;
    updateMoneyDisplay();

    if(player4Bet == null && player3Bet == null){
        checkAndEqualizeBets();
    }
});

// Función para retirarse
document.getElementById("dev-fold-button-3").addEventListener("click", () => {
    console.log(`Jugador ${currentPlayer} se ha retirado.`);
    const currentPlayerIndex = currentPlayer - 1; // Obtener índice del jugador actual
    retirePlayer(currentPlayerIndex);
    changeTurn(); // Cambiar turno después de retirarse
    document.getElementById("dev-check-player-3").style.display = "none";
    document.getElementById("dev-play-button-3").style.display = "none";
    document.getElementById("dev-fold-button-3").style.display = "none";
    document.getElementById("dev-bet-player-3").style.display = "none"; // Ocultar botón de apostar
    totalBet = totalBet + player3Bet;
    player3Bet = null;
    updateMoneyDisplay();

    if(player4Bet == null){
        checkAndEqualizeBets();
    }
});

// Función para retirarse
document.getElementById("dev-fold-button-4").addEventListener("click", () => {
    console.log(`Jugador ${currentPlayer} se ha retirado.`);
    const currentPlayerIndex = currentPlayer - 1; // Obtener índice del jugador actual
    retirePlayer(currentPlayerIndex);
    changeTurn(); // Cambiar turno después de retirarse
    document.getElementById("dev-check-player-4").style.display = "none";
    document.getElementById("dev-play-button-4").style.display = "none";
    document.getElementById("dev-fold-button-4").style.display = "none";
    document.getElementById("dev-bet-player-4").style.display = "none"; // Ocultar botón de apostar
    totalBet = totalBet + player4Bet;
    
    player4Bet = null;
    updateMoneyDisplay();
    checkAndEqualizeBets();
});

// Evaluar la mano más alta de los jugadores
function evaluateWinner(players, revealedCards) {
    const rankOrder = [
        "high card",
        "pair",
        "two pair",
        "three of a kind",
        "straight",
        "flush",
        "full house",
        "four of a kind",
        "straight flush",
        "royal flush",
    ];

    const cardValueMap = {
        "2": 2,
        "3": 3,
        "4": 4,
        "5": 5,
        "6": 6,
        "7": 7,
        "8": 8,
        "9": 9,
        "10": 10,
        "J": 11,
        "Q": 12,
        "K": 13,
        "A": 14,
    };

    // Verificar si una mano contiene un color (flush)
    function isFlush(cards) {
        const suits = cards.map(card => card.suit);
        return suits.some(suit => suits.filter(s => s === suit).length >= 5);
    }

    // Verificar si una mano contiene una escalera (straight)
    function isStraight(values) {
        values = [...new Set(values)].sort((a, b) => a - b); // Eliminar duplicados y ordenar
        for (let i = 0; i <= values.length - 5; i++) {
            if (
                values[i + 4] - values[i] === 4 ||
                (values.slice(-4).includes(14) && values[0] === 2) // Escalera baja A-2-3-4-5
            ) {
                return true;
            }
        }
        return false;
    }

    // Evaluar una mano
    function evaluateHand(cards) {
        const values = cards.map(card => cardValueMap[card.rank]);
        const suits = cards.map(card => card.suit);

        const valueCounts = values.reduce((acc, value) => {
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});

        const counts = Object.values(valueCounts).sort((a, b) => b - a);
        const sortedValues = Object.keys(valueCounts)
            .map(Number)
            .sort((a, b) => b - a);

        const flush = isFlush(cards);
        const straight = isStraight(sortedValues);

        if (flush && straight && sortedValues.includes(14)) return { rank: "royal flush", tiebreaker: [] };
        if (flush && straight) return { rank: "straight flush", tiebreaker: sortedValues };
        if (counts[0] === 4) return { rank: "four of a kind", tiebreaker: [sortedValues[0], sortedValues[1]] };
        if (counts[0] === 3 && counts[1] === 2) return { rank: "full house", tiebreaker: [sortedValues[0], sortedValues[1]] };
        if (flush) return { rank: "flush", tiebreaker: sortedValues };
        if (straight) return { rank: "straight", tiebreaker: sortedValues };
        if (counts[0] === 3) return { rank: "three of a kind", tiebreaker: [sortedValues[0], ...sortedValues.slice(1)] };
        if (counts[0] === 2 && counts[1] === 2) return { rank: "two pair", tiebreaker: [sortedValues[0], sortedValues[1], sortedValues[2]] };
        if (counts[0] === 2) return { rank: "pair", tiebreaker: [sortedValues[0], ...sortedValues.slice(1)] };

        return { rank: "high card", tiebreaker: sortedValues };
    }

    // Evaluar las manos de todos los jugadores
    const results = players
        .filter(player => !player.retired) // Excluir jugadores retirados
        .map(player => {
            const combinedHand = [...player.hand, ...revealedCards];
            const handResult = evaluateHand(combinedHand);
            return {
                player: player.id,
                rank: handResult.rank,
                rankIndex: rankOrder.indexOf(handResult.rank),
                tiebreaker: handResult.tiebreaker,
                cards: combinedHand,
            };
        });

    // Determinar al ganador con desempate por "kicker"
    results.sort((a, b) => {
        if (b.rankIndex !== a.rankIndex) return b.rankIndex - a.rankIndex; // Clasificación por tipo de mano
        for (let i = 0; i < a.tiebreaker.length; i++) {
            if (b.tiebreaker[i] !== a.tiebreaker[i]) {
                return b.tiebreaker[i] - a.tiebreaker[i]; // Clasificación por desempate
            }
        }
        return 0; // Empate exacto (poco probable)
    });

    const winner = results[0];

    console.log("Resultados:");
    console.table(results);

    console.log(`El ganador es el Jugador ${winner.player} con la mano: ${winner.rank}`);
    return winner;
}

// Llamar a la función al finalizar la partida
document.getElementById("show-cards-button").addEventListener("click", () => {
    const winner = evaluateWinner(players, revealedCards);

    // Actualizar la interfaz con el ganador
    alert(`El ganador es el Jugador ${winner.player} con la mano: ${winner.rank}`);
});

});
