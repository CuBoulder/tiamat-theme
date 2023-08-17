/*
 *  ucb-video-reveal.js - This should allow the dynamic functionality necessary
 *      for the video reveal block.
 *
 *  FUTURE  : add in auto-play of vidoe on reveal
 *          : have image fade-out and video fade-in?
*/
// controls to show the video 
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
//     console.log('parentEl', myParentEl)
//     if(myParentEl) {
//       // find the text controls and hide them
//       myParentEl.querySelector(".ucb-video-reveal-controls").style.display = "none";

//       // find the image and hide it
//       myParentEl.querySelector(".ucb-video-reveal-image").style.display = "none";
//       // unhide video
//       myParentEl.querySelector(".ucb-video-reveal-video-wrapper").style.display = 'block';

//       // find the video and video control block and show them
//       let vidControlEl = myParentEl.querySelector(".ucb-video-reveal-close");
//       vidControlEl.style.display = "inline-block";

//       let videoEl = myParentEl.querySelector(".ucb-video-reveal-video");
//     //   var iframe = videoEl.getElementsByTagName("iframe")[0].contentWindow;
//     //   console.log('my iframe', iframe)
//     //   videoEl.style.display = "block";
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

//       let videoEl = myParentEl.querySelector(".ucb-video-reveal-video-wrapper");
//       videoEl.style.display = "none";
//     //   var iframe = videoEl.getElementsByTagName("iframe")[0].contentWindow;

//       // find the text controls and show them
//       myParentEl.querySelector(".ucb-video-reveal-controls").style.display = "flex";

//       // find the image and hide it
//       myParentEl.querySelector(".ucb-video-reveal-image").style.display = "block";
//     }
//   };
// }


/**
 * Enables a hero unit background video.
 * @param {string} videoURLString - The Vimeo or YouTube video URL of the video as supplied by the media library
 * @param {string} videoPlayerWrapperElementId - The id of the video player wrapper div, inside which the player will go
 */
function enableVideoHero(videoURLString, videoPlayerWrapperElementId) {
    // Convert the video URL string to a URL object
    const videoURL = new URL(videoURLString);

    // Get the second-to-last part of the video URL hostname (e.g., "youtube" or "vimeo")
    const videoURLSplit = videoURL.hostname.split('.');
    const videoSiteString = videoURLSplit[videoURLSplit.length - 2].toLowerCase();

    // Look up the corresponding video site handler in the supported sites object
    const videoSite = videoHeroSupportedSites[videoSiteString];

    // If the video site is unsupported, throw an error
    if (!videoSite)
        throw new Error('Background video in video reveal block encountered an error: The video is from an unsupported site!');

    // Create a unique script ID for the video site player script
    const scriptId = 'ucb_' + videoSite.name + '_player_script';

    // Find the script element with the given script ID, or append the script to the document head if not found
    const scriptElement = document.getElementById(scriptId) || appendVideoPlayerScript(scriptId, videoSite.api);

    // Check if the video site handler should be executed immediately or wait for the script to load
    if (!videoSite.waitForLoad || scriptElement.hasAttribute('data-ucb-loaded'))
        // If the script is already loaded or doesn't require waiting, create the video player immediately
        createVideoHeroPlayer(videoSite, videoURL, videoPlayerWrapperElementId);
    else
        // If the script is not loaded yet, wait for the script to load and then create the video player
        scriptElement.addEventListener('load', () => createVideoHeroPlayer(videoSite, videoURL, videoPlayerWrapperElementId));
}


