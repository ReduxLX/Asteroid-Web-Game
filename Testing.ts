function generateRandom(low:number, high:number){return (Math.random() * (high-low+1)) + low}
for(let i=0;i<30;i++){
  console.log(generateRandom(0, Math.PI/4))
}