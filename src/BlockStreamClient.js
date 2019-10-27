import React from "react";
import { fabric } from "fabric";

export default class BlockStreamClient extends React.Component {
  constructor(props) {
    super(props);
    this.canvas = null;
  }

  nodeRefs = [];

  createTopologicalRing = (ringRadius, nodeRadius) =>
    new fabric.Circle({
      radius: ringRadius,
      stroke: "black",
      fill: "rgba(0, 0, 0, 0)",
      top: nodeRadius,
      left: nodeRadius,
      selectable: false,
      opacity: 0.25
    });

  placeCircleAt = (circle, x, y, change = true) => {
    const radius = circle.radius;
    if (change) {
      circle.left = x - radius;
      circle.top = y - radius;
      return circle;
    } else {
      return { left: x - radius, top: y - radius };
    }
  };

  createNodes = (ringRadius, nodeRadius, n) => {
    const cx = ringRadius + nodeRadius;
    const cy = ringRadius + nodeRadius;

    let start = Math.PI / 2;
    const sector = (Math.PI * 2) / n;

    const rTheta = (r, theta) => ({
      x: r * Math.cos(theta),
      y: r * Math.sin(theta)
    });

    const nodes = [];
    for (let i = 0; i < n; i++) {
      const node = new fabric.Circle({ radius: nodeRadius, fill: "green" });
      const pos = rTheta(ringRadius, start);
      const ax = pos.x + cx;
      const ay = cy - pos.y;
      this.placeCircleAt(node, ax, ay);
      nodes.push(node);
      start -= sector;
    }

    nodes.map(node => this.nodeRefs.push(node));
    return nodes;
  };

  createEdge = (node1, node2) => {
    const c1 = this.getCenter(node1);
    const c2 = this.getCenter(node2);

    const line = new fabric.Line([c1.x, c1.y, c2.x, c2.y], {
      stroke: "black",
      strokeWidth: 2
    });
    return line;
  };

  getCenter = circle => ({
    x: circle.left + circle.radius,
    y: circle.top + circle.radius
  });

  sendPacket = (from, to, canvas) => {
    const packet = new fabric.Circle({
      radius: 5,
      fill: "blue"
    });
    const fromCenter = this.getCenter(from);
    const toCenter = this.getCenter(to);

    this.placeCircleAt(packet, fromCenter.x, fromCenter.y);
    canvas.add(packet);

    const duration = 2000;

    const virtualPlace = this.placeCircleAt(
      packet,
      toCenter.x,
      toCenter.y,
      false
    );

    packet.animate("left", virtualPlace.left, {
      onChange: canvas.renderAll.bind(canvas),
      duration: duration,
      onComplete: () => canvas.remove(packet)
    });
    packet.animate("top", virtualPlace.top, {
      onChange: canvas.renderAll.bind(canvas),
      duration: duration,
      onComplete: () => canvas.remove(packet)
    });
  };

  receivePacket = (from, to, canvas) => {};

  steps = [
    {
      name: "drawRing",
      render: () => {
        const ringRadius = this.props.ringRadius;
        const nodeRadius = this.props.nodeRadius;
        this.canvas.add(this.createTopologicalRing(ringRadius, nodeRadius));
      },
      backward: () => {}
    },
    {
      name: "drawSelfNode",
      render: () => {
        const ringRadius = this.props.ringRadius;
        const nodeRadius = this.props.nodeRadius;
        const nodes = this.createNodes(ringRadius, nodeRadius, 1);
        nodes.map(node => this.canvas.add(node));
      },
      backward: () => {
        this.nodeRefs.map(node => this.canvas.remove(node));
        this.nodeRefs = [];
      }
    },
    {
      name: "drawAllNodes",
      render: () => {
        this.nodeRefs.map(node => this.canvas.remove(node));

        const ringRadius = this.props.ringRadius;
        const nodeRadius = this.props.nodeRadius;
        const n = this.props.n;
        const nodes = this.createNodes(ringRadius, nodeRadius, n);
        nodes.map(node => this.canvas.add(node));
      },
      backward: () => {
        this.nodeRefs.map(node => this.canvas.remove(node));
        this.nodeRefs = [];
      }
    },
    {
      name: "sendPacket",
      render: () => {
        const edge = this.createEdge(this.nodeRefs[0], this.nodeRefs[3]);
        this.canvas.add(edge);
        this.canvas.sendToBack(edge);

        this.sendPacket(this.nodeRefs[0], this.nodeRefs[3], this.canvas);
      },
      backward: () => {
        this.sendPacket(this.nodeRefs[3], this.nodeRefs[0], this.canvas);
      }
    }
  ];

  currentStep = -1;

  stepUp() {
    this.currentStep += 1;
    const info = this.steps[this.currentStep];
    console.log(info.name);
    info.render();
  }

  stepDown() {
    const info = this.steps[this.currentStep];
    console.log(info.name);
    info.backward();
    this.currentStep -= 1;
  }

  globalKeyPressHandle = event => {
    if (event.key === "ArrowRight") {
      console.log("forward");
      this.stepUp();
    } else if (event.key === "ArrowLeft") {
      this.stepDown();
    }
  };

  componentDidMount() {
    document.onkeydown = this.globalKeyPressHandle;
    this.canvas = new fabric.Canvas("can");
    /*
    const ringRadius = this.props.ringRadius;
    const nodeRadius = this.props.nodeRadius;
    const n = this.props.n;

    const side = (ringRadius + nodeRadius) * 2;
    const canvas = new fabric.Canvas("can");

    canvas.add(this.createTopologicalRing(ringRadius, nodeRadius));    

    const nodes = this.createNodes(ringRadius, nodeRadius, n);
    nodes.map(node => canvas.add(node));

    const edge = this.createEdge(nodes[0], nodes[3]);
    canvas.add(edge);
    canvas.sendToBack(edge);

    this.sendPacket(nodes[0], nodes[3], canvas);
    */
  }

  render() {
    this._this = this;
    const ringRadius = this.props.ringRadius;
    const nodeRadius = this.props.nodeRadius;
    const n = this.props.n;

    const side = (ringRadius + nodeRadius) * 2;
    const canEl = <canvas width={side} height={side} id="can" />;
    return canEl;
  }
}