const videoHeroSupportedSites = {
    youtube: {
        name: 'youtube',
        api: 'https://www.youtube.com/iframe_api',
        waitForLoad: false,
        handler: function(videoURL, videoWrapperElement, videoPlayerWrapperElement) {
            // YouTube video handler
            // Create a div element to hold the YouTube video player
            const videoPlayerElementId = videoPlayerWrapperElement.id + '_frame';
            const videoPlayerElement = document.createElement('div');
            videoPlayerElement.id = videoPlayerElementId;
            // videoPlayerElement.style.display = 'none'
            videoPlayerWrapperElement.appendChild(videoPlayerElement);

            // Create the YouTube video player using the YouTube API
            const videoPlayer = new YT.Player(videoPlayerElementId, {
                videoId: videoURL.searchParams.get('v'),
                playerVars: { autoplay: 0, controls: 0, mute: 1, disablekb: 1, rel: 0, playsinline: 1 },
                events: {
                    // Called when the YouTube player is ready to play
                    onReady: function(event) {
                        enableVideoHeroAutoresize(videoWrapperElement, videoPlayerWrapperElement, document.getElementById(videoPlayerElementId), 800, 450);
                        videoWrapperElement.removeAttribute('hidden');
                    },
                    // Called when the state of the YouTube player changes (playing, paused, ended)
                    onStateChange: function(event) {
                        const playerState = event.data;
                        switch (playerState) {
                            case YT.PlayerState.PLAYING:
                                // showVideoHeroPauseIcon(playPauseButtonElement);
                                break;
                            case YT.PlayerState.PAUSED:
                                // showVideoHeroPlayIcon(playPauseButtonElement);
                                break;
                            case YT.PlayerState.ENDED: // This will loop the video
                                videoPlayer.seekTo(0);
                                videoPlayer.playVideo();
                        }
                        // Add an event listener to the play/pause button
                        playPauseButtonElement.onclick = function() {
                            if (videoPlayer.getPlayerState() == YT.PlayerState.PAUSED)
                                videoPlayer.playVideo();
                            else
                                videoPlayer.pauseVideo();
                        };
                    },
                    // Called when an error occurs with the YouTube player
                    onError: function(event) {
                        videoHeroErrorHandler(videoWrapperElement, videoPlayerWrapperElement);
                    }
                }
            });
        }
    },
    youtu: { // For youtu.be URLs (redirects to YouTube handler)
        name: 'youtube',
        api: 'https://www.youtube.com/iframe_api',
        waitForLoad: false,
        handler: function(videoURL, videoWrapperElement, videoPlayerWrapperElement) {
            // Handler for youtu.be URLs
            // Redirect to the YouTube handler by converting youtu.be URL to the standard YouTube URL format
            videoHeroSupportedSites.youtube.handler(new URL('https://www.youtube.com/watch?v=' + videoURL.pathname.substr(1)), videoWrapperElement, videoPlayerWrapperElement, playPauseButtonElement);
        }
    },
    vimeo: {
        name: 'vimeo',
        api: 'https://player.vimeo.com/api/player.js',
        waitForLoad: true,
        handler: function(videoURL, videoWrapperElement, videoPlayerWrapperElement) {
            // Vimeo video handler
            let videoWidth = -1, videoHeight = -1, videoPlaying = false;

            // Create the Vimeo video player using the Vimeo API
            const videoPlayer = new Vimeo.Player(videoPlayerWrapperElement.id, {
                url: videoURL + '',
                background: true,
                muted: true,
                autoplay: false  
            });

            // Retrieve the video width and height using the Vimeo API (returned as Promises)
            // In case of error, default to 800x450, which is fine for 16:9 videos
            videoPlayer.getVideoWidth().then(
                (value) => { videoWidth = value; enableVideoHeroAutoresize(videoWrapperElement, videoPlayerWrapperElement, videoPlayer.element, videoWidth, videoHeight); },
                (error) => { videoWidth = 800; enableVideoHeroAutoresize(videoWrapperElement, videoPlayerWrapperElement, videoPlayer.element, videoWidth, videoHeight); }
            );
            videoPlayer.getVideoHeight().then(
                (value) => { videoHeight = value; enableVideoHeroAutoresize(videoWrapperElement, videoPlayerWrapperElement, videoPlayer.element, videoWidth, videoHeight); },
                (error) => { videoHeight = 450; enableVideoHeroAutoresize(videoWrapperElement, videoPlayerWrapperElement, videoPlayer.element, videoWidth, videoHeight); }
            );

            // Register event handlers for Vimeo player events
            videoPlayer.on('loaded', function() {
                videoWrapperElement.removeAttribute('hidden');
                videoPlaying = false;
            });
            videoPlayer.on('play', function() {
                videoPlaying = true;
                // showVideoHeroPauseIcon(playPauseButtonElement);
            });
            videoPlayer.on('pause', function() {
                videoPlaying = false;
                // showVideoHeroPlayIcon(playPauseButtonElement);
            });
            videoPlayer.on('error', function() {
                videoHeroErrorHandler(videoWrapperElement, videoPlayerWrapperElement);
            });

            const videoEl = videoPlayer.element.parentElement.getElementsByClassName('ucb-video-reveal-video-wrapper')[0]
            const closeBtn = videoPlayer.element.parentElement.getElementsByClassName('ucb-video-reveal-close')[0]
            const imgWrapper = videoPlayer.element.parentElement.getElementsByClassName('ucb-video-reveal-controls')[0]
            const imgEl = videoPlayer.element.parentElement.getElementsByClassName('ucb-video-reveal-image')[0]
            
            closeBtn.onclick = function() {
                videoPlayer.pause();
                videoEl.style.display = "none"
                closeBtn.style.display = "none"
                imgEl.style.display = "block"
                imgWrapper.style.display = "flex"
            };

            const playBtn = videoPlayer.element.parentElement.getElementsByClassName('ucb-video-reveal-controls')[0]
            playBtn.onclick = function() {
                videoPlayer.play();
                videoEl.style.display = "block"
                closeBtn.style.display = "block"
                imgEl.style.display = "none"
                imgWrapper.style.display = "none"
            };
        }
    }
};

