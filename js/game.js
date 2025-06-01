document.addEventListener('DOMContentLoaded', () => {
    const player = document.getElementById('player');
    const coffee = document.getElementById('coffee');
    const gameArea = document.querySelector('.game-area');
    const scoreElement = document.getElementById('score');
    const startButton = document.getElementById('startButton');
    const discountCodeElement = document.getElementById('discountCode');
    
    let score = 0;
    let gameInterval;
    let isGameRunning = false;
    let playerX = 50;
    let coffeeX = 50;
    let coffeeSpeed = 12;
    let baseSpeed = 12;
    let maxSpeed = 25;
    let coffeeCount = 1;
    let maxCoffees = 4;
    let coffees = [];
    
    // Oyuncu kontrolü - Fare ve Dokunmatik
    function updatePlayerPosition(x) {
        if (!isGameRunning) return;
        
        const gameAreaRect = gameArea.getBoundingClientRect();
        const maxX = gameAreaRect.width - player.offsetWidth;
        
        playerX = Math.max(0, Math.min(x, maxX));
        player.style.left = `${playerX}px`;
    }

    // Fare kontrolü
    document.addEventListener('mousemove', (e) => {
        const gameAreaRect = gameArea.getBoundingClientRect();
        const mouseX = e.clientX - gameAreaRect.left;
        updatePlayerPosition(mouseX);
    });

    // Dokunmatik kontrol
    gameArea.addEventListener('touchmove', (e) => {
        const gameAreaRect = gameArea.getBoundingClientRect();
        const touchX = e.touches[0].clientX - gameAreaRect.left;
        updatePlayerPosition(touchX);
    }, { passive: true });

    // Dokunmatik başlangıç
    gameArea.addEventListener('touchstart', (e) => {
        const gameAreaRect = gameArea.getBoundingClientRect();
        const touchX = e.touches[0].clientX - gameAreaRect.left;
        updatePlayerPosition(touchX);
    }, { passive: true });
    
    // Kahve oluştur
    function createCoffee() {
        const newCoffee = document.createElement('div');
        newCoffee.className = 'coffee';
        newCoffee.style.cssText = `
            width: 35px;
            height: 35px;
            background: url('../img/point.png') center/cover;
            position: absolute;
            top: -35px;
            left: ${Math.random() * (gameArea.offsetWidth - 35)}px;
            border-radius: 50%;
            transition: top 0.1s linear;
            box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
            animation: rotate 2s linear infinite, float 3s ease-in-out infinite;
        `;
        gameArea.appendChild(newCoffee);
        return newCoffee;
    }
    
    // Kahve düşme animasyonu
    function moveCoffees() {
        if (!isGameRunning) return;
        
        coffees.forEach((coffee, index) => {
            const coffeeTop = parseFloat(getComputedStyle(coffee).top);
            coffee.style.top = `${coffeeTop + coffeeSpeed}px`;
            
            // Çarpışma kontrolü
            const playerRect = player.getBoundingClientRect();
            const coffeeRect = coffee.getBoundingClientRect();
            
            if (coffeeTop > gameArea.offsetHeight) {
                gameOver();
                return;
            }
            
            if (
                coffeeRect.left < playerRect.right &&
                coffeeRect.right > playerRect.left &&
                coffeeRect.top < playerRect.bottom &&
                coffeeRect.bottom > playerRect.top
            ) {
                score++;
                scoreElement.textContent = score;
                
                // Puan animasyonu
                createPoint(coffeeRect.left + coffeeRect.width/2, coffeeRect.top);
                
                // Her 3 puanda bir zorluk artır
                if (score % 3 === 0) {
                    coffeeSpeed = Math.min(baseSpeed + (score / 3), maxSpeed);
                    if (coffeeCount < maxCoffees) {
                        coffeeCount++;
                    }
                }
                
                // Kahveyi kaldır
                coffee.remove();
                coffees.splice(index, 1);
                
                // Yeni kahve ekle
                if (coffees.length < coffeeCount) {
                    coffees.push(createCoffee());
                }
            }
        });
    }
    
    // Oyunu başlat
    function startGame() {
        if (isGameRunning) return;
        
        // Önceki kahveleri temizle
        coffees.forEach(coffee => coffee.remove());
        coffees = [];
        
        isGameRunning = true;
        score = 0;
        coffeeSpeed = baseSpeed;
        coffeeCount = 1;
        scoreElement.textContent = score;
        discountCodeElement.style.display = 'none';
        discountCodeElement.textContent = '';
        startButton.textContent = 'Oyun Devam Ediyor';
        
        // İlk kahveyi ekle
        coffees.push(createCoffee());
        
        gameInterval = setInterval(moveCoffees, 16);
    }
    
    // İndirim kodu oluştur
    function generateDiscountCode(score) {
        const discount = Math.min(Math.floor(score / 3) * 5, 20);
        if (discount === 0) return null;
        
        const code = `CANDY${discount}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        return { code, discount };
    }
    
    // Oyunu bitir
    function gameOver() {
        isGameRunning = false;
        clearInterval(gameInterval);
        startButton.textContent = 'Tekrar Başlat';
        
        // Tüm kahveleri temizle
        coffees.forEach(coffee => coffee.remove());
        coffees = [];
        
        const discountInfo = generateDiscountCode(score);
        if (discountInfo) {
            discountCodeElement.textContent = `Tebrikler! ${discountInfo.discount}% İndirim Kazandınız! Kod: ${discountInfo.code}`;
            discountCodeElement.style.display = 'block';
        }
        
        alert(`Oyun Bitti! Skorunuz: ${score}`);
    }
    
    function createPoint(x, y) {
        const point = document.createElement('div');
        point.className = 'point';
        point.textContent = '+1';
        point.style.left = `${x}px`;
        point.style.top = `${y}px`;
        gameArea.appendChild(point);
        
        // Animasyon bittikten sonra elementi kaldır
        setTimeout(() => {
            point.remove();
        }, 500);
    }
    
    startButton.addEventListener('click', startGame);
}); 