(function () {
  /**
   * Enables a video reveal.
   * @param {string} videoURLString - The Vimeo or YouTube video URL of the video as supplied by the media library
   * @param {string} videoPlayerWrapperElementId - The id of the video player wrapper div, inside which the player will go
   */
  function enableVideoReveal(videoURLString, videoPlayerWrapperElementId) {
    // Convert the video URL string to a URL object
    const videoURL = new URL(videoURLString);

    // Get the second-to-last part of the video URL hostname (e.g., "youtube" or "vimeo")
    const videoURLSplit = videoURL.hostname.split('.');
    const videoSiteString = videoURLSplit[videoURLSplit.length - 2].toLowerCase();

    // Look up the corresponding video site handler in the supported sites object
    const videoSite = videoRevealSupportedSites[videoSiteString];

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
      createVideoRevealPlayer(videoSite, videoURL, videoPlayerWrapperElementId);
    else
      // If the script is not loaded yet, wait for the script to load and then create the video player
      scriptElement.addEventListener('load', () => createVideoRevealPlayer(videoSite, videoURL, videoPlayerWrapperElementId));
  }

  const videoRevealSupportedSites = {
    youtube: {
      name: 'youtube',
      api: 'https://www.youtube.com/iframe_api',
      waitForLoad: true,
      callbacks: [],
      handler: function (videoURL, videoWrapperElement, videoPlayerWrapperElement) {
        if (!YT.loaded) {
          window.onYouTubeIframeAPIReady = window.onYouTubeIframeAPIReady || function () {
            if (YT.loaded) {
              videoRevealSupportedSites.youtube.callbacks.forEach(callback => callback());
            }
          };
          videoRevealSupportedSites.youtube.callbacks.push(() => videoRevealSupportedSites.youtube.handler(videoURL, videoWrapperElement, videoPlayerWrapperElement));
          return;
        }
        // YouTube video handler
        // Create a div element to hold the YouTube video player
        const videoPlayerElementId = videoPlayerWrapperElement.id + '_frame';
        const videoPlayerElement = document.createElement('div');
        videoPlayerElement.id = videoPlayerElementId;
        videoPlayerWrapperElement.appendChild(videoPlayerElement);

        // Create the YouTube video player using the YouTube API
        const videoPlayer = new YT.Player(videoPlayerElementId, {
          videoId: videoURL.searchParams.get('v'),
          playerVars: { autoplay: 0, controls: 1, mute: 0, disablekb: 1, rel: 0, playsinline: 1 },
          events: {
            // Called when the YouTube player is ready to play
            onReady: function (event) {
              enableVideoRevealAutoresize(videoWrapperElement, videoPlayerWrapperElement, document.getElementById(videoPlayerElementId));
              videoWrapperElement.removeAttribute('hidden');
              rigControls(videoWrapperElement, videoPlayerWrapperElement, () => videoPlayer.playVideo(), () => videoPlayer.pauseVideo());
            },
            // Called when the state of the YouTube player changes (playing, paused, ended)
            onStateChange: function (event) {
              const playerState = event.data;
              switch (playerState) {
                case YT.PlayerState.PLAYING:
                  break;
                case YT.PlayerState.PAUSED:
                  break;
                case YT.PlayerState.ENDED: // This will loop the video
                  videoPlayer.seekTo(0);
                  videoPlayer.playVideo();
              }
            },
            // Called when an error occurs with the YouTube player
            onError: function (event) {
              videoRevealErrorHandler(videoWrapperElement, videoPlayerWrapperElement);
            }
          }
        });
      }
    },
    youtu: { // For youtu.be URLs (redirects to YouTube handler)
      name: 'youtube',
      api: 'https://www.youtube.com/iframe_api',
      waitForLoad: true,
      handler: function (videoURL, videoWrapperElement, videoPlayerWrapperElement) {
        // Handler for youtu.be URLs
        // Redirect to the YouTube handler by converting youtu.be URL to the standard YouTube URL format
        videoRevealSupportedSites.youtube.handler(new URL('https://www.youtube.com/watch?v=' + videoURL.pathname.substr(1)), videoWrapperElement, videoPlayerWrapperElement);
      }
    },
    vimeo: {
      name: 'vimeo',
      api: 'https://player.vimeo.com/api/player.js',
      waitForLoad: true,
      handler: function (videoURL, videoWrapperElement, videoPlayerWrapperElement) {
        // Vimeo video handler
        let videoWidth = -1, videoHeight = -1, videoPlaying = false;
        // Create the Vimeo video player using the Vimeo API
        const videoPlayer = new Vimeo.Player(videoPlayerWrapperElement.id, {
          url: videoURL + '',
          background: false,
          autoplay: false,
          muted: false,
          responsive: true
        });

        // Retrieve the video width and height using the Vimeo API (returned as Promises)
        // In case of error, default to 800x450, which is fine for 16:9 videos
        videoPlayer.getVideoWidth().then(
          (value) => { videoWidth = value; enableVideoRevealAutoresize(videoWrapperElement, videoPlayerWrapperElement, videoPlayer.element); },
          (error) => { videoWidth = 800; enableVideoRevealAutoresize(videoWrapperElement, videoPlayerWrapperElement, videoPlayer.element); }
        );
        videoPlayer.getVideoHeight().then(
          (value) => { videoHeight = value; enableVideoRevealAutoresize(videoWrapperElement, videoPlayerWrapperElement, videoPlayer.element); },
          (error) => { videoHeight = 450; enableVideoRevealAutoresize(videoWrapperElement, videoPlayerWrapperElement, videoPlayer.element); }
        );

        // Register event handlers for Vimeo player events
        videoPlayer.on('loaded', function () {
          videoWrapperElement.removeAttribute('hidden');
          videoPlaying = false;
          rigControls(videoWrapperElement, videoPlayerWrapperElement, () => videoPlayer.play(), () => videoPlayer.pause());
        });
        videoPlayer.on('play', function () {
          videoPlaying = true;
        });
        videoPlayer.on('pause', function () {
          videoPlaying = false;
        });
        videoPlayer.on('error', function () {
          videoRevealErrorHandler(videoWrapperElement, videoPlayerWrapperElement);
        });
      }
    }
  };

  function rigControls(videoWrapperElement, videoPlayerWrapperElement, playCallback, pauseCallback) {
    const videoEl = videoWrapperElement.getElementsByClassName('ucb-video-reveal-video-wrapper')[0];
    const closeBtn = videoWrapperElement.getElementsByClassName('ucb-video-reveal-close')[0];
    const imgWrapper = videoWrapperElement.getElementsByClassName('ucb-video-reveal-controls')[0];

    closeBtn.onclick = function () {
      pauseCallback();
      videoEl.style.display = "none";
      closeBtn.setAttribute('hidden', '');
      imgWrapper.style.display = 'flex';
    };

    const playBtn = videoWrapperElement.getElementsByClassName('ucb-video-reveal-controls')[0];
    playBtn.onclick = function () {
      playCallback();
      videoEl.style.display = "block";
      closeBtn.removeAttribute('hidden');
      imgWrapper.style.display = 'none';
    };
  }

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

  function videoRevealErrorHandler(videoWrapperElement, videoPlayerWrapperElement) {
    videoWrapperElement.setAttribute('hidden', '');
    videoPlayerWrapperElement.innerHTML = '';
    throw new Error('Video in video reveal unit encountered an error.');
  }

  function createVideoRevealPlayer(videoSite, videoURL, videoPlayerWrapperElementId) {
    const videoPlayerWrapperElement = document.getElementById(videoPlayerWrapperElementId);
    const videoWrapperElement = videoPlayerWrapperElement.parentElement;

    videoSite.handler(videoURL, videoWrapperElement, videoPlayerWrapperElement);
  }

  function enableVideoRevealAutoresize(videoWrapperElement, videoPlayerWrapperElement, videoPlayerElement) {
    resizeVideo(videoWrapperElement, videoPlayerWrapperElement, videoPlayerElement);
    window.addEventListener('resize', () => resizeVideo(videoWrapperElement, videoPlayerWrapperElement, videoPlayerElement));
  }

  function resizeVideo(videoWrapperElement, videoPlayerWrapperElement, videoPlayerElement) {
    const
      controlsElement = videoWrapperElement.parentElement.getElementsByClassName('ucb-video-reveal-controls')[0],
      videoRevealWidth = controlsElement.parentElement.offsetWidth,
      videoRevealHeight = videoRevealWidth*9/16;
      videoPlayerElement.width = videoRevealWidth;
      videoPlayerWrapperElement.style.width = videoRevealWidth;
      videoPlayerElement.height = videoRevealHeight + "px";
      videoPlayerWrapperElement.style.height = videoRevealHeight + "px";
  }

  window.enableVideoReveal = enableVideoReveal;
})();
