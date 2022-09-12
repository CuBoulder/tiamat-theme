    var article = document.querySelector('.ucb-newsletter')
    var loggedIn = article.getAttribute('data-loggedin') == 'true' ? true : false;
  

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
if(loggedIn){
    // Use absolute path for all images
    var allImages = document.getElementsByTagName('img');
    // Change to absolute
    for(var i = 0; i < allImages.length ; i++) {
        allImages[i].src = allImages[i].src;
    }
    // Computed Styles to Inline
    awaitBody();
    // Get new body and add html base
    var articleContainer = document.querySelector('.node--type-newsletter')
    // 
    // var htmlTemplate = `
    // <!DOCTYPE html>
    // <html lang="en">
    // <head>
    //     <meta charset="UTF-8">
    //     <meta http-equiv="X-UA-Compatible" content="IE=edge">
    //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //     <title>Document</title>
    // </head>
    // <body>
    //     ${articleContainer.innerHTML}
    // </body>
    // </html>
    // `
    // Create the admin button for copying HTML and the admin messages
    var codeContainer = document.createElement('div')
    codeContainer.classList = 'container admin-html-button'

    // Create copy button and functionality
    var button = document.createElement('button')
    button.onclick = function(){
        // navigator.clipboard.writeText(htmlTemplate)
        navigator.clipboard.writeText(articleContainer.innerHTML)
        button.innerText = 'Your email-ready HTML has been copied to clipboard!'
    }

    // Append
    var main = document.getElementsByTagName('main')[0]
    button.innerText = 'Click to copy your newsletter HTML'
    codeContainer.appendChild(button)
    main.appendChild(codeContainer)
}


// // Copy the html to clipboard
// navigator.clipboard.writeText(articleContainer.innerHTML)