/** FIT 2102 [Assignment 1]
 * Implementation of the classic retro game Asteroids using Observable streams
 * @author Alfons Fernaldy
 * @student_id 30127831
 * @date_created 6 September 2019
 * @last_modified 13 September 2019
 */
//================================================================================
//                               { IMPORTANT }
//          I have provided a video showcasing gameplay on my laptop 
//                      (asteroid_gameplay_demo.mp4)
//                Just in case the game performance is bad
//          Alternatively please try and switch to direct movement
//   Further instructions are provided in the THRUST SHIP MOVEMENT SECTION
//================================================================================ 

//================================================================================
//                                REFERENCES
//================================================================================ 
// FIT2102 2019 Assignment 1
// https://docs.google.com/document/d/1Gr-M6LTU-tfm4yabqZWJYg-zTjEVqHKKTCvePGCYsUA/edit?usp=sharing
// All HTML Audio files used are all provided by:
// https://www.zapsplat.com/
// Game Over song obtained from the 1995 computer game Total Distortion developed by Pop Rocket

//================================================================================
//                     SIDE EFFECTS AND FUNCTION PURITY
/**
 * In Programming, side effects are the modification of some kind of state 
 * This includes things such as:
 *  1.) Changing variable values
 *  2.) HTML Element interactions
 *  3.) Writing data on to disk
 * Functions that have code with side effects are impure while the opposite is true
 * for pure functions (no side effects)
 * 
 * Most functions & observables have side effects as most of them handle with
 * modifying values of Elements, deleting elements, etc..
 * so I would only identify small pure functions that I use
 * [PURE] FUNCTION Shall be the label for small pure functions
 */ 
//================================================================================ 

