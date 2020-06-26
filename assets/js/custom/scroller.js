// scroller - handles the details of figuring out which section the user is currently scrolled to

function scroller(){
  let container = d3.select('body');
  // event dispatcher
  let dispatch = d3.dispatch('active', 'progress');
  // d3 selection of all the text sections that will be scrolled through
  let sections = d3.selectAll('.step');
  let sectionPositions;
  let currentIndex = -1;
  let containerStart = 0;

  function scroll(){
      // when window is scrolled call position. When it is resized call resize
      d3.select(window)
          .on('scroll.scroller', position)
          .on('resize.scroller', resize);
      // manually call resize initially to setup scroller
      resize();
      // hack to get position to be called once for the scroll position on load. @v4 timer no longer stops if you return true at the end of the callback function - so here we stop it explicitly
      let timer = d3.timer(function() {
          position();
          timer.stop();
      });
  }

  // sectionPositions will be each sections starting position relative to the top of the first section
  // it saves all of the co-ordinates of these elements in an array called sectionPositions
  function resize(){
      sectionPositions = [];
      let startPos;

      sections.each(function(d, i) {
          let top = this.getBoundingClientRect().top;

          if (i === 0 ){
              startPos = top;
          }
          sectionPositions.push(top - startPos)
      });
      innerDimensions();
  }

  // the position function determines where the user is on the page (using window.pageYOffset), and uses that to determine which section of text should currently be in view. It then uses D3’s dispatching tools to signal the 'progress' event, which will be used in the main script, passing along the current section index so that the script knows which stage of the animation/visualisation should be showing
  function position() {
      let pos = window.pageYOffset - 400 - containerStart;
      let sectionIndex = d3.bisect(sectionPositions, pos);
      sectionIndex = Math.min(sections.size()-1, sectionIndex);

      if (currentIndex !== sectionIndex){
          dispatch.call('active', this, sectionIndex);
          currentIndex = sectionIndex;
      }

      let prevIndex = Math.max(sectionIndex - 1, 0);
      let prevTop = sectionPositions[prevIndex]
      let progress = (pos - prevTop) / (sectionPositions[sectionIndex] - prevTop);
      dispatch.call('progress', this, currentIndex, progress)
  }

  // container - get/set the parent element of the sections. Useful for if the scrolling doesn't start at the very top of the page
  scroll.container = function(value) {
      if (arguments.length === 0){
          return container
      }
      container = value
      return scroll
  }

  // the code here adds an event listener to the dispatcher
  scroll.on = function(action, callback){
      dispatch.on(action, callback)
  };

  return scroll;
}

