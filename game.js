class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
    }

    preload() {
        this.load.image('title', 'assets/ui/title.png');
        this.load.image('startButton', 'assets/ui/start_button.png');
        this.load.image('how-to-button', 'assets/ui/howTo_button.png');
    }

    create() {
        this.add.image(config.width / 2, config.height / 2 - 200, 'title').setOrigin(0.5, 0.5).setScale(0.6);
        this.startButton = this.add.image(config.width / 2, config.height / 2 + 200, 'startButton').setOrigin(0.5, 0.5).setScale(0.3);
        this.startButton.setInteractive();

        this.startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        this.isPopupOpen = false;
        this.howToPlayBtn = this.add.image(config.width / 2, config.height - 100, 'how-to-button')
        this.howToPlayBtn.setScale(0.1)
        this.howToPlayBtn.setInteractive({ useHandCursor: true });

        // Buton efektleri
        this.howToPlayBtn.on('pointerover', () => {
            this.howToPlayBtn.setScale(this.howToPlayBtn.scale * 1.2);
        });

        this.howToPlayBtn.on('pointerout', () => {
            this.howToPlayBtn.setScale(this.howToPlayBtn.scale / 1.2);
        });

        this.howToPlayBtn.on('pointerdown', () => {
            this.openHowToPlayPopup();
        });
    }

    openHowToPlayPopup() {
        this.howToPlayBtn.disableInteractive();
        this.startButton.disableInteractive();
        const popupBg = this.add.rectangle(
            config.width / 2, config.height / 2,
            config.width * 0.9, config.height * 0.6,
            0x000000, 0.85
        ).setScrollFactor(0).setDepth(2000);

        const howToPlayText = this.add.text(
            config.width / 2, config.height / 2,
            'HOW TO YAZ',
            {
                fontSize: '30px',
                fontFamily: 'monospace',
                fill: '#ffffff',
                align: 'center',
                wordWrap: { width: config.width * 0.8 }
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(2001);

        const closeText = this.add.text(
            config.width / 2, config.height / 2 + 180,
            'Kapat', {
            fontSize: '35px',
            fontFamily: 'monospace',
            fill: '#ff6666',
            backgroundColor: '#ffffff',
            padding: { x: 12, y: 5 }
        }
        ).setOrigin(0.5).setInteractive().setScrollFactor(0).setDepth(2002);

        closeText.on('pointerup', () => {
            this.isPopupOpen = false;
            popupBg.destroy();
            howToPlayText.destroy();
            closeText.destroy();
            this.howToPlayBtn.setInteractive();
            this.startButton.setInteractive();
        });
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' })
    }
    preload() {
        this.load.image('background5', 'assets/background/image1x5.png');
        this.load.image('background4', 'assets/background/image1x4.png');
        this.load.image('background3', 'assets/background/image1x3.png');
        this.load.image('background2', 'assets/background/image1x2.png');
        this.load.image('background1', 'assets/background/image1x1.png');

        this.load.image('platform', 'assets/platform.png');
        this.load.image('platformSpace', 'assets/platformSpace.png');
        this.load.image('movingPlatform', 'assets/movingPlatform.png');
        this.load.image('breakingPlatform', 'assets/breakingPlatform.png');
        this.load.image('player', 'assets/player.png');
        this.load.image('coin', 'assets/coin.png');
        this.load.image('ground', 'assets/ground.png');
        this.load.image('bird', 'assets/bird.png');
        this.load.image('ufo', 'assets/ufo.png');
        this.load.image('alien', 'assets/alien.png');
        this.load.image('bullet', 'assets/bullet.png');
        this.load.image('trophy', 'assets/trophy.png');


        this.load.image('scorePanel', 'assets/ui/score_panel.png');
        this.load.image('healthBar', 'assets/ui/health_bar.png');
        this.load.image('healthPoint', 'assets/ui/health_point.png');
        this.load.image('skor-panel', 'assets/ui/score_panel.png');
        this.load.image('sound-on', 'assets/ui/sound_on.png');
        this.load.image('sound-off', 'assets/ui/sound_off.png');
    }

    create() {
        this.gameActive = false;

        this.jumpPower = 810;

        this.lastPlatformY = 650;
        this.platformGap = 150;
        this.spaceThreshold = -(10000 * 0.39);
        this.victoryY = this.spaceThreshold - 8400;
        this.platformsSpawned = 0; //tüm oyunda 83 platform spawn ediliyor

        this.hearts = 5;

        this.lastEnemyY = 0;
        this.enemyGap = 900; // düşmanların spawn aralığı
        this.enemySpawned = 0; // düşman sayacı

        this.score = 0;
        this.lastCoinY = 650;
        this.coinGap = 100;
        this.coinSpawned = 0;

        this.inSpace = false;

        this.isMobile = this.sys.game.device.input.touch;

        if (!this.isMobile) {
            this.cursors = this.input.keyboard.createCursorKeys();
        }
        else {
            this.touchDirection = null;
            this.input.on('pointerdown', pointer => {
                if (pointer.x > this.game.config.width / 2) {
                    this.touchDirection = 'right';
                } else {
                    this.touchDirection = 'left';
                }
            });
            this.input.on('pointerup', () => {
                this.touchDirection = null;
            });
        }

        //arka plan oluşturma
        this.addBackground(config.width / 2, config.height, 'background5');
        this.addBackground(config.width / 2, config.height - 1 * (13200 / 5), 'background4');
        this.addBackground(config.width / 2, config.height - 2 * (13200 / 5), 'background3');
        this.addBackground(config.width / 2, config.height - 3 * (13200 / 5), 'background2');
        this.addBackground(config.width / 2, config.height - 4 * (13200 / 5), 'background1');

        this.addUIElements();

        this.player = this.physics.add.sprite(config.width / 2, config.height - 400, 'player'); //config.height - 400
        this.player.setScale(0.35);
        this.player.setCollideWorldBounds(false);
        this.player.setDepth(100);
        this.maxHeight = this.player.y;

        // Zemini ve trambolini oluşturma
        this.createInitialGround();

        this.alienBullets = this.physics.add.group({
            allowGravity: false
        });

        this.coins = this.physics.add.group();
        this.normalPlatforms = this.physics.add.staticGroup();
        this.breakingPlatforms = this.physics.add.group();
        this.movingPlatforms = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.bullets = this.physics.add.group();

        this.physics.add.overlap(this.player, this.coins, (player, coin) => {
            this.collectCoin(coin);
        });
        // Normal zıplama için
        this.physics.add.collider(this.player, this.normalPlatforms, (player, platform) => {
            this.handlePlatformCollision(this.jumpPower, platform, player);
        }, this.onlyTopCollision, this);

        // Kırılan platformlar için
        this.physics.add.collider(this.player, this.breakingPlatforms, (player, platform) => {
            this.handlePlatformCollision(this.jumpPower, platform, player);
            platform.destroy(); // kır
        }, this.onlyTopCollision, this);

        // Hareketli platformlar (aynı mantıkla)
        this.physics.add.collider(this.player, this.movingPlatforms, (player, platform) => {
            this.handlePlatformCollision(this.jumpPower, platform, player);
        }, this.onlyTopCollision, this);

        this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
            this.handleEnemyHit(enemy);
        });
        this.physics.add.overlap(this.player, this.bullets, (player, bullet) => {
            this.handleBulletHit(bullet);
        });

        // Trophy'yi victoryY konumuna yerleştir
        this.trophy = this.physics.add.sprite(config.width / 2, this.victoryY, 'trophy');
        this.trophy.setScale(0.2);
        this.trophy.body.setSize(this.trophy.width * 0.2, this.trophy.height * 0.2);
        this.trophy.body.setAllowGravity(false);
        this.trophy.setImmovable(true);

        this.physics.add.overlap(this.player, this.trophy, () => {
            this.handleVictory();
        }, null, this);
    }

    update() {
        //mobil kontrolleri kontrol et
        if (this.isMobile) {
            this.handleMobileControls();

        } else {
            this.handlePlayerMovement();
        }

        if (this.player.y < this.spaceThreshold) {
            this.inSpace = true;
        }
        if (this.player.y < this.maxHeight) {
            this.maxHeight = this.player.y;
            console.log('maxHeight: ' + this.maxHeight);
        }
        if (this.player.y > this.cameras.main.scrollY + config.height) {
            this.handleGameOver();
        }
        // Kamera sadece yukarı çıkarken takip etsin
        const camera = this.cameras.main;
        if (this.player.y < camera.scrollY + 500) {  // 400: ekranın ortasından biraz yukarısı
            camera.scrollY = this.player.y - 500;
        }


        this.spawnHighPoint = this.player.y - config.height;
        if (this.lastPlatformY > this.spawnHighPoint && this.lastPlatformY > this.victoryY) {
            switch (this.platformsSpawned % 5) {
                case 0:
                    this.platformSpawner('normal');
                    break;
                case 1:
                    this.platformSpawner('normal');
                    break;
                case 2:
                    this.platformSpawner('moving');
                    break;
                case 3:
                    this.platformSpawner('normal');
                    break;
                case 4:
                    this.platformSpawner('breaking');
                    break;
            }
        }
        if (this.lastEnemyY > this.spawnHighPoint && this.lastEnemyY > this.victoryY + 1200) {
            if (!this.inSpace) {
                this.addBird();
            }
            else {
                switch (this.enemySpawned % 2) {
                    case 0:
                        this.spaceEnemySpawner('ufo');
                        break;
                    case 1:
                        this.spaceEnemySpawner('alien');
                        break;
                }
            }

        }
        if (this.lastCoinY > this.spawnHighPoint && this.lastCoinY > this.victoryY + 800) {
            this.addCoin();

        }
        this.bullets.getChildren().forEach(bullet => {
            if (this.time.now - bullet.birthTime > bullet.maxLife) {
                bullet.destroy();
            }
        });
    }

    addUIElements() {
        // Score image
        this.skor = this.add.image(110, 50, 'skor-panel');
        this.skor.setScale(0.40); // Adjust scale as needed
        this.skor.setDepth(15)
        this.skor.setScrollFactor(0); // Kamerayla sabit kalsın

        // Score value text
        this.itemScoreText = this.add.text(155, 48, '0', {
            fontSize: '30px',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fill: '#ea4325',
            stroke: '#f2d855',
            strokeThickness: 4
        });
        this.itemScoreText.setOrigin(0, 0.5);
        this.itemScoreText.setScrollFactor(0);
        this.itemScoreText.setDepth(15)

        this.heartIcons = [];
        for (let i = 0; i < this.hearts; i++) {
            let heart = this.add.image(65 + i * 20, 100, 'healthPoint');
            heart.setScale(0.12); // İsteğe göre ayarla
            heart.setScrollFactor(0); // Kamerayla sabit kalsın
            heart.setDepth(15)
            this.heartIcons.push(heart);
        }
    }


    addBackground(x, y, texture) {
        this.background = this.add.image(x, y, texture);
        this.background.setOrigin(0.5, 1);
        this.background.displayWidth = config.width;
        this.background.setScrollFactor(0.9);
        this.background.setDepth(-1);
    }

    handlePlayerMovement() {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-500);
            this.player.flipX = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(500);
            this.player.flipX = false;
        }
        else
            this.player.setVelocityX(0);

        this.wrapPlayer();
    }

    handleMobileControls() {
        if (this.touchDirection === 'left') {
            this.player.body.setVelocityX(-500);
            this.player.flipX = true;
        } else if (this.touchDirection === 'right') {
            this.player.setVelocityX(500);
            this.player.flipX = false;
        }
        else
            this.player.setVelocityX(0);

        this.wrapPlayer();
    }

    wrapPlayer() {
        if (this.player.x < 0) {
            this.player.x = config.width;
        } else if (this.player.x > config.width) {
            this.player.x = 0;
        }
    }

    createInitialGround() {
        // Trambolin görüntüsü
        this.trampolineFrame = this.add.image(config.width / 2, config.height - 300, 'ground').setScale(2).setDepth(1);
        this.trampolineMat = this.add.image(config.width / 2, config.height - 300, 'ground').setScale(2).setDepth(0);

        // Mask için grafik nesnesi oluştur
        this.graphics = this.make.graphics();
        this.graphics.fillStyle(0xffffff);
        this.trampolineWidth = this.trampolineMat.width * this.trampolineMat.scaleX;
        this.trampolineHeight = this.trampolineMat.height * this.trampolineMat.scaleY;

        this.graphics.fillEllipse(
            this.trampolineMat.x,
            this.trampolineMat.y,
            this.trampolineWidth * 0.6,
            this.trampolineHeight * 0.3
        );

        this.mask = this.graphics.createGeometryMask(); // düzeltme burada
        this.trampolineMat.setMask(this.mask);

        // Zemin oluştur (statik grup tavsiye edilir)
        this.ground = this.physics.add.staticGroup();
        this.ground.create(config.width / 2, config.height - 320)
            .setDisplaySize(config.width, 20)
            .setVisible(false)
            .refreshBody();

        // Çarpışma tanımı
        this.physics.add.collider(this.player, this.ground, (player, platform) => {
            this.handlePlatformCollision(this.jumpPower + 200, platform);
        });
    }

    handlePlatformCollision(jumpPower, platform) {
        let playerBottom = this.player.y + this.player.displayHeight / 2;
        let platformTop = platform.y - platform.displayHeight / 2;

        // Karakterin yalnızca düşerken çarpışmasını sağla
        if (this.player.body.velocity.y >= 0) {
            if (playerBottom <= platformTop + 5) { // 5 piksel tolerans
                this.player.body.velocity.y = -jumpPower;
            }
        }
    }
    onlyTopCollision(player, platform) {
        const playerBottom = player.y + player.displayHeight / 2;
        const platformTop = platform.y - platform.displayHeight / 2;
        return player.body.velocity.y >= 0 && playerBottom <= platformTop + 5;
    }
    handleGameOver() {
        this.physics.pause();
        this.scene.start('GameOverScene')
    }

    handleVictory() {
        this.physics.pause();
        this.scene.start('WinScene');
    }
    handleFall() {
        if (this.player.y > this.maxHeight + config.height + 300) {
            this.handleGameOver();
        }
    }

    handleEnemyHit(enemy) {
        for (let i = 0; i < 4; i++) {
            this.handleDamage();
        }
        enemy.destroy();
        if (this.hearts < 1) {
            this.handleGameOver();
        }
        console.log('hearts: ' + this.hearts);
    }
    handleBulletHit(bullet) {
        this.handleDamage();
        bullet.destroy();
        if (this.hearts < 1) {
            this.handleGameOver();
        }
        console.log('hearts' + this.hearts)
    }

    handleDamage() {
        this.hearts -= 1;
        const heartToRemove = this.heartIcons[this.hearts];

        // Fade-out efekti ile kalbi yok et
        this.tweens.add({
            targets: heartToRemove,
            alpha: 0,
            duration: 300,
            ease: 'Linear',
            onComplete: () => {
                heartToRemove.destroy();
            }
        });
    }

    addCoin() {
        let y = this.lastCoinY - this.coinGap;
        this.coin = this.coins.create(Phaser.Math.Between(100, config.width - 100), y, 'coin');
        this.coin.body.setAllowGravity(false);
        this.coin.setScale(0.1);
        this.lastCoinY = this.coin.y;
        this.coinSpawned++;
        console.log(this.coinSpawned)
    }
    collectCoin(coin) {
        coin.destroy();
        this.score += 10;
        this.itemScoreText.setText(this.score);
        console.log('score: ' + this.score)
    }

    addNormalPlatform() {
        let y = this.lastPlatformY - this.platformGap;
        let platformTexture = this.inSpace ? 'platformSpace' : 'platform';
        this.platform = this.normalPlatforms.create(Phaser.Math.Between(0, config.width), y, platformTexture);
        this.platform.setScale(120 / this.platform.width, 42 / this.platform.height);

        this.platform.body.setSize(this.platform.width * 0.8, this.platform.height * 0.1);
        this.platform.body.setOffset(this.platform.width * 0.1, 0);

        this.lastPlatformY = this.platform.y;
        this.platformsSpawned++;
    }
    addMovingPlatform() {
        let y = this.lastPlatformY - this.platformGap;
        let platformTexture = this.inSpace ? 'platformSpace' : 'movingPlatform';
        this.movingPlatform = this.movingPlatforms.create(Phaser.Math.Between(0, config.width), y, platformTexture);
        this.movingPlatform.setScale(120 / this.movingPlatform.width, 42 / this.movingPlatform.height);
        this.movingPlatform.body.setAllowGravity(false);
        this.movingPlatform.setImmovable(true);

        this.movingPlatform.body.setSize(this.movingPlatform.width * 0.8, this.movingPlatform.height * 0.1);
        this.movingPlatform.body.setOffset(this.movingPlatform.width * 0.1, 0);

        this.lastPlatformY = this.movingPlatform.y;
        this.platformsSpawned++;

        // Hareketli platformun hareketi
        this.tweens.add({
            targets: this.movingPlatform,
            x: Phaser.Math.Between(0, config.width),
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // daha yumuşak ve çeşitli hareket
        let moveDistance = Phaser.Math.Between(100, 200);
        let moveDuration = Phaser.Math.Between(1500, 2500); // Daha çeşitli hızlar
        this.tweens.add({
            targets: this.movingPlatform,
            x: this.movingPlatform.x + moveDistance * (Math.random() > 0.5 ? 1 : -1),
            duration: moveDuration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    addBreakingPlatform() {
        let y = this.lastPlatformY - this.platformGap;
        let platformTexture = this.inSpace ? 'platformSpace' : 'breakingPlatform';
        this.breakingPlatform = this.breakingPlatforms.create(Phaser.Math.Between(0, config.width), y, platformTexture);
        this.breakingPlatform.setScale(120 / this.breakingPlatform.width, 42 / this.breakingPlatform.height);
        this.breakingPlatform.body.allowGravity = false;
        this.breakingPlatform.setImmovable(true);

        this.breakingPlatform.body.setSize(this.breakingPlatform.width * 0.8, this.breakingPlatform.height * 0.1);
        this.breakingPlatform.body.setOffset(this.breakingPlatform.width * 0.1, 0);

        this.lastPlatformY = this.breakingPlatform.y;
        this.platformsSpawned++;


        if (this.inSpace) {
            this.breakingPlatform.setAlpha(0.8);
        }
        this.breakingPlatform.refreshBody();
    }

    platformSpawner(keyword) {
        switch (keyword) {
            case 'normal':
                this.addNormalPlatform();
                break;
            case 'moving':
                this.addMovingPlatform();
                break;
            case 'breaking':
                this.addBreakingPlatform();
                break;
            default:
                console.error('Geçersiz platform türü:', keyword);
        }
    }
    addBird() {
        if (this.inSpace) return;
        let y = this.lastEnemyY - this.enemyGap;

        let bird = this.enemies.create(Phaser.Math.Between(100, config.width - 100), y, 'bird');
        bird.setScale(1.2);
        bird.body.setAllowGravity(false);
        bird.body.moves = false;
        bird.setImmovable(true);

        this.lastEnemyY = bird.y;
        this.enemySpawned++;

        let movementDistance = Phaser.Math.Between(100, 200);
        let direction = 1;

        this.tweens.add({
            targets: bird,
            x: bird.x + movementDistance,
            scaleY: bird.scaleY * 0.85,
            y: bird.y - 20,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            onYoyo: () => {
                direction *= -1;
                bird.setFlipX(direction < 0); // sola gidiyorsa flipX true
            },
            onRepeat: () => {
                direction *= -1;
                bird.setFlipX(direction < 0);
            }
        });
    }


    addUFO() {
        if (!this.inSpace) return;
        let y = this.lastEnemyY - this.enemyGap;
        const ufo = this.enemies.create(Phaser.Math.Between(100, config.width - 100), y, 'ufo');
        ufo.setScale(1.2);
        ufo.body.setGravity(0, 0);
        ufo.body.velocity.y = 0;
        ufo.body.allowGravity = false;
        ufo.body.moves = false;
        ufo.setImmovable(true);
        this.lastEnemyY = ufo.y;
        this.enemySpawned++;
        console.log('Düşman Spawned:', this.enemySpawned);

        this.tweens.add({
            targets: ufo,
            x: ufo.x + Phaser.Math.Between(-40, 40),
            y: y - 10,
            angle: 10,
            alpha: 0.65,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    addAlien() {
        if (!this.inSpace) return;

        let y = this.lastEnemyY - this.enemyGap;
        const alien = this.enemies.create(Phaser.Math.Between(100, config.width - 100), y, 'alien');
        alien.setScale(1.2);
        alien.body.allowGravity = false;
        alien.body.moves = false;
        alien.setImmovable(true);
        alien.setTint(0xccffcc);

        this.lastEnemyY = alien.y;
        this.enemySpawned++;

        this.tweens.add({
            targets: alien,
            y: y - 10,
            angle: Phaser.Math.Between(-5, 5),
            alpha: 0.85,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });


        // Ateş etme döngüsü (her 2 saniyede bir dene)
        this.time.addEvent({
            delay: 2000,
            loop: true,
            callback: () => {
                const distance = Phaser.Math.Distance.Between(alien.x, alien.y, this.player.x, this.player.y);
                if (distance < 800) {
                    const bullet = this.bullets.create(alien.x, alien.y, 'bullet');
                    bullet.setScale(1.0);
                    bullet.body.allowGravity = false;

                    const angle = Phaser.Math.Angle.Between(alien.x, alien.y, this.player.x, this.player.y);
                    const bulletSpeed = 300;

                    bullet.body.velocity.x = Math.cos(angle) * bulletSpeed;
                    bullet.body.velocity.y = Math.sin(angle) * bulletSpeed;

                    bullet.setAngle(Phaser.Math.RadToDeg(angle) - 90);
                    bullet.birthTime = this.time.now;
                    bullet.maxLife = 4000; // 4 saniye yaşasın
                }
            }
        });
    }

    spaceEnemySpawner(keyword) {
        switch (keyword) {
            case 'bird':
                this.addBird();
                break;
            case 'ufo':
                this.addUFO();
                break;
            case 'alien':
                this.addAlien();
                break;
            default:
                console.error('Geçersiz düşman türü:', keyword);
        }

    }
}

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }
    preload() {
        this.add.image('resetButton', 'assets/ui/restart.png');
    }

    create() { }
}

class WinScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WinScene' });
    }

    preload() {

    }

    create() { }
}

const config = {
    type: Phaser.AUTO,
    width: 560,
    height: 1050,
    scale: {
        mode: Phaser.Scale.FIT,       // Ekrana sığdır
        autoCenter: Phaser.Scale.CENTER_BOTH, // Ortala
        width: 560,
        height: 1050
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: true,
        }
    },
    scene: [StartScene, GameScene]//StartScene, GameScene , GameOverScene, WinScene]
};

const game = new Phaser.Game(config);

//TODO: UI
//TODO: başlangıç ve bitiş sahneleri

