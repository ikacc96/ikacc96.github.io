// visualization container
const container = document.querySelector('#vis');
const mainCanvas = document.querySelector('#mainCanvas');
const ctx = mainCanvas.getContext('2d');

// Define dimensions
const margin = {left: 30, top: 30, bottom: 30, right: 30};
let width;
let height = 600;
let device;
// Sim
let r, space, stick;

const innerDimensions = () => {
    let computedStyle = getComputedStyle(container);
    const vWidth = container.clientWidth;
    width = vWidth;
    width -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);

    mainCanvas.width = width * devicePixelRatio;
    mainCanvas.height = height * devicePixelRatio;

    ctx.scale(devicePixelRatio, devicePixelRatio);

    mainCanvas.style.width = `${width}px`;
    mainCanvas.style.height = `${height}px`;

    const sD = window.matchMedia('(max-width: 768px)').matches;
    const mD = window.matchMedia('(max-width: 992px)').matches;

    if (sD) {
        device = 'sm'
        r = 2.5;
        space = 1;
        stick = -4;
    } else if (mD) {
        device = 'md'
        r = 2;
        space = 0;
        stick = -3.5;
    } else {
        device = 'lg'
        r = 2.5;
        space = 0.5;
        stick = -8;
    }

    if (set === 1) {
        simulation
            .force('charge', d3.forceManyBody()
                .strength(stick))
            .force('collide', d3.forceCollide(r+space))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .restart();

        update();
    }

}


// Data
let graph;
let gLinks;

d3.json('../../assets/js/custom/nodeGraph.json')
    .catch((error) => {
        console.error('JSON file not found');
    })
    .then((data) => {
        graph = data;
        gLinks = graph.links0;
        setUp();
    });

// Set up
let simulation = d3.forceSimulation();
let set = 0;
function setUp () {

    simulation
        .force('x', d3.forceX(width/2))
        .force('y', d3.forceY(height/2))
        .force('collide', d3.forceCollide(r+space))
        .force('charge', d3.forceManyBody()
                .strength(stick))
        .force('link', d3.forceLink()
            .id(function(d) {return d.id}))
            // .distance())
        .force("center", d3.forceCenter(width / 2, height / 2))
        .alphaDecay(0.01);

    simulation
        .nodes(graph.nodes)
            .on("tick", update);

    set = 1;

    // Trigger automatically
    setTimeout(draw1, 7000);
}

// Update
function update () {
  ctx. clearRect(0, 0, width, height);

  if (gLinks === undefined || gLinks === 0) {
  } else {
      ctx.beginPath();
      gLinks.forEach(drawLink);
      ctx.stroke();
  }

  graph.nodes.forEach(drawNode);
}

function updateLinks (l) {

  simulation.force("link")
      .links(l)
      .strength(.3);

  simulation
      .alpha(.5)
      .restart();

  update();
}

// Draw functions
function drawNode(d) {
  ctx.beginPath();
  ctx.globalAlpha = 1;
  ctx.fillStyle = d.color;
  ctx.moveTo(d.x, d.y);
  ctx.arc(d.x, d.y, r, 0, 2*Math.PI);
  ctx.fill();
 }

 function drawLink(l) {
  ctx.globalAlpha = 0.3;
  ctx.moveTo(l.source.x, l.source.y);
  ctx.lineTo(l.target.x, l.target.y);
  ctx.strokeStyle = l.source.color;
 }

// Sections
function draw0 () {
  gLinks = graph.links0;

  updateLinks(gLinks);
}

function draw1 () {
  gLinks = graph.links1;

  updateLinks(gLinks);
}

// Array of all the graph functions
// Will be called from the scroller functionality

let activationFunctions = [
    draw0,
    draw1
]

// All the scrolling function
// Will draw a new graph based on the index provided by the scroll


let scroll = scroller()
    .container(d3.select('#graphic'))
scroll()

let lastIndex, activeIndex = 0

// This is where most of the magic happens. Every time the user scrolls, we receive a new index. First, we find all the irrelevant sections, and reduce their opacity.
scroll.on('active', function(index){
    d3.selectAll('.step')
        // .transition().duration(500)
        // .style('opacity', function (d, i) {return i === index ? 1 : 0.7;});

    // Next, we select from a range of activationFunctions (which we create), based on the index of the current section.
    activeIndex = index
    let sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    let scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(i => {
        activationFunctions[i]();
    })
    lastIndex = activeIndex;

})

scroll.on('progress', function(index, progress){
    if (index == 2 & progress > 0.7){

    }
})