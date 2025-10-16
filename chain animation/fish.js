class Vector2D {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  copy() {
    return new Vector2D(this.x, this.y);
  }

  static add(v1, v2) {
    return new Vector2D(v1.x + v2.x, v1.y + v2.y);
  }

  static sub(v1, v2) {
    return new Vector2D(v1.x - v2.x, v1.y - v2.y);
  }

  heading() {
    return Math.atan2(this.y, this.x);
  }

  static fromAngle(angle) {
    return new Vector2D(Math.cos(angle), Math.sin(angle));
  }

  setMag(mag) {
    const h = this.heading();
    this.x = Math.cos(h) * mag;
    this.y = Math.sin(h) * mag;
    return this;
  }

  mag() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}

function constrainAngle(angle, targetAngle, maxDiff) {
  let diff = angle - targetAngle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;

  if (Math.abs(diff) > maxDiff) {
    return targetAngle + Math.sign(diff) * maxDiff;
  }
  return angle;
}

function constrainDistance(point, anchor, distance) {
  const dir = Vector2D.sub(point, anchor);
  const currentDist = dir.mag();
  if (currentDist === 0) return anchor.copy();

  const scale = distance / currentDist;
  return new Vector2D(anchor.x + dir.x * scale, anchor.y + dir.y * scale);
}

class Chain {
  constructor(origin, jointCount, linkSize, angleConstraint = Math.PI * 2) {
    this.linkSize = linkSize;
    this.angleConstraint = angleConstraint;
    this.joints = [];
    this.angles = [];

    this.joints.push(origin.copy());
    this.angles.push(0);

    for (let i = 1; i < jointCount; i++) {
      this.joints.push(
        Vector2D.add(this.joints[i - 1], new Vector2D(0, this.linkSize))
      );
      this.angles.push(0);
    }
  }

  resolve(pos) {
    this.angles[0] = Vector2D.sub(pos, this.joints[0]).heading();
    this.joints[0] = pos;

    for (let i = 1; i < this.joints.length; i++) {
      const curAngle = Vector2D.sub(
        this.joints[i - 1],
        this.joints[i]
      ).heading();
      this.angles[i] = constrainAngle(
        curAngle,
        this.angles[i - 1],
        this.angleConstraint
      );
      this.joints[i] = Vector2D.sub(
        this.joints[i - 1],
        Vector2D.fromAngle(this.angles[i]).setMag(this.linkSize)
      );
    }
  }

  fabrikResolve(pos, anchor) {
    this.joints[0] = pos;
    for (let i = 1; i < this.joints.length; i++) {
      this.joints[i] = constrainDistance(
        this.joints[i],
        this.joints[i - 1],
        this.linkSize
      );
    }

    this.joints[this.joints.length - 1] = anchor;
    for (let i = this.joints.length - 2; i >= 0; i--) {
      this.joints[i] = constrainDistance(
        this.joints[i],
        this.joints[i + 1],
        this.linkSize
      );
    }
  }

  display(ctx) {
    // draw lines
    ctx.strokeStyle = "white";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";

    for (let i = 0; i < this.joints.length - 1; i++) {
      ctx.beginPath();
      ctx.moveTo(this.joints[i].x, this.joints[i].y);
      ctx.lineTo(this.joints[i + 1].x, this.joints[i + 1].y);
      ctx.stroke();
    }

    // draw joints
    ctx.fillStyle = "#16703dff";
    for (const joint of this.joints) {
      ctx.beginPath();
      ctx.arc(joint.x, joint.y, 16, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");

  // set canvas size (adjust as needed)
  canvas.width = 800;
  canvas.height = 600;

  // create chains
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  const chains = [
    new Chain(new Vector2D(centerX, centerY), 8, 30, Math.PI / 4),
    new Chain(new Vector2D(centerX, centerY), 10, 25, Math.PI / 3),
    new Chain(new Vector2D(centerX, centerY), 12, 20, Math.PI / 2),
  ];

  const anchor = new Vector2D(centerX, centerY);

  // mouse tracking
  let mouseX = centerX;
  let mouseY = centerY - 100;

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  // animation loop
  function animate() {
    // clear canvas
    ctx.fillStyle = "#0e0e0eff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // update and draw chains
    for (const chain of chains) {
      chain.fabrikResolve(new Vector2D(mouseX, mouseY), anchor);
      chain.display(ctx);
    }

    // draw anchor point
    ctx.beginPath();
    ctx.arc(anchor.x, anchor.y, 8, 0, Math.PI * 2);
    ctx.fill();

    requestAnimationFrame(animate);
  }

  animate();
});