function asteroids() {
  const svg = document.getElementById("canvas")!,
        canvasTop = svg.getBoundingClientRect().top,
        canvasBottom = svg.getBoundingClientRect().bottom,
        canvasRight = svg.getBoundingClientRect().right,
        canvasLeft = svg.getBoundingClientRect().left;

  // Create a group to hold the spaceship including a transform to move & rotate it
  // Updating the transform property animates the spaceship's movement
  
  const g = new Elem(svg,'g')
    .attr("transform","translate(600 300)")

  // I had to make 2 group for all asteroids and bullets both with tag 'g'
  const a = new Elem(svg, 'g')
  const b = new Elem(svg, 'g')
  
  // Create a polygon shape for the space ship as a child of the transform group
  const ship = new Elem(svg, 'polygon', g.elem)
    .attr("points","-15,20 15,20 0,-20")
    .attr("style","fill:purple;stroke:white;stroke-width:3")
    .attr("accelerationX", 0)
    .attr("accelerationY", 0)
  
  // Asteroid HTMLCollection reference variables (declared here for convenience)
  const
    gGroup = svg.getElementsByTagName('g'),             // This will also have the ship elements and must be filtered to access just one
    asteroidElementGroup = <SVGElement>gGroup.item(1),  // This will get the second html grouping which contains asteroid elements
    bulletElementGroup = <SVGElement>gGroup.item(2),    // This will get the third html grouping which contains bullet elements
  // Returns a reference to the HTMLCollection which is like an array storing our asteroid and bullet elements on screen
    asteroidElements = asteroidElementGroup.children,   
    bulletElements = bulletElementGroup.children
  
  // Global Speed Modifier [ DIFFICULTY ]
  let
    lowerSpeedLimit = 0.2, // Lowest speed generated
    upperSpeedLimit = 0.4  // Highest speed generated

  // [PURE] FUNCTION: Perform Calculations and return result
  // Functions to convert radians to degrees and vice versa
  const radToDeg = (rad:number) => rad * 180 / Math.PI + 90;
  const degToRad = (deg:number) => (deg-90) * (Math.PI /180);
  
  /**[PURE] FUNCTION: Perform Calculations and return result
   * Generate a random number between low-high range
   * @param {number} low The lower boundary
   * @param {number} angle The higher boundary
   * @return {number} Generated random number
   */
  function generateRandom(low:number, high:number): number{return (Math.random() * (high-low)) + low}

  // Function that gets the current transform property of the given Elem
  const transformMatrix = 
    (e:Elem) => new WebKitCSSMatrix(window.getComputedStyle(e.elem).webkitTransform)

//================================================================================
//                     ROTATING THE SHIP [Relative to Mouse]
//================================================================================  

  // Subscribe mousemove event on the svg canvas
  // Every mousemove event, we want to fire the observable
  // in order to rotate the ship to face the mouse cursor
  Observable.fromEvent<MouseEvent>(svg, "mousemove")
    // Calculate current pointer position relative to the canvas
    .map(({clientX, clientY}) => ({
      lookx: clientX - canvasLeft,
      looky: clientY - canvasTop,
      x: transformMatrix(g).m41, // m41 is transformX in the Webkit CSS Matrix
      y: transformMatrix(g).m42  // m42 is transformY in the Webkit CSS Matrix
    }))
    // Update our g group attr using our calculated x & y values
    .map(({lookx, looky, x, y}) => 
      g.attr("transform",
        "translate(" + x.toPrecision(8).substring(0, 7) + " " + y.toPrecision(8).substring(0, 7) + ")" +
        "rotate(" +  
        (radToDeg(Math.atan2(looky - y, lookx - x))).toPrecision(7)
        + ")"))
    .subscribe((g) => console.log("Ship (x,y): "+transformMatrix(g).m41+", "+transformMatrix(g).m42));

 //================================================================================
 //                     DIRECT SHIP MOVEMENT [Q Key Code: 81]
 //                   READ DISCLAIMER UNDER THRUST SHIP MOVEMENT
 //================================================================================

  // /**[PURE] FUNCTION (degToRad(angle) is also pure)
  //  * Calculates next X value position based on current value and angle of direction
  //  * @param {number} currentX The current X position
  //  * @param {number} angle The direction (angle) to move on the X plane
  //  * @return {string} The next X value position
  //  */
  // function moveX(currentX:number, angle:number): string{
  //   return ((10*Math.cos(degToRad(angle)) + currentX).toPrecision(8).substring(0,7))
  // }

  // /**[PURE] FUNCTION (degToRad(angle) is also pure)
  //  * Calculates next Y value position based on current value and angle of direction
  //  * @param {number} currentY The current Y position
  //  * @param {number} angle The direction (angle) to move on the Y plane
  //  * @return {string} The next Y value position
  //  */
  // function moveY(currentY:number, angle:number): string{
  //   return ((10*Math.sin(degToRad(angle)) + currentY).toPrecision(8).substring(0,7))
  // }

  // /**FUNCTION
  //  * Observable function which handles ship movement and ship wrapping
  //  * @param {number} keyTrigger The key code for the key which when pressed will trigger the Mouse observable
  //  * @return {void}
  //  */
  // function MouseMoveObservable(keyTrigger:number): void
  // {
  //   const MouseMoveObservable = Observable.fromEvent<KeyboardEvent>(document, 'keydown')
  //   // Filter for keypress codes that match the keyTrigger parameter
  //   .filter(({keyCode}) => (keyCode == keyTrigger))
  //   // Map calculates and passes an object containing: ship's current X & Y values as well as its angle
  //   .map(() => ({
  //     shipX: transformMatrix(g).m41,
  //     shipY: transformMatrix(g).m42,
  //     angle: Number(g.attr("transform").substring(33, 39))
  //     }))
  //   // I've created 5 observable branches to handle 5 move scenarios:
  //   // |- Ship's X position is lesser than left canvas boundary therefore wrapping the ship to the right canvas boundary
  //   // |- Ship's X position is greater than right canvas boundary therefore wrapping the ship to the left canvas boundary
  //   // |- Ship's Y position is lesser than top canvas boundary therefore wrapping the ship to the bottom canvas boundary
  //   // |- Ship's Y position is greater than bottom canvas boundary therefore wrapping the ship to the top canvas boundary
  //   // |- Ship's X & Y position are nowhere near the boundaries so no wrapping is required
  //   MouseMoveObservable
  //   .filter(({shipX})=> (shipX <= -35))
  //   .subscribe(({shipY, angle})=>
  //   g.attr("transform","translate(" + moveX(canvasRight+35, angle) + " " + moveY(shipY, angle) + ")" +"rotate(" + angle.toPrecision(7)+ ")"))
  //   MouseMoveObservable
  //   .filter(({shipX})=> (shipX >= canvasRight+35))
  //   .subscribe(({shipY, angle})=>
  //   g.attr("transform","translate(" + moveX(-35, angle) + " " + moveY(shipY, angle) + ")" +"rotate(" + angle.toPrecision(7)+ ")"))
  //   MouseMoveObservable
  //   .filter(({shipY})=> (shipY <= -35))
  //   .subscribe(({shipX, angle})=>
  //   g.attr("transform","translate(" + moveX(shipX, angle) + " " + moveY(canvasBottom+35, angle) + ")" +"rotate(" + angle.toPrecision(7)+ ")"))
  //   MouseMoveObservable
  //   .filter(({shipY})=> (shipY >= canvasBottom+35))
  //   .subscribe(({shipX, angle})=>
  //   g.attr("transform","translate(" + moveX(shipX, angle) + " " + moveY(-35, angle) + ")" +"rotate(" + angle.toPrecision(7)+ ")"))
  //   MouseMoveObservable
  //   .subscribe(({shipX, shipY, angle})=>
  //   g.attr("transform","translate(" + moveX(shipX, angle) + " " + moveY(shipY, angle) + ")" +"rotate(" + angle.toPrecision(7)+ ")"))
  // }
  // // Call the MouseMoveObservable function and pass in keycode 81 [Q] as the designated move key
  // // Placing the observable in the function also allows me to easily map the ship move button easily to other keys
  // MouseMoveObservable(81)

 //================================================================================
 //                     THRUST SHIP MOVEMENT [Q Key Code: 81]
 //    DISCLAIMER: IF GAMEPLAY BECOMES TOO LAGGY, PLEASE TRY AND SWITCH TO 
 //       DIRECT SHIP MOVEMENT BY COMMENTING THE WHOLE BLOCK JUST BEFORE
 //  "FIRING BULLETS + BULLET-ASTEROID DETECTION" AND THEN UNCOMMENTING THE ABOVE BLOCK
 //================================================================================
  /**[PURE] FUNCTION: Perform Calculations and return result
   * Calculates X acceleration based on the angle of direction
   * @param {number} angle The direction (angle) to move on the X plane
   * @return {string} The value to be assigned to accelerationX (X direction of thrust)
   */
  function accX(angle:number): string{
    return (2*Math.cos(degToRad(angle))).toPrecision(8).substring(0,7)
  }
  /**[PURE] FUNCTION: Perform Calculations and return result
   * Calculates Y value position based on the angle of direction
   * @param {number} angle The direction (angle) to move on the Y plane
   * @return {string} The value to be assigned to accelerationY (Y direction of thrust)
   */
  function accY(angle:number): string{
    return (2*Math.sin(degToRad(angle))).toPrecision(8).substring(0,7)
  }
  /**[PURE] FUNCTION: Perform Calculations and return result
   * Calculates next X value position based on current value and angle of direction
   * @param {number} shipX The ship's X coordinate
   * @param {number} shipAccX The ship's Acceleration X value
   * @return {string} The next X position value
   */
  function moveX(shipX:number, shipAccX:number): string{
    return (shipX + shipAccX).toPrecision(8).substring(0,7)
  }
  /**[PURE] FUNCTION: Perform Calculations and return result
   * Calculates next Y value position based on current value and angle of direction
   * @param {number} shipX The ship's Y coordinate
   * @param {number} shipAccX The ship's Acceleration Y value
   * @return {string} The next Y position value
   */
  function moveY(shipY:number, shipAccY:number): string{
    return (shipY + shipAccY).toPrecision(8).substring(0,7)
  }
  // Subscribe for keyboard event on the svg canvas
  // This observable triggers when [Q] key is pressed
  // It sets the ship's acceleration attributes based on the angle of the ship
  Observable.fromEvent<KeyboardEvent>(document, 'keydown')
  .filter(({keyCode}) => (keyCode == 81))
  .map(()=>({
    angle: Number(g.attr("transform").substring(33, 39))
  }))
  .subscribe(({angle})=>{
    ship.elem.setAttribute("accelerationX", accX(angle))
    ship.elem.setAttribute("accelerationY", accY(angle))
  }
  )
  // This observable stream fires as fast as possible indefinitely
  // It simulates the thrust of the ship by always animating the ship
  // so a ship with non-zero acceleration will keep moving (as it should in the void of space)
  const MouseMoveObservable = Observable.interval(0)
    // Map calculates and passes an object containing: ship's current X & Y values, its X & Y acceleration and its angle
    .map(()=>({
      shipX: transformMatrix(g).m41,
      shipY: transformMatrix(g).m42,
      shipAccX: parseInt(<string>ship.elem.getAttribute("accelerationX")),
      shipAccY: parseInt(<string>ship.elem.getAttribute("accelerationY")),
      angle: Number(g.attr("transform").substring(33, 39))
    }))
  //   // I've created 5 observable branches to handle 5 move scenarios:
  //   // |- Ship's X position is lesser than left canvas boundary therefore wrapping the ship to the right canvas boundary
  //   // |- Ship's X position is greater than right canvas boundary therefore wrapping the ship to the left canvas boundary
  //   // |- Ship's Y position is lesser than top canvas boundary therefore wrapping the ship to the bottom canvas boundary
  //   // |- Ship's Y position is greater than bottom canvas boundary therefore wrapping the ship to the top canvas boundary
  //   // |- Ship's X & Y position are nowhere near the boundaries so no wrapping is required
    MouseMoveObservable
    .filter(({shipX})=> (shipX <= -35))
    .subscribe(({shipY, shipAccX, shipAccY, angle})=>
    g.attr("transform","translate(" + moveX(canvasRight+35, shipAccX) + " " + moveY(shipY, shipAccY) + ")" +"rotate(" + angle.toPrecision(7)+ ")"))
    MouseMoveObservable
    .filter(({shipX})=> (shipX >= canvasRight+35))
    .subscribe(({shipY, shipAccX, shipAccY, angle})=>
    g.attr("transform","translate(" + moveX(-35, shipAccX) + " " + moveY(shipY, shipAccY) + ")" +"rotate(" + angle.toPrecision(7)+ ")"))
    MouseMoveObservable
    .filter(({shipY})=> (shipY <= -35))
    .subscribe(({shipX, shipAccX, shipAccY, angle})=>
    g.attr("transform","translate(" + moveX(shipX, shipAccX) + " " + moveY(canvasBottom+35, shipAccY) + ")" +"rotate(" + angle.toPrecision(7)+ ")"))
    MouseMoveObservable
    .filter(({shipY})=> (shipY >= canvasBottom+35))
    .subscribe(({shipX, shipAccX, shipAccY, angle})=>
    g.attr("transform","translate(" + moveX(shipX, shipAccX) + " " + moveY(-35, shipAccY) + ")" +"rotate(" + angle.toPrecision(7)+ ")"))
    MouseMoveObservable
    .subscribe(({shipX, shipY, shipAccX, shipAccY, angle})=>
    g.attr("transform","translate(" + moveX(shipX, shipAccX) + " " + moveY(shipY, shipAccY) + ")" +"rotate(" + angle.toPrecision(7)+ ")"))

 //================================================================================
 //               FIRING BULLETS + BULLET-ASTEROID DETECTION
 //================================================================================
   // Subscribe for mousedown event on the svg canvas
   // Triggers when mouse is pressed (either Right/Left Click)
  Observable.fromEvent<KeyboardEvent>(svg, 'mousedown')
  .map(() => {
    const
    // Create the bullet element in the ship center
      bullet = new Elem(svg, 'circle', b.elem)
      .attr('cx', String(transformMatrix(g).m41)) // Set cx as the Ship's x
      .attr('cy', String(transformMatrix(g).m42)) // Set cy as the Ship's y
      .attr('r', "3")
      .attr('fill', '#FFFFFF')
      .attr('has_hit', "false")
      .attr('angle', String(g.attr("transform").substring(33, 39))),
      // Play a sound effect for firing bullet
      shootSound = new Audio("shoot.mp3")
      shootSound.volume = 0.3
      shootSound.play()
    // Every bullet gets an observable stream which fires as fast as possible
    Observable.interval(0)
      // Terminates the bullet observer after 2 seconds
      .takeUntil(Observable.interval(2000))
      .map(()=>{
        // Every asteroid element on the screen gets an observable stream
        // All active bullet's (x,y) are checked with all asteroid's (x,y)
        // fromArray will return every asteroid element
        Observable.fromArray(Array.from(asteroidElements))
        .map((asteroidElem)=>({
          // hitboxRange: area where a collision between a bullet and asteroid should occur AND
          // asteroidBulletX/Y: X and Y distance between asteroid & bullet's cx/cy
          asteroidElem: asteroidElem,
          hitboxRange: Number(bullet.attr('r')) + Number(asteroidElem.getAttribute('r')),
          asteroidBulletX: Number(asteroidElem.getAttribute('cx')) - Number(bullet.attr('cx')),
          asteroidBulletY: Number(asteroidElem.getAttribute('cy')) - Number(bullet.attr('cy')),
          hasBulletHit: bullet.attr('has_hit')
        }))
        // filter for bullets that are within the asteroid by comparing asteroidBulletX/Y and hitboxRange
        .filter(({hitboxRange, asteroidBulletX, asteroidBulletY, hasBulletHit})=> 
        ((asteroidBulletX >= -hitboxRange) && (asteroidBulletX <= hitboxRange)) &&
        ((asteroidBulletY >= -hitboxRange) && (asteroidBulletY <= hitboxRange)) &&
        (hasBulletHit == "false"))
        // Remove the bullet and (Replace asteroid with 4 child asteroids or Remove child asteroid)
        .subscribe(({asteroidElem})=>{
        bullet.elem.remove()
        bullet.elem.setAttribute('has_hit', "true")
        // Increment score counter
        const
        scoreCounter = <HTMLElement>document.getElementById('score')
        scoreCounter.textContent = (parseInt(<string>scoreCounter.textContent) + 1).toString()
        // Create an observer to handle level ups every 20 scores
        Observable.interval(0)
        .map(()=>({
          levelCounter: <HTMLElement>document.getElementById('level'),
          currentScore: parseInt(<string>scoreCounter.textContent)
        }))
        .filter(({currentScore}) => currentScore % 20 == 0)
        // Levelling up increases the asteroid speed limit making newly generated asteroids faster
        .subscribe(({levelCounter}) => {
        new Audio("next_level.mp3").play()
        levelCounter.textContent = (parseInt(<string>levelCounter.textContent) + 1).toString()
        scoreCounter.textContent = (parseInt(<string>scoreCounter.textContent) + 1).toString()
        lowerSpeedLimit *= 1.2 // Asteroids are 20% faster
        upperSpeedLimit *= 1.2
        })
        // Call function to handle bullet-asteroid collision and pass in the relevent asteroid element   
        asteroidCollision(asteroidElem);
      }
        )
      })
      // Simulating each bullet's motion based on the angle the ship is facing when bullet is fired
      .subscribe(() =>
      bullet.attr('cx', (10*Math.cos(degToRad(Number(bullet.attr('angle')))) + Number(bullet.attr('cx'))))
            .attr('cy', (10*Math.sin(degToRad(Number(bullet.attr('angle')))) + Number(bullet.attr('cy'))))
      );
  }).subscribe(()=>{})
  

 //================================================================================
 //         GENERATING PARENT ASTEROIDS + DETECTING ASTEROID COLLISIONS
 //================================================================================
  /**FUNCTION
 * Observable function which handles both parent & child asteroid's bullet collisions
 * @param {Element} asteroidParent The asteroid element involved in the collision
 * @return {void}
 */
 function asteroidCollision(asteroidParent: Element): void{
  const
  asteroidCollisionSound = new Audio("asteroid_explosion.mp3")
  asteroidCollisionSound.volume = 0.5
  asteroidCollisionSound.play()
  // If asteroidParent is a child asteroid, then we want to just remove it
  // This is because child asteroids would just disappear if shot unlike parent asteroids
  if(asteroidParent.getAttribute('parent') != "true") {return asteroidParent.remove()}
    const
    parentX = asteroidParent.getAttribute("cx"),
    parentY = asteroidParent.getAttribute("cy"),
    // Create 4 child asteroids and place them on the top, bottom, left and right of the parent asteroid
    childAsteroidTop = new Elem(svg, 'circle', a.elem)
    .attr('cx', String(parentX)) 
    .attr('cy', asteroidParent.getBoundingClientRect().top-100)
    .attr('r', "15")
    .attr('parent', "false")
    .attr("style","fill:none;stroke:#da0a0a;stroke-width:10"),
    childAsteroidRight = new Elem(svg, 'circle', a.elem)
    .attr('cx', asteroidParent.getBoundingClientRect().right-20) 
    .attr('cy', String(parentY))
    .attr('r', "15")
    .attr('parent', "false")
    .attr("style","fill:none;stroke:#da0a0a;stroke-width:10"),
    childAsteroidLeft = new Elem(svg, 'circle', a.elem)
    .attr('cx', asteroidParent.getBoundingClientRect().left-120) 
    .attr('cy', String(parentY)) 
    .attr('r', "15")
    .attr('parent', "false")
    .attr("style","fill:none;stroke:#da0a0a;stroke-width:10"),
    childAsteroidBottom = new Elem(svg, 'circle', a.elem)
    .attr('cx', String(parentX)) 
    .attr('cy', asteroidParent.getBoundingClientRect().bottom)
    .attr('r', "15")
    .attr('parent', "false")
    .attr("style","fill:none;stroke:#da0a0a;stroke-width:10")
    // Pass the 4 child asteroid elements into function createAsteroidObservable
    // I've also defined each asteroid to move in an angle which best suits their position
    // so top child asteroid will move up, left child asteroid moves left and so on
    // Children asteroids are also meant to be faster than their parents therefore they get a 50% speed boost
    createAsteroidObservable(childAsteroidTop, 1.5*generateRandom(lowerSpeedLimit, upperSpeedLimit), 0)
    createAsteroidObservable(childAsteroidRight, 1.5*generateRandom(lowerSpeedLimit, upperSpeedLimit), 90)
    createAsteroidObservable(childAsteroidLeft, 1.5*generateRandom(lowerSpeedLimit, upperSpeedLimit), 270)
    createAsteroidObservable(childAsteroidBottom, 1.5*generateRandom(lowerSpeedLimit, upperSpeedLimit), 180)
    asteroidParent.remove()
}

/**FUNCTION
 * Observable function which assigns an observable to the passed in asteroid element so they can move
 * @param {Elem} asteroidParent The asteroid element to be assigned an observable
 * @param {number} speed The speed we want the asteroid element to move
 * @param {number} angle The direction we want the asteroid element to move
 * @return {void}
 */
function createAsteroidObservable(asteroidChild: Elem, speed:number, angle:number): void{
  // Observer fires as soon as possible
  Observable.interval(0)
    // Terminates after 25 seconds
    .takeUntil(Observable.interval(25000))
    // Move the asteroid as per speed and angle parameter
    .subscribe(()=>{
      asteroidChild.attr('cx', (speed*Math.cos(degToRad(angle)) + Number(asteroidChild.attr('cx'))))
          .attr('cy', (speed*Math.sin(degToRad(angle)) + Number(asteroidChild.attr('cy'))))
    }
  )
}
/**[PURE] FUNCTION : Just creates and returns an Elem
 * There should theoretically be no side effects
 * Observable function which creates and returns a new asteroid object
 * @param {number} x The x coordinate to spawn the asteroid
 * @param {number} y The y coordinate to spawn the asteroid
 * @param {number} angle The direction we want the asteroid element to move
 * @return {Elem}
 */
function createAsteroid(x:number, y:number): Elem{
  const
    asteroid = new Elem(svg, 'circle', a.elem)
    .attr('cx', String(x)) //transformMatrix(g).m41 gets the x coordinate of the center
    .attr('cy', String(y)) //transformMatrix(g).m42 gets the y coordinate of the center
    .attr('r', "30")
    .attr('parent', "true")
    .attr("style","fill:none;stroke:#da0a0a;stroke-width:10")
  return asteroid
}
 // Observable responsible for the generation of parent asteroids
const asteroidObservable = Observable
  .interval(generateRandom(2000, 3000))  // Observable fires every 0.5 - 1 second
  // speed: generate parent asteroid's speed based on lower/upperSpeedLimit
  // angle: generate parent asteroid's angle (0-360 deg)
  .map(_ => ({speed:generateRandom(lowerSpeedLimit, upperSpeedLimit), angle:generateRandom(0, 360)}))
  // Determine the best starting position based on the generated angle of the asteroid
  // I've created 4 observable branches to determine the best starting position based on the generated angle of the asteroid:
  //  |- Generated angle is between    0 - 90 deg, create the asteroid outside the bottom-left canvas boundary
  //  |- Generated angle is between  90 - 180 deg, create the asteroid outside the top-left canvas boundary
  //  |- Generated angle is between 180 - 270 deg, create the asteroid outside the top-right canvas boundary
  //  |- Generated angle is between 270 - 360 deg, create the asteroid outside the bottom-right canvas boundary
  asteroidObservable    
  .filter(({angle}) => angle >= 0 && angle <= 90)                   
  .map(({speed, angle}) => {
    const asteroid = createAsteroid(canvasLeft-100, canvasBottom+100) // Create new asteroid elem based on x/y arguments
    createAsteroidObservable(asteroid, speed, angle) // Create an Observable to move the asteroids
  })
  .subscribe((asteroid) => asteroid);

  asteroidObservable    
  .filter(({angle}) => angle > 90 && angle <= 180)                   
  .map(({speed, angle}) => {
    const asteroid = createAsteroid(canvasLeft-100, canvasTop-50)
    createAsteroidObservable(asteroid, speed, angle)
  })
  .subscribe((asteroid) => asteroid);

  asteroidObservable    
  .filter(({angle}) => angle > 180 && angle <= 270)                   
  .map(({speed, angle}) => {
    const asteroid = createAsteroid(canvasRight-100, canvasTop-100)
    createAsteroidObservable(asteroid, speed, angle)
  })
  .subscribe((asteroid) => asteroid);

  asteroidObservable    
  .filter(({angle}) => angle >= 270 && angle <= 360)                   
  .map(({speed, angle}) => {
    const asteroid = createAsteroid(canvasRight, canvasBottom+100)
    createAsteroidObservable(asteroid, speed, angle)
  })
  .subscribe((asteroid) => asteroid);
 //================================================================================
 //                               SHIP HIT DETECTION
 //================================================================================
 // Create an Observer to detect if the ship collides with any asteroids
 // Because we don't know when this will happen, I must use .interval(0)
 // to continuosly fire the observable all the time
  Observable.interval(0)
  .map(()=>{
    // Make another nested observer which cycles through all the asteroid elements stored in a HTMLCollection
    const ShipCollisionObserver = Observable.fromArray(Array.from(asteroidElements))
      // Pass in a reference to the asteroid element in the HTMLCollection...
      // Return an object containing ship x & y coordinates and asteroid boundaries
      .map((asteroidElem)=>({
        shipX: transformMatrix(g).m41,
        shipY: transformMatrix(g).m42,
        asteroidElem: asteroidElem,
        asteroidLeft: Number(asteroidElem.getAttribute('cx')) - Number(asteroidElem.getAttribute('r')),
        asteroidRight: Number(asteroidElem.getAttribute('cx')) + Number(asteroidElem.getAttribute('r')),
        asteroidTop: Number(asteroidElem.getAttribute('cy')) - Number(asteroidElem.getAttribute('r')),
        asteroidBottom: Number(asteroidElem.getAttribute('cy')) + Number(asteroidElem.getAttribute('r'))
      }))
      // filter returns true when ship x & y within asteroid boundaries
      .filter(({shipX, shipY, asteroidLeft, asteroidRight, asteroidTop, asteroidBottom})=> 
      (shipX > asteroidLeft && shipX < asteroidRight && shipY > asteroidTop && shipY < asteroidBottom))
      // pass in the asteroid element colliding the ship and return a reference to the livesCounter HTMLElement
      .map((asteroidElem)=>({
        livesCounter: <HTMLElement>document.getElementById('life'),
        asteroidElem: asteroidElem.asteroidElem
      }))
  // I've created 2 observable branches to determine whether the player respawns or experiences a game over
  //  |- LivesCounter > 1 : the ship gets sent back to start, the colliding asteroid is destroyed and one life is deducted
  //  |- LivesCounter <= 1: player has no more lives and so the game ends

      ShipCollisionObserver.filter(({livesCounter})=>parseInt(<string>livesCounter.textContent) > 1)
      .subscribe(({livesCounter, asteroidElem})=>{
        new Audio("ship_explode.mp3").play()
        livesCounter.textContent = (parseInt(<string>livesCounter.textContent) - 1).toString()
        asteroidElem.remove()
        g.attr("transform","translate(" + 600 + " " + 300 + ")" +"rotate(" + 0+ ")")
        })

      ShipCollisionObserver.filter(({livesCounter})=>parseInt(<string>livesCounter.textContent) <= 1)
      .subscribe(({livesCounter, asteroidElem})=>{
      new Audio("ship_explode.mp3").play()
      new Audio("gameover.mp3").play()
      // Remove ship, asteroid and the whole canvas
      ship.elem.remove()
      asteroidElem.remove()
      g.elem.remove()
      svg.remove()
      // Get a reference to the HTMLElement for score, this will be our final score
      const scoreCounter = <HTMLElement>document.getElementById('score'),
      finalScore = <string>scoreCounter.textContent
      // Overwrite the HTML with a simple game over page which includes:
      //  1.) A final tally of the score  2.) A Restart button which simply refreshes the page
      document.write("<body style=\"background-color: black\"></body>")
      document.write("<h1 style=\"color:red;font-size:50px;text-align:center\">YOU ARE DEAD</h1>")
      document.write("<h2 style=\"color:blue;font-size:30px;text-align:center\">YOUR FINAL LOUSY SCORE</h2>")
      document.write("<h2 style=\"color:blue;font-size:50px;text-align:center\">")
      document.write(finalScore)
      document.write("</h1>")
      document.write("<p align=\"center\"><button onClick=\"window.location.reload();\" type=\"button\" style=\"background-color:green;font-size:30px;margin-left:auto;margin-right:auto;display:block;\">Reset</button></p>")
      document.write("<img src=\"gameover.jpg\">")
      })
  }).subscribe(()=>{})

 //================================================================================
 //                               ASTEROID CLEANUP
 //================================================================================
 /**FUNCTION
 * Observable function which removes any elements belonging to a HTMLCollection as soon as they are out of canvas bounds
 * @param {HTMLCollection} elements The HTML Collection to observe
 * @return {void}
 */
 function ElementCleanerObserver(elements: HTMLCollection): void{
  Observable.interval(0).map(()=>{
    const AsteroidRemovalObserver = Observable.fromArray(Array.from(elements))
    .map((elements)=>({
      element: elements,
      elementX: parseInt(<string>elements.getAttribute('cx')),
      elementY: parseInt(<string>elements.getAttribute('cy'))
      }))
      AsteroidRemovalObserver.filter(({elementX}) => (elementX < canvasLeft-200)).subscribe(({element}) => {
        element.remove()})
      AsteroidRemovalObserver.filter(({elementX}) => (elementX > canvasRight+200)).subscribe(({element}) => {
        element.remove()})
      AsteroidRemovalObserver.filter(({elementY}) => (elementY > canvasBottom+200)).subscribe(({element})=> {
        element.remove()})
      AsteroidRemovalObserver.filter(({elementY}) => (elementY < canvasTop-200)).subscribe(({element}) => {
        element.remove()})
      }).subscribe(()=>{})
 }
 // Pass in both HTMLCollection references of asteroid & bullet
 // This ensures that asteroid/bullet elements will be removed once they travel out of bounds
 ElementCleanerObserver(asteroidElements)
 ElementCleanerObserver(bulletElements)
}

// I've modified this so the code only runs when function start() is invoked
// This can only happens when the player pressees the play button
// I did this to give time for the player to read the gameplay rules/controls before starting
function start(){
  asteroids();
}