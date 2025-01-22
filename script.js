<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Póker con Amigos</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <!-- Pantalla de Inicio -->
  <div id="start-screen">
    <h1>Póker Multijugador</h1>
    <input type="text" id="room-name" placeholder="Nombre de la sala">
    <button id="create-room">Crear Sala</button>
    <button id="join-room">Unirse a Sala</button>
    <p id="error-message"></p>
  </div>

  <!-- Mesa de Juego -->
  <div id="game-screen" style="display: none;">
    <div id="table">
      <!-- Mazo y cartas descartadas -->
      <div id="deck">
        <div class="card face-down">M</div> <!-- Mazo visible desde el principio -->
      </div>
      <div id="discard-pile">
        <div class="card face-down">D</div> <!-- Descartes visible desde el principio -->
      </div>

      <!-- Huecos para las cartas desveladas numerados -->
      <div id="revealed-cards">
          <div class="card-slot" id="slot1"></div>
          <div class="card-slot" id="slot2"></div>
          <div class="card-slot" id="slot3"></div>
          <div class="card-slot" id="slot4"></div>
          <div class="card-slot" id="slot5"></div>
      </div>

      <!-- Jugadores -->
      <div id="player-top" class="player"></div>
      <div id="player-left" class="player"></div>
      <div id="player-right" class="player"></div>
      <div id="player-bottom" class="player"></div>
    </div>
    
    <button id="deal-button">Repartir Cartas</button>
    <button id="play-button" style="display: none;">Jugar</button>
    <button id="bet-button" style="display: none;">Apostar</button>
    <button id="check-button" style="display: none;">Check</button>  
    <button id="fold-button" style="display: none;">Retirarse</button>
    <button id="reveal-button" style="display: none;">Revelar cartas</button>
    <button id="show-cards-button" style="display: none;">Mostrar Cartas</button>

    <!-- Indicador de turno -->
    <div id="turn-display"></div>

    <!-- Mostrar el dinero -->
    <div id="money-info">
      <p>Dinero Jugador 1: <span id="money1">100</span></p>
      <p>Dinero Jugador 2: <span id="money2">100</span></p>
      <p>Dinero Jugador 3: <span id="money3">100</span></p>
      <p>Dinero Jugador 4: <span id="money4">100</span></p>
      <div id="player1-bet">Apuesta Jugador 1: 0</div>
      <div id="player2-bet">Apuesta Jugador 2: 0</div>
      <div id="player3-bet">Apuesta Jugador 3: 0</div>
      <div id="player4-bet">Apuesta Jugador 4: 0</div>
      <div>Apostado total: <span id="total-bet">0</span></div>
    </div>
  </div>

  <script src="/socket.io/socket.io.js"></script> <!-- Librería de Socket.IO -->
  <script src="script.js"></script>
</body>
</html>
