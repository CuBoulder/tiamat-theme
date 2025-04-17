/**
 * @file
 * Hero slider behaviors.
 */
(function (Drupal) {
  'use strict';

  Drupal.behaviors.heroSlider = {
    attach: function (context, settings) {
      context.querySelectorAll('.carousel').forEach(function(carouselElement) {
        if (carouselElement.classList.contains('processed')) {
          return;
        }

        const playPauseButton = carouselElement.querySelector('.carousel-control-playpause');
        const restartButton = carouselElement.querySelector('.carousel-control-restart');
        if (!playPauseButton || !restartButton) {
          return;
        }

        // Initialize state
        let isPlaying = true;
        const carousel = new bootstrap.Carousel(carouselElement);
        const visuallyHidden = playPauseButton.querySelector('.visually-hidden');

        // Function to update button state
        function updateButtonState(playing) {
          const pauseIcon = playPauseButton.querySelector('.fa-pause');
          const playIcon = playPauseButton.querySelector('.fa-play');
          
          if (playing) {
            pauseIcon?.classList.remove('d-none');
            playIcon?.classList.add('d-none');
            visuallyHidden.textContent = 'Pause';
          } else {
            pauseIcon?.classList.add('d-none');
            playIcon?.classList.remove('d-none');
            visuallyHidden.textContent = 'Play';
          }
        }

        // Handle play/pause click events
        playPauseButton.addEventListener('click', function() {
          if (isPlaying) {
            carousel.pause();
          } else {
            carousel.cycle();
          }
          isPlaying = !isPlaying;
          updateButtonState(isPlaying);
        });

        // Handle restart click events
        restartButton.addEventListener('click', function() {
          carousel.cycle();
          isPlaying = true;
          updateButtonState(isPlaying);
        });

        // Set initial state
        updateButtonState(isPlaying);
        carouselElement.classList.add('processed');
      });
    }
  };
})(Drupal); 