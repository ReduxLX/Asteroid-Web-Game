"use strict";
function piApproximation() {
    const resultInPage = document.getElementById("value_piApproximation");
    if (!resultInPage) {
        console.log("Not on the challenge.html page");
        return;
    }
    const pseudoRandomNum = (seed) => (prime1, prime2) => (v) => ((((prime1 * v) + seed) % prime2) - (prime2 / 2)) / (prime2 / 2);
    const randomNum1 = pseudoRandomNum(1)(1262099, 77237);
    const randomNum2 = pseudoRandomNum(1)(1246499, 77237);
    const inCircle = ({ x, y }) => (x * x) + (y * y) <= 1;
    function createDot(x, y, colour) {
        const canvas = document.getElementById("piApproximationVis");
        if (!canvas)
            throw "Couldn't get canvas element!";
        const dot = document.createElementNS(canvas.namespaceURI, "circle");
        dot.setAttribute("cx", x.toString());
        dot.setAttribute("cy", y.toString());
        dot.setAttribute("r", "10");
        dot.setAttribute("fill", colour);
        canvas.appendChild(dot);
    }
    const numberPairObservable = Observable
        .interval(1000)
        .map(v => Math.floor(v / 100))
        .map(v => ({ x: randomNum1(v), y: randomNum2(v) }));
    numberPairObservable
        .map(inCircle)
        .scan([0, 0], ([i, t], e) => e ? [i + 1, t + 1] : [i, t + 1])
        .map(([inside, total]) => inside / total)
        .map(e => e * 4)
        .subscribe(e => {
        resultInPage.textContent = e.toString();
    });
    numberPairObservable
        .filter(({ x, y }) => inCircle({ x, y }))
        .subscribe(e => createDot(150 + e.x * 150, 150 + e.y * 150, "red"));
    numberPairObservable
        .filter(({ x, y }) => !inCircle({ x, y }))
        .subscribe(e => createDot(150 + e.x * 150, 150 + e.y * 150, "green"));
}
function mousePosEvents() {
    const pos = document.getElementById("pos");
    document.addEventListener("mousemove", ({ clientX, clientY }) => {
        const p = clientX + ', ' + clientY;
        pos.innerHTML = p;
        if (clientX > 400) {
            pos.classList.add('highlight');
        }
        else {
            pos.classList.remove('highlight');
        }
    });
    document.addEventListener("mousemove", e => {
        const p = e.clientX + ', ' + e.clientY;
        pos.innerHTML = p;
        if (e.clientX > 400) {
            pos.classList.add('highlight');
        }
        else {
            pos.classList.remove('highlight');
        }
    });
}
function mousePosObservable() {
    const pos = document.getElementById("pos"), o = Observable
        .fromEvent(document, "mousemove")
        .map(({ clientX, clientY }) => ({ x: clientX, y: clientY }));
    o.map(({ x, y }) => `${x},${y}`)
        .subscribe(s => pos.innerHTML = s);
    o.filter(({ x }) => x > 400)
        .subscribe(_ => pos.classList.add('highlight'));
    o.filter(({ x }) => x <= 400)
        .subscribe(_ => pos.classList.remove('highlight'));
}
function animatedRectTimer() {
    const svg = document.getElementById("animatedRect");
    let rect = new Elem(svg, 'rect')
        .attr('x', 100).attr('y', 70)
        .attr('width', 120).attr('height', 80)
        .attr('fill', '#95B3D7');
    const animate = setInterval(() => rect.attr('x', 1 + Number(rect.attr('x'))), 10);
    const timer = setInterval(() => {
        clearInterval(animate);
        clearInterval(timer);
    }, 1000);
}
function animatedRect() {
    const svg = document.getElementById("animatedRect");
    let rect = new Elem(svg, 'rect')
        .attr('x', 100).attr('y', 70)
        .attr('width', 120).attr('height', 80)
        .attr('fill', '#95B3D7');
    Observable.interval(10)
        .takeUntil(Observable.interval(1000))
        .subscribe(() => rect.attr('x', 1 + Number(rect.attr('x'))));
}
function dragRectEvents() {
    const svg = document.getElementById("dragRect"), { left, top } = svg.getBoundingClientRect();
    const rect = new Elem(svg, 'rect')
        .attr('x', 100).attr('y', 70)
        .attr('width', 120).attr('height', 80)
        .attr('fill', '#95B3D7');
    rect.elem.addEventListener('mousedown', ((e) => {
        const xOffset = Number(rect.attr('x')) - e.clientX, yOffset = Number(rect.attr('y')) - e.clientY, moveListener = (e) => {
            rect
                .attr('x', e.clientX + xOffset)
                .attr('y', e.clientY + yOffset);
        }, done = () => {
            svg.removeEventListener('mousemove', moveListener);
        };
        svg.addEventListener('mousemove', moveListener);
        svg.addEventListener('mouseup', done);
        svg.addEventListener('mouseout', done);
    }));
}
function dragRectObservable() {
    const svg = document.getElementById("dragRect"), mousemove = Observable.fromEvent(svg, 'mousemove'), mouseup = Observable.fromEvent(svg, 'mouseup'), rect = new Elem(svg, 'rect')
        .attr('x', 100).attr('y', 70)
        .attr('width', 120).attr('height', 80)
        .attr('fill', '#95B3D7');
    rect.observe('mousedown')
        .map(({ clientX, clientY }) => ({ xOffset: Number(rect.attr('x')) - clientX,
        yOffset: Number(rect.attr('y')) - clientY }))
        .flatMap(({ xOffset, yOffset }) => mousemove
        .takeUntil(mouseup)
        .map(({ clientX, clientY }) => ({ x: clientX + xOffset, y: clientY + yOffset })))
        .subscribe(({ x, y }) => rect.attr('x', x)
        .attr('y', y));
}
function drawRectsEvents() {
    const svg = document.getElementById("drawRects");
    svg.addEventListener('mousedown', e => {
        const svgRect = svg.getBoundingClientRect(), x0 = e.clientX - svgRect.left, y0 = e.clientY - svgRect.top, rect = new Elem(svg, 'rect')
            .attr('x', String(x0))
            .attr('y', String(y0))
            .attr('width', '5')
            .attr('height', '5')
            .attr('fill', '#95B3D7');
        function moveListener(e) {
            const x1 = e.clientX - svgRect.left, y1 = e.clientY - svgRect.top, left = Math.min(x0, x1), top = Math.min(y0, y1), width = Math.abs(x0 - x1), height = Math.abs(y0 - y1);
            rect.attr('x', String(left))
                .attr('y', String(top))
                .attr('width', String(width))
                .attr('height', String(height));
        }
        function cleanup() {
            svg.removeEventListener('mousemove', moveListener);
            svg.removeEventListener('mouseup', cleanup);
        }
        svg.addEventListener('mouseup', cleanup);
        svg.addEventListener('mousemove', moveListener);
    });
}
function drawRectsObservable() {
    const svg = document.getElementById("drawRects"), mousemove = Observable.fromEvent(svg, 'mousemove'), mouseup = Observable.fromEvent(svg, 'mouseup');
    Observable.fromEvent(svg, 'mousedown')
        .map(({ clientX, clientY }) => {
        const svgRect = svg.getBoundingClientRect(), x0 = clientX - svgRect.left, y0 = clientY - svgRect.top;
        return {
            svgRect: svgRect,
            x0: x0,
            y0: y0,
            rect: new Elem(svg, 'rect')
                .attr('x', String(x0))
                .attr('y', String(y0))
                .attr('width', '5')
                .attr('height', '5')
                .attr('fill', '#95B3D7')
        };
    })
        .flatMap(({ svgRect, x0, y0, rect }) => mousemove
        .takeUntil(mouseup)
        .map(({ clientX, clientY }) => {
        const x1 = clientX - svgRect.left, y1 = clientY - svgRect.top;
        return {
            left: Math.min(x0, x1),
            top: Math.min(y0, y1),
            width: Math.abs(x0 - x1),
            height: Math.abs(y0 - y1),
            rect: rect
        };
    }))
        .subscribe(({ left, top, width, height, rect }) => rect.attr('x', String(left))
        .attr('y', String(top))
        .attr('width', String(width))
        .attr('height', String(height)));
}
function stopPropagation(e) {
    e.stopPropagation();
    return e;
}
function drawAndDragRectsObservable() {
    function dragRefactor(svg) {
        return ({ rect }) => {
            const mousemove = Observable.fromEvent(svg, 'mousemove'), mouseup = Observable.fromEvent(svg, 'mouseup');
            return rect
                .observe('mousedown')
                .map((event) => stopPropagation(event))
                .map(({ clientX, clientY }) => ({
                xOffset: Number(rect.attr('x')) - clientX,
                yOffset: Number(rect.attr('y')) - clientY
            }))
                .flatMap(({ xOffset, yOffset }) => mousemove
                .takeUntil(mouseup)
                .map(({ clientX, clientY }) => {
                const x = clientX + xOffset, y = clientY + yOffset;
                return {
                    rect: rect.attr('x', x).attr('y', y)
                };
            }));
        };
    }
    function drawRefactor(svg) {
        const mousemove = Observable.fromEvent(svg, 'mousemove'), mouseup = Observable.fromEvent(svg, 'mouseup');
        return Observable.fromEvent(svg, 'mousedown')
            .map((event) => {
            const svgRect = svg.getBoundingClientRect(), x0 = event.clientX - svgRect.left, y0 = event.clientY - svgRect.top;
            return {
                svgRect: svgRect,
                x0: x0,
                y0: y0,
                rect: new Elem(svg, 'rect')
                    .attr('x', String(x0))
                    .attr('y', String(y0))
                    .attr('width', '5')
                    .attr('height', '5')
                    .attr('fill', '#95B3D7')
            };
        }).flatMap(({ svgRect, x0, y0, rect }) => mousemove
            .takeUntil(mouseup)
            .map(({ clientX, clientY }) => {
            const x1 = clientX - svgRect.left, y1 = clientY - svgRect.top, left = Math.min(x0, x1), top = Math.min(y0, y1), width = Math.abs(x0 - x1), height = Math.abs(y0 - y1);
            return {
                rect: rect.attr('x', String(left))
                    .attr('y', String(top))
                    .attr('width', String(width))
                    .attr('height', String(height))
            };
        }));
    }
    const svg = document.getElementById("drawAndDragRects");
    drawRefactor(svg).map(dragRefactor(svg)).subscribe(observable => observable.subscribe(_ => _));
}
if (typeof window != 'undefined')
    window.onload = () => {
        piApproximation();
        mousePosObservable();
        animatedRect();
        dragRectObservable();
        drawRectsObservable();
        drawAndDragRectsObservable();
    };
//# sourceMappingURL=observableexamples.js.map