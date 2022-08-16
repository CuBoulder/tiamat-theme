/*
 *  ucb-video-reveal.js - This should allow the dynamic functionality necessary
 *      for the video reveal block.
 *
 *  FUTURE  : add in auto-play of vidoe on reveal
 *          : have image fade-out and video fade-in?
*/
// controls to show the video 
var els = document.getElementsByClassName("ucb-video-reveal-controls");

// controls to close the video 
var closeEls = document.getElementsByClassName("ucb-video-reveal-close");

// Adding a handler for each instance of the video reveal ...
// this should allow multiple instances of the video reveal block
// to all work independantly on the page.
for (let i = 0, x = els.length; i < x; i++) {
  els[i].onclick = function() {
    // sanity checker
    // alert("Coming Soon!");

    // We have 3 sibling elements that we're dealing with.  One was clicked on
    // the text control element which needs to be hidden
    // we then have a sibling elements of the image (hide)
    // and the video (show)

    // get the parent element
    let myParentEl = this.parentElement;

    if(myParentEl) {
      // find the text controls and hide them
      myParentEl.querySelector(".ucb-video-reveal-controls").style.display = "none";

      // find the image and hide it
      myParentEl.querySelector(".ucb-video-reveal-image").style.display = "none";

      // find the video and video control block and show them
      let vidControlEl = myParentEl.querySelector(".ucb-video-reveal-close");
      vidControlEl.style.display = "inline-block";

      let videoEl = myParentEl.querySelector(".ucb-video-reveal-video");
      videoEl.style.display = "block";

      // now we should be able to play the video for the user
      // I wonder how that works...
      // looks like you can add "&autoplay=1" to the src field to make a YouTube
      // video autoplay.

      // apparently this is difficult -- maybe future polish?

    }
  };
}


// Adding a handler for each instance of the video close button ...
// this should allow multiple instances of the video reveal block 
// to all work independantly on the page.  
for (let i = 0, x = closeEls.length; i < x; i++) {
  closeEls[i].onclick = function() {
    // Sanity checker
    //alert("Coming Soon!");

    // get the parent element
    let myParentEl = this.parentElement;

    if(myParentEl) {
      // find the video and video control block and hide them
      let vidControlEl = myParentEl.querySelector(".ucb-video-reveal-close");
      vidControlEl.style.display = "none";

      let videoEl = myParentEl.querySelector(".ucb-video-reveal-video");
      videoEl.style.display = "none";

      // find the text controls and show them
      myParentEl.querySelector(".ucb-video-reveal-controls").style.display = "block";

      // find the image and hide it
      myParentEl.querySelector(".ucb-video-reveal-image").style.display = "block";
    }
  };
}
