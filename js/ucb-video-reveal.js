// /*
//  *  ucb-video-reveal.js - This should allow the dynamic functionality necessary
//  *      for the video reveal block.
//  *
//  *  FUTURE  : add in auto-play of vidoe on reveal
//  *          : have image fade-out and video fade-in?
// */
// // controls to show the video 
// var els = document.getElementsByClassName("ucb-video-reveal-controls");

// // controls to close the video 
// var closeEls = document.getElementsByClassName("ucb-video-reveal-close");

// // Adding a handler for each instance of the video reveal ...
// // this should allow multiple instances of the video reveal block
// // to all work independantly on the page.
// for (let i = 0, x = els.length; i < x; i++) {
//   els[i].onclick = function() {
//     // sanity checker
//     // alert("Coming Soon!");

//     // We have 3 sibling elements that we're dealing with.  One was clicked on
//     // the text control element which needs to be hidden
//     // we then have a sibling elements of the image (hide)
//     // and the video (show)

//     // get the parent element
//     let myParentEl = this.parentElement;

//     if(myParentEl) {
//       // find the text controls and hide them
//       myParentEl.querySelector(".ucb-video-reveal-controls").style.display = "none";

//       // find the image and hide it
//       myParentEl.querySelector(".ucb-video-reveal-image").style.display = "none";

//       // find the video and video control block and show them
//       let vidControlEl = myParentEl.querySelector(".ucb-video-reveal-close");
//       vidControlEl.style.display = "inline-block";

//       let videoEl = myParentEl.querySelector(".ucb-video-reveal-video");
//       videoEl.style.display = "block";

//       // now we should be able to play the video for the user
//       // I wonder how that works...
//       // looks like you can add "&autoplay=1" to the src field to make a YouTube
//       // video autoplay.

//       // apparently this is difficult -- maybe future polish?

//     }
//   };
// }


// // Adding a handler for each instance of the video close button ...
// // this should allow multiple instances of the video reveal block 
// // to all work independantly on the page.  
// for (let i = 0, x = closeEls.length; i < x; i++) {
//   closeEls[i].onclick = function() {
//     // Sanity checker
//     //alert("Coming Soon!");

//     // get the parent element
//     let myParentEl = this.parentElement;

//     if(myParentEl) {
//       // find the video and video control block and hide them
//       let vidControlEl = myParentEl.querySelector(".ucb-video-reveal-close");
//       vidControlEl.style.display = "none";

//       let videoEl = myParentEl.querySelector(".ucb-video-reveal-video");
//       videoEl.style.display = "none";

//       // find the text controls and show them
//       myParentEl.querySelector(".ucb-video-reveal-controls").style.display = "flex";

//       // find the image and hide it
//       myParentEl.querySelector(".ucb-video-reveal-image").style.display = "block";
//     }
//   };
// }
/**
 * Contains video background functionality for the hero unit.
 */
