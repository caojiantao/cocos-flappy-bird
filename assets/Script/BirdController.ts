import { _decorator, Component, Node, Animation, Collider2D, Contact2DType, Vec3, IPhysics2DContact, CCInteger, RigidBody2D, v2, Vec2, ERigidBody2DType } from 'cc';
const { ccclass, property } = _decorator;

export enum BirdState {
    READY, FLYING, STOP
}

@ccclass('BirdController')
export class BirdController extends Component {

    @property(CCInteger)
    Speed: Number = 10;
    @property(CCInteger)
    Angel: Number = 30;

    birdState: BirdState = BirdState.READY;

    annimation: Animation = null;

    start() {
        this.annimation = this.node.getComponent(Animation);

        let collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
        this.setState(BirdState.READY);
    }

    update(deltaTime: number) {
        if (this.birdState != BirdState.FLYING) {
            return;
        }
        let y = this.getComponent(RigidBody2D).linearVelocity.y
        let angle = y / +this.Speed * +this.Angel;
        angle = Math.max(angle, -90);
        this.node.angle = angle;
    }

    onJump() {
        this.getComponent(RigidBody2D).linearVelocity = new Vec2(0, +this.Speed);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        this.node.emit('BeginContact', selfCollider, otherCollider, contact);
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        this.node.emit('EndContact', selfCollider, otherCollider, contact);
    }

    setState(state: BirdState) {
        this.birdState = state;
        switch (state) {
            case BirdState.READY:
                this.setRigidBody2DType(ERigidBody2DType.Static);
                break;
            case BirdState.FLYING:
                this.node.setPosition(new Vec3(0, 0, 0));
                this.setRigidBody2DType(ERigidBody2DType.Dynamic);
                this.annimation.play()
                this.onJump();
                break;
            case BirdState.STOP:
                this.setRigidBody2DType(ERigidBody2DType.Static);
                this.annimation.pause();
                break;
        }
    }

    setRigidBody2DType(type: ERigidBody2DType) {
        this.scheduleOnce(() => {
            this.getComponent(RigidBody2D).type = type;
        }, 0);
    }
}


