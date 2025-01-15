import { _decorator, Component, Node, Prefab, Sprite, instantiate, input, Input, Script, SpriteFrame, v3, UITransform, v2, Collider2D, IPhysics2DContact, CCInteger, RigidBody2D, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

import { BirdController, BirdState } from './BirdController';

export enum GameState {
    READY, PLAYING, GAMEOVER
}

@ccclass('GameManager')
export class GameManager extends Component {

    @property(Node)
    Bg: Node[] = [];

    @property(Prefab)
    PipePrefab: Prefab = null;

    @property(Node)
    Pipe: Node;

    @property(CCInteger)
    PipeMinY: Number = 0;
    
    @property(CCInteger)
    PipeMaxY: Number = 0;

    @property(Sprite)
    Bird: Sprite = null;

    @property(Node)
    GameReady: Node;

    @property(Node)
    GameOver: Node;

    @property(Node)
    Score: Node;

    @property(SpriteFrame)
    ScoreSprite: SpriteFrame[] = [];

    gameState: GameState = GameState.READY;

    birdController: BirdController = null;

    score: Number = 0;

    start() {
        this.Bird.node.on('BeginContact', this.onBeginContact, this);
        this.Bird.node.on('EndContact', this.onEndContact, this);
        input.on(Input.EventType.MOUSE_UP, this.onBirdJump, this);
        input.on(Input.EventType.TOUCH_START, this.onBirdJump, this);

        this.birdController = this.Bird.node.getComponent(BirdController)
    }

    onBirdJump() {
        if (this.gameState == GameState.READY) {
            this.setState(GameState.PLAYING);
        }
        if (this.gameState != GameState.GAMEOVER) {
            this.birdController.onJump();
        }
    }

    update(deltaTime: number) {
        if (this.gameState != GameState.GAMEOVER) {
            for (let bg of this.Bg) {
                let pos = bg.getPosition();
                pos.x -= 0.5;
                if (pos.x <= -288) {
                    pos.x = 288;
                }
                bg.setPosition(pos);
            }
        }

        if (this.gameState == GameState.PLAYING) {
            for (let node of this.Pipe.children) {
                let pos = node.getPosition();
                pos.x -= 1;
                if (pos.x <= -288) {
                    pos.x = 288;
                    pos.y = this.getPipeRandomY();
                }
                node.setPosition(pos);
            }
        }
    }

    setScore(score: Number) {
        this.Score.removeAllChildren();
        this.score = score;
        const scoreStr = score.toString();

        const nodes: Node[] = [];
        for (const digit of scoreStr) {
            const digitNode = new Node();
            const sprite = digitNode.addComponent(Sprite);
            sprite.spriteFrame = this.ScoreSprite[parseInt(digit)];
            nodes.push(digitNode);
        }

        let totalWidth = 0;
        for (const node of nodes) {
            totalWidth += node.getComponent(UITransform).width;
        }

        const offsetX = -totalWidth / 2;

        let currentX = offsetX;
        for (const node of nodes) {
            let width = node.getComponent(UITransform).width;
            node.position = v3(currentX + width/2, 0, 0);
            this.Score.addChild(node);
            currentX += width;
        }
    }

    getPipeRandomY() {
        return +this.PipeMinY + Math.random() * (+this.PipeMaxY - +this.PipeMinY);
    }
  
    setState(state: GameState) {
        this.gameState = state;
        switch (state) {
            case GameState.READY:
                break;
            case GameState.PLAYING:
                this.GameReady.active = false;
                this.GameOver.active = false;
                this.setScore(0);
                this.initPipe();
                this.birdController.setState(BirdState.FLYING);
                break;
            case GameState.GAMEOVER:
                this.GameOver.active = true;
                this.birdController.setState(BirdState.STOP);
                break;
        }
    }

    initPipe() {
        this.Pipe.removeAllChildren();
        for (let i = 0; i < 3; i++) {
            let node = instantiate(this.PipePrefab);
            let pos = node.getPosition();
            pos.x = 170 + 200*i
            pos.y = this.getPipeRandomY();
            node.setPosition(pos);
            this.Pipe.addChild(node);
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.tag == 10) {
            return;
        }
        this.setState(GameState.GAMEOVER);
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.tag == 10 && this.gameState == GameState.PLAYING) {
            this.setScore(+this.score + 1)
        }
    }

    onClickRestart(event: Event) {
        this.setState(GameState.PLAYING)
    }
}