function appendVideoPlayerScript(scriptId, scriptURL) {
    const
        headElement = document.head || document.getElementsByTagName('head')[0],
        scriptElement = document.createElement('script');
    scriptElement.addEventListener('load', () => scriptElement.setAttribute('data-ucb-loaded', ''));
    scriptElement.id = scriptId;
    scriptElement.type = 'text/javascript';
    scriptElement.src = scriptURL;
    headElement.appendChild(scriptElement);
    return scriptElement;
}


function videoHeroErrorHandler(videoWrapperElement, videoPlayerWrapperElement) {
    videoWrapperElement.setAttribute('hidden', '');
    videoPlayerWrapperElement.innerHTML = '';
    throw new Error('Video in video reveal unit encountered an error.');
}

function createVideoHeroPlayer(videoSite, videoURL, videoPlayerWrapperElementId) {
    const videoPlayerWrapperElement = document.getElementById(videoPlayerWrapperElementId);
    const videoWrapperElement = videoPlayerWrapperElement.parentElement;

    videoSite.handler(videoURL, videoWrapperElement, videoPlayerWrapperElement);
}

function enableVideoHeroAutoresize(videoWrapperElement, videoPlayerWrapperElement, videoPlayerElement, videoWidth, videoHeight) {
    if(videoWidth > -1 && videoHeight > -1) {
        resizeVideoHero(videoWrapperElement, videoPlayerWrapperElement, videoPlayerElement, videoWidth, videoHeight);
        window.addEventListener('resize', () => resizeVideoHero(videoWrapperElement, videoPlayerWrapperElement, videoPlayerElement, videoWidth, videoHeight));    
    }
}

function resizeVideoHero(videoWrapperElement, videoPlayerWrapperElement, videoPlayerElement, videoWidth, videoHeight) {
    const 
        heroElement = videoWrapperElement.parentElement,
        heroWidth = heroElement.offsetWidth,
        heroHeight = heroElement.offsetHeight,
        dimensions = calculateAspectRatioFit(videoWidth, videoHeight, heroWidth, heroHeight);
    videoPlayerElement.width = dimensions.width;
    videoPlayerWrapperElement.style.width = heroWidth + 'px';
    videoPlayerElement.height = dimensions.height;
    videoPlayerWrapperElement.style.height = heroHeight + 'px';
    videoPlayerElement.style.marginTop = ((heroHeight - dimensions.height) / 2) + 'px';
    videoPlayerElement.style.marginLeft = ((heroWidth - dimensions.width) / 2) + 'px';
}

function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
    const ratio = Math.max(maxWidth / srcWidth, maxHeight / srcHeight);
    return { width: srcWidth * ratio, height: srcHeight * ratio };
}