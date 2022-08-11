/**
 * Contains video background functionality for the hero unit.
 */
(function() {
    const videoHeroSupportedSites = {
        youtube: {
            name: 'youtube',
            api: 'https://www.youtube.com/iframe_api',
            waitForLoad: false,
            handler: function(videoURL, videoWrapperElement, videoPlayerWrapperElement, playPauseButtonElement) {
                const youtubeAPIHandler = function() {
                    const
                        videoPlayerElementId = videoPlayerWrapperElement.id + '_frame',
                        videoPlayerElement = document.createElement('div');
                    videoPlayerElement.id = videoPlayerElementId;
                    videoPlayerWrapperElement.appendChild(videoPlayerElement);
                    const videoPlayer = new YT.Player(videoPlayerElementId, {
                        videoId: videoURL.searchParams.get('v'),
                        playerVars: { autoplay: 1, controls: 0, mute: 1, disablekb: 1, rel: 0, playsinline: 1 },
                        events: {
                            onReady: function(event){
                                enableVideoHeroAutoresize(videoWrapperElement, videoPlayerWrapperElement, document.getElementById(videoPlayerElementId), 800, 450);
                                videoWrapperElement.removeAttribute('hidden');
                            },
                            onStateChange: function(event) {
                                const playerState = event.data;
                                switch(playerState) {
                                    case YT.PlayerState.PLAYING:
                                        showVideoHeroPauseIcon(playPauseButtonElement);
                                    break;
                                    case YT.PlayerState.PAUSED:
                                        showVideoHeroPlayIcon(playPauseButtonElement);
                                    break;
                                    case YT.PlayerState.ENDED: // This will loop the video
                                        videoPlayer.seekTo(0);
                                        videoPlayer.playVideo();
                                }
                                playPauseButtonElement.onclick = function() {
                                    if(videoPlayer.getPlayerState() == YT.PlayerState.PAUSED)
                                        videoPlayer.playVideo()
                                    else videoPlayer.pauseVideo();
                                };
                            },
                            onError: function(event) {
                                videoHeroErrorHandler(videoWrapperElement, videoPlayerWrapperElement);
                            }
                        }
                    }); 
                };
                if(window.YT)
                    youtubeAPIHandler()
                else {
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
                videoHeroSupportedSites.youtube.handler(new URL('https://www.youtube.com/watch?v=' + videoURL.pathname.substr(1)), videoWrapperElement, videoPlayerWrapperElement, playPauseButtonElement)
            }
        },
        vimeo: {
            name: 'vimeo',
            api: 'https://player.vimeo.com/api/player.js',
            waitForLoad: true,
            handler: function(videoURL, videoWrapperElement, videoPlayerWrapperElement, playPauseButtonElement) {
                let videoWidth = -1, videoHeight = -1, videoPlaying = false;
                const videoPlayer = new Vimeo.Player(videoPlayerWrapperElement.id, {
                    url: videoURL + '',
                    background: true,
                    muted: true
                });
                // Video width and height come back from the Vimeo player API as Promises
                // In case of error, it will default to 800x450 which is fine for 16:9 videos
                videoPlayer.getVideoWidth().then(
                    (value) => { videoWidth = value; enableVideoHeroAutoresize(videoWrapperElement, videoPlayerWrapperElement, videoPlayer.element, videoWidth, videoHeight); },
                    (error) => { videoWidth = 800; enableVideoHeroAutoresize(videoWrapperElement, videoPlayerWrapperElement, videoPlayer.element, videoWidth, videoHeight); });
                videoPlayer.getVideoHeight().then(
                    (value) => { videoHeight = value; enableVideoHeroAutoresize(videoWrapperElement, videoPlayerWrapperElement, videoPlayer.element, videoWidth, videoHeight); },
                    (error) => { videoHeight = 450; enableVideoHeroAutoresize(videoWrapperElement, videoPlayerWrapperElement, videoPlayer.element, videoWidth, videoHeight); });
                // API event calls to the Vimeo player can go here
                videoPlayer.on('loaded', function() {
                    videoWrapperElement.removeAttribute('hidden');
                });
                videoPlayer.on('play', function() {
                    videoPlaying = true;
                    showVideoHeroPauseIcon(playPauseButtonElement);
                });
                videoPlayer.on('pause', function() {
                    videoPlaying = false;
                    showVideoHeroPlayIcon(playPauseButtonElement);
                });
                videoPlayer.on('error', function() {
                    videoHeroErrorHandler(videoWrapperElement, videoPlayerWrapperElement);
                });
                playPauseButtonElement.onclick = function() {
                    if(videoPlaying)
                        videoPlayer.pause()
                    else videoPlayer.play();
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

    /**
     * Enables a hero unit background video.
     * @param {string} videoURLString - The Vimeo or YouTube video URL of the video as supplied by the media library
     * @param {string} videoPlayerWrapperElementId - The id of the video player wrapper div, inside which the player will go
     */
    function enableVideoHero(videoURLString, videoPlayerWrapperElementId) {
        const
            videoURL = new URL(videoURLString),
            videoURLSplit = videoURL.hostname.split('.'),
            videoSiteString = videoURLSplit[videoURLSplit.length - 2].toLowerCase(),
            videoSite = videoHeroSupportedSites[videoSiteString];
        if(!videoSite)
            throw new Error('Background video in hero unit encountered an error: The video is from an unsupported site!');
        const
            scriptId = 'ucb_' + videoSite.name + '_player_script',
            scriptElement = document.getElementById(scriptId) || appendVideoPlayerScript(scriptId, videoSite.api);
        if(!videoSite.waitForLoad || scriptElement.hasAttribute('data-ucb-loaded'))
            createVideoHeroPlayer(videoSite, videoURL, videoPlayerWrapperElementId);
        else scriptElement.addEventListener('load', () => createVideoHeroPlayer(videoSite, videoURL, videoPlayerWrapperElementId));
    }

    function createVideoHeroPlayer(videoSite, videoURL, videoPlayerWrapperElementId) {
        const
            videoPlayerWrapperElement = document.getElementById(videoPlayerWrapperElementId),
            videoWrapperElement = videoPlayerWrapperElement.parentElement,
            playPauseButton = videoWrapperElement.querySelector('.ucb-hero-unit-video-play-pause');
        videoSite.handler(videoURL, videoWrapperElement, videoPlayerWrapperElement, playPauseButton);
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

    function showVideoHeroPauseIcon(playPauseButtonElement) {
        playPauseButtonElement.innerHTML = '<i class="fa fa-pause"></i>';
    }

    function showVideoHeroPlayIcon(playPauseButtonElement) {
        playPauseButtonElement.innerHTML = '<i class="fa fa-play"></i>';
    }

    function videoHeroErrorHandler(videoWrapperElement, videoPlayerWrapperElement) {
        videoWrapperElement.setAttribute('hidden', '');
        videoPlayerWrapperElement.innerHTML = '';
        throw new Error('Background video in hero unit encountered an error!');
    }

    window.enableVideoHero = enableVideoHero;
})();