(function() {
  // Object that defines supported video sites and their corresponding handlers
  const videoHeroSupportedSites = {
      youtube: {
          name: 'youtube',
          api: 'https://www.youtube.com/iframe_api',
          waitForLoad: false,
          handler: function(videoURL, videoWrapperElement, videoPlayerWrapperElement, playPauseButtonElement) {
              // Handler for YouTube videos
              // Creates a YouTube player and handles player events

              const youtubeAPIHandler = function() {
                  // Generate a unique ID for the video player element
                  const videoPlayerElementId = videoPlayerWrapperElement.id + '_frame';
                  const videoPlayerElement = document.createElement('div');
                  videoPlayerElement.id = videoPlayerElementId;
                  videoPlayerWrapperElement.appendChild(videoPlayerElement);

                  // Create a new YouTube player instance
                  const videoPlayer = new YT.Player(videoPlayerElementId, {
                      videoId: videoURL.searchParams.get('v'),
                      playerVars: { autoplay: 0, controls: 0, mute: 1, disablekb: 1, rel: 0, playsinline: 1 },
                      events: {
                          onReady: function(event) {
                              // When the player is ready, enable auto-resize, show the video wrapper, and remove the "hidden" attribute
                              enableVideoHeroAutoresize(videoWrapperElement, videoPlayerWrapperElement, document.getElementById(videoPlayerElementId), 800, 450);
                              videoWrapperElement.removeAttribute('hidden');
                          },
                          onStateChange: function(event) {
                              const playerState = event.data;
                              switch(playerState) {
                                  case YT.PlayerState.PLAYING:
                                      // If the player state is "PLAYING", show the pause icon
                                      toggleImage(videoPlayerWrapperElement)
                                      showVideoHeroPauseIcon(playPauseButtonElement,videoPlayerWrapperElement);
                                      break;
                                  case YT.PlayerState.PAUSED:
                                      // If the player state is "PAUSED", show the play icon
                                      toggleImage(videoPlayerWrapperElement)
                                      showVideoHeroPlayIcon(playPauseButtonElement,videoPlayerWrapperElement);
                                      break;
                                  case YT.PlayerState.ENDED:
                                      // If the player state is "ENDED", seek to the beginning and play the video to create a loop
                                      videoPlayer.seekTo(0);
                                      videoPlayer.playVideo();
                                      break;
                              }

                              // Toggle play/pause functionality when the play/pause button is clicked
                              playPauseButtonElement.onclick = function() {
                                  if(videoPlayer.getPlayerState() == YT.PlayerState.PAUSED)
                                      videoPlayer.playVideo();
                                  else
                                      videoPlayer.pauseVideo();
                              };
                          },
                          onError: function(event) {
                              // Handle errors encountered during video playback
                              videoHeroErrorHandler(videoWrapperElement, videoPlayerWrapperElement);
                          }
                      }
                  });
              };

              // Check if the YouTube API is already loaded, otherwise wait for it to load
              if(window.YT)
                  youtubeAPIHandler();
              else {
                  // Dispatch a custom event when the YouTube API is ready
                  document.addEventListener('ucbVideoHeroYouTubeIframeAPIReady', youtubeAPIHandler);
                  window.onYouTubeIframeAPIReady = window.onYouTubeIframeAPIReady || function() { document.dispatchEvent(new CustomEvent('ucbVideoHeroYouTubeIframeAPIReady')); };
              }
          }
      },
      youtu: { // For youtu.be URLs
          name: 'youtube',
          api: 'https://www.youtube.com/iframe_api',
          waitForLoad: false,
          handler: function(videoURL, videoWrapperElement, videoPlayerWrapperElement, playPauseButtonElement) {
              // Handler for youtu.be URLs, invokes the YouTube handler with modified video URL
              videoHeroSupportedSites.youtube.handler(new URL('https://www.youtube.com/watch?v=' + videoURL.pathname.substr(1)), videoWrapperElement, videoPlayerWrapperElement, playPauseButtonElement);
          }
      },
      vimeo: {
          name: 'vimeo',
          api: 'https://player.vimeo.com/api/player.js',
          waitForLoad: true,
          handler: function(videoURL, videoWrapperElement, videoPlayerWrapperElement, playPauseButtonElement) {
              // Handler for Vimeo videos
              // Creates a Vimeo player and handles player events

              let videoWidth = -1, videoHeight = -1, videoPlaying = false;

              // Create a new Vimeo player instance
              const videoPlayer = new Vimeo.Player(videoPlayerWrapperElement.id, {
                  url: videoURL + '',
                  background: true,
                  muted: true
              });

              // Video width and height come back from the Vimeo player API as Promises
              // In case of error, it will default to 800x450 which is fine for 16:9 videos
              videoPlayer.getVideoWidth().then(
                  (value) => {
                      videoWidth = value;
                      enableVideoHeroAutoresize(videoWrapperElement, videoPlayerWrapperElement, videoPlayer.element, videoWidth, videoHeight);
                  },
                  (error) => {
                      videoWidth = 800;
                      enableVideoHeroAutoresize(videoWrapperElement, videoPlayerWrapperElement, videoPlayer.element, videoWidth, videoHeight);
                  }
              );

              videoPlayer.getVideoHeight().then(
                  (value) => {
                      videoHeight = value;
                      enableVideoHeroAutoresize(videoWrapperElement, videoPlayerWrapperElement, videoPlayer.element, videoWidth, videoHeight);
                  },
                  (error) => {
                      videoHeight = 450;
                      enableVideoHeroAutoresize(videoWrapperElement, videoPlayerWrapperElement, videoPlayer.element, videoWidth, videoHeight);
                  }
              );

              // API event calls to the Vimeo player can go here

              // When the video is loaded, remove the "hidden" attribute from the video wrapper
              videoPlayer.on('loaded', function() {
                  videoPlayer.pause()
                  videoWrapperElement.removeAttribute('hidden');
              });

              // When the video starts playing, set the playing flag to true and show the pause icon
              videoPlayer.on('play', function() {
                  videoPlaying = true;
                  showVideoHeroPauseIcon(playPauseButtonElement);
              });

              // When the video is paused, set the playing flag to false and show the play icon
              videoPlayer.on('pause', function() {
                  videoPlaying = false;
                  showVideoHeroPlayIcon(playPauseButtonElement, videoPlayerWrapperElement);
              });

              // Handle errors encountered during video playback
              videoPlayer.on('error', function() {
                  videoHeroErrorHandler(videoWrapperElement, videoPlayerWrapperElement);
              });

              // Toggle play/pause functionality when the play/pause button is clicked
              playPauseButtonElement.onclick = function() {
                  if(videoPlaying){
                    videoPlayer.pause();
                    toggleImage(videoPlayerWrapperElement)
                  }
                  else {
                    toggleImage(videoPlayerWrapperElement)
                    videoPlayer.play();
                    
                  }
              };
          }
      }
  };

  // Appends a video player script to the document's head
  function appendVideoPlayerScript(scriptId, scriptURL) {
      const headElement = document.head || document.getElementsByTagName('head')[0];
      const scriptElement = document.createElement('script');
      scriptElement.addEventListener('load', () => scriptElement.setAttribute('data-ucb-loaded', ''));
      scriptElement.id = scriptId;
      scriptElement.type = 'text/javascript';
      scriptElement.src = scriptURL;
      headElement.appendChild(scriptElement);
      return scriptElement;
  }

  /**
   * Enables a hero unit background video.
   * @param {string} videoURLString - The Vimeo or YouTube video URL of the video as supplied by the media library
   * @param {string} videoPlayerWrapperElementId - The id of the video player wrapper div, inside which the player will go
   */
  function enableVideoHero(videoURLString, videoPlayerWrapperElementId) {
      const videoURL = new URL(videoURLString);
      const videoURLSplit = videoURL.hostname.split('.');
      const videoSiteString = videoURLSplit[videoURLSplit.length - 2].toLowerCase();
      const videoSite = videoHeroSupportedSites[videoSiteString];

      if(!videoSite)
          throw new Error('Background video in hero unit encountered an error: The video is from an unsupported site!');

      const scriptId = 'ucb_' + videoSite.name + '_player_script';
      const scriptElement = document.getElementById(scriptId) || appendVideoPlayerScript(scriptId, videoSite.api);

      if(!videoSite.waitForLoad || scriptElement.hasAttribute('data-ucb-loaded'))
          createVideoHeroPlayer(videoSite, videoURL, videoPlayerWrapperElementId);
      else
          scriptElement.addEventListener('load', () => createVideoHeroPlayer(videoSite, videoURL, videoPlayerWrapperElementId));
  }

  // Creates the video player based on the video site and URL
  function createVideoHeroPlayer(videoSite, videoURL, videoPlayerWrapperElementId) {
      const videoPlayerWrapperElement = document.getElementById(videoPlayerWrapperElementId);
      const videoWrapperElement = videoPlayerWrapperElement.parentElement;
      const playPauseButton = videoWrapperElement.querySelector('.ucb-hero-unit-video-play-pause');
      videoSite.handler(videoURL, videoWrapperElement, videoPlayerWrapperElement, playPauseButton);
  }

  // Enables auto-resizing of the video player based on the aspect ratio and available space
  function enableVideoHeroAutoresize(videoWrapperElement, videoPlayerWrapperElement, videoPlayerElement, videoWidth, videoHeight) {
      if(videoWidth > -1 && videoHeight > -1) {
          resizeVideoHero(videoWrapperElement, videoPlayerWrapperElement, videoPlayerElement, videoWidth, videoHeight);
          window.addEventListener('resize', () => resizeVideoHero(videoWrapperElement, videoPlayerWrapperElement, videoPlayerElement, videoWidth, videoHeight));
      }
  }

  // Resizes the video player to fit the available space
  function resizeVideoHero(videoWrapperElement, videoPlayerWrapperElement, videoPlayerElement, videoWidth, videoHeight) {
      const heroElement = videoWrapperElement.parentElement;
      const heroWidth = heroElement.offsetWidth;
      const heroHeight = heroElement.offsetHeight;
      const dimensions = calculateAspectRatioFit(videoWidth, videoHeight, heroWidth, heroHeight);
      videoPlayerElement.width = dimensions.width;
      videoPlayerWrapperElement.style.width = heroWidth + 'px';
      videoPlayerElement.height = dimensions.height;
      videoPlayerWrapperElement.style.height = heroHeight + 'px';
      videoPlayerElement.style.marginTop = ((heroHeight - dimensions.height) / 2) + 'px';
      videoPlayerElement.style.marginLeft = ((heroWidth - dimensions.width) / 2) + 'px';
  }

  // Calculates the aspect ratio fit for the video player dimensions
  function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
      const ratio = Math.max(maxWidth / srcWidth, maxHeight / srcHeight);
      return { width: srcWidth * ratio, height: srcHeight * ratio };
  }

  // Displays the pause icon on the play/pause button
  function showVideoHeroPauseIcon(playPauseButtonElement,videoPlayerWrapperElement) {
      toggleImage(videoPlayerWrapperElement)
      playPauseButtonElement.innerHTML = '<i class="fa fa-pause"></i>';
  }

  // Displays the play icon on the play/pause button
  function showVideoHeroPlayIcon(playPauseButtonElement, videoPlayerWrapperElement) {
    toggleImage(videoPlayerWrapperElement)

      playPauseButtonElement.innerHTML = '<i class="fa fa-play"></i>';
  }

  // Handles errors encountered during video playback
  function videoHeroErrorHandler(videoWrapperElement, videoPlayerWrapperElement) {
      videoWrapperElement.setAttribute('hidden', '');
      videoPlayerWrapperElement.innerHTML = '';
      throw new Error('Background video in hero unit encountered an error!');
  }

  // Handles toggling the image on/off when pause/play is clicked
  function toggleImage(videoPlayerWrapperElement){
    console.log('clicked')
    const image = videoPlayerWrapperElement.parentElement.children[1]
    if(image.style.display == 'inline' || image.style.display == ''){
      image.style.display = 'none'
    } else if(image.style.display == 'none') {
      image.style.display == 'inline'
    } else {
      image.style.display == ''
    }
    console.log('my display is now', image.style.display)
  }

  // Exposes the enableVideoHero function to the global scope
  window.enableVideoHero = enableVideoHero;
})();
