"use strict";
function asteroids() {
    const svg = document.getElementById("canvas"), canvasTop = svg.getBoundingClientRect().top, canvasBottom = svg.getBoundingClientRect().bottom, canvasRight = svg.getBoundingClientRect().right, canvasLeft = svg.getBoundingClientRect().left;
    const g = new Elem(svg, 'g')
        .attr("transform", "translate(600 300)");
    const a = new Elem(svg, 'g');
    const b = new Elem(svg, 'g');
    const ship = new Elem(svg, 'polygon', g.elem)
        .attr("points", "-15,20 15,20 0,-20")
        .attr("style", "fill:purple;stroke:white;stroke-width:3")
        .attr("accelerationX", 0)
        .attr("accelerationY", 0);
    const gGroup = svg.getElementsByTagName('g'), asteroidElementGroup = gGroup.item(1), bulletElementGroup = gGroup.item(2), asteroidElements = asteroidElementGroup.children, bulletElements = bulletElementGroup.children;
    let lowerSpeedLimit = 0.2, upperSpeedLimit = 0.4;
    const radToDeg = (rad) => rad * 180 / Math.PI + 90;
    const degToRad = (deg) => (deg - 90) * (Math.PI / 180);
    function generateRandom(low, high) { return (Math.random() * (high - low)) + low; }
    const transformMatrix = (e) => new WebKitCSSMatrix(window.getComputedStyle(e.elem).webkitTransform);
    Observable.fromEvent(svg, "mousemove")
        .map(({ clientX, clientY }) => ({
        lookx: clientX - canvasLeft,
        looky: clientY - canvasTop,
        x: transformMatrix(g).m41,
        y: transformMatrix(g).m42
    }))
        .map(({ lookx, looky, x, y }) => g.attr("transform", "translate(" + x.toPrecision(8).substring(0, 7) + " " + y.toPrecision(8).substring(0, 7) + ")" +
        "rotate(" +
        (radToDeg(Math.atan2(looky - y, lookx - x))).toPrecision(7)
        + ")"))
        .subscribe((g) => console.log("Ship (x,y): " + transformMatrix(g).m41 + ", " + transformMatrix(g).m42));
    function accX(angle) {
        return (2 * Math.cos(degToRad(angle))).toPrecision(8).substring(0, 7);
    }
    function accY(angle) {
        return (2 * Math.sin(degToRad(angle))).toPrecision(8).substring(0, 7);
    }
    function moveX(shipX, shipAccX) {
        return (shipX + shipAccX).toPrecision(8).substring(0, 7);
    }
    function moveY(shipY, shipAccY) {
        return (shipY + shipAccY).toPrecision(8).substring(0, 7);
    }
    Observable.fromEvent(document, 'keydown')
        .filter(({ keyCode }) => (keyCode == 81))
        .map(() => ({
        angle: Number(g.attr("transform").substring(33, 39))
    }))
        .subscribe(({ angle }) => {
        ship.elem.setAttribute("accelerationX", accX(angle));
        ship.elem.setAttribute("accelerationY", accY(angle));
    });
    const MouseMoveObservable = Observable.interval(0)
        .map(() => ({
        shipX: transformMatrix(g).m41,
        shipY: transformMatrix(g).m42,
        shipAccX: parseInt(ship.elem.getAttribute("accelerationX")),
        shipAccY: parseInt(ship.elem.getAttribute("accelerationY")),
        angle: Number(g.attr("transform").substring(33, 39))
    }));
    MouseMoveObservable
        .filter(({ shipX }) => (shipX <= -35))
        .subscribe(({ shipY, shipAccX, shipAccY, angle }) => g.attr("transform", "translate(" + moveX(canvasRight + 35, shipAccX) + " " + moveY(shipY, shipAccY) + ")" + "rotate(" + angle.toPrecision(7) + ")"));
    MouseMoveObservable
        .filter(({ shipX }) => (shipX >= canvasRight + 35))
        .subscribe(({ shipY, shipAccX, shipAccY, angle }) => g.attr("transform", "translate(" + moveX(-35, shipAccX) + " " + moveY(shipY, shipAccY) + ")" + "rotate(" + angle.toPrecision(7) + ")"));
    MouseMoveObservable
        .filter(({ shipY }) => (shipY <= -35))
        .subscribe(({ shipX, shipAccX, shipAccY, angle }) => g.attr("transform", "translate(" + moveX(shipX, shipAccX) + " " + moveY(canvasBottom + 35, shipAccY) + ")" + "rotate(" + angle.toPrecision(7) + ")"));
    MouseMoveObservable
        .filter(({ shipY }) => (shipY >= canvasBottom + 35))
        .subscribe(({ shipX, shipAccX, shipAccY, angle }) => g.attr("transform", "translate(" + moveX(shipX, shipAccX) + " " + moveY(-35, shipAccY) + ")" + "rotate(" + angle.toPrecision(7) + ")"));
    MouseMoveObservable
        .subscribe(({ shipX, shipY, shipAccX, shipAccY, angle }) => g.attr("transform", "translate(" + moveX(shipX, shipAccX) + " " + moveY(shipY, shipAccY) + ")" + "rotate(" + angle.toPrecision(7) + ")"));
    Observable.fromEvent(svg, 'mousedown')
        .map(() => {
        const bullet = new Elem(svg, 'circle', b.elem)
            .attr('cx', String(transformMatrix(g).m41))
            .attr('cy', String(transformMatrix(g).m42))
            .attr('r', "3")
            .attr('fill', '#FFFFFF')
            .attr('has_hit', "false")
            .attr('angle', String(g.attr("transform").substring(33, 39))), shootSound = new Audio("shoot.mp3");
        shootSound.volume = 0.3;
        shootSound.play();
        Observable.interval(0)
            .takeUntil(Observable.interval(2000))
            .map(() => {
            Observable.fromArray(Array.from(asteroidElements))
                .map((asteroidElem) => ({
                asteroidElem: asteroidElem,
                hitboxRange: Number(bullet.attr('r')) + Number(asteroidElem.getAttribute('r')),
                asteroidBulletX: Number(asteroidElem.getAttribute('cx')) - Number(bullet.attr('cx')),
                asteroidBulletY: Number(asteroidElem.getAttribute('cy')) - Number(bullet.attr('cy')),
                hasBulletHit: bullet.attr('has_hit')
            }))
                .filter(({ hitboxRange, asteroidBulletX, asteroidBulletY, hasBulletHit }) => ((asteroidBulletX >= -hitboxRange) && (asteroidBulletX <= hitboxRange)) &&
                ((asteroidBulletY >= -hitboxRange) && (asteroidBulletY <= hitboxRange)) &&
                (hasBulletHit == "false"))
                .subscribe(({ asteroidElem }) => {
                bullet.elem.remove();
                bullet.elem.setAttribute('has_hit', "true");
                const scoreCounter = document.getElementById('score');
                scoreCounter.textContent = (parseInt(scoreCounter.textContent) + 1).toString();
                Observable.interval(0)
                    .map(() => ({
                    levelCounter: document.getElementById('level'),
                    currentScore: parseInt(scoreCounter.textContent)
                }))
                    .filter(({ currentScore }) => currentScore % 20 == 0)
                    .subscribe(({ levelCounter }) => {
                    new Audio("next_level.mp3").play();
                    levelCounter.textContent = (parseInt(levelCounter.textContent) + 1).toString();
                    scoreCounter.textContent = (parseInt(scoreCounter.textContent) + 1).toString();
                    lowerSpeedLimit *= 1.2;
                    upperSpeedLimit *= 1.2;
                });
                asteroidCollision(asteroidElem);
            });
        })
            .subscribe(() => bullet.attr('cx', (10 * Math.cos(degToRad(Number(bullet.attr('angle')))) + Number(bullet.attr('cx'))))
            .attr('cy', (10 * Math.sin(degToRad(Number(bullet.attr('angle')))) + Number(bullet.attr('cy')))));
    }).subscribe(() => { });
    function asteroidCollision(asteroidParent) {
        const asteroidCollisionSound = new Audio("asteroid_explosion.mp3");
        asteroidCollisionSound.volume = 0.5;
        asteroidCollisionSound.play();
        if (asteroidParent.getAttribute('parent') != "true") {
            return asteroidParent.remove();
        }
        const parentX = asteroidParent.getAttribute("cx"), parentY = asteroidParent.getAttribute("cy"), childAsteroidTop = new Elem(svg, 'circle', a.elem)
            .attr('cx', String(parentX))
            .attr('cy', asteroidParent.getBoundingClientRect().top - 100)
            .attr('r', "15")
            .attr('parent', "false")
            .attr("style", "fill:none;stroke:#da0a0a;stroke-width:10"), childAsteroidRight = new Elem(svg, 'circle', a.elem)
            .attr('cx', asteroidParent.getBoundingClientRect().right - 20)
            .attr('cy', String(parentY))
            .attr('r', "15")
            .attr('parent', "false")
            .attr("style", "fill:none;stroke:#da0a0a;stroke-width:10"), childAsteroidLeft = new Elem(svg, 'circle', a.elem)
            .attr('cx', asteroidParent.getBoundingClientRect().left - 120)
            .attr('cy', String(parentY))
            .attr('r', "15")
            .attr('parent', "false")
            .attr("style", "fill:none;stroke:#da0a0a;stroke-width:10"), childAsteroidBottom = new Elem(svg, 'circle', a.elem)
            .attr('cx', String(parentX))
            .attr('cy', asteroidParent.getBoundingClientRect().bottom)
            .attr('r', "15")
            .attr('parent', "false")
            .attr("style", "fill:none;stroke:#da0a0a;stroke-width:10");
        createAsteroidObservable(childAsteroidTop, 1.5 * generateRandom(lowerSpeedLimit, upperSpeedLimit), 0);
        createAsteroidObservable(childAsteroidRight, 1.5 * generateRandom(lowerSpeedLimit, upperSpeedLimit), 90);
        createAsteroidObservable(childAsteroidLeft, 1.5 * generateRandom(lowerSpeedLimit, upperSpeedLimit), 270);
        createAsteroidObservable(childAsteroidBottom, 1.5 * generateRandom(lowerSpeedLimit, upperSpeedLimit), 180);
        asteroidParent.remove();
    }
    function createAsteroidObservable(asteroidChild, speed, angle) {
        Observable.interval(0)
            .takeUntil(Observable.interval(25000))
            .subscribe(() => {
            asteroidChild.attr('cx', (speed * Math.cos(degToRad(angle)) + Number(asteroidChild.attr('cx'))))
                .attr('cy', (speed * Math.sin(degToRad(angle)) + Number(asteroidChild.attr('cy'))));
        });
    }
    function createAsteroid(x, y) {
        const asteroid = new Elem(svg, 'circle', a.elem)
            .attr('cx', String(x))
            .attr('cy', String(y))
            .attr('r', "30")
            .attr('parent', "true")
            .attr("style", "fill:none;stroke:#da0a0a;stroke-width:10");
        return asteroid;
    }
    const asteroidObservable = Observable
        .interval(generateRandom(2000, 3000))
        .map(_ => ({ speed: generateRandom(lowerSpeedLimit, upperSpeedLimit), angle: generateRandom(0, 360) }));
    asteroidObservable
        .filter(({ angle }) => angle >= 0 && angle <= 90)
        .map(({ speed, angle }) => {
        const asteroid = createAsteroid(canvasLeft - 100, canvasBottom + 100);
        createAsteroidObservable(asteroid, speed, angle);
    })
        .subscribe((asteroid) => asteroid);
    asteroidObservable
        .filter(({ angle }) => angle > 90 && angle <= 180)
        .map(({ speed, angle }) => {
        const asteroid = createAsteroid(canvasLeft - 100, canvasTop - 50);
        createAsteroidObservable(asteroid, speed, angle);
    })
        .subscribe((asteroid) => asteroid);
    asteroidObservable
        .filter(({ angle }) => angle > 180 && angle <= 270)
        .map(({ speed, angle }) => {
        const asteroid = createAsteroid(canvasRight - 100, canvasTop - 100);
        createAsteroidObservable(asteroid, speed, angle);
    })
        .subscribe((asteroid) => asteroid);
    asteroidObservable
        .filter(({ angle }) => angle >= 270 && angle <= 360)
        .map(({ speed, angle }) => {
        const asteroid = createAsteroid(canvasRight, canvasBottom + 100);
        createAsteroidObservable(asteroid, speed, angle);
    })
        .subscribe((asteroid) => asteroid);
    Observable.interval(0)
        .map(() => {
        const ShipCollisionObserver = Observable.fromArray(Array.from(asteroidElements))
            .map((asteroidElem) => ({
            shipX: transformMatrix(g).m41,
            shipY: transformMatrix(g).m42,
            asteroidElem: asteroidElem,
            asteroidLeft: Number(asteroidElem.getAttribute('cx')) - Number(asteroidElem.getAttribute('r')),
            asteroidRight: Number(asteroidElem.getAttribute('cx')) + Number(asteroidElem.getAttribute('r')),
            asteroidTop: Number(asteroidElem.getAttribute('cy')) - Number(asteroidElem.getAttribute('r')),
            asteroidBottom: Number(asteroidElem.getAttribute('cy')) + Number(asteroidElem.getAttribute('r'))
        }))
            .filter(({ shipX, shipY, asteroidLeft, asteroidRight, asteroidTop, asteroidBottom }) => (shipX > asteroidLeft && shipX < asteroidRight && shipY > asteroidTop && shipY < asteroidBottom))
            .map((asteroidElem) => ({
            livesCounter: document.getElementById('life'),
            asteroidElem: asteroidElem.asteroidElem
        }));
        ShipCollisionObserver.filter(({ livesCounter }) => parseInt(livesCounter.textContent) > 1)
            .subscribe(({ livesCounter, asteroidElem }) => {
            new Audio("ship_explode.mp3").play();
            livesCounter.textContent = (parseInt(livesCounter.textContent) - 1).toString();
            asteroidElem.remove();
            g.attr("transform", "translate(" + 600 + " " + 300 + ")" + "rotate(" + 0 + ")");
        });
        ShipCollisionObserver.filter(({ livesCounter }) => parseInt(livesCounter.textContent) <= 1)
            .subscribe(({ livesCounter, asteroidElem }) => {
            new Audio("ship_explode.mp3").play();
            new Audio("gameover.mp3").play();
            ship.elem.remove();
            asteroidElem.remove();
            g.elem.remove();
            svg.remove();
            const scoreCounter = document.getElementById('score'), finalScore = scoreCounter.textContent;
            document.write("<body style=\"background-color: black\"></body>");
            document.write("<h1 style=\"color:red;font-size:50px;text-align:center\">YOU ARE DEAD</h1>");
            document.write("<h2 style=\"color:blue;font-size:30px;text-align:center\">YOUR FINAL LOUSY SCORE</h2>");
            document.write("<h2 style=\"color:blue;font-size:50px;text-align:center\">");
            document.write(finalScore);
            document.write("</h1>");
            document.write("<p align=\"center\"><button onClick=\"window.location.reload();\" type=\"button\" style=\"background-color:green;font-size:30px;margin-left:auto;margin-right:auto;display:block;\">Reset</button></p>");
            document.write("<img src=\"gameover.jpg\">");
        });
    }).subscribe(() => { });
    function ElementCleanerObserver(elements) {
        Observable.interval(0).map(() => {
            const AsteroidRemovalObserver = Observable.fromArray(Array.from(elements))
                .map((elements) => ({
                element: elements,
                elementX: parseInt(elements.getAttribute('cx')),
                elementY: parseInt(elements.getAttribute('cy'))
            }));
            AsteroidRemovalObserver.filter(({ elementX }) => (elementX < canvasLeft - 200)).subscribe(({ element }) => {
                element.remove();
            });
            AsteroidRemovalObserver.filter(({ elementX }) => (elementX > canvasRight + 200)).subscribe(({ element }) => {
                element.remove();
            });
            AsteroidRemovalObserver.filter(({ elementY }) => (elementY > canvasBottom + 200)).subscribe(({ element }) => {
                element.remove();
            });
            AsteroidRemovalObserver.filter(({ elementY }) => (elementY < canvasTop - 200)).subscribe(({ element }) => {
                element.remove();
            });
        }).subscribe(() => { });
    }
    ElementCleanerObserver(asteroidElements);
    ElementCleanerObserver(bulletElements);
}
function start() {
    asteroids();
}
//# sourceMappingURL=asteroids.js.map