import React, { useRef, useEffect } from 'react';
import p5 from 'p5';

const Tree = ({ data, width, height }) => {
    const sketchRef = useRef();

    useEffect(() => {
        if (!data || data.length === 0) return

        console.log(data)

        const sketch = (p) => {
            p.setup = () => {
                p.createCanvas(width, height);
                p.background(255);
                p.stroke(139, 69, 19);
                p.translate(p.width / 2, p.height);
                branch(300, 25, data, true);
            };

            const getRandomBrownColor = () => {
                // Generate a random brown color
                const r = p.random(100, 150);
                const g = p.random(50, 100);
                const b = p.random(20, 60);
                return p.color(r, g, b);
            };

            const branch = (len, weight, data, isMainTrunk) => {
                // Set the stroke weight
                p.strokeWeight(weight * (isMainTrunk ? 2 : 1));

                // Set the stroke color
                p.stroke(getRandomBrownColor());

                if (isMainTrunk) {
                    p.line(0, 0, 0, -len);
                    p.translate(0, -len);
                } else {
                    let segments = 10;
                    let segmentLen = len / segments;
                    for (let i = 0; i < segments; i++) {
                        let angle = p.random(-p.PI / 30, p.PI / 30);
                        p.rotate(angle);
                        p.line(0, 0, 0, -segmentLen);
                        p.translate(0, -segmentLen);
                    }
                }

                if (data.length > 0) {
                    let angleStep = p.PI; // Spread branches 180 degrees
                    let numBranches = data.length;
                    let baseAngle = -p.PI / 2; // Start angle

                    data.forEach((d, index) => {
                        p.push();
                        // Spread branches 180 degrees apart, with more separation
                        let angle = baseAngle + (index * angleStep / numBranches) + p.random(-p.PI / 12, p.PI / 12);
                        p.rotate(angle);
                        // Adjust length to vary it
                        let newLength = len * p.random(0.5, 0.6);
                        // Translate to spread the branches further
                        p.translate(p.random(-10, 10), p.random(-10, 10));
                        branch(newLength, weight * 0.67, [], false); // Pass false to indicate these are branches
                        drawLeaves(d.data);
                        p.pop();
                    });
                }
            };

            const drawLeaves = (data) => {
                data.forEach((d, index) => {
                    console.log('datun')
                    p.push();
                    p.rotate(p.random(-p.PI / 6, p.PI / 6));
                    p.translate(0, -p.random(10, 20));
                    p.fill(34, 139, 34, 150);
                    p.noStroke();
                    drawLeaf();
                    p.pop();
                });
            };

            const drawLeaf = () => {
                p.beginShape();
                p.vertex(0, 0);
                p.bezierVertex(5, -10, 10, -10, 10, -15);
                p.bezierVertex(10, -20, 5, -25, 0, -25);
                p.bezierVertex(-5, -25, -10, -20, -10, -15);
                p.bezierVertex(-10, -10, -5, -10, 0, 0);
                p.endShape(p.CLOSE);
            };
        };

        const myP5 = new p5(sketch, sketchRef.current);

        return () => {
            myP5.remove();
        };
    }, [data]);

    return <div ref={sketchRef}></div>;
};

export default Tree;
