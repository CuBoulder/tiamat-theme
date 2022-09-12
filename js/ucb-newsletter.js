    var article = document.querySelector('.ucb-newsletter')    

    // Runs on the DOM and converts the newsletter element to inline styles using the computed-to-inline library
    function convertToInline() {
        return new Promise(resolve => {
          var newBody = computedStyleToInlineStyle(article, {
            recursive: true,
          })
          resolve(newBody)

        });
    }
    
    // Show loaders
    async function awaitBody(){
        console.log('calling');
        var result = await convertToInline();
        return result
    }

// init

// Use absolute path for all images
var allImages = document.getElementsByTagName('img');
// Change to absolute
for(var i = 0; i < allImages.length ; i++) {
    allImages[i].src = allImages[i].src;
}
// Computed Styles to Inline
awaitBody();
// Log new body
var articleContainer = document.querySelector('.node--type-newsletter')
// TO DO -- inject the rest of the standard HTML structure

// Copy the html to clipboard
navigator.clipboard.writeText(articleContainer.innerHTML)
// TO DO -- show code in a separate element that is copy-able with another copy button for site editors