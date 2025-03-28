// @ts-nocheck
import { DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';

export default class TransformControlsPlane extends Mesh {
  constructor() {
    super(
      new PlaneGeometry(100000, 100000, 2, 2),
      new MeshBasicMaterial({ visible: false, wireframe: true, side: DoubleSide, transparent: true, opacity: 0.1, toneMapped: false })
    );

    this.isTransformControlsPlane = true;
    this.type = 'TransformControlsPlane';
  }

  updateMatrixWorld(force?: boolean) {
    let space = this.space;

    this.position.copy(this.worldPosition);

    if (this.mode === 'scale') space = 'local'; // scale always oriented to local rotation

    _v1.copy(_unitX).applyQuaternion(space === 'local' ? this.worldQuaternion : _identityQuaternion);
    _v2.copy(_unitY).applyQuaternion(space === 'local' ? this.worldQuaternion : _identityQuaternion);
    _v3.copy(_unitZ).applyQuaternion(space === 'local' ? this.worldQuaternion : _identityQuaternion);

    // Align the plane for current transform mode, axis and space.
    _alignVector.copy(_v2);

    switch (this.mode) {

      case 'translate':
      case 'scale':
        switch (this.axis) {

          case 'X':
            _alignVector.copy(this.eye).cross(_v1);
            _dirVector.copy(_v1).cross(_alignVector);
            break;
          case 'Y':
            _alignVector.copy(this.eye).cross(_v2);
            _dirVector.copy(_v2).cross(_alignVector);
            break;
          case 'Z':
            _alignVector.copy(this.eye).cross(_v3);
            _dirVector.copy(_v3).cross(_alignVector);
            break;
          case 'XY':
            _dirVector.copy(_v3);
            break;
          case 'YZ':
            _dirVector.copy(_v1);
            break;
          case 'XZ':
            _alignVector.copy(_v3);
            _dirVector.copy(_v2);
            break;
          case 'XYZ':
          case 'E':
            _dirVector.set(0, 0, 0);
            break;

        }

        break;
      case 'rotate':
      default:
        // special case for rotate
        _dirVector.set(0, 0, 0);
    }

    if (_dirVector.length() === 0) {

      // If in rotate mode, make the plane parallel to camera
      this.quaternion.copy(this.cameraQuaternion);

    }
    else {
      _tempMatrix.lookAt(_tempVector.set(0, 0, 0), _dirVector, _alignVector);
      this.quaternion.setFromRotationMatrix(_tempMatrix);
    }

    super.updateMatrixWorld(force);
  }
}
