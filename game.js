class StartScene {
    constructor() {
        ({ key: 'StartScene' });
    }
    preload() { }

    create() { }
}

class GameScene {
    constructor() {
        ({ key: 'GameScene' })
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


    }

    create() {
        this.gameActive = false;

        this.jumpPower = 810;
        this.lastPlatformY = 500;
        this.platformGap = 150;
        this.spaceThreshold = -(10000 * 0.39);
        this.victoryY = this.spaceThreshold - 7800;
        this.platformsSpawned = 0;

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

        this.player = this.physics.add.sprite(config.width / 2, config.height - 400, 'player');
        this.player.setScale(0.35);
        this.player.setCollideWorldBounds(false);
        this.player.setDepth(100);

        // Zemini ve trambolini oluşturma
        this.createInitialGround()

        this.normalPlatforms = this.physics.add.staticGroup();
        this.movingPlatforms = this.physics.add.group();
        this.breakingPlatforms = this.physics.add.group();

    }

    update() {
        if (this.isMobile) {
            this.handleMobileControls();

        } else {
            this.handlePlayerMovement();
        }

        if (this.player.y < this.spaceThreshold) {
            this.inSpace = true;
        }
        // Kamera sadece yukarı çıkarken takip etsin
        const camera = this.cameras.main;
        if (this.player.y < camera.scrollY + 500) {  // 400: ekranın ortasından biraz yukarısı
            camera.scrollY = this.player.y - 500;
        }

        this.salladim = this.player.y - config.height;

        if (this.lastPlatformY > this.salladim) {
            this.addNormalPlatforms();
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

    addNormalPlatforms() {
        let y = this.lastPlatformY - this.platformGap;
        let platformTexture = this.inSpace ? 'platformSpace' : 'platform';
        console.log('inSpace:', this.inSpace); // eklenecek satır
        this.platform = this.normalPlatforms.create(Phaser.Math.Between(0, config.width), y, platformTexture);
        this.platform.setScale(120 / this.platform.width, 42 / this.platform.height);

        this.platform.body.setSize(this.platform.width * 0.8, this.platform.height * 0.1);
        this.platform.body.setOffset(this.platform.width * 0.1, 0);

        this.lastPlatformY = this.platform.y;
        this.platformsSpawned++;

        this.physics.add.collider(this.player, this.platform,
            (player, platform) => {
                this.handlePlatformCollision(this.jumpPower, platform, player);
            },
            (player, platform) => {
                const playerBottom = player.y + player.displayHeight / 2;
                const platformTop = platform.y - platform.displayHeight / 2;
                return player.body.velocity.y >= 0 && playerBottom <= platformTop + 5;
            }
        );

    }

}

class GameOverScene {
    constructor() {
        ({ key: 'GameOverScene' });
    }
    preload() {
        this.add.image();
    }

    create() { }
}

class WinScene {
    constructor() {
        ({ key: 'WinScene' });
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
    scene: [ /* StartScene,*/ GameScene /*, GameOverScene, WinScene*/]
};

const game = new Phaser.Game(config);

