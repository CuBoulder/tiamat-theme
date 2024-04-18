(function ($, Drupal) {
//     // Create the admin button for copying HTML and the admin messages
    var codeContainer = document.createElement('div')
    codeContainer.classList = 'container email-button-container'
    codeContainer.style.cssText = 'display: flex; justify-content: center; padding-top:10px;padding-top: 10px;flex-wrap: wrap;'
//     codeContainer.classList = 'container admin-html-button'

    // Create copy button and functionality
    var button = document.createElement('button')
    button.style.cssText = 'background-color:gold;width: 100%;max-width: 60%;padding: 10px;margin: 10px;'

    button.onclick = function(){
        // Get baseURL
        var emailContainer = document.getElementById('email')
        var baseURL = emailContainer.dataset.url

        // Tags -  make absolute
        var tags = document.getElementsByClassName('tags')
        // Iterate through all tags and create an absolute url
        for(let tag of tags){
            for(child of tag.children){
                var endurl = child.getAttribute('href')
                child.href = `${baseURL}${endurl}`
            }
        }

        // Section Link - make blue (gets overridden by user agent style)
        var moreLinks = document.getElementsByClassName('article-link')
        for(link of moreLinks){
            for(child of link.children)
            child.style.cssText = `background-color: #0277BD !important;
            color: #fff !important;
            display: inline-block !important;
            padding: 5px 10px !important;
            font-weight: bold !important;
            transition: background-color 0.5s ease !important;
            margin-bottom: 5px !important;
            text-decoration: none !important;
            -webkit-border-radius: 3px !important;
            -moz-border-radius: 3px !important;
            border-radius: 3px !important;
            -webkit-background-clip: padding-box !important;
            -moz-background-clip: padding;
            background-clip: padding-box;
            -webkit-box-shadow: 0 1px 2px rgba(0,0,0,0.2);
            -moz-box-shadow: 0 1px 2px rgba(0,0,0,0.2);
            box-shadow: 0 1px 2px rgba(0,0,0,0.2);
            transition: -webkit-box-shadow 0.5s ease,background-color 0.5s ease,color 0.5s ease;
            transition: -moz-box-shadow 0.5s ease,background-color 0.5s ease,color 0.5s ease;
            transition: box-shadow 0.5s ease,background-color 0.5s ease,color 0.5s ease;
            background-color: #0277BD;
            color: #fff !important;`
        }

        // Stick the styles in the header of the email
        var style = document.getElementsByTagName('style')
        var email = document.getElementById('email-preview')
        var emailStyles = ""
        for(stylesheet of style){
            emailStyles += stylesheet.innerText
        }
        
        var emailTemplate = 
        `
        <!DOCTYPE html>
        <html>
            <head>
                <style>
                ${emailStyles}
                </style>
            </head>
        `

        var emailEnd = `
        </html>`

        // Add to clipboard, change text
        navigator.clipboard.writeText(emailTemplate+email.innerHTML+emailEnd)
        textArea.innerText = emailTemplate+email.innerHTML+emailEnd
        button.innerText = 'Your email-ready HTML has been copied to clipboard!'
        button.style.backgroundColor = 'grey'
    }

    // Append Button
    var main = document.getElementById('block-boulder-base-content')
    button.innerText = 'Click to copy your newsletter HTML'
    codeContainer.appendChild(button)
    
    // Append TextArea
    var textArea = document.createElement('textarea')
    textArea.style.cssText = 'display: block;width: 100%;height: 241px;'
    codeContainer.appendChild(textArea)
    main.appendChild(codeContainer)

})(jQuery, Drupal